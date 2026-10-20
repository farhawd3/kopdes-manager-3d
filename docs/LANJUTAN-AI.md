# Serah terima AI

Berkas ini untuk agen berikutnya (Claude, Codex, Antigravity, OpenCode, dll.). Isinya hanya keadaan sekarang dan langkah berikut; timpa, jangan menambah catatan sesi.

## Keadaan (20 Oktober 2026)

- Cabang: `tampilan/papan-tugas-lekuk`.
- Gaya web Lavender Lekuk sudah lengkap untuk kerangka, Beranda, Tugas (daftar dan papan Kanban), Agenda, dok ponsel dengan tombol tambah lavender, dan palet Ctrl+K. Rincian di [STATUS](STATUS.md).
- Selektor tab di `scripts/audit-tampilan.mjs` sudah diperbaiki (`.workspace-page .tabs .ui-btn`) dan emulasi tema terang/gelap aktif.

## Peta kode yang sering disentuh

| Bagian | Berkas |
|---|---|
| Token dan komponen gaya | `src/styles/token.css`, `komponen.css` (`.bertakik`, `.takik-aksi`), `kerangka.css`, `halaman/*.css`; aturan di `DESIGN.md` |
| Kerangka dan menu | `components/layout/AppShell.tsx`, `navigasi.ts` (`HUBS`, `MENU_KERJA`, `RUANG_LAIN`), `TabHub.tsx`, `components/ui/BottomNav.tsx` |
| Beranda | `features/dashboard/Dashboard.tsx`, `beranda-bantu.ts` (tambah cepat, laporan, hitung mundur) |
| Tugas | `features/records/Records.tsx`, `Editor.tsx`, `PilihPenanggung.tsx`, `features/tasks/ScrumBoardView.tsx`, `features/tasks/UbinStatusTugas.tsx`, `components/ui/useSwipeAction.ts` |
| Agenda | `features/meetings/jenis.ts`, kolom `jenis` di `records/schemas.ts` |
| Palet Ctrl+K | `features/workspace/WorkspaceSearch.tsx` |
| Dunia | `features/dunia-3d/MonitoringDashboard.tsx`, `model/` (lihat skill dunia-koperasi) |

## Langkah berikut (urut)

1. Pemilik menilai di mode demo dan perangkat fisik (dok ponsel lavender, papan Kanban baru).
2. Tata kalender (`TaskCalendar.tsx`) dan Gantt (`TaskTimeline.tsx`) tugas ke gaya Lekuk.
3. Warna panel Dunia 3D ke Lavender (paket terpisah, skill dunia-koperasi).
4. Pemilik menjalankan migrasi 9 lalu 10 dan seed contoh terbaru di Supabase; periksa keadaan migrasi 1–8 dulu, jangan reset database berisi data.

Jangan menambah render idle ke dunia. Tidak ada migrasi, deploy, atau push tanpa permintaan pemilik.
