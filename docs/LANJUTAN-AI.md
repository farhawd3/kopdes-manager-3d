# Serah terima AI

Berkas ini untuk agen berikutnya (Claude, Codex, Antigravity, OpenCode, dll.). Isinya hanya keadaan sekarang dan langkah berikut; timpa, jangan menambah catatan sesi.

## Keadaan (20 Oktober 2026)

- Cabang: `tampilan/papan-tugas-lekuk`.
- **Redesain Lantai Dunia Disetujui Pemilik** (`docs/RENCANA-REDESAIN.md`):
  - Paket 0 (Pelepasan kunci dokumen) selesai: aturan gaya di `AGENTS.md`, `PRODUCT.md`, skill `ui-ux-kopdes`, dan `docs/DESAIN-ANTARMUKA.md` dialihkan ke arah "Lantai Dunia" (rel biru batu `#2F3B63`, latar lantai ruang diorama, permukaan modul putih hangat, modul lempeng taktil, aksen jingga kayu `#AC5108`/`#C8680F`). `DESIGN.md` lama ditandai usang/transisi.
  - Paket berikutnya: Paket 1 (Token warna & kerangka rel biru batu / latar ruang), Paket 2 (Komponen modul lempeng), Paket 3 (Beranda POC).
- Verifikasi: 473/473 tes vitest lulus, typecheck, lint, lint:ui, build (JS awal 247 KB), dan `audit:tampilan` 58/58 layar 0 temuan di 375x812.

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
