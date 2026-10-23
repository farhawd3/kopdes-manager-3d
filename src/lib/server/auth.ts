import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { db } from './db';
import { isDemoMode } from '@/lib/demo';
export const COOKIE = 'kopdes_manager_session';
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function hashPin(pin: string) {
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + scryptSync(pin, salt, 32).toString('hex');
}
export function verifyPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{64}$/.test(hash || '')) return false;
  return timingSafeEqual(scryptSync(pin, salt, 32), Buffer.from(hash, 'hex'));
}
export async function requireSession() {
  // Mode demo lokal tidak memakai PIN (lib/demo.ts: tidak pernah aktif di Vercel).
  if (isDemoMode()) return;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) throw new Error('UNAUTHORIZED');
  const { data, error } = await db()
    .from('manager_sessions')
    .select('token_hash')
    .eq('token_hash', digest(token))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error('Pemeriksaan sesi gagal. Coba lagi.');
  if (!data) throw new Error('UNAUTHORIZED');
}
