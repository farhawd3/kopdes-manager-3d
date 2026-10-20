# Acuan desain antarmuka — 20 Oktober 2026

## Prioritas dan lingkup

Arahan 10 Oktober 2026: dunia meniru panel logistik referensi, dan **seluruh web memakai bahasa visual yang sama** dengan sidebar/rel/dock tetap. [DUNIA-KOPERASI](DUNIA-KOPERASI.md) menyimpan spesifikasi dunia.

| Permukaan | Gaya dan sumber |
|---|---|
| Dunia Koperasi `/dunia-koperasi` | Diorama lembut, kartu mengambang, menu lokasi/cuaca. `src/features/dunia-3d/monitoring.css`. |
| Halaman operasional | Transisi ke gaya "Lantai Dunia" (20 Oktober 2026, `docs/RENCANA-REDESAIN.md`): rel navigasi biru batu `#2F3B63`, latar lantai ruang diorama (`--lantai-*`), modul lempeng bertingkat lembut, aksen jingga kayu `#AC5108`/`#C8680F`. (Menggantikan Lavender Lekuk secara bertahap). Token dan komponen dalam pembaruan bertahap dari `token.css` dan `kerangka.css`. |

Pilihan palet lama tidak dipakai lagi: arah baru menggunakan warna lantai per ruang diorama, dan Pengaturan memilih terang/gelap/sistem. Status tetap memakai warna semantik (hijau aman, kuning peringatan, merah terlambat) plus teks.

## Dunia Koperasi

Seluruh palet, komposisi kartu, scene, karakter, waktu, kendaraan dan rencana upgrade berada di [DUNIA-KOPERASI](DUNIA-KOPERASI.md). Dokumen ini tidak menyimpan salinan spesifikasi dunia. Jika ada konflik lama, ikuti kontrak dunia dan arahan pemilik terbaru.

## Halaman operasional

- **Arah Baru: Lantai Dunia (20 Oktober 2026)**, disetujui pemilik di `docs/RENCANA-REDESAIN.md`: setiap halaman adalah ruang diorama kantor koperasi. Rel navigasi biru batu, latar warna lantai penuh (pandan, kayu madu, lila, persik, air), modul lempeng dengan tepi taktil, aksen jingga kayu menyatu dengan dunia 3D.
- **Gaya lama** (Lavender Lekuk, Senja, Kebun, Teal, Cerah, Taskflow, Merah Putih) sedang digantikan secara bertahap (Paket 0 s/d Paket 6).
- **Beranda** (19 Oktober 2026): sapaan sesuai jam WIB + tanggal + satu baris ringkasan (terlambat, jatuh tempo), pilihan proyek, tombol "Salin laporan hari ini" (teks polos untuk grup WhatsApp pengurus; dialog cadangan bila clipboard ditolak); tambah cepat satu kalimat (`@nama` dari Tim, `#proyek`, `!prioritas`, besok/lusa/nama hari/tgl-bln) yang membuka form tugas terisi, tidak menyimpan sendiri; grid dua kolom: Rutin harian (kartu pastel, baris berikutnya berwarna aksen, centang, konfeti saat beres) | Agenda hari ini (hitung mundur, linimasa, garis sekarang, Gabung, Catat hasil ke jurnal), Perlu tindakan (tugas terlambat/hari ini + pengingat dokumen, isu, risiko, stok) | Minggu ini (pita Senin–Minggu, pilih hari); lalu Pekerjaan berjalan (kartu proyek bergulir) dan usaha harian (kas, penjualan, kehadiran). Satu kolom bila area halaman < 860 px.

- **Pola tata letak (11 Oktober 2026)**: tabel = judul teks rata kiri dengan ikon/avatar di kiri, kolom selebar isi, aksi satu baris (ikon bila lebih dari dua); kartu daftar = tinggi rata per baris, aksi di dasar kartu dipisah garis tipis, informasi tidak diulang antara cip dan badan kartu; tabel Tugas/Kegiatan tampil sebagai kartu bila area halaman < 900 px (container query, bukan lebar layar, karena sidebar), dan Buku koperasi memakai tampilan kartu di layar < 1280 px. Warna hanya untuk status (lencana lembut), bukan garis aksen kartu. Satu set warna: lavender untuk aksen, pastel untuk kategori; token `--pastel-emerald/rose/amber-*` hanya untuk status selesai/terlambat/perlu perhatian; abu untuk netral. Judul halaman = ikon halaman + 22 px tebal; kode dan jam memakai angka rata (`tabular-nums`).

