import Link from 'next/link';

// Bukan <main>: halaman ini juga tampil di dalam kerangka yang sudah punya <main>.
export default function NotFound() {
  return (
    <div className="grid min-h-[60dvh] place-items-center p-6">
      <div className="max-w-sm rounded-3xl bg-surface p-8 text-center shadow-card">
        <p className="text-5xl font-extrabold text-accent-strong">404</p>
        <h1 className="mt-2 text-xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-1 text-sm text-ink-3">Alamatnya mungkin sudah berubah. Buka Beranda untuk melanjutkan.</p>
        <Link href="/home" className="mt-5 inline-flex h-11 items-center rounded-2xl bg-action px-5 font-bold text-on-action">
          Buka Beranda
        </Link>
      </div>
    </div>
  );
}
