# Redesain Total Web — "Meja Kerja Terang"

Tanggal: 21 Oktober 2026 · Status: **disetujui sebagai rencana, belum dikerjakan** · Cabang: `tampilan/redesain-total`

Arahan pemilik: rombak tampilan web secara total menjadi **task manager yang bersih, rapi, dan profesional**, fitur mudah dijangkau, dan memakai **grafik yang mudah dipahami**. Jangan terikat desain lama. Pemilik belum menentukan warna, jadi web menyediakan **pemilih palet** di demo; warna bawaan ditetapkan setelah pemilik mencoba.

Dokumen ini adalah **satu-satunya acuan gaya web**. Dokumen gaya lama (Lavender Lekuk, Lantai Dunia, Workbench) ada di `docs/arsip/` hanya sebagai riwayat. Pola fungsi halaman (apa isi tiap halaman, laci, saran, rute) tetap di [DESAIN-ANTARMUKA](DESAIN-ANTARMUKA.md). Prompt siap pakai untuk agen: [PROMPT-DEEPSEEK](PROMPT-DEEPSEEK.md).

---

## 1. Temuan pemeriksaan (demo :3200, 21 Oktober 2026)

- Kode berisi checkpoint "Indigo Studio": rel navigasi ungu gelap bergradien, kartu hero gradien, glow. Bertentangan dengan dokumen lama dan terasa ramai, bukan alat kerja.
- **Beranda terlalu panjang** (±3.050 px di 1440×900, ±10 modul berurutan). Yang penting tenggelam.
- **Label ubin terpotong** di lebar 800 px ("TERLAMB…", "JATUH TE…", "Perlu ditin…").
- **Isi tidak tampil saat gulir cepat** (layar kosong di tengah Beranda); kemungkinan `src/components/ui/useMotionEntry.ts` menunggu IntersectionObserver.
- **Navigasi dua lapis**: 6 hub → tab per hub (±30 halaman). Banyak halaman perlu dua klik; "Agenda" (`/rapat`) muncul di dua kelompok.
- **Grafik tidak seragam**: `GrafikBanding`/`Donat` (SVG), `ReadinessRadar`, `Meter`, `RiskMatrix`, batang CSS `.jual-grafik`, `.hadir-bilah`, `.project-progress-fill`. Laporan, Buku kas, dan Proyek tidak punya grafik.
- CSS ±6.700 baris kelas kustom; `token.css` penuh grup sisa (`--lantai-*`, `--lempeng-*`, `--wood-*`, `--wall-*`, `--pastel-*`, `--grad-*`, `--tint-*`, `--violet-*`).

## 2. Konsep

Mode **Operate**: manajer datang untuk menyelesaikan pekerjaan. Kanvas terang netral, panel putih bergaris rambut, **satu aksen** (dipilih pemilik), data lebih dulu, grafik kecil yang langsung menjawab tiga pertanyaan: *berapa*, *membaik atau tidak*, *apa yang harus dikerjakan*. Tidak ada gradien, glow, kartu pastel, ilustrasi hias, atau slogan. Kepribadian datang dari ketepatan: jarak rapi, angka tabular, status jelas.

Acuan rasa (bukan untuk ditiru): Linear, Todoist, Asana mode daftar — padat, tenang, cepat dipindai.

## 3. Token (`src/styles/token.css`, ditulis ulang)

Tiga lapis: primitif (hanya di berkas ini) → semantik (dipakai CSS lain) → komponen bila perlu. Terang di `:root`, gelap di `:root.dark`, aksen di `:root[data-palet="…"]` dan `:root.dark[data-palet="…"]`.

**Netral**

| Token | Terang | Gelap |
|---|---|---|
| `--bg` (kanvas) | `#F8F9FB` | `#0B0D12` |
| `--panel` | `#FFFFFF` | `#12151C` |
| `--panel-2` (isian, hover, kepala tabel) | `#F3F4F6` | `#181C25` |
| `--line` | `#E5E7EB` | `#262B36` |
| `--line-strong` | `#D1D5DB` | `#353B48` |
| `--text-1` (judul, isi utama) | `#111827` | `#F3F4F6` |
| `--text-2` (isi sekunder) | `#4B5563` | `#C4C9D4` |
| `--text-3` (keterangan) | `#6B7280` | `#9AA1AE` |

**Aksen — lima palet untuk dipilih pemilik** (nilai awal; boleh disetel asal tes kontras lulus)

