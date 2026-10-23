import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/lib/server/auth';
import { AppShell } from '@/components/layout/app-shell';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  try {
    await requireSession();
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') redirect('/pin');
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <section className="max-w-md rounded-3xl bg-surface p-8 shadow-card">
          <h1 className="text-xl font-bold">Sesi belum dapat diperiksa</h1>
          <p className="mt-2 text-sm text-ink-2">
            Server belum dapat memeriksa sesi di Supabase. Muat ulang halaman. Jika masih gagal,
            periksa koneksi server, konfigurasi Supabase, dan tabel sesi.
          </p>
          <Link href="/pin" className="mt-4 inline-block font-semibold text-accent-ink underline">
            Kembali ke PIN
          </Link>
        </section>
      </main>
    );
  }
  return <AppShell>{children}</AppShell>;
}
