# Serah terima AI

Berkas ini untuk agen berikutnya (Claude, Codex, Antigravity, OpenCode, dll.). Isinya hanya keadaan sekarang dan langkah berikut; timpa, jangan menambah catatan sesi.

## Keadaan (21 Oktober 2026)

- Cabang: `tampilan/redesain-total` (berisi checkpoint gaya "Indigo Studio" dan 13 commit gaya lama yang belum masuk `main`).
- **Redesain total web: arah dipilih, prototipe siap, kode belum dikerjakan.** Pemilik menolak lima arah dunia sebagai "terlalu kuno" dan memilih acuan ClickUp/Monday, berani dan berwarna. Prototipe interaktif: `docs/desain/redesain-total.html` (`python -m http.server 3300 -d docs/desain`). Acuan tunggal: [REDESAIN-TOTAL](REDESAIN-TOTAL.md); prompt agen: [PROMPT-DEEPSEEK](PROMPT-DEEPSEEK.md). Pemilik akan memakai DeepSeek, satu paket per sesi.
- Kunci gaya lama sudah dilepas: AGENTS, PRODUCT, DESAIN-ANTARMUKA, skill `ui-ux-kopdes`; `DESIGN.md` dan rencana Workbench diarsipkan di `docs/arsip/`. `DESIGN.md` baru ditulis di paket 9.
- Warna aksen belum ditetapkan: prototipe punya pemilih lima aksen (Ungu, Biru, Hijau, Oranye, Magenta) dan tema gelap; bawaan sementara Ungu.
- Kode tampilan masih gaya lama (rel ungu bergradien); temuan yang harus diperbaiki ada di bagian 1 REDESAIN-TOTAL.
- Verifikasi terakhir kode (sebelum checkpoint): 473/473 tes, typecheck, lint, lint:ui, build lulus; JS awal 248 KB. Checkpoint Indigo Studio belum diuji ulang.

## Peta kode yang sering disentuh

| Bagian | Berkas |
|---|---|
| Token dan komponen gaya | `src/styles/token.css`, `komponen.css`, `kerangka.css`, `halaman/*.css`; arah di `docs/REDESAIN-TOTAL.md` |
| Kerangka dan menu | `components/layout/AppShell.tsx`, `navigasi.ts` (`HUBS`, `MENU_KERJA`, `RUANG_LAIN`), `TabHub.tsx`, `components/ui/BottomNav.tsx` |
| Beranda | `features/dashboard/Dashboard.tsx`, `beranda-bantu.ts` (tambah cepat, laporan, hitung mundur) |
| Tugas | `features/records/Records.tsx`, `Editor.tsx`, `PilihPenanggung.tsx`, `features/tasks/ScrumBoardView.tsx`, `features/tasks/TaskCalendar.tsx`, `features/tasks/TaskTimeline.tsx`, `features/tasks/UbinStatusTugas.tsx` |
| Agenda | `features/meetings/jenis.ts`, kolom `jenis` di `records/schemas.ts` |
| Palet Ctrl+K | `features/workspace/WorkspaceSearch.tsx` |
| Dunia | `features/dunia-3d/MonitoringDashboard.tsx`, `monitoring.css`, `model/` (lihat skill dunia-koperasi) |

## Langkah berikut (urut)

1. Paket 1 REDESAIN-TOTAL (fondasi + pemilih aksen) — jalankan dengan prompt di PROMPT-DEEPSEEK.
2. Pemilik memilih aksen bawaan dari prototipe.
3. Paket 2–9 berurutan, satu paket per sesi.
4. Pemilik menjalankan migrasi 9 lalu 10 dan seed contoh terbaru di Supabase; periksa keadaan migrasi 1–8 dulu, jangan reset database berisi data.

Jangan menambah render idle ke dunia. Tidak ada migrasi, deploy, atau push tanpa permintaan pemilik.