| `data-palet` | Nama di UI | `--accent` terang | `--accent-hover` | `--accent-soft` | `--accent` gelap | `--accent-text` gelap | `--on-accent` |
|---|---|---|---|---|---|---|---|
| `biru` (bawaan sementara) | Biru tinta | `#1D4ED8` | `#1E40AF` | `#EFF4FF` | `#2563EB` | `#93B4FD` | putih |
| `zamrud` | Zamrud | `#047857` | `#065F46` | `#ECFDF5` | `#047857` | `#6EE7B7` | putih |
| `indigo` | Indigo | `#4F46E5` | `#4338CA` | `#EEF2FF` | `#4F46E5` | `#A5B4FC` | putih |
| `grafit` | Grafit | `#18181B` | `#3F3F46` | `#F4F4F5` | `#E4E4E7` | `#E4E4E7` | `#18181B` di gelap, putih di terang |
| `kunyit` | Kunyit tua | `#B45309` | `#92400E` | `#FFF7ED` | `#B45309` | `#FCD34D` | putih |

Setiap palet juga mendefinisikan `--accent-text` terang (= `--accent` atau lebih gelap), `--focus-ring` (aksen 40 % via `color-mix`), dan `--grafik-3` (lihat grafik). Teks di atas isi aksen **selalu** `--on-accent`.

**Status** (sama untuk semua palet, selalu bersama teks): `--ok` hijau, `--warn` kuning tua, `--late` merah, `--info` biru abu; masing-masing `-soft` untuk latar cip. Kontras teks ≥ 4,5:1 di atas `--panel` dan `-soft`.

**Grafik**: `--grafik-1` = `--accent`; `--grafik-2` = slate netral (`#64748B` / gelap `#94A3B8`) untuk pembanding; `--grafik-3` ditentukan per palet agar berbeda rona dari aksen; `--grafik-grid` = `--line`. Distribusi status memakai token status.

**Bentuk & jarak**: radius `--r-sm 6px`, `--r-md 8px`, `--r-lg 10px`, `--r-full`; panel tanpa bayangan (garis 1 px saja); `--shadow-pop` hanya untuk menu, popover, dialog, dok ponsel. Jarak 4/8/12/16/24/32. Tinggi kontrol 36 px (desktop, pointer halus) dan ≥ 44 px untuk `pointer: coarse`.

**Huruf**: satu keluarga **Plus Jakarta Sans** (sudah lokal). Hapus `@fontsource-variable/bricolage-grotesque` dari `layout.tsx` dan `package.json`. Skala: `h1` 20 px/650, `h2` 16 px/600, isi 14 px/1,5, tabel padat 13 px, label 12 px/600. Angka `tabular-nums`. Tanpa label kecil di atas judul.

**Hapus** grup sisa: `--lantai-*`, `--lempeng-*`, `--wood-*`, `--wall-*`, `--pastel-*`, `--grad-*`, `--tint-*`, `--violet-*`, `--sampul-*`, `--rel-*`. Agar tidak semua CSS pecah sekaligus, nama lama yang masih dipakai boleh sementara dipetakan ke token baru di blok "alias sementara" lalu dihapus di paket 9.

## 4. Pemilih palet dan tema (permintaan pemilik)

- `src/app/layout.tsx`: skrip inline sekarang membaca `hub-theme` (bawaan `system`) dan sisa `hub-color-style` (bawaan `sky`). Ganti: `hub-theme` bawaan **`light`**; `hub-palet` → atribut `data-palet` di `<html>` (bawaan `biru`, nilai tak dikenal jatuh ke `biru`). Dijalankan sebelum render, tanpa kedip.
- Menu profil di bilah atas: bagian **Warna aksen** (5 swatch bundar berlabel nama, `role="radiogroup"`, panah kiri/kanan berpindah) dan **Tema** (Terang / Gelap / Ikuti sistem).
- Pengaturan → tab **Tampilan**: pilihan yang sama + **pratinjau** kecil (tombol utama, cip status, satu baris tugas, grafik batang mini) supaya pemilik bisa membandingkan.
- Simpan di `localStorage` dengan try/catch; tersedia di demo dan produksi (preferensi per pengguna). Satu modul kecil (mis. `src/lib/tampilan.ts`) memegang daftar palet + baca/tulis; jangan menyalin daftar palet di beberapa tempat.

## 5. Kerangka dan navigasi

Berkas: `src/components/layout/{AppShell.tsx,navigasi.ts,TabHub.tsx}`, `src/components/ui/BottomNav.tsx`, `src/features/workspace/WorkspaceSearch.tsx`, `src/styles/kerangka.css`.

