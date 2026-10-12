import Link from 'next/link';
// Bukan <main>: halaman ini juga tampil di dalam kerangka yang sudah punya <main>.
export default function NotFound() {
  return (
    <div className="auth">
      <div className="card">
        <h1>Halaman tidak ditemukan</h1>
        <p>Gunakan navigasi ruang kerja untuk melanjutkan.</p>
        <Link href="/beranda">Buka Beranda</Link>
      </div>
    </div>
  );
}
