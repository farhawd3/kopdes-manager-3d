import Link from 'next/link';
import type { Entity } from '../records/schemas';

const instructions: Partial<Record<Entity, { title: string; text: string; href?: string; link?: string }>> = {
  'work-items': { title: '1. Pilih proyek → 2. Tulis pekerjaan → 3. Tetapkan tenggat', text: 'Buat tugas dari halaman proyek agar proyek terisi otomatis. Untuk pekerjaan harian yang berdiri sendiri, pilih Tugas mandiri. Milestone, mitra dan dokumen ada di Rincian tambahan.' },
  workstreams: { title: 'Proyek → tugas → hasil → selesai', text: 'Proyek mengelompokkan satu tujuan. Tambahkan tugas dan milestone setelah menyimpan proyek. Menyelesaikan proyek tidak otomatis menyelesaikan tugas; periksa pekerjaan yang masih aktif.' },
  members: { title: 'Mulai dari identitas anggota', text: 'Isi nama, nomor anggota dan tanggal bergabung. Kontak, alamat dan catatan dapat dilengkapi nanti. Transaksi uang dicatat terpisah di Buku kas.' },
  'inventory-items': { title: 'Daftarkan barang sebelum menghitung stok', text: 'Isi nama, kode barang, satuan dan stok buku. Gerai hanya diperlukan jika barang ditempatkan di gerai tertentu. Pencatatan barang tidak membuat transaksi kas otomatis.' },
  'cash-entries': { title: 'Catat transaksi, lalu hubungkan bila perlu', text: 'Isi judul, tanggal, uang masuk/keluar, nominal dan kas/rekening. Anggota, barang dan gerai merupakan hubungan opsional; kosongkan jika tidak terkait. Transaksi kas tidak mengubah stok barang.', href: '/anggota', link: 'Daftar anggota' },
  'stock-counts': { title: 'Barang → hitung fisik → catat selisih', text: 'Pilih barang yang sudah didaftarkan, kemudian isi tanggal dan jumlah fisik. Stok buku diambil sebagai snapshot pembanding. Menyimpan opname tidak mengoreksi stok otomatis.', href: '/barang', link: 'Daftar barang' },
};

export function EntryGuide({ entity }: { entity: Entity }) {
  const guide = instructions[entity];
  if (!guide) return null;
  return (
    <details className="entry-guide">
      <summary>Cara mengisi</summary>
      <div className="entry-guide-content">
        <strong>{guide.title}</strong>
        <p>{guide.text}</p>
        {guide.href && <Link href={guide.href}>{guide.link}</Link>}
      </div>
    </details>
  );
}