- **Sidebar terang** 240 px (`--panel`, garis kanan 1 px), bukan rel gelap:
  1. Merek (inisial + nama koperasi dari profil).
  2. Tombol **Cari… Ctrl K** selebar sidebar.
  3. Kelompok **Kerja**: Beranda, Hari ini, Tugas, Proyek, Agenda, Linimasa.
  4. Kelompok **Catatan**, **Usaha**, **Koperasi**: bagian yang bisa dilipat dan **langsung memuat semua halamannya** (satu klik ke halaman mana pun). Kelompok halaman aktif selalu terbuka; status lipat disimpan.
  5. **Dunia 3D**, lalu kaki Pengaturan dan Panduan.
  - Item aktif: latar `--accent-soft`, teks `--accent-text`, garis kiri 2 px aksen. Hapus kartu "Tim" mengambang (Tim tetap di kelompok Koperasi).
- Tablet 768–1023 px: rel ikon 64 px dengan tooltip dan label untuk pembaca layar; tombol untuk membuka sidebar penuh sebagai laci.
- **Bilah atas**: breadcrumb `Kelompok / Halaman` + `h1`, lalu Cari, **Tambah** (aksen), Notifikasi, Profil.
- `TabHub` tetap untuk berpindah antarhalaman sekelompok: tab teks dengan garis bawah 2 px, bergulir di ponsel.
- **Palet perintah Ctrl K** menjadi jalur tercepat: semua halaman (dari `navigasi.ts`), aksi "Tambah tugas / rapat / catatan kas / barang / …", dan hasil cari data. Navigasi keyboard penuh.
- **Ponsel ≤ 767 px**: bilah bawah 4 item (Beranda, Tugas, Agenda, Menu) + tombol Tambah; "Menu" membuka lembar berisi semua kelompok. Hormati safe area.
- `navigasi.ts` tetap sumber tunggal; `HUBS` menjadi data kelompok sidebar. **Rute/slug tidak berubah** (dipakai tautan dunia↔web dan `?record=`).

## 6. Kit grafik (`src/components/charts/`)

SVG tanpa pustaka (batas JS awal 300 KB). Komponen seragam, satu gaya:

| Komponen | Untuk |
|---|---|
| `GrafikBatang` | vertikal/horizontal, satu atau grup (≤ 3 seri) |
| `GrafikBatangTumpuk` | tumpuk dan **100 % satu baris** (distribusi status) |
| `GrafikGaris` | tren waktu 1–3 seri, opsional area; seri dibedakan gaya garis juga |
| `Donat` | sudah ada di `GrafikLembut.tsx`, dirapikan; maks 5 irisan |
| `Meter` / `Progres` | sudah ada (`Charts.tsx`, `ui/Progress.tsx`) |
| `Sparkline` | tren kecil di ubin KPI |
| `GrafikKosong` | keadaan kosong / galat / "pencatatan belum aktif" |

Aturan wajib:
- Sumbu batang mulai 0; garis kisi tipis `--grafik-grid`; label nilai langsung pada batang/ujung garis bila muat.
- Tooltip saat hover **dan** fokus keyboard (setiap titik/batang bisa difokus, atau satu kontrol panah).
- Bungkus `<figure>` + `<figcaption>` berisi **ringkasan satu kalimat** dari data, mis. "12 tugas selesai minggu ini, naik dari 8".
- `<details><summary>Lihat tabel</summary>…</details>` sebagai cadangan aksesibel.
- Warna dari `--grafik-*`; status pakai token status + teks. Rupiah singkat lewat helper `singkat` di `GrafikLembut.tsx`.
- Memuat, kosong, galat, dan belum aktif dibedakan; **tidak pernah nol palsu**. Tanpa animasi bila reduced-motion.
- Cetak (Laporan): grafik tetap terbaca hitam-putih (pola/garis putus, label nilai).
- `ReadinessRadar` dan `RiskMatrix` dipertahankan, gayanya disamakan.

**Agregasi data** dalam fungsi murni teruji, mis. `src/lib/statistik.ts`: `hitungTugasPerStatus`, `tugasSelesaiPerHari`, `kasPerMinggu`, `progresProyek`, `penjualanPerHari`, `absensiPerStatus`, `simpananPerJenis`. Pakai yang sudah ada, jangan menduplikasi rumus: `lib/progress.ts` (`scopeProgress`, `planProgress`, `isOverdue`), `lib/task-status.ts`, `features/operations/ledger.ts` (`cashSummary`), `features/dashboard/KasBanding.tsx` (`kumulatifHarian`, `ringkasKas`), `features/reports/report-snapshot.ts` (`reportSnapshot`), `lib/date.ts` (Asia/Jakarta).

