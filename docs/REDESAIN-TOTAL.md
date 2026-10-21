# Redesain Total Web — "Ruang Kerja Berwarna"

Tanggal: 21 Oktober 2026 · Status: **arah dipilih pemilik, prototipe siap, kode belum dikerjakan** · Cabang: `tampilan/redesain-total`

Arahan pemilik: rombak tampilan web secara total menjadi **task manager yang bersih, rapi, dan profesional**, fitur mudah dijangkau, dan memakai **grafik yang mudah dipahami**. Jangan terikat desain lama. Setelah melihat lima arah (ordner, buku kas, papan stasiun, monokrom, standar) pemilik menilai semuanya "terlalu kuno" lalu memilih **acuan ClickUp / Monday** dengan nuansa **berani dan berwarna**.

**Acuan visual utama: prototipe [`docs/desain/redesain-total.html`](desain/redesain-total.html).** Jalankan `python -m http.server 3300 -d docs/desain` lalu buka `http://localhost:3300/redesain-total.html`. Prototipe memuat Beranda, Hari ini, Tugas (Daftar/Papan/Kalender), Proyek, Agenda, Buku kas, laci detail tugas, palet perintah Ctrl K, tambah cepat, pemilih warna aksen, tema gelap, dan tata letak ponsel. Bila brief dan prototipe berbeda soal tampilan, **prototipe menang**; bila soal aturan (data, aksesibilitas, batas produk), **brief dan AGENTS menang**. Prototipe memakai data contoh dan JavaScript polos; jangan menyalin kodenya mentah, bangun ulang dengan komponen React dan CSS proyek.

Dokumen gaya lama (Lavender Lekuk, Lantai Dunia, Workbench) ada di `docs/arsip/` hanya sebagai riwayat. Pola fungsi halaman tetap di [DESAIN-ANTARMUKA](DESAIN-ANTARMUKA.md). Prompt siap pakai untuk agen: [PROMPT-DEEPSEEK](PROMPT-DEEPSEEK.md).

---

## 1. Temuan pemeriksaan (demo :3200, 21 Oktober 2026)

- Kode berisi checkpoint "Indigo Studio": rel navigasi ungu gelap bergradien, kartu hero gradien, glow. Terasa ramai, bukan alat kerja.
- **Beranda terlalu panjang** (±3.050 px di 1440×900, ±10 modul berurutan). Yang penting tenggelam.
- **Label ubin terpotong** di lebar 800 px ("TERLAMB…", "JATUH TE…", "Perlu ditin…").
- **Isi tidak tampil saat gulir cepat** (layar kosong di tengah Beranda); kemungkinan `src/components/ui/useMotionEntry.ts` menunggu IntersectionObserver.
- **Navigasi dua lapis**: 6 hub → tab per hub (±30 halaman). Banyak halaman perlu dua klik; "Agenda" (`/rapat`) muncul di dua kelompok.
- **Grafik tidak seragam**: `GrafikBanding`/`Donat` (SVG), `ReadinessRadar`, `Meter`, `RiskMatrix`, batang CSS `.jual-grafik`, `.hadir-bilah`, `.project-progress-fill`. Laporan, Buku kas, dan Proyek tidak punya grafik.
- CSS ±6.700 baris kelas kustom; `token.css` penuh grup sisa (`--lantai-*`, `--lempeng-*`, `--wood-*`, `--wall-*`, `--pastel-*`, `--grad-*`, `--tint-*`, `--violet-*`).

## 2. Konsep

Mode **Operate**. Ruang kerja yang hidup dan berwarna seperti ClickUp/Monday, tetapi **warna selalu bekerja**: menandai ruang (Kerja, Catatan, Usaha, Koperasi, Dunia), proyek, status, prioritas, dan seri grafik. Bukan dasbor abu-abu satu aksen, bukan metafora benda lama, bukan gradien atau glow.

