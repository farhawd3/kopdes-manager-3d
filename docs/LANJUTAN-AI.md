# Serah terima AI

## Lokasi kerja

- Repo `kopdes-manager-3d`, cabang utama `main`; kerjakan paket di cabang bertopik (`fitur/…`, `perbaikan/…`, `tampilan/…`, `dokumen/…`, `rapikan/…`). Aturan lengkap di [AGENTS](../AGENTS.md) dan [CONTRIBUTING](../CONTRIBUTING.md).
- Versi pixel lama ada di repo terpisah `kopdes-manager-web`; jangan diubah dari sini.
- Baca Git, [DUNIA-KOPERASI](DUNIA-KOPERASI.md), lalu [STATUS](STATUS.md).

## Keadaan aktif (12 Oktober 2026)

- Repo dibuat ulang dengan riwayat bersih; sisa pixel (PixiJS, aset gambar, skrip, pratinjau) dan prototipe 3D lama yang tidak dimuat sudah dibuang. Model data dunia ada di `src/features/dunia-3d/model/` (`world-model.ts`, `district.ts`, `schedule.ts`).
- Dunia: `/dunia-koperasi` memakai `MonitoringDashboard` (lima lokasi: Pulau, Kantor, Gerai, Gudang, Cold storage). Dok bawah Detail/Ringkasan/Daftar/Agenda (pilihan pemilik). Pratinjau `/dev/dunia-3d?contoh=1`.
- Web: sistem gaya baru bahasa dunia 3D di `src/styles/` (`token.css` → `dasar.css` → `komponen.css` → `kerangka.css` → `halaman/*.css`); lantai per ruang lewat `data-ruang` di `AppShell.tsx`; ikon dua nada `components/ui/Ikon3D.tsx`. Laci detail dan Terkait di `features/records/`. Konteks produk desain di `PRODUCT.md`.
- Mode demo `npm run dev:demo` (port bisa diatur `-- -p 3200`); seed `supabase/seed/SEED_DATA_CONTOH.sql` dan `HAPUS_DATA_CONTOH.sql` dijalankan pemilik.

## Lanjutan

1. Penilaian pemilik di mode demo; reset + seed cloud oleh pemilik.
2. Penilaian pemilik atas sistem gaya baru (sudah di `main` sejak 12 Oktober 2026); laporkan bagian yang belum serasi per halaman.
3. Pemeriksaan perangkat fisik dan UAT cloud.

Jangan menambahkan render idle ke dunia. Tidak ada migrasi, deploy, atau push tanpa permintaan pemilik.
