# Status produk

Keadaan terkini saja. Timpa bagian yang berubah; jangan menambah riwayat sesi di sini (riwayat ada di [CHANGELOG](../CHANGELOG.md)).

## Ruang kerja web

- **Gaya:** Modern Clean (Emerald Fresh & Slate Crystal) — canvas slate-50 bersih #f8fafc, modul kartu putih murni #ffffff dengan border halus 1px #e2e8f0, aksen hijau zamrud presisi #059669 / #047857 (WCAG AA 5.48:1), sidebar modern minimal, bilah atas frosted glass blur 12px, dan tautan spasial langsung ke Dunia Koperasi 3D. Menghapus efek cat lantai penuh dan tepi tebal jadul.
- **Beranda:** Sistem Cockpit Operasional terpadu ala Linear/Things 3/Routine: live operational status radar WIB, dial momentum energi SVG sirkular (% rutin harian), tab filter perspektif dinamis (`Semua Fokus`, `Alur Kerja`, `Prioritas & Radar`, `Vitalitas Usaha`), portal spasial 3D ke ruang kerja kantor, quick-capture command island dengan tombol sematan interaktif (`@Staf`, `#Proyek`, `!Tinggi`, `Besok`) serta bilah preview deteksi pintar real-time, rutinitas harian taktil dengan perayaan konfeti, agenda hari ini dengan hitung mundur dan penanda garis kini, perlu tindakan, pita radar minggu ini, proyek berjalan, usaha harian, dan salin laporan kerja.
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

## Pemeriksaan terakhir — 20 Oktober 2026

- 473 tes / 80 berkas vitest lulus 100%, typecheck, lint, `lint:ui`, build lulus; JS awal 247 KB (batas 300 KB).
- `audit:tampilan` tugas-kalender pada 1024x1400 dan 375x812: 0 temuan di mode demo.
- **Belum:** perangkat fisik (termasuk geser kartu), UAT data cloud, penyelarasan warna monitoring Dunia 3D ke Lavender.

## Git

Cabang kerja aktif: `tampilan/papan-tugas-lekuk`. Aturan cabang dan commit di [AGENTS](../AGENTS.md#git).