Ciri yang wajib terbawa dari prototipe:
- **Sidebar putih** dengan **ubin huruf berwarna per ruang** yang bisa dilipat dan langsung memuat semua halamannya.
- **Sel status berisi warna penuh** ala Monday (Dikerjakan kuning, Menunggu ungu, Rencana abu, Selesai hijau) yang bisa diklik untuk mengganti status.
- **Daftar tugas dikelompokkan per status** dengan kepala pil berwarna ala ClickUp; kolom penanggung jawab (avatar berwarna), tenggat ("Lewat 2 hari" merah, "Hari ini" kuning tua), prioritas (bendera berwarna + teks), proyek (cip berwarna).
- **Ubin KPI berlatar warna lembut** dengan ikon berisi warna; seluruh ubin adalah tautan.
- **Kartu proyek** dengan garis warna proyek di atas, ikon huruf, bilah progres tebal, tiga statistik, dan avatar tim.
- **Grafik berwarna** yang selalu punya ringkasan kalimat dan tabel cadangan.

## 3. Token (`src/styles/token.css`, ditulis ulang)

Tiga lapis: primitif (hanya di berkas ini) → semantik (dipakai CSS lain) → komponen bila perlu. Terang di `:root`, gelap di `:root.dark`, aksen di `:root[data-aksen="…"]` (dan kombinasi gelap). Nilai di bawah = nilai di prototipe.

**Netral**

| Token | Terang | Gelap |
|---|---|---|
| `--bg` (kanvas) | `#F5F6FA` | `#0E1018` |
| `--panel` | `#FFFFFF` | `#161925` |
| `--panel-2` (hover, kepala, kolom papan) | `#F0F2F8` | `#1D2130` |
| `--panel-3` (trek progres) | `#E8EBF4` | `#252A3C` |
| `--line` | `#E4E7F0` | `#2A2F43` |
| `--line-2` | `#D3D8E6` | `#383E56` |
| `--t1` (judul, isi utama) | `#151829` | `#F1F3FA` |
| `--t2` (isi sekunder) | `#474D66` | `#C2C7DA` |
| `--t3` (keterangan) | `#646B85` | `#9AA0B8` |

**Aksen — lima pilihan** (pemilik memilih bawaan setelah mencoba; sementara `ungu`)

| `data-aksen` | Nama | `--accent` | `--accent-h` | `--accent-soft` terang / gelap | `--accent-ink` terang / gelap |
|---|---|---|---|---|---|
| `ungu` | Ungu | `#6D3FE0` | `#5A2FC7` | `#F0EBFF` / `#2A2246` | `#5A2FC7` / `#BCA8FF` |
| `biru` | Biru | `#2563EB` | `#1D4ED8` | `#EAF1FF` / `#1A2746` | `#1D4ED8` / `#9DBBFF` |
| `hijau` | Hijau | `#047857` | `#065F46` | `#E3F5EC` / `#14302A` | `#047857` / `#74E0B4` |
| `oranye` | Oranye | `#C2410C` | `#9A3412` | `#FFEEE3` / `#3A2318` | `#B13A0A` / `#FFB48A` |
| `magenta` | Magenta | `#BE185D` | `#9D174D` | `#FDEAF2` / `#3A1A2C` | `#A3154F` / `#FF9FCB` |

`--on-accent` selalu putih (semua isi aksen ≥ 4,5:1). `--fokus` = cincin aksen 45 %.

**Warna ruang**: Kerja `#7C3AED`, Catatan `#D97706`, Usaha `#16A34A`, Koperasi `#2563EB`, Dunia `#DB2777` (ubin huruf berteks putih).

**Status tugas** (isi penuh + teks): Rencana `#64748B`/putih, Dikerjakan `#F5A524`/`#2A1A00`, Menunggu `#7C3AED`/putih, Selesai `#15803D`/putih. "Terlambat" bukan status, melainkan label tenggat merah `--lambat` (`#C81E1E`, gelap `#FF8A8A`); "Hari ini" `--hari` (`#9A5B00`, gelap `#FFC870`).

