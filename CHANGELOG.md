# Catatan perubahan

Hanya perubahan besar (fitur, fase, migrasi). Entri baru di atas. Format dan aturan ada di [AGENTS.md](AGENTS.md).

## Redesain total ala TaskTrack dan rutin harian di database — 23 Oktober 2026

- Alasan: arahan pemilik untuk merombak seluruh tampilan tanpa terikat desain lama, dengan fitur dipertahankan, acuan TaskTrack (pastel, tanpa gradasi), dan tatanan proyek serta aturan AI yang seragam.
- Perubahan:
  - Seluruh tampilan dibangun ulang (Tailwind v4, Radix, Motion; huruf Urbanist; aksi biru tua; 5 warna sorotan; tema terang/gelap). Kartu tugas dan proyek berwarna per proyek, progres bersegmen, avatar bertumpuk.
  - Kerangka baru: sidebar laptop, rel ikon tablet, navigasi bawah HP dengan kapsul yang meluncur dan tombol tambah di tengah; palet Ctrl K; lonceng pengingat; menu tambah cepat.
  - Semua modal formulir diganti laci kanan / lembar bawah; formulir dibangun otomatis dari katalog dengan pesan galat bahasa Indonesia dan draf yang tidak hilang.
  - Beranda: rutin hari ini paling atas, tenggat dekat (kartu bisa digeser), ringkasan tugas, linimasa hari ini, perlu perhatian, proyek berjalan, salin laporan harian.
  - Tugas: daftar (geser di HP: kanan selesai, kiri tunda), papan seret-lepas (mouse dan sentuh-tahan), kalender bulan/pekan, linimasa Gantt dengan tinjauan sebelum simpan, pilih banyak, tampilan tersimpan, periode kerja, pintasan J/K/X; setiap perubahan bisa diurungkan.
  - Proyek: kartu proyek, halaman detail (tugas, milestone, anggaran vs kas, catatan proyek, catatan terkait).
  - Rutin harian tersimpan di database dengan hari aktif per rutin (migrasi 11), sinkron HP ↔ laptop.
  - Kode dan alamat halaman berbahasa Inggris; alamat dan parameter lama tetap dialihkan.
  - Dokumen diringkas menjadi README, AGENTS, STATUS, PRODUK, KODE, TAMPILAN, DATABASE, DUNIA-3D; skill proyek hanya `grilling`; pemeriksaan cepat `npm run cek`.
- Verifikasi: typecheck dan lint bersih; 30 berkas tes / 206 tes lulus; `next build` lulus; JS awal halaman utama 402–477 KB (batas baru 500 KB); mode demo dicoba di peramban (centang rutin, seret kartu papan).
- Belum: tinjauan pemilik di perangkat nyata; migrasi 11 belum dijalankan di Supabase; nama dalam kode Dunia 3D dan database demo masih bahasa Indonesia; tes perilaku UI baru belum ada.

## Sebelum redesain total — 11 sampai 22 Oktober 2026

- Rilis awal repo 3D (11 Okt): ruang kerja manajer dan Dunia Koperasi 3D yang membaca data yang sama.
- Fitur yang dibangun dan dipertahankan: tugas (daftar, papan, kalender, Gantt, harian), proyek, milestone, periode kerja, rapat dengan ICS, kegiatan, dokumen, risiko dan kendala, mitra, tim dan pelatihan, gerai dan kesiapan, laporan kerja, buku kas, anggota, barang, stok opname, pengiriman dan mutasi stok (migrasi 8), aset, absensi, pembelian, penjualan harian, simpanan anggota (migrasi 10), cadangan dan pemulihan data.
- Beberapa gaya tampilan dicoba lalu ditinggalkan (Lantai Dunia, Lavender Lekuk, Workbench, Indigo Studio, ClickUp/Monday). Rinciannya ada di riwayat Git.
