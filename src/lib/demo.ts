/**
 * Mode demo lokal: semua data dari memori server (data contoh), tanpa Supabase dan tanpa PIN.
 * Aktif hanya dengan NEXT_PUBLIC_MODE_DEMO=1 dan tidak pernah di Vercel, agar hosting
 * sungguhan tidak bisa terbuka tanpa PIN karena salah konfigurasi.
 */
export function modeDemo(): boolean {
  return process.env.NEXT_PUBLIC_MODE_DEMO === '1' && process.env.VERCEL !== '1';
}