**Prioritas**: Tinggi `#DC2626`, Sedang `#D97706`, Rendah `#64748B` — ikon bendera berwarna + teks.

**Warna proyek**: diambil berurutan dari palet grafik.

**Grafik** (kategorikal, urutan tetap, lolos validator palet dataviz; selisih CVD terdekat butuh label langsung): terang `#2563EB, #D97706, #7C3AED, #16A34A, #DB2777, #0891B2`; gelap `#3B82F6, #D97706, #8B5CF6, #16A34A, #EC4899, #0891B2`. Uang masuk = seri 1, uang keluar = seri 2.

**Bentuk & jarak**: radius kartu 14 px, kontrol 8–10 px, pil 7 px; panel bergaris 1 px tanpa bayangan; `--shadow-pop` hanya untuk laci, palet perintah, popover, dok ponsel. Tinggi kontrol 38 px desktop, ≥ 44 px sentuh.

**Huruf**: **Figtree** (pasang lokal `@fontsource-variable/figtree` atau `@fontsource/figtree`; dependensi baru yang diizinkan). Hapus Plus Jakarta Sans dan Bricolage Grotesque dari `layout.tsx` dan `package.json` setelah semua halaman pindah. Skala: `h1` 26 px/800, judul kartu 15,5 px/700, isi 14 px/1,5, tabel 13 px, label 12 px/700. Angka `tabular-nums`. Tanpa label kecil di atas judul.

**Hapus** grup sisa: `--lantai-*`, `--lempeng-*`, `--wood-*`, `--wall-*`, `--pastel-*`, `--grad-*`, `--tint-*`, `--violet-*`, `--sampul-*`, `--rel-*`. Nama lama yang masih dipakai boleh sementara dipetakan ke token baru di blok "alias sementara" lalu dihapus di paket 9.

## 4. Pemilih aksen dan tema (permintaan pemilik)

- `src/app/layout.tsx`: skrip inline sekarang membaca `hub-theme` (bawaan `system`) dan sisa `hub-color-style` (bawaan `sky`). Ganti: `hub-theme` bawaan **`light`**; `hub-aksen` → atribut `data-aksen` di `<html>` (bawaan `ungu`, nilai tak dikenal jatuh ke bawaan). Dijalankan sebelum render, tanpa kedip.
- Seperti prototipe: popover **Tampilan** berisi 5 swatch bundar berlabel (`role="radiogroup"`, panah kiri/kanan) dan segmen Terang/Gelap. Di aplikasi, letakkan di menu profil dan Pengaturan → tab **Tampilan** (dengan pratinjau kecil); tombol mengambang hanya untuk prototipe.
- Simpan di `localStorage` dengan try/catch. Satu modul kecil (mis. `src/lib/tampilan.ts`) memegang daftar aksen + baca/tulis.
## 5. Kerangka dan navigasi

Berkas: `src/components/layout/{AppShell.tsx,navigasi.ts,TabHub.tsx}`, `src/components/ui/BottomNav.tsx`, `src/features/workspace/WorkspaceSearch.tsx`, `src/styles/kerangka.css`.

