# Serah terima AI

## Lokasi kerja

- Repo `kopdes-manager-3d`, cabang utama `main`; kerjakan paket di cabang bertopik (`fitur/…`, `perbaikan/…`, `tampilan/…`, `dokumen/…`, `rapikan/…`). Aturan lengkap di [AGENTS](../AGENTS.md) dan [CONTRIBUTING](../CONTRIBUTING.md).
- Versi pixel lama ada di repo terpisah `kopdes-manager-web`; jangan diubah dari sini.
- Baca Git, [DUNIA-KOPERASI](DUNIA-KOPERASI.md), lalu [STATUS](STATUS.md).

## Keadaan aktif (13 Oktober 2026)

- Repo dibuat ulang dengan riwayat bersih; sisa pixel (PixiJS, aset gambar, skrip, pratinjau) dan prototipe 3D lama yang tidak dimuat sudah dibuang. Model data dunia ada di `src/features/dunia-3d/model/` (`world-model.ts`, `district.ts`, `schedule.ts`).
- Dunia: `/dunia-koperasi` memakai `MonitoringDashboard` (lima lokasi: Pulau, Kantor, Gerai, Gudang, Cold storage). Dok bawah Detail/Ringkasan/Daftar/Agenda (pilihan pemilik). Pratinjau `/dev/dunia-3d?contoh=1`.
- Web: sistem gaya baru bahasa dunia 3D di `src/styles/` (`token.css` → `dasar.css` → `komponen.css` → `kerangka.css` → `halaman/*.css`); lantai per ruang lewat `data-ruang` di `AppShell.tsx`; ikon dua nada `components/ui/Ikon3D.tsx`. Laci detail dan Terkait di `features/records/`. Konteks produk desain di `PRODUCT.md`.
- Mode demo `npm run dev:demo` (port bisa diatur `-- -p 3200`); seed `supabase/seed/SEED_DATA_CONTOH.sql` dan `HAPUS_DATA_CONTOH.sql` dijalankan pemilik.
- Paket perbaikan di `perbaikan/cadangan-dan-aturan`: cadangan laporan mendukung kas/status dan format lama, API menyelaraskan status, kontrol bersama/aksi buku 44 px, kartu Harian muat di 360 px. Migrasi 9 memperbaiki status lama dan pemulihan, sudah diuji lokal tetapi belum dijalankan di cloud.
- Graphify opsional menurut AGENTS; aturan turunan menunjuk ke sana. CI menjalankan `lint:ui`; skill memakai rute pratinjau dan ukuran pemeriksaan yang sama.
- Verifikasi paket: 350 tes / 56 berkas, typecheck, lint, `lint:ui`, build lulus. Beranda/Tugas Harian/Barang/formulir Barang diperiksa pada 360/768/1024/1440 px; bukti dan batasan di STATUS. Perubahan pengguna yang belum di-commit tetap ada.

## Lanjutan

1. Penilaian pemilik di mode demo; reset + seed cloud oleh pemilik.
2. Penilaian pemilik atas sistem gaya baru (sudah di `main` sejak 12 Oktober 2026); laporkan bagian yang belum serasi per halaman.
3. Pemeriksaan perangkat fisik dan UAT cloud.
4. Periksa keadaan migrasi 1–8 pada proyek Supabase baru sebelum pemilik menerapkan migrasi 9; jangan memakai reset/install pada database berisi data. Uji cadangan/pemulihan cloud tetap terbuka.

Jangan menambahkan render idle ke dunia. Tidak ada migrasi, deploy, atau push tanpa permintaan pemilik.
