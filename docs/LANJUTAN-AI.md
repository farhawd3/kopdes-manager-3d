# Serah terima AI

Berkas ini untuk agen berikutnya (Claude, Codex, Antigravity, OpenCode, dll.). Isinya hanya keadaan sekarang dan langkah berikut; timpa, jangan menambah catatan sesi.

## Keadaan (22 Oktober 2026)

- Cabang: `tampilan/redesain-total`.
- **Paket 1 (fondasi) selesai.** Token baru di `src/styles/token.css` (netral terang/gelap, lima aksen, warna ruang/status/prioritas, enam seri grafik), huruf Figtree, tema terang bawaan, dan pemilih aksen + tema (`src/components/ui/PemilihTampilan.tsx`, `src/lib/tampilan.ts`) di menu profil dan Pengaturan › Tampilan.
- Warna aksen bawaan sementara **Ungu**; pemilik belum memilih. Pemilihan ditetapkan di paket 9.
- Halaman operasional dan kerangka **belum dirombak**: masih memakai tata letak checkpoint "Indigo Studio" dengan token baru lewat blok "alias sementara". Blok itu dihapus di paket 9 setelah semua halaman pindah.
- `check:ui` masih gagal karena 50 kontrol HTML mentah di luar `components/ui` (jumlah sama sebelum paket 1); dimigrasi saat halamannya disentuh.
- Dua tes Beranda gagal karena checkpoint Indigo Studio menambah judul sorotan yang menduplikasi judul rutin; akan hilang saat Beranda dirombak di paket 4.
- Verifikasi terakhir: 478/480 tes, typecheck/lint/lint:ui/build lulus, JS awal 250 KB; audit 375×812 dan 768×1024 terang 0 temuan (58 keadaan).

## Peta kode yang sering disentuh

| Bagian | Berkas |
|---|---|
| Token dan komponen gaya | `src/styles/token.css`, `dasar.css`, `komponen.css`, `kerangka.css`, `halaman/*.css`; arah di `docs/REDESAIN-TOTAL.md` |
| Pemilih aksen/tema | `components/ui/PemilihTampilan.tsx`, `lib/tampilan.ts`, `lib/ThemeContext.tsx`, `app/layout.tsx` |
| Kerangka dan menu | `components/layout/AppShell.tsx`, `navigasi.ts` (`HUBS`, `MENU_KERJA`, `RUANG_LAIN`), `TabHub.tsx`, `components/ui/BottomNav.tsx` |
| Beranda | `features/dashboard/Dashboard.tsx`, `beranda-bantu.ts` |
| Tugas | `features/records/Records.tsx`, `Editor.tsx`, `features/tasks/*` |
| Agenda | `features/meetings/jenis.ts`, kolom `jenis` di `records/schemas.ts` |
| Palet Ctrl+K | `features/workspace/WorkspaceSearch.tsx` |
| Dunia | `features/dunia-3d/MonitoringDashboard.tsx`, `monitoring.css`, `model/` (tidak termasuk redesain) |

## Langkah berikut (urut)

1. **Paket 2 — Kerangka & navigasi:** sidebar putih 252 px dengan ruang berwarna yang bisa dilipat dan memuat semua halaman satu klik, breadcrumb + `h1`, palet perintah Ctrl K, dok ponsel 4 item, `TabHub`, sesuaikan tes navigasi/kerangka. Rute/slug tidak berubah.
2. Paket 3 kit grafik (`components/charts/`, `lib/statistik.ts`), lalu paket 4 Beranda (sekaligus membereskan dua tes Beranda yang gagal).
3. Paket 5–8 (Tugas, Proyek/Hari ini/Agenda/Linimasa, Catatan+Laporan, Usaha & Koperasi), lalu paket 9 penutup (hapus alias token, tetapkan aksen bawaan pilihan pemilik, tulis `DESIGN.md`).
4. Pemilik menjalankan migrasi 9 lalu 10 dan seed contoh terbaru di Supabase; periksa keadaan migrasi 1–8 dulu, jangan reset database berisi data.

Jangan menambah render idle ke dunia. Tidak ada migrasi, deploy, atau push tanpa permintaan pemilik.