- **Sidebar putih** 252 px (`--panel`, garis kanan 1 px), bukan rel gelap; setiap ruang punya ubin huruf berwarna (lihat prototipe):
  1. Merek (inisial + nama koperasi dari profil).
  2. Tombol **Cari… Ctrl K** selebar sidebar.
  3. Kelompok **Kerja**: Beranda, Hari ini, Tugas, Proyek, Agenda, Linimasa.
  4. Kelompok **Catatan**, **Usaha**, **Koperasi**: bagian yang bisa dilipat dan **langsung memuat semua halamannya** (satu klik ke halaman mana pun). Kelompok halaman aktif selalu terbuka; status lipat disimpan.
  5. **Dunia 3D**, lalu kaki Pengaturan dan Panduan.
  - Item aktif: latar `--accent-soft`, teks `--accent-ink`, tebal; halaman dalam ruang diberi titik warna ruang. Tanpa garis warna di sisi kiri. Hapus kartu "Tim" mengambang (Tim tetap di kelompok Koperasi).
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
- Sumbu batang mulai 0; garis kisi tipis `--line`; label nilai langsung pada batang/ujung garis bila muat.
- Tooltip saat hover **dan** fokus keyboard (setiap titik/batang bisa difokus, atau satu kontrol panah).
- Bungkus `<figure>` + `<figcaption>` berisi **ringkasan satu kalimat** dari data, mis. "12 tugas selesai minggu ini, naik dari 8".
- `<details><summary>Lihat tabel</summary>…</details>` sebagai cadangan aksesibel.
- Warna dari token grafik `--g1`…`--g6` (urutan tetap, tidak diputar ulang); status pakai token status + teks. Rupiah singkat lewat helper `singkat` di `GrafikLembut.tsx`.
- Memuat, kosong, galat, dan belum aktif dibedakan; **tidak pernah nol palsu**. Tanpa animasi bila reduced-motion.
- Cetak (Laporan): grafik tetap terbaca hitam-putih (pola/garis putus, label nilai).
- `ReadinessRadar` dan `RiskMatrix` dipertahankan, gayanya disamakan.

**Agregasi data** dalam fungsi murni teruji, mis. `src/lib/statistik.ts`: `hitungTugasPerStatus`, `tugasSelesaiPerHari`, `kasPerMinggu`, `progresProyek`, `penjualanPerHari`, `absensiPerStatus`, `simpananPerJenis`. Pakai yang sudah ada, jangan menduplikasi rumus: `lib/progress.ts` (`scopeProgress`, `planProgress`, `isOverdue`), `lib/task-status.ts`, `features/operations/ledger.ts` (`cashSummary`), `features/dashboard/KasBanding.tsx` (`kumulatifHarian`, `ringkasKas`), `features/reports/report-snapshot.ts` (`reportSnapshot`), `lib/date.ts` (Asia/Jakarta).

## 7. Halaman

**Beranda** (`features/dashboard/Dashboard.tsx`) — target ≤ 2 layar di 1440×900:
1. Kepala ringkas: sapaan + tanggal, pilihan proyek, "Salin laporan hari ini".
2. **4 ubin KPI berwarna lembut** (Terlambat merah, Jatuh tempo hari ini kuning, Tugas terbuka aksen, Agenda hari ini biru laut): ikon berisi warna, angka besar, keterangan; seluruh ubin = tautan ke daftar terfilter. Label **membungkus**, tidak terpotong (4 kolom → 2 kolom di ≤ 960 px).
3. **Tambah cepat** satu baris + petunjuk sintaks (`@nama #proyek !prioritas besok`; tetap membuka form terisi di aplikasi).
4. Grid 12 kolom: **Fokus hari ini** (8 kolom, dua baris) — tugas terlambat, jatuh tempo hari ini, dan besok dalam satu daftar ringkas dengan sel status berwarna | **Status tugas** (donat + legenda berangka) dan **Agenda hari ini** (linimasa jam).
5. Baris kedua: **Beban kerja tim** (batang bertumpuk per orang menurut status), **Progres proyek** (batang horizontal warna proyek, tautan ke proyek), **Uang masuk & keluar** per pekan (batang grup; hanya bila pencatatan aktif; jangan sebut saldo/laba).
6. **Rutin harian** dan **Minggu ini** dari Beranda lama tetap ada sebagai kartu ringkas di bawah atau dipindah ke Hari ini; jangan menghapus fitur yang sudah dipakai pemilik.

**Tugas** (`features/records/Records.tsx`, `features/tasks/*`):
- Bilah alat satu baris: pengalih tampilan bersegmen (Daftar, Papan, Kalender, Gantt, Harian), cip filter, urut, kelompok, cari.
- Di atas daftar: satu **batang distribusi status berwarna** yang bisa diklik untuk memfilter (menggantikan ubin status besar), ditambah kalimat "x dari y tugas selesai".
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