## 7. Halaman

**Beranda** (`features/dashboard/Dashboard.tsx`) — target ≤ 2 layar di 1440×900:
1. Kepala ringkas: sapaan + tanggal, pilihan proyek, "Salin laporan hari ini".
2. **4 ubin KPI** (Terlambat, Jatuh tempo hari ini, Tugas terbuka, Agenda hari ini): angka besar, keterangan, sparkline 7 hari bila datanya ada; seluruh ubin = tautan ke daftar terfilter. Label **membungkus**, tidak terpotong (grid `repeat(auto-fit, minmax(…))`).
3. **Tambah cepat** satu baris (sintaks `@nama #proyek !prioritas besok` tetap; tetap membuka form terisi).
4. Dua kolom (≥ 1024 px): **Fokus hari ini** — tugas terlambat, jatuh tempo, dan rapat hari ini dalam **satu daftar berurut** dengan cip status bertulisan | **Rutin harian** ringkas + **Minggu ini** (pita 7 hari).
5. Baris grafik: **Distribusi status tugas** (batang 100 %, klik segmen → Tugas terfilter), **Selesai 14 hari terakhir** (batang), **Progres proyek** (batang horizontal, maks 6, tiap baris tautan ke proyek).
6. **Usaha** — hanya bila pencatatan aktif: **Uang masuk vs keluar bulan ini** per minggu (batang grup; jangan sebut saldo/laba) dan **Penjualan 7 hari**. Ringkasan "Tim hari ini" pindah ke Hari ini/Absensi.

**Tugas** (`features/records/Records.tsx`, `features/tasks/*`):
- Bilah alat satu baris: pengalih tampilan bersegmen (Daftar, Papan, Kalender, Gantt, Harian), cip filter, urut, kelompok, cari.
- Di atas daftar: satu **batang distribusi status** yang bisa diklik untuk memfilter (menggantikan ubin status besar).
- Daftar = **tabel padat** (baris 40 px desktop, ≥ 48 px sentuh), kolom: centang, judul, status, prioritas (ikon + teks), penanggung jawab (avatar), proyek, tenggat. Dikelompokkan per status, kepala kelompok lengket. Kartu di area < 900 px.
- Papan: kolom netral berlatar `--panel-2`, kartu datar putih bergaris. Kalender dan Gantt: bar aksen, garis "hari ini". Laci detail dan editor memakai bidang ringkas.

**Hari ini / Agenda (`/rapat`) / Linimasa**: daftar berpemisah per bagian; agenda dengan jam di kiri; Gantt bergulir dalam kontainer.

**Proyek** (`features/projects/*`): daftar sebagai tabel/kartu — nama, progres (bar + %), milestone x/y, tugas terlambat, status bertulisan. Detail: donat progres, **tugas selesai per minggu**, linimasa milestone, anggaran vs uang keluar sebagai meter.

**Catatan** (jurnal, dokumen, risiko, mitra): tabel di desktop, kartu di ponsel; risiko memakai `RiskMatrix` bergaya kit. **Laporan** (`features/reports/*`): grafik dari `reportSnapshot` — selesai vs terlambat, kas masuk/keluar periode — di pratinjau dan cetak.

**Usaha & Koperasi** (`features/operations/Operations.tsx`, Records generik): ringkasan + grafik per buku, tabel tetap sumber utama.
- Buku kas: masuk vs keluar per minggu/bulan + rincian kategori (batang horizontal).
- Barang: barang di bawah stok minimum (daftar + batang).
- Penjualan: 30 hari. Absensi: hadir/izin/alpa (batang tumpuk, warna status + teks). Simpanan: per jenis (pokok, wajib, sukarela).

**Pengaturan** (tab Tampilan baru), **PIN**, **Panduan**, dan semua keadaan memuat/kosong/galat diselaraskan.

**Perbaiki temuan**: label ubin terpotong; isi tak tampil saat gulir (`useMotionEntry` harus menampilkan isi bila observer belum memicu, saat reduced-motion, dan saat dicetak).

## 8. Batas yang tetap berlaku