- **Laci detail** (`records/RecordDrawer.tsx`) untuk semua catatan selain tugas: Detail · Terkait · Riwayat, tombol Ubah dan Lihat di dunia, saran langkah berikut. Desktop panel kanan, ponsel lembar bawah. `?record=` membuka laci, `?ubah=1` langsung form. Laci tugas memuat bagian Terkait yang sama.
- **Kepala daftar**: ikon halaman, judul, ringkasan angka per status. **Kartu catatan**: cip info kunci per jenis (`ringkasan()`), avatar staf, pil status, aksi kecil berjajar.
- **Saran** hanya membuka form terisi (`?baru=1&isi.<kolom>=…`); tidak ada penulisan otomatis.
- Menu: Perlu tindakan (dulu Perlu perhatian) menjadi bagian Beranda (`#perhatian`); Ringkasan buku tetap tab Buku koperasi, tidak di menu samping.

- Ikon halaman dua nada lavender (`IkonHalaman`, `Ikon3D`, token `--ikon-*`) di menu samping, rel, menu ponsel, dok; menu aktif berisi lavender. Kartu statistik, keadaan kosong dan pusat aksi memakai ikon yang sama; barang memakai thumbnail berwarna.
- Dialog muat di layar dan bergulir di dalam; di ponsel menjadi lembar bawah selebar layar. Catatan unit, staf, barang, pengiriman, tugas dan rapat punya tombol "Lihat di dunia".
- Menu memakai bahasa Indonesia langsung dan kapitalisasi kalimat; judul/deskripsi panjang membungkus. Dunia tersedia di bilah atas dan dock ponsel; Tambah membuka pilihan pencatatan yang sama di semua ukuran.
- Ikon 3D adalah SVG dari kode, tanpa memuat WebGL.
- Token di `src/styles/token.css` adalah sumber warna; urutan impor ada di `src/app/layout.tsx`. `npm run lint:ui` menolak warna hex dan `!important` di luar token, pengaman reduced-motion, dan lembar cetak.
- Beranda mengutamakan tindakan: setiap modul berisi data yang bisa ditindaklanjuti.
- Riwayat proyek adalah tab `/proyek?tab=riwayat`; alias `/riwayat-proyek` mengalihkan ke tab, tanpa menu riwayat sidebar terpisah.
- Judul lebih utama dari kode; metadata dan aksi terpisah, label panjang membungkus. Tidak ada capaian tiruan, slogan atau tim palsu.
- DateInput/DateField dan Select bersama; kalender ke bawah dalam batas panel, menu dapat menggulir. Form ponsel satu kolom.
- Status berupa teks selain warna. Memuat/kosong/galat harus berbeda; galat tidak menjadi angka nol.
- Perlu tindakan memakai permukaan netral dan rincian bertautan sumber.

## Akses dan bukti

Target sentuh 44 px, label aksesibel, fokus keyboard, reduced-motion, safe area, dan scroll tabel/Gantt dalam kontainer. Dunia menyediakan kontrol HTML dan daftar lokasi sebagai alternatif model WebGL.

Periksa 360/768/1024/1440 px. Catat screenshot, interaksi dan state yang benar-benar diuji di STATUS. Build/tes DOM tidak membuktikan kesamaan visual dengan video, WebGL semua perangkat atau penerimaan pemilik. QA-ANOTASI, QA-TATA-LETAK dan QA-POPUP adalah bukti historis halaman operasional, bukan arahan yang mengalahkan dokumen ini.

`/dev/ruang-kerja` menyediakan pratinjau menu, kartu dan form dengan isi contoh lokal. Hanya development; tidak membuka sesi atau menulis data.
