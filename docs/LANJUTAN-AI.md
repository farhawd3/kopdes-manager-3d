# Serah terima AI

Berkas ini untuk agen berikutnya (Claude, Codex, Antigravity, OpenCode, dll.). Isinya hanya keadaan sekarang dan langkah berikut; timpa, jangan menambah catatan sesi.

## Keadaan (20 Oktober 2026)

- Cabang: `tampilan/papan-tugas-lekuk`.
- **Gaya Web: Modern Clean Look (Emerald Fresh & Slate Crystal)**:
  - Canvas terang bersih `#f8fafc` (slate-50), permukaan modul kartu putih murni `#ffffff` dengan border halus 1px `#e2e8f0`.
  - Aksen hijau zamrud presisi `#059669` / `#047857` (lolos kontras WCAG AA 5.48:1).
  - Sidebar modern minimalis, bilah atas frosted glass dengan blur 12px, serta tautan spasial langsung ke Dunia Koperasi 3D.
  - Bebas dari efek cat lantai penuh dan tepi tebal bawah yang berkesan kuno/jadul.
- Verifikasi: 473/473 tes vitest lulus 100% (80 berkas), typecheck 0 error, lint 0 error, lint:ui 0 error, build JS awal 247 KB, audit visual 0 temuan.

## Peta kode yang sering disentuh

| Bagian | Berkas |
|---|---|
| Token dan komponen gaya | `src/styles/token.css`, `komponen.css` (`.bertakik`, `.takik-aksi`), `kerangka.css`, `halaman/*.css`; aturan di `DESIGN.md` |
| Kerangka dan menu | `components/layout/AppShell.tsx`, `navigasi.ts` (`HUBS`, `MENU_KERJA`, `RUANG_LAIN`), `TabHub.tsx`, `components/ui/BottomNav.tsx` |
| Beranda | `features/dashboard/Dashboard.tsx`, `beranda-bantu.ts` (tambah cepat, laporan, hitung mundur) |
| Tugas | `features/records/Records.tsx`, `Editor.tsx`, `PilihPenanggung.tsx`, `features/tasks/ScrumBoardView.tsx`, `features/tasks/TaskCalendar.tsx`, `features/tasks/TaskTimeline.tsx`, `features/tasks/UbinStatusTugas.tsx` |
| Agenda | `features/meetings/jenis.ts`, kolom `jenis` di `records/schemas.ts` |
| Palet Ctrl+K | `features/workspace/WorkspaceSearch.tsx` |
| Dunia | `features/dunia-3d/MonitoringDashboard.tsx`, `model/` (lihat skill dunia-koperasi) |

## Langkah berikut (urut)

1. Pemilik menilai di mode demo dan perangkat fisik (dok navigasi lavender, ubin status, papan, kalender, dan Gantt).
2. Penyelarasan warna panel Dunia 3D ke Lavender (paket terpisah, skill dunia-koperasi).
3. Pemilik menjalankan migrasi 9 lalu 10 dan seed contoh terbaru di Supabase; periksa keadaan migrasi 1–8 dulu, jangan reset database berisi data.

Jangan menambah render idle ke dunia. Tidak ada migrasi, deploy, atau push tanpa permintaan pemilik.
