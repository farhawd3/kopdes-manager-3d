# Serah terima AI

Berkas ini untuk agen berikutnya (Claude, Codex, Antigravity, OpenCode, dll.). Isinya hanya keadaan sekarang dan langkah berikut; timpa, jangan menambah catatan sesi.

## Keadaan (21 Oktober 2026)

- Cabang: `tampilan/papan-tugas-lekuk`.
- **Gaya Web: Warm Editorial Modern & Arsitektur Kartu Volingo**:
  - Canvas krem hangat `#faf8f5`, permukaan kartu putih murni `#ffffff` dengan garis pembatas 1px hangat `#efece6`, sudut membulat 18–20px elegan.
  - Arsitektur kartu terinspirasi Volingo: rounded rectangle murni tanpa takik arcade, badge kode hitam solid (`TGS-XXX`), tab filter aktif charcoal gelap `#1C1917`, pil waktu, dan subtask mini progress track.
  - Aksen terracotta hangat `#ea580c` / `#c2410c` (WCAG AA 5.25:1), pil peach lembut `#fff7ed`, dan tombol aksi charcoal tegas `#1c1917`.
  - Sidebar wordmark `kopdes.` dengan titik aksen terracotta, kartu profil manajer, pil streak operasional (`🔥 Operasional Aktif · Shift Pagi`), dan menu navigasi terstruktur.
  - Beranda dengan kartu hero spotlight "Saat Hari Ini", kartu motivasi prinsip kerja koperasi, dan kartu rutin harian terstruktur.
- Verifikasi: 473/473 tes vitest lulus 100% (80 berkas), typecheck 0 error, lint 0 error, lint:ui 0 error, build Next.js lulus (JS awal 248 KB), audit visual headless Chrome pada 1440x900 dan 375x812: 0 temuan.

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
