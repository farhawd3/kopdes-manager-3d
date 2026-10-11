# Alur proyek, tugas dan pencatatan — 4 Oktober 2026

## Proyek dan tugas

1. Buat proyek untuk satu tujuan: nama, kode, tujuan, penanggung jawab dan tanggal jika diketahui. Durasi tidak wajib.
2. Buka proyek, lalu tambah tugas. Proyek terisi otomatis. Pada form tugas umum, pilih proyek terlebih dahulu; pekerjaan yang berdiri sendiri menggunakan pilihan **Tugas mandiri (tanpa proyek)**.
3. Isi pekerjaan dan tenggat, lalu status, prioritas dan penanggung jawab. Milestone, mitra, dokumen, rapat, subtugas dan pengulangan ada di **Detail lainnya**; gunakan hanya jika diperlukan.
4. Perbarui status tugas dan catat hasil kegiatan/bukti. Progres proyek dihitung dari tugas; 100% progres tidak otomatis mengubah status proyek.
5. Tinjau tugas aktif dan hasilnya, buka **Ubah proyek**, lalu pilih **Selesai**. Tugas tidak diselesaikan otomatis. Pekerjaan aktif yang tersisa tetap terlihat di Daftar Tugas agar tidak terlupakan.
6. Proyek selesai/arsip keluar dari daftar proyek berjalan dan pintasan sidebar. Buka **Riwayat Proyek** (`/proyek?tab=riwayat`) untuk seluruh tugas, milestone, dokumen dan catatan terkait. Detail proyek memuat seluruh status tugas, termasuk selesai lebih dari 30 hari lalu, dan riwayat membuka daftar secara bawaan.
7. Untuk tugas baru, buka kembali status proyek ke aktif. Server menolak tugas baru pada proyek selesai/arsip. Pembaruan tugas historis tetap diizinkan; tugas berulang pada proyek tertutup tidak menghasilkan salinan periode berikutnya.

## Hubungan data

| Catatan | Hubungan | Aturan |
|---|---|---|
| Tugas | Proyek melalui workstream_id | Opsional untuk tugas mandiri; pilih satu proyek untuk pekerjaan proyek |
| Milestone | Proyek | Milestone tugas harus dari proyek yang sama; mengganti proyek mengosongkan pilihan milestone |
| Dokumen, mitra, rapat, isu | Ditautkan pada tugas | Detail proyek menelusuri hubungan tersebut; bukan salinan data |
| Keputusan | Rapat yang ditautkan oleh tugas | Ditampilkan pada detail proyek melalui rapat tersebut |
| Transaksi kas | Anggota/barang/gerai | Opsional; hubungan tidak membuat transaksi atau perubahan stok lain otomatis |
| Barang | Gerai | Opsional; nama, kode, satuan dan stok buku tetap isian utama |
| Stok opname | Barang | Wajib; memakai snapshot stok buku, tanpa koreksi stok otomatis |

Referensi diperiksa server sebelum simpan. Hubungan yang hilang ditolak, bukan diabaikan. Detail dan angka hanya mencakup data yang telah dimuat; gunakan **Muat catatan lain** jika masih ada halaman data. API tetap memakai paginasi, bukan pengambilan semua data tanpa batas.

## Urutan empat buku

1. **Anggota**, bila perlu: isi nama, nomor anggota, tanggal bergabung dan status. Kontak/alamat/catatan dapat dilengkapi kemudian.
2. **Barang**, sebelum opname: isi nama, kode, satuan, stok buku dan batas stok. Gerai, harga dan catatan merupakan rincian tambahan.
3. **Buku kas**, setiap transaksi: isi judul, tanggal, masuk/keluar, nominal, kategori dan kas/rekening. Buka **Hubungan dan rincian opsional** hanya untuk anggota, barang, gerai atau bukti terkait. Tidak perlu membuat ketiga catatan tersebut untuk transaksi umum.
4. **Stok opname**: pilih barang, tanggal, jumlah fisik dan pemeriksa. Stok buku diambil dari barang sebagai snapshot pembanding. Perubahan stok buku dilakukan secara terpisah setelah meninjau selisih.

Buku kas hanya catatan uang masuk/keluar; selisih bukan saldo bank atau laba. Barang dan kas tidak saling mengubah otomatis. Anggota tidak wajib diisi sebelum transaksi umum.

## Verifikasi paket

- Penyebab Gantt: lapisan fixed berada dalam leluhur aplikasi dan animasi dapat menimpa transform rotasi. Lapisan kini dipasang pada body melalui portal, animasi dimatikan saat rotasi potret. Desktop yang sudah lanskap tetap tegak; fokus dibatasi dan dikembalikan setelah tutup.
- Fixture enam halaman dan enam form: masing-masing 48 kombinasi 360/768/1024/1440 px × terang/gelap tanpa overflow yang diukur; form hubungan dibuka. Gantt diputar serta bubble tugas historis: masing-masing delapan kombinasi. Screenshot/pengukuran lokal di artifacts/astra.
- Rute /riwayat-proyek dibuka pada sesi aplikasi nyata dan berhasil memuat keadaan kosong. Pemeriksaan lain memakai fixture lokal tanpa penyimpanan database.
- 253 tes/41 berkas lulus; termasuk riwayat tugas lama, tugas mandiri/rincian tambahan, portal Gantt, penolakan referensi/proyek tertutup, dan pembaruan historis tanpa pengulangan baru. Typecheck, ESLint, build, audit sumber 97/97 lulus.
- check:ui masih gagal pada tujuh kontrol mentah di luar komponen UI. Utang lint:ui legacy tetap terbuka. Tidak menjalankan SQL cloud atau deployment, tidak mengklaim UAT/perangkat fisik/seluruh backend produksi sudah diperiksa.

## Koreksi bantuan terbaru

Petunjuk form menjadi Cara mengisi yang tertutup bawaan; banner permanen halaman buku dihapus. + Kas anggota/barang membuka cash-entries dengan relasi terisi, jenis editor dibersihkan ketika ditutup. Tidak mengubah stok atau membuat transaksi otomatis.
