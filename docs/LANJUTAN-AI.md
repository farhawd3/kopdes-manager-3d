# Serah terima AI

Berkas ini untuk agen berikutnya (Claude, Codex, Antigravity, OpenCode, dll.). Isinya hanya keadaan sekarang dan langkah berikut; timpa, jangan menambah catatan sesi.

## Keadaan (21 Oktober 2026)

- Cabang: `tampilan/papan-tugas-lekuk`.
- **Gaya Web: Workbench** (redesain total, menggantikan Lantai Dunia dan semua arah lama):
  - Rel navigasi gelap `#0E1015`, kanvas abu sejuk `#F7F8FA`, panel putih `#FFFFFF` bergaris rambut 1px `#E4E7EC`, sudut 8–12 px, bayangan sangat tipis.
  - Aksen indigo tunggal `#4F46E5`; status semantik tetap hijau/merah/kuning dan selalu berteks. Tidak ada tepi lempeng, gradien hias, atau kartu pastel dekoratif.
  - Sidebar: merek `kopdes.`, kelompok Kerja, Ruang lain, kartu Tim, kaki Pengaturan/Panduan. Kartu profil, pil streak, dan swatch lantai sudah dihapus.
  - Beranda: empat ubin metrik menggantikan hero "Saat Hari Ini"; rutin, agenda, perlu tindakan, dan minggu ini memakai baris pemisah. Tugas: papan, ubin status, dan kartu dibuat lebih datar dan rapat.
  - Tipografi Bricolage Grotesque untuk judul/merek dan Plus Jakarta Sans untuk isi; angka tabular.
- Verifikasi: 473/473 tes vitest lulus (80 berkas), typecheck 0 error, lint 0 error, lint:ui 0 error, build Next.js lulus, JS awal 248 KB. Audit visual headless Chrome pada 1440x900, 1024x768, 768x1024, dan 375x812 (halaman, tampilan, laci, editor, dialog) serta mode gelap Beranda/Tugas: 0 temuan.

## Peta kode yang sering disentuh

| Bagian | Berkas |
|---|---|
| Token dan komponen gaya | `src/styles/token.css`, `komponen.css`, `kerangka.css`, `halaman/*.css`; arah baru di `docs/RENCANA-REDESAIN.md` |
| Kerangka dan menu | `components/layout/AppShell.tsx`, `navigasi.ts` (`HUBS`, `MENU_KERJA`, `RUANG_LAIN`), `TabHub.tsx`, `components/ui/BottomNav.tsx` |
| Beranda | `features/dashboard/Dashboard.tsx`, `beranda-bantu.ts` (tambah cepat, laporan, hitung mundur) |
| Tugas | `features/records/Records.tsx`, `Editor.tsx`, `PilihPenanggung.tsx`, `features/tasks/ScrumBoardView.tsx`, `features/tasks/TaskCalendar.tsx`, `features/tasks/TaskTimeline.tsx`, `features/tasks/UbinStatusTugas.tsx` |
| Agenda | `features/meetings/jenis.ts`, kolom `jenis` di `records/schemas.ts` |
| Palet Ctrl+K | `features/workspace/WorkspaceSearch.tsx` |
| Dunia | `features/dunia-3d/MonitoringDashboard.tsx`, `monitoring.css`, `model/` (lihat skill dunia-koperasi) |

## Langkah berikut (urut)

1. Pemilik menilai di mode demo dan perangkat fisik (dok navigasi, ubin status, papan, kalender, Gantt, laci, dan formulir).
2. Rapikan sisa halaman yang belum dilihat pada tinggi layar lain bila audit menemukan temuan; jangan mengembalikan gaya dekoratif lama.
3. Pemilik menjalankan migrasi 9 lalu 10 dan seed contoh terbaru di Supabase; periksa keadaan migrasi 1–8 dulu, jangan reset database berisi data.

Jangan menambah render idle ke dunia. Tidak ada migrasi, deploy, atau push tanpa permintaan pemilik.
