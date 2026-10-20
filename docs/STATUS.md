# Status produk

Keadaan terkini saja. Timpa bagian yang berubah; jangan menambah riwayat sesi di sini (riwayat ada di [CHANGELOG](../CHANGELOG.md)).

## Ruang kerja web

- **Gaya:** Lavender Lekuk ([DESIGN](../DESIGN.md)): aksen #6A55C8, kartu datar bertakik, pil, mode gelap. Sidebar Kerja (Beranda, Hari ini, Tugas, Agenda, Proyek, Linimasa) + Ruang lain + kartu Tim; ponsel memakai dok pil terpusat dan tombol tambah bulat lavender. URL lama tetap sebagai tab hub.
- **Beranda:** rutin harian, agenda hari ini (jenis kegiatan, hitung mundur, Catat hasil), perlu tindakan, pita minggu, proyek berjalan, usaha harian; tambah cepat satu kalimat (`@nama #proyek !prioritas besok`) bergaris tegas dan salin laporan harian untuk grup WhatsApp pengurus.
- **Tugas:** daftar/papan/kalender/Gantt/harian, ubin status kompak kartu putih dengan lencana pastel, penanggung jawab dari Tim, saringan penanggung jawab, geser kartu di ponsel (selesai + Batalkan, atau ubah). Papan (Kanban) sudah bergaya Lavender Lekuk (kartu datar membulat 18px, tombol aksi cepat 44px, kolom snap); kalender dan Gantt masih menunggu penataan Lekuk.
- **Agenda (`/rapat`):** jenis rapat/kunjungan/acara/lainnya, Catat hasil ke catatan kegiatan, unduhan ICS, tautan rapat online.
- **Lainnya:** proyek fleksibel dengan anggaran vs uang keluar, kegiatan, dokumen, risiko/isu, tim, mitra, laporan (preset 7 hari/bulan ini/bulan lalu), lonceng pengingat, palet Ctrl+K, cadangan/pemulihan, PIN.
- **Pencatatan:** anggota, buku kas (uang masuk/keluar saja), barang, stok opname (tanpa koreksi otomatis), pengiriman, mutasi stok. Migrasi 10 menambah simpanan, penjualan gerai, pembelian, inventaris aset, jadwal & absensi; sebelum terpasang halamannya tampil "belum aktif".
- **Belum ada:** editor blok, kolaborasi real-time, PWA/offline, unggah berkas, jalur kritis, POS, akuntansi lengkap, pinjaman, penyusutan aset.

## Dunia Koperasi 3D

Kontrak di [DUNIA-KOPERASI](DUNIA-KOPERASI.md). Lima lokasi (Pulau, Kantor, Gerai, Gudang, Cold storage), panel logistik dengan grafik ringkas per lokasi, figur chibi dari data Tim, tautan dua arah dengan web. Warna panel masih biru #546FFF (belum ikut Lavender).

## Data, demo, dan cloud

- `npm run dev:demo` memakai data contoh di memori (tanpa Supabase/PIN; tidak aktif di Vercel). Seed `supabase/seed/SEED_DATA_CONTOH.sql` dijalankan pemilik.
- Supabase baru milik pemilik: migrasi 8 sudah dijalankan; migrasi 9 dan 10 siap di repo, belum dijalankan ([MIGRASI-SQL](MIGRASI-SQL.md)). AI tidak menjalankan SQL cloud.

## Pemeriksaan terakhir — 20 Oktober 2026

- 473 tes / 80 berkas, typecheck, lint, `lint:ui`, build lulus; JS awal 247 KB (batas 300 KB).
- `audit:tampilan` Beranda, Tugas, Agenda, form, dan palet: 0 temuan pada 375/768/1024/1440 px di mode demo.
- **Belum:** perangkat fisik (termasuk geser kartu), UAT data cloud, audit ukuran untuk halaman migrasi 10.

## Git

`main` di GitHub (`halimxn/kopdes-manager-3d`) adalah satu-satunya cabang aktif; tidak ada cabang kerja terbuka. Aturan cabang dan commit di [AGENTS](../AGENTS.md#git).
