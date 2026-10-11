import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/lib/server/auth';
import { AppShell } from '@/components/layout/AppShell';
export const dynamic = 'force-dynamic';
export default async function Layout({ children }: { children: React.ReactNode }) {
  try {
    await requireSession();
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') redirect('/pin');
    return (
      <main className="auth">
        <section className="card">
          <h1>Sesi belum dapat diperiksa</h1>
          <p>
            Server belum dapat memeriksa sesi di Supabase. Muat ulang halaman untuk mencoba
            kembali. Jika masih gagal, periksa koneksi server, konfigurasi Supabase, dan tabel sesi.
          </p>
          <Link href="/pin">Kembali ke PIN</Link>
        </section>
      </main>
    );
  }
  return <AppShell>{children}</AppShell>;
}
