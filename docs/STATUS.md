# Status produk

Keadaan terkini saja. Timpa bagian yang berubah; jangan menambah riwayat sesi di sini (riwayat ada di [CHANGELOG](../CHANGELOG.md)).

## Ruang kerja web

- **Gaya:** sedang dirombak total menurut [REDESAIN-TOTAL](REDESAIN-TOTAL.md). Arah dipilih pemilik: acuan ClickUp/Monday, berani dan berwarna; prototipe interaktif di `docs/desain/redesain-total.html`. **Paket 1 (fondasi) selesai:** token netral/aksen/ruang/status/prioritas/grafik, Figtree, tema terang bawaan, dan pemilih lima aksen + terang/gelap (menu profil dan Pengaturan › Tampilan). Halaman operasional masih memakai tata letak checkpoint "Indigo Studio"; kerangka dan halaman dirombak bertahap di paket 2–9.
- **Beranda:** sapaan ringkas, ubin metrik, tambah cepat satu kalimat (`@nama #proyek !prioritas besok`), rutin harian, agenda hari ini dengan Catat hasil, perlu tindakan, minggu ini, proyek berjalan, dan salin laporan harian. Warna hanya untuk status dan aksi, bukan latar dekoratif.
- **Tugas:** daftar/papan/kalender/Gantt/harian dengan ubin status datar, papan Kanban berkartu rapat, pengalih tampilan, penanggung jawab dari Tim, serta laci dan formulir bergaris tipis.
- **Agenda (`/rapat`):** jenis rapat/kunjungan/acara/lainnya, Catat hasil ke catatan kegiatan, unduhan ICS, tautan rapat online.
- **Lainnya:** proyek fleksibel dengan anggaran vs uang keluar, kartu catatan memakai tombol aksi netral (hanya tautan "Lihat di dunia" berlatar indigo lembut), pencarian buku, layar PIN, pengaturan, laporan (preset 7 hari/bulan ini/bulan lalu), lonceng pengingat, palet Ctrl+K, cadangan/pemulihan.
- **Pencatatan:** anggota, buku kas (uang masuk/keluar saja), barang, stok opname (tanpa koreksi otomatis), pengiriman, mutasi stok. Migrasi 10 menambah simpanan, penjualan gerai, pembelian, inventaris aset, jadwal & absensi; sebelum terpasang halamannya tampil "belum aktif".
- **Belum ada:** editor blok, kolaborasi real-time, PWA/offline, unggah berkas, jalur kritis, POS, akuntansi lengkap, pinjaman, penyusutan aset.

## Dunia Koperasi 3D

Kontrak di [DUNIA-KOPERASI](DUNIA-KOPERASI.md). Lima lokasi (Pulau, Kantor, Gerai, Gudang, Cold storage), panel logistik dengan grafik ringkas per lokasi, figur chibi dari data Tim, tautan dua arah dengan web. Warna panel masih biru #546FFF dan tidak termasuk redesain web.

## Data, demo, dan cloud

- `npm run dev:demo` memakai data contoh di memori (tanpa Supabase/PIN; tidak aktif di Vercel). Seed `supabase/seed/SEED_DATA_CONTOH.sql` dijalankan pemilik.
- Supabase baru milik pemilik: migrasi 8 sudah dijalankan; migrasi 9 dan 10 siap di repo, belum dijalankan ([MIGRASI-SQL](MIGRASI-SQL.md)). AI tidak menjalankan SQL cloud.

## Pemeriksaan terakhir — 22 Oktober 2026 (paket 1)

- 478 dari 480 tes Vitest lulus (82 berkas); dua tes Beranda gagal karena checkpoint "Indigo Studio" menambah judul sorotan yang menduplikasi judul rutin — bukan dari paket 1, akan dirombak di paket 4. Typecheck 0 error, lint 0 error, `lint:ui` 0 error, build lulus; JS awal 250 KB (batas 300 KB).
- `check:ui` gagal: 50 kontrol HTML mentah di luar `components/ui` (keadaan sebelum paket juga 50). Kontrol baru `PemilihTampilan` memakai elemen di dalam `components/ui` sehingga tidak menambah temuan.
- `audit:tampilan` mode demo: 375×812 dan 768×1024 terang, 58 keadaan, 0 temuan. 1024, 1440, dan mode gelap dijalankan pada sesi yang sama (lihat CHANGELOG).
- **Belum:** pengujian langsung di layar fisik oleh pemilik, UAT data cloud, penyelarasan warna monitoring Dunia 3D ke tema baru, migrasi 50 kontrol mentah, dan pemilihan aksen bawaan (paket 9).

## Git

Cabang kerja aktif: `tampilan/redesain-total`. Aturan cabang dan commit di [AGENTS](../AGENTS.md#git).
