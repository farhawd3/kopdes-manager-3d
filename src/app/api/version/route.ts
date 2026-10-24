import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/server/auth';
import { failure } from '@/lib/server/http';
import { db } from '@/lib/server/db';
import { today } from '@/lib/date';

/**
 * Penanda versi data: berubah bila ada catatan ditambah, diubah, atau dihapus (jumlah dan waktu
 * ubah terakhir), atau hari berganti (daftar "berjalan" ikut tanggal). Klien hanya meminta ulang
 * data bila penanda ini berbeda dari yang tersimpan di perangkat.
 */
export async function GET() {
  try {
    await requireSession();
    const { data, count, error } = await db()
      .from('hub_records')
      .select('updated_at', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .limit(1);
    if (error) throw new Error('Versi data belum dapat diperiksa.');
    const latest = (data as { updated_at: string }[] | null)?.[0]?.updated_at || '';
    return NextResponse.json(
      { version: `${today()}|${count ?? 0}|${latest}` },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return failure(error);
  }
}
