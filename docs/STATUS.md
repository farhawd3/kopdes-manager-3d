# Status produk

Keadaan terkini saja. Timpa bagian yang berubah; jangan menambah riwayat sesi di sini (riwayat ada di [CHANGELOG](../CHANGELOG.md)).

## Ruang kerja web

- **Gaya:** Warm Editorial Modern (terinspirasi Volingo) — canvas krem hangat `#faf8f5`, modul kartu putih murni `#ffffff` dengan garis pembatas 1px halus hangat `#efece6`, aksen terracotta terfokus `#ea580c` / `#c2410c` (WCAG AA 5.25:1), pil peach lembut `#fff7ed`, tombol aksi charcoal tegas `#1c1917`, sidebar wordmark `kopdes.`, bilah atas frosted glass, kartu spotlight "Saat Hari Ini", dan tautan langsung ke Dunia Koperasi 3D.
- **Beranda:** kartu hero spotlight "Saat Hari Ini" dengan glif visual dan tombol CTA tegas, rutin harian terstruktur, agenda hari ini dengan hitung mundur dan Catat hasil, perlu tindakan, pita minggu, proyek berjalan, usaha harian, kartu penutup prinsip kerja koperasi; tambah cepat satu kalimat (`@nama #proyek !prioritas besok`) dengan tombol aksi tegas, dan salin laporan harian.
- **Tugas:** daftar/papan/kalender/Gantt/harian, ubin status kompak kartu putih dengan lencana pastel, penanggung jawab dari Tim, saringan penanggung jawab, geser kartu di ponsel (selesai + Batalkan, atau ubah). Papan Kanban, kalender tugas (toolbar 2-klaster bersih, kisi lekuk 22px, status chip cerdas, agenda lekuk 24px dengan pemisah hari tegas), dan Gantt/linimasa (pil switch, responsif) telah diselaraskan ke gaya Lavender Lekuk penuh.
- **Agenda (`/rapat`):** jenis rapat/kunjungan/acara/lainnya, Catat hasil ke catatan kegiatan, unduhan ICS, tautan rapat online.
- **Lainnya:** proyek fleksibel dengan anggaran vs uang keluar, tab cakupan dan status pil penuh, seluruh kartu catatan entitas (pengiriman, dokumen, risiko, mitra, jurnal, kesiapan) telah diselaraskan ke standar bersih meeting-record dengan ikon domain 3D, baris rincian berikon, dan kotak seksi terstruktur. Kegiatan, tim, mitra, laporan (preset 7 hari/bulan ini/bulan lalu), lonceng pengingat, palet Ctrl+K, cadangan/pemulihan, PIN.
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