- Fungsi, rute/slug, data, teks operasional, validasi Zod, RLS, dan API tidak diubah oleh redesain.
- `src/features/dunia-3d/` dan `monitoring.css` tidak disentuh.
- Tanpa angka/data karangan; data contoh hanya di mode demo. Buku kas hanya uang masuk/keluar.
- Kontrol form lewat `src/components/ui` (`npm run check:ui`). Warna mentah hanya di `token.css`, tanpa `!important` (`npm run lint:ui`).
- Bahasa Indonesia ringkas, tanpa slogan. Area sentuh 44 px, fokus terlihat, status bertulisan, reduced-motion, safe area. Periksa 360/375, 768, 1024, 1440 px.
- Nama kelas lama boleh dipertahankan bila strukturnya sama (tes dan `scripts/audit-tampilan.mjs` memakainya). Bila diganti, perbarui tes/selektor di commit yang sama.

## 9. Tes dan alat yang ikut diubah

- `tests/unit/token-warna.test.ts`: ganti cek hex tetap dengan **kontrak** — tiap palet × tema punya `--accent`, `--accent-hover`, `--accent-soft`, `--accent-text`, `--on-accent`, `--focus-ring`; kontras teks ≥ 4,5:1; teks di atas aksen memakai `--on-accent`. Hapus syarat `--sampul-*` bila sampul dihapus.
- `tests/unit/navigasi-hub.test.ts`, `tests/ui/kerangka-hub.test.tsx`, `tests/ui/astra-controls.test.tsx` (dok ponsel), `tests/ui/hub-taskflow.test.tsx`, `tests/ui/redesign.test.tsx`: sesuaikan struktur baru, pertahankan maksudnya (h1 hanya di kerangka, tautan benar, fokus terlihat).
- `tests/ui/tinjauan-taskflow.test.tsx` mencocokkan nilai CSS mentah (padding, scrollbar): ganti dengan cek perilaku atau hapus bagian yang hanya mengunci gaya lama.
- `scripts/audit-tampilan.mjs`: selektor kelas tetap (`.quick-action-hub-btn`, `.project-card`, `.record .ui-btn`, `.settings-tab-btn`, …) diperbarui bila kelasnya berubah.
- Tes baru: fungsi agregasi (`lib/statistik.ts`), ringkasan teks grafik, pemilih palet (baca/tulis + nilai tak dikenal).

## 10. Urutan paket

Satu paket = satu atau beberapa commit bertema; setiap paket lulus semua verifikasi sebelum lanjut.

1. **Fondasi** — token baru, lima palet, tema terang bawaan, pemilih palet (menu profil + Pengaturan › Tampilan dengan pratinjau), huruf tunggal, `dasar.css` + `komponen.css` (Button, Input, Select, Badge, Card, SegmentedControl, Modal, Toast, EmptyState, Skeleton), tes token. Bukti: `/dev/komponen` di 5 palet × 2 tema. **Setelah paket ini pemilik mencoba palet di demo dan memilih.**
2. **Kerangka & navigasi** — sidebar terang berkelompok, breadcrumb, palet perintah, dok ponsel, TabHub, tes navigasi.
3. **Kit grafik** — komponen, `lib/statistik.ts`, tes unit, bagian grafik di `/dev/komponen`.
4. **Beranda**.
5. **Tugas** — lima tampilan, laci, editor, aksi massal.
6. **Proyek, Hari ini, Agenda, Linimasa**.
7. **Catatan + Laporan**.
8. **Usaha & Koperasi**.
9. **Penutup** — Pengaturan/PIN/Panduan, pass mode gelap, hapus alias token dan CSS mati, tetapkan palet bawaan pilihan pemilik, tulis `DESIGN.md` baru di akar repo, perbarui STATUS/LANJUTAN-AI/CHECKLIST.

## 11. Verifikasi setiap paket

`npm test -- --maxWorkers=2`, `npm run typecheck`, `npm run lint`, `npm run lint:ui`, `npm run check:ui`, `npm run build` (kembalikan `next-env.d.ts` bila berubah), `npm run ukur:bundel` (JS awal ≤ 300 KB). Lalu `npm run dev:demo -- -p 3200` dan `npm run audit:tampilan -- <lebar> <tinggi> [nama]` pada 375×812, 768×1024, 1024×768, 1440×900, terang dan gelap; **lihat tangkapannya**.

Tambahan per paket: palet berganti tanpa kedip dan bertahan setelah muat ulang (1); semua halaman terjangkau ≤ 2 klik dari sidebar atau lewat Ctrl K (2); grafik punya ringkasan teks dan tabel cadangan (3); Beranda ≤ 2 layar di 1440×900 dan label ubin utuh di 360 px (4).

Pemeriksaan di perangkat fisik dilakukan pemilik dan tidak boleh diklaim agen.
