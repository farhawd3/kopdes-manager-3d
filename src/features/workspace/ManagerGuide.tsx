'use client';
import Link from 'next/link';
import { AppIcon, type AppIconName } from '@/components/ui/AppIcon';
import { Ikon3D } from '@/components/ui/Ikon3D';

const steps = [
  ['/pengaturan', 'Lengkapi profil', 'Isi identitas koperasi dan penanggung jawab.'],
  ['/proyek', 'Susun proyek', 'Tulis tujuan, lalu hubungkan tugas dan milestone.'],
  [
    '/hari-ini',
    'Jalankan pekerjaan',
    'Periksa tenggat, perbarui status, dan catat hasil kegiatan.',
  ],
  [
    '/laporan',
    'Tinjau dan laporkan',
    'Simpan snapshot laporan; unduh cadangan melalui Pengaturan.',
  ],
] as const;
const books: { href: string; title: string; description: string; icon: AppIconName }[] = [
  { href: '/anggota', title: 'Anggota', description: 'Kelola nomor anggota, kontak, dan status keanggotaan.', icon: 'members' },
  { href: '/keuangan', title: 'Buku kas', description: 'Catat uang masuk dan keluar beserta bukti. Selisih kas bukan saldo bank atau laba.', icon: 'cash' },
  { href: '/barang', title: 'Barang', description: 'Daftarkan kode, satuan, dan stok buku barang.', icon: 'inventory' },
  { href: '/stok-opname', title: 'Stok opname', description: 'Bandingkan hitung fisik dengan snapshot stok buku. Tidak mengoreksi stok otomatis.', icon: 'stockCount' },
];
const stepIcons: AppIconName[] = ['profile', 'project', 'today', 'report'];

export function ManagerGuide() {
  return (
    <section className="manager-guide" aria-labelledby="manager-guide-title">
      <header className="guide-intro">
        <h2 id="manager-guide-title" className="judul-halaman">
          <Ikon3D kind="tanya" size={30} />
          Panduan penggunaan
        </h2>
        <p>Mulai dari profil dan proyek, lalu gunakan Hari Ini untuk pekerjaan harian.</p>
      </header>
      <ol className="guide-steps">
        {steps.map(([href, title, description], index) => (
          <li key={href} className="guide-step">
            <Link href={href} className="guide-card-link">
            <span className="guide-icon"><AppIcon name={stepIcons[index]} size={24} /></span>
            <div>
              <span className="eyebrow">Langkah {index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <AppIcon name="open" size={18} />
            </Link>
          </li>
        ))}
      </ol>
      <section aria-labelledby="guide-books-title">
        <div className="entry-guide"><strong>Menutup proyek</strong><p>Periksa tugas yang masih aktif, catat hasil, lalu ubah status proyek menjadi selesai. Status tugas tidak diubah otomatis. Proyek selesai keluar dari sidebar proyek berjalan; tugas, milestone dan catatan tetap dapat dibuka melalui <Link href="/proyek?tab=riwayat">Riwayat proyek</Link>.</p></div>
        <h3 id="guide-books-title">Catatan operasional</h3>
        <p>Daftarkan anggota bila ada transaksi anggota. Daftarkan barang sebelum stok opname. Buku kas dapat dicatat tanpa anggota, barang atau gerai; hubungan tersebut opsional dan tidak membuat pencatatan lain otomatis.</p>
        <div className="guide-books">
          {books.map(book => <Link key={book.href} href={book.href} className="guide-card-link">
            <span className="guide-icon"><AppIcon name={book.icon} size={24} /></span>
            <div><h3>{book.title}</h3><p>{book.description}</p></div>
            <AppIcon name="open" size={18} />
          </Link>)}
        </div>
      </section>
      <details className="card guide-details">
        <summary>Koordinasi dan keamanan data</summary>
        <p>
          Catat rapat dan keputusan, lalu buat tugas tindak lanjut. Kegiatan mencatat hasil
          pekerjaan; dokumen menyimpan tautan bukti.
        </p>
        <p>
          Kunci aplikasi setelah selesai. Simpan cadangan JSON secara pribadi dan uji pemulihan pada
          lingkungan terpisah. Jangan membagikan PIN, token pengaturan atau kunci server.
        </p>
        <p>
          Gantt membantu mengatur tanggal. Kolaborasi real-time, offline, baseline dan jalur kritis
          otomatis belum tersedia.
        </p>
      </details>
    </section>
  );
}
