import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { db } from '@/lib/server/db';
import { COOKIE, digest, hashPin, verifyPin, requireSession } from '@/lib/server/auth';
import { sameOrigin, failure, readJson } from '@/lib/server/http';
import { isDemoMode } from '@/lib/demo';
const pin = z.string().regex(/^\d{6,12}$/, 'PIN harus 6–12 digit.');
const input = z.discriminatedUnion('action', [
  z.object({ action: z.literal('login'), pin }).strict(),
  z.object({ action: z.literal('setup'), pin, setupToken: z.string().min(32).max(200) }).strict(),
  z.object({ action: z.literal('change'), pin, newPin: pin }).strict(),
  z.object({ action: z.literal('logout') }).strict(),
]);
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = input.parse(await readJson(request));
    // Mode demo: PIN apa pun membuka ruang kerja, tidak ada sesi yang disimpan.
    if (isDemoMode()) return NextResponse.json({ success: true });
    const client = db();
    if (body.action === 'logout') {
      const token = (await cookies()).get(COOKIE)?.value;
      if (token) {
        const { error } = await client
          .from('manager_sessions')
          .delete()
          .eq('token_hash', digest(token));
        if (error) throw new Error('Sesi gagal dikunci.');
      }
      (await cookies()).delete(COOKIE);
      return NextResponse.json({ success: true });
    }
    if (body.action === 'setup') {
      const expected = process.env.HUB_SETUP_TOKEN;
      if (
        !expected ||
        expected.length < 32 ||
        !timingSafeEqual(Buffer.from(digest(expected)), Buffer.from(digest(body.setupToken)))
      )
        throw new Error('FORBIDDEN');
      const { data, error } = await client.rpc('initialize_manager', { hash: hashPin(body.pin) });
      if (error) {
        if (error.code === 'PGRST202')
          throw new Error('Fungsi pengaturan PIN belum tersedia. Periksa migrasi proyek baru.');
        if (error.code === '42501')
          throw new Error('Kunci server belum memiliki izin fungsi pengaturan PIN.');
        throw new Error(
          'Koneksi Supabase gagal. PIN belum tersimpan; coba lagi setelah server tersambung.',
        );
      }
      if (!data) throw new Error('PIN sudah pernah diatur. Gunakan halaman masuk.');
      return NextResponse.json({ success: true });
    }
    if (body.action === 'change') await requireSession();
    const { data: stored, error: attemptError } = await client.rpc('reserve_pin_attempt');
    if (attemptError) {
      if (['PGRST202', '42883'].includes(attemptError.code))
        throw new Error('Fungsi keamanan belum tersedia di proyek Supabase ini. Periksa migrasi.');
      if (attemptError.code === '42501')
        throw new Error('Kunci server tidak memiliki izin untuk memeriksa PIN.');
      if (!attemptError.code)
        throw new Error(
          'Server tidak dapat terhubung ke Supabase. Periksa jaringan server, lalu coba lagi.',
        );
      throw new Error('Pemeriksaan PIN gagal di database. Periksa status proyek Supabase.');
    }
    if (!stored)
      return NextResponse.json(
        {
          error:
            'PIN belum disiapkan atau percobaan dibatasi. Setelah 5 percobaan, tunggu 15 menit.',
        },
        { status: 429 },
      );
    if (!verifyPin(body.pin, stored))
      return NextResponse.json(
        { error: 'PIN tidak sesuai. Tunggu sejenak sebelum mencoba kembali.' },
        { status: 401 },
      );
    if (body.action === 'change') {
      const { data, error } = await client.rpc('change_manager_pin', {
        expected_hash: stored,
        new_hash: hashPin(body.newPin),
      });
      if (error || !data) throw new Error('PIN gagal diubah.');
      (await cookies()).delete(COOKIE);
    } else {
      const token = randomBytes(32).toString('base64url');
      const { data, error } = await client.rpc('finish_pin_login', {
        expected_hash: stored,
        session_hash: digest(token),
      });
      if (error || !data) throw new Error('Sesi tidak dapat dibuat.');
      (await cookies()).set(COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 43200,
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
