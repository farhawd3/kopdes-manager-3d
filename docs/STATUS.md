# Status produk

Keadaan terkini saja. Timpa bagian yang berubah; jangan menambah riwayat sesi di sini (riwayat ada di [CHANGELOG](../CHANGELOG.md)).

## Ruang kerja web

- **Gaya:** Workbench — rel navigasi gelap `#0E1015`, kanvas abu sejuk `#F7F8FA`, panel putih `#FFFFFF` bergaris rambut 1px, sudut 8–12 px, bayangan sangat tipis, dan aksen indigo tunggal `#4F46E5`. Beranda memakai empat ubin metrik (Terlambat, Jatuh tempo hari ini, Tugas terbuka, Agenda hari ini), bukan hero gradien; rutin dan agenda menjadi baris pemisah. Sidebar memuat merek, kelompok Kerja, Ruang lain, kartu Tim, dan kaki Pengaturan/Panduan.
- **Beranda:** sapaan ringkas, ubin metrik, tambah cepat satu kalimat (`@nama #proyek !prioritas besok`), rutin harian, agenda hari ini dengan Catat hasil, perlu tindakan, minggu ini, proyek berjalan, dan salin laporan harian. Warna hanya untuk status dan aksi, bukan latar dekoratif.
- **Tugas:** daftar/papan/kalender/Gantt/harian dengan ubin status datar, papan Kanban berkartu rapat, pengalih tampilan, penanggung jawab dari Tim, serta laci dan formulir bergaris tipis.
- **Agenda (`/rapat`):** jenis rapat/kunjungan/acara/lainnya, Catat hasil ke catatan kegiatan, unduhan ICS, tautan rapat online.
- **Lainnya:** proyek fleksibel dengan anggaran vs uang keluar, kartu catatan memakai tombol aksi netral (hanya tautan "Lihat di dunia" berlatar indigo lembut), pencarian buku, layar PIN, pengaturan, laporan (preset 7 hari/bulan ini/bulan lalu), lonceng pengingat, palet Ctrl+K, cadangan/pemulihan.
- **Pencatatan:** anggota, buku kas (uang masuk/keluar saja), barang, stok opname (tanpa koreksi otomatis), pengiriman, mutasi stok. Migrasi 10 menambah simpanan, penjualan gerai, pembelian, inventaris aset, jadwal & absensi; sebelum terpasang halamannya tampil "belum aktif".
- **Belum ada:** editor blok, kolaborasi real-time, PWA/offline, unggah berkas, jalur kritis, POS, akuntansi lengkap, pinjaman, penyusutan aset.

## Dunia Koperasi 3D

Kontrak di [DUNIA-KOPERASI](DUNIA-KOPERASI.md). Lima lokasi (Pulau, Kantor, Gerai, Gudang, Cold storage), panel logistik dengan grafik ringkas per lokasi, figur chibi dari data Tim, tautan dua arah dengan web. Warna panel masih biru #546FFF (belum ikut Lavender).

## Data, demo, dan cloud

- `npm run dev:demo` memakai data contoh di memori (tanpa Supabase/PIN; tidak aktif di Vercel). Seed `supabase/seed/SEED_DATA_CONTOH.sql` dijalankan pemilik.
- Supabase baru milik pemilik: migrasi 8 sudah dijalankan; migrasi 9 dan 10 siap di repo, belum dijalankan ([MIGRASI-SQL](MIGRASI-SQL.md)). AI tidak menjalankan SQL cloud.

## Pemeriksaan terakhir — 21 Oktober 2026

- 473 tes / 80 berkas vitest lulus 100%, typecheck tsc 0 error, lint eslint 0 error, `lint:ui` 0 error, build lulus; JS awal 248 KB (batas 300 KB).
- `audit:tampilan` pada 1440x900 dan 375x812: 0 temuan di mode demo.
- **Belum:** pengujian langsung di layar fisik oleh pemilik, UAT data cloud, penyelarasan warna monitoring Dunia 3D ke tema baru.

## Git

Cabang kerja aktif: `tampilan/papan-tugas-lekuk`. Aturan cabang dan commit di [AGENTS](../AGENTS.md#git).
