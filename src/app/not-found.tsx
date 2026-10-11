import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="auth">
      <div className="card">
        <h1>Halaman tidak ditemukan</h1>
        <p>Gunakan navigasi ruang kerja untuk melanjutkan.</p>
        <Link href="/beranda">Buka Beranda</Link>
      </div>
    </main>
  );
}