- `tests/unit/token-warna.test.ts`: ganti cek hex tetap dengan **kontrak** — tiap aksen × tema punya `--accent`, `--accent-h`, `--accent-soft`, `--accent-ink`, `--on-accent`; status, ruang, dan prioritas lengkap; kontras teks ≥ 4,5:1; teks di atas aksen memakai `--on-accent`. Hapus syarat `--sampul-*` bila sampul dihapus.
- `tests/unit/navigasi-hub.test.ts`, `tests/ui/kerangka-hub.test.tsx`, `tests/ui/astra-controls.test.tsx` (dok ponsel), `tests/ui/hub-taskflow.test.tsx`, `tests/ui/redesign.test.tsx`: sesuaikan struktur baru, pertahankan maksudnya (h1 hanya di kerangka, tautan benar, fokus terlihat).
- `tests/ui/tinjauan-taskflow.test.tsx` mencocokkan nilai CSS mentah (padding, scrollbar): ganti dengan cek perilaku atau hapus bagian yang hanya mengunci gaya lama.
- `scripts/audit-tampilan.mjs`: selektor kelas tetap (`.quick-action-hub-btn`, `.project-card`, `.record .ui-btn`, `.settings-tab-btn`, …) diperbarui bila kelasnya berubah.
- Tes baru: fungsi agregasi (`lib/statistik.ts`), ringkasan teks grafik, pemilih aksen (baca/tulis + nilai tak dikenal).

## 10. Urutan paket

Satu paket = satu atau beberapa commit bertema; setiap paket lulus semua verifikasi sebelum lanjut.

1. **Fondasi** — token baru, lima aksen, warna ruang/status/prioritas, tema terang bawaan, pemilih aksen (menu profil + Pengaturan › Tampilan dengan pratinjau), huruf Figtree, `dasar.css` + `komponen.css` (Button, Input, Select, Badge, Card, SegmentedControl, Modal, Toast, EmptyState, Skeleton), tes token. Bukti: `/dev/komponen` di 5 aksen × 2 tema, dibandingkan dengan prototipe. **Pemilik bisa memilih aksen dari prototipe kapan saja; bawaan ditetapkan di paket 9.**
2. **Kerangka & navigasi** — sidebar putih dengan ruang berwarna yang bisa dilipat, breadcrumb, palet perintah, dok ponsel, TabHub, tes navigasi.
3. **Kit grafik** — komponen, `lib/statistik.ts`, tes unit, bagian grafik di `/dev/komponen`.
4. **Beranda**.
5. **Tugas** — lima tampilan, laci, editor, aksi massal.
6. **Proyek, Hari ini, Agenda, Linimasa**.
7. **Catatan + Laporan**.
8. **Usaha & Koperasi**.
9. **Penutup** — Pengaturan/PIN/Panduan, pass mode gelap, hapus alias token dan CSS mati, tetapkan aksen bawaan pilihan pemilik, tulis `DESIGN.md` baru di akar repo, perbarui STATUS/LANJUTAN-AI/CHECKLIST.

## 11. Verifikasi setiap paket

`npm test -- --maxWorkers=2`, `npm run typecheck`, `npm run lint`, `npm run lint:ui`, `npm run check:ui`, `npm run build` (kembalikan `next-env.d.ts` bila berubah), `npm run ukur:bundel` (JS awal ≤ 300 KB). Lalu `npm run dev:demo -- -p 3200` dan `npm run audit:tampilan -- <lebar> <tinggi> [nama]` pada 375×812, 768×1024, 1024×768, 1440×900, terang dan gelap; **lihat tangkapannya**.

Tambahan per paket: aksen berganti tanpa kedip dan bertahan setelah muat ulang (1); semua halaman terjangkau ≤ 2 klik dari sidebar atau lewat Ctrl K (2); grafik punya ringkasan teks dan tabel cadangan (3); Beranda ≤ 2 layar di 1440×900 dan label ubin utuh di 360 px (4).

Pemeriksaan di perangkat fisik dilakukan pemilik dan tidak boleh diklaim agen.
