# Changelog

Semua perubahan penting dicatat di sini, satu entri per paket kerja (terbaru di atas). Format entri ada di AGENTS.md bagian Proses. Riwayat sebelum repo ini (versi pixel dan pengembangan awal 3D) ada di repo `kopdes-manager-web`.

## Desain Cockpit Interaktif & Re-arsitektur UX Beranda — 20 Oktober 2026

- Alasan: arahan pemilik ("buat desain paling menarik, unik, interaktif dan fresh. jangan berpanduan pada desain lama. sesiakan dengan web task manager terbaik. atur ulang penataan sistem nya, atur sistem sebaik mungkin untuk setiap komponen dan fitur. jangan seperti yang sudah ada penempatan dan ux nya").
- Perubahan:
  - Re-arsitektur Cockpit Operasional Beranda: menggantikan tata letak kartu statis konvensional dengan sistem Command Cockpit terpadu ala Linear/Things 3/Routine.
  - Live Status & Operational Radar: indikator denyut waktu real-time WIB dan lokasi operasional gerai aktif di kepala halaman.
  - Dial Momentum Energi (Circular SVG Ring): meteran progres sirkular visual yang menampilkan persentase penyelesaian rutinitas harian secara dinamis dan hidup.
  - Filter Perspektif Fokus Interaktif: tab pengalih perspektif kerja (`Semua Fokus`, `Alur Kerja Hari Ini`, `Prioritas & Radar`, `Vitalitas Usaha`) yang memberi sorotan dinamis pada modul terpilih.
  - Quick-Capture Command Island dengan Chip Sematan Pintar: tombol cepat interaktif (`@Staf`, `#Proyek`, `!Tinggi`, `Besok`) serta bilah preview pintar (*real-time parsed tokens*) yang langsung mendeteksi atribut tugas saat pengguna mengetik.
  - Tata letak responsif mulus: dioptimalkan untuk desktop, tablet, dan ponsel sempit (375 px) tanpa layout shift.
- Verifikasi: 473 dari 473 tes Vitest lulus 100% (80 berkas), `npm run typecheck` 0 error, `npm run lint` 0 error, `npm run lint:ui` 0 error, build Next.js lulus, JS awal 247 KB (batas 300 KB), visual audit (`audit:tampilan`) pada 1024x1000 dan 375x812 menghasilkan 0 temuan.
- Belum: pengujian langsung oleh pemilik di perangkat fisik.

## Revisi Desain: Modern Clean Look (Emerald Fresh & Slate Crystal) — 20 Oktober 2026

- Alasan: arahan pemilik bahwa eksperimen lantai warna penuh dan tepi tebal terasa kuno dan jadul ("desain menjadi kuno dan jadul, coba anda revisi menggunakan skill desain anda"), meminta perombakan menjadi desain yang benar-benar bersih, modern, segar, dan berkelas.
- Perubahan:
  - Kanvas bersih & berpori (`--canvas: #f8fafc`): membuang seluruh latar hijau/kuning keruh di seluruh layar, menggantikannya dengan palet slate-50 yang sangat terang, bersih, modern, dan lapang.
  - Kartu & modul modern (`--surface: #ffffff`): kartu putih bersih dengan radius presisi 18–20px, garis pembatas 1px ultra-halus (`#e2e8f0`), bayangan mikro kontemporer (`--shadow-sm`), dan menghapus seluruh tepi tebal bawah 6px yang memicu kesan jadul/arcade.
  - Aksen Modern Emerald (`--brand: #059669` / `#047857`): aksen hijau zamrud yang segar, hidup, dan berwibawa, mewakili pertumbuhan koperasi desa dengan kualitas visual fintech/SaaS Silicon Valley. Lolos kontras teks putih 5.48:1.
  - Rel navigasi & bilah atas modern: sidebar putih bersih dengan pemisah minimalis, pil menu aktif emerald yang presisi, serta topbar kaca buram (*frosted glass*) dengan `backdrop-filter: blur(12px)`.
  - Tautan ruang Dunia 3D terintegrasi: menambahkan pil interaktif "Ruang Kerja · Masuk ke 3D" di kepala Beranda yang menghubungkan web langsung dengan Dunia Koperasi 3D.
  - Tipografi tajam: judul kembali menggunakan Plus Jakarta Sans dengan *tracking* ketat (`letter-spacing: -0.025em`) untuk ketajaman bacaan modern.
- Verifikasi: 473 dari 473 tes vitest lulus 100% (80 berkas), typecheck tsc 0 error, stylelint `lint:ui` 0 error, build Next.js lulus, JS awal 247 KB (batas 300 KB), audit visual headless Chrome (`audit:tampilan`) pada 1024x1000 dan 375x812 menghasilkan 0 temuan.
- Belum: pengujian langsung di layar fisik oleh pemilik.

## Paket 0 Redesain: Pelepasan kunci dokumen ke arah Lantai Dunia — 20 Oktober 2026

- Alasan: arahan pemilik ("lakukan") menyetujui rencana redesain di `docs/RENCANA-REDESAIN.md` dengan arah baru "Lantai Dunia" (rel navigasi biru batu, latar lantai per ruang diorama, permukaan modul putih hangat, modul lempeng taktil, dan aksen jingga kayu), serta melepaskan aturan gaya lama (Lavender Lekuk) dari seluruh dokumen panduan.
- Perubahan:
  - `docs/RENCANA-REDESAIN.md`: status diperbarui menjadi disetujui pemilik, rencana kerja aktif dari Paket 0 hingga Paket 6.
  - `AGENTS.md` & `PRODUCT.md`: aturan gaya multiplatform dan komitmen merek dialihkan dari Lavender Lekuk ke Lantai Dunia.
  - `DESIGN.md`: ditandai usang/transisi sebagai acuan gaya lama yang sedang digantikan bertahap.
  - `docs/DESAIN-ANTARMUKA.md` & skill `ui-ux-kopdes`: spesifikasi visual diperbarui untuk memuat konsep Lantai Dunia, dan skill disinkronkan ke `.agents/skills`.
- Verifikasi: git status rapi, `sync-skills.mjs` berhasil disinkronkan, verifikasi dokumentasi dan integritas aturan.
- Belum: implementasi kode Paket 1 (token & kerangka) dan Paket 2–3 (komponen lempeng & Beranda POC).

## Pembersihan tampilan tambah tugas beranda & pemisah agenda kalender — 20 Oktober 2026

- Alasan: arahan pemilik untuk membuat tampilan `beranda-tambah` (kotak pembuatan tugas cepat di Beranda) dan `calendar-agenda-day-group` (pengelompokan hari di agenda kalender tugas) lebih clean, rapi, dan terstruktur.
- Perubahan:
  - Kotak tambah tugas cepat Beranda (`.beranda-tambah`): ditata ulang dengan wadah kartu lekuk radius 22px (`--r-card`), ikon tambah berbingkai bulat lembut (`.beranda-tambah-icon`), input teks fleksibel dengan border pil halus (`.beranda-tambah-input-box .ui-input`), tombol aksi pil lavender (`.beranda-tambah-btn`), serta bantuan sintaks cepat yang diubah dari teks mentah paragraf menjadi deretan chip monospaced yang elegan (`.tambah-hint-item` & `.tambah-hint-code` untuk `@nama`, `#proyek`, `!tinggi`, dan `besok`).
  - Pemisah hari agenda tugas (`.calendar-agenda-day-group`): kepala grup tanggal (`.calendar-agenda-day-head`) ditata ulang dengan judul tanggal ber-ikon, penanda lencana hari ini yang kontras bersih, pil jumlah tugas tabular, dan garis horizontal pemisah antar-hari (`.agenda-day-divider`) sehingga alur daftar agenda per tanggal memiliki pemisahan ritme visual yang tegas dan tidak bertumpuk seperti dinding kartu.
- Verifikasi: typecheck `tsc --noEmit` 0 error, stylelint `lint:ui` 0 error, audit visual headless Chrome (`audit:tampilan`) pada resolusi desktop (1024x1000) dan ponsel (375x812) pada tampilan beranda dan tugas-kalender menghasilkan 0 temuan tata letak.
- Belum: pengujian fisik di perangkat nyata dan penyesuaian tema warna monitoring Dunia 3D.

## Penyelarasan kartu catatan ke standar bersih kartu rapat (meeting-record) — 20 Oktober 2026

- Alasan: arahan pemilik bahwa tampilan kartu catatan rapat (meeting-record) sudah cukup clean dan rapi, dan meminta menyesuaikan seluruh kartu catatan lainnya (pengiriman, dokumen, risiko, mitra, jurnal, kesiapan) agar mengikuti standar kerapian yang sama.
- Perubahan:
  - Ikon domain 3D (`record-domain-icon`): setiap kartu catatan kini memiliki ikon 3D representatif di samping judul (truk untuk pengiriman, dokumen untuk legalitas, peringatan untuk risiko, jabat tangan untuk mitra, buku untuk jurnal, centang untuk kesiapan, dompet untuk kas, kotak untuk barang), serasi dengan ikon kalender pada kartu rapat.
  - Pemisahan metadata dan baris rincian: metadata strip (`.record-meta`) kini hanya diisi pil ringkas tingkat tinggi (status, arah kiriman, dok, jam, tanggal). Teks panjang seperti nama sopir, nomor pelat kendaraan, nama mitra, dan gerai tujuan dipindahkan dari metadata menjadi baris detail terstruktur (`.record-detail-row`) dengan ikon Lucide dan label tebal.
  - Kotak bagian terstruktur (`.record-section-box`): catatan panjang seperti rincian barang kiriman, rencana mitigasi risiko, bukti kesiapan, dan rencana tindak lanjut mitra kini dibungkus rapi dalam kartu mini berlatar lembut radius `var(--r-md)` dengan ikon penanda, menyamakan pengalaman kotak agenda pembahasan dan notulen pada kartu rapat.
- Verifikasi: typecheck `tsc --noEmit` 0 error, stylelint `lint:ui` 0 error, audit visual headless Chrome (`audit:tampilan`) pada tampilan pengiriman, dokumen, mitra, dan risiko menghasilkan 0 galat tata letak.
- Belum: pengujian fisik di perangkat nyata dan penyesuaian tema warna monitoring Dunia 3D.

## Pembaruan kalender tugas & pembersihan tipografi antarmuka — 20 Oktober 2026

- Alasan: arahan pemilik mengenai kalender tugas yang kurang menarik, tulisan/tipografi yang kurang clean, serta mengoptimalkan alur kerja verifikasi agar eksekusi berlangsung cepat tanpa penundaan berlebih.
- Perubahan:
  - Toolbar kalender tugas (`TaskCalendar`): tata letak dikelompokkan ke dalam dua klaster rapi (judul + subteks di kiri, navigasi tanggal + switcher Bulan/Minggu/Hari + pemilih bulan di kanan). Tulisan mentah "Bulan" dihilangkan dan diganti dengan input pil terintegrasi (`.calendar-month-picker`) sehingga tidak melompat baris. Pada ponsel sempit 375px, baris kontrol otomatis sejajar rapi dalam satu baris horizontal tanpa memakan ruang vertikal.
  - Kisi kalender (`.calendar-grid`): wadah ber-radius lekuk kartu 22px (`--r-card`), kepala nama hari ("SEN", "SEL", ...) berpusat rapi dengan letter-spacing proporsional, nomor tanggal di dalam bulatan tabular bersih, penanda "Hari Ini" menggunakan lingkaran ungu Lavender Lekuk kontras tinggi (`var(--brand)`), dan tombol tambah tugas muncul mulus saat hover.
  - Chip kegiatan kalender (`.calendar-event`): sudut melengkung 7px (`--r-sm`), warna latar dan titik status yang cerdas (hijau untuk tugas selesai dengan teks tercoret rapi, merah lembut untuk tenggat terlewat/mendesak, biru lembut untuk sedang dikerjakan, dan lavender untuk tugas umum). Pembatasan maksimal 3 kegiatan per sel dengan indikator pil `+N lainnya` untuk mencegah sel kisi memanjang tidak terkontrol.
  - Agenda kalender (`.calendar-agenda`): wadah kartu lekuk 24px, ikon kalender terbingkai lembut, pemisahan tipografi judul dan jumlah tugas, pil tanggal agenda (`.agenda-day-pill`) dengan border bersih, serta kartu kosong bermotif putus-putus minimalis.
- Verifikasi: typecheck `tsc --noEmit` 0 error, stylelint `lint:ui` 0 error, audit visual headless Chrome (`audit:tampilan`) pada resolusi desktop (1024x1400) dan ponsel (375x812) menghasilkan 0 temuan tata letak.
- Belum: pengujian fisik di perangkat nyata dan penyesuaian tema warna monitoring Dunia 3D.

## Perbaikan offside cal-due-pill, tata letak kartu kalender & tipografi kartu — 20 Oktober 2026

- Alasan: arahan pemilik mengatasi elemen `.cal-due-pill.is-late` yang offside (meluap ke luar kartu) serta merapikan tipografi, hierarki tulisan, dan bagian yang belum rapi pada kartu tugas kalender dan kartu catatan.
- Perubahan:
  - Pil tenggat tugas (`.cal-due-pill` & `.is-late`): dirombak dari blok kaku menjadi pil bulat inline-flex penuh (`border-radius: var(--r-full)`), perataan ikon kalender SVG agar tidak melompat baris, `white-space: nowrap`, dan garis tepi lembut `border: 1px solid var(--late-line)` sehingga tidak pernah lagi meluap ke luar kartu (offside).
  - Footer kartu tugas kalender (`.cal-card-footer`): ditata ulang dengan pemisahan baris metadata (penanggung jawab dengan batasan truncate teks + pil tanggal) dan baris tombol aksi, tombol aksi pil bulat 30px (`.cal-btn-action.ui-btn`) dengan area sentuh 44px di layar sentuh.
  - Kartu tugas kalender (`.calendar-task-card`): kartu ber-radius lekuk 22px (`var(--r-card)`), pil kode tugas ber-monospaced, pil proyek dengan pembatasan teks agar tidak meluap, klem 2 baris pada deskripsi kartu, dan tipografi judul 15px tebal 600.
  - Tipografi kartu umum: `.record.card > .section-head` kini mengizinkan flex wrap agar lencana status tidak menabrak judul yang panjang; chip relasi dan metadata catatan diubah ke bentuk pil melengkung konsisten; judul dan deskripsi kartu proyek dibatasi 2 baris klem agar seragam.
- Verifikasi: 473 tes / 80 berkas vitest lulus 100%, typecheck tsc lulus, ESLint no issues, stylelint `lint:ui` 0 error, build Next.js lulus, JS awal 247 KB (batas 300 KB). Audit visual headless Chrome (`audit:tampilan`) pada 375x812 untuk tampilan tugas kalender, papan, harian, dan proyek menghasilkan 0 temuan.
- Belum: pengujian di perangkat fisik asli dan penyesuaian tema warna monitoring Dunia 3D.

## Penyelarasan tampilan bersih Lavender Lekuk pada tab, kalender, linimasa & laci — 20 Oktober 2026

- Alasan: arahan pemilik merapikan tampilan yang masih berantakan, kurang rapi, dan terpotong di layar sempit pada seluruh tampilan ruang kerja (kalender, linimasa/Gantt, tab kontrol, detail proyek, laci catatan, dan pencarian).
- Perubahan:
  - Tab pilihan tampilan (`SegmentedControl`): teks tab di ponsel 375px tidak lagi terpotong berkat penyesuaian padding mobile, touch scroll, dan auto-scroll yang menjaga tab aktif selalu di tengah layar secara mulus.
  - Penegasan kartu & kontrol data: `--kartu-garis` diubah menjadi `var(--line)` sehingga kotak cari (`.records-cari`), tombol filter (`.records-filter-toggle`), panel filter, dan pembungkus tabel memiliki definisi kontur yang tajam, bersih, dan elegan alih-alih mengambang transparan di atas kanvas.
  - Kalender tugas (`TaskCalendar`): tombol mode tampilan (Bulan, Minggu, Hari) dirombak menjadi pil segmented dengan sorotan status aktif (`aria-pressed="true"`), dan pemilih bulan bawaan disembunyikan di layar ponsel sempit agar toolbar tetap ringkas dan tidak bertumpuk.
  - Linimasa tugas (`TaskTimeline` / Gantt): tombol ganti tampilan linimasa diubah menjadi pil halus, dan otomatis disembunyikan di layar desktop yang sudah menampilkan bagan penuh. Tombol menu "Lainnya" (`.view-extra-summary`) dirapikan menjadi tombol pil serasi.
  - Halaman proyek & detail: judul kartu terkait dengan ikon SVG diatur flex agar ikon dan teks sejajar rapi (mengeliminasi 5 error audit); tab cakupan dan status proyek diseragamkan ke bentuk pil penuh.
  - Laci catatan & hari ini: tombol tutup laci dan tab detail dibuat berbentuk pil melengkung konsisten; kartu agenda pada Hari Ini dibersihkan menjadi kartu bergaris halus tanpa gradien kuning mencolok.
- Verifikasi: 473 tes / 80 berkas vitest lulus 100%, typecheck tsc lulus, ESLint no issues, stylelint `lint:ui` 0 error, build Next.js lulus, JS awal 247 KB (batas 300 KB). Audit visual headless Chrome (`audit:tampilan`) pada 375x812 untuk seluruh 58 tampilan, dialog, tab, dan laci menghasilkan 0 temuan.
- Belum: penyesuaian tema warna di monitoring Dunia 3D (masih biru #546FFF) dan pengujian di perangkat fisik asli.

## Penataan Papan tugas Lavender Lekuk & penyempurnaan dok navigasi — 20 Oktober 2026

- Alasan: arahan pemilik merapikan desain tugas dan memperbaiki tombol navigasi bawah ponsel yang sebelumnya berwarna hitam mati/kurang menarik, serta menata papan Kanban (ScrumBoardView) ke gaya Lavender Lekuk penuh.
- Perubahan:
  - Navigasi bawah ponsel (`.ui-bottom-nav`): tombol tambah bulat (`.nav-tambah`) kini menggunakan warna aksen lavender utama (`var(--brand-isi)`) dengan ikon putih dan efek bayangan lembut, menggantikan tombol hitam mati (`--ink-heading`). Dok pil dipusatkan (`max-width: 440px`) dengan border garis halus dan peredam blur yang rapi.
  - Ubin status tugas (`.ubin-status`): didesain ulang menjadi kartu putih datar dengan lencana ikon pastel terpisah, angka tebal tabular, dan label rapi; pada ponsel otomatis menjadi satu baris 4 ubin kompak (~60px) tanpa blok warna pekat yang memakan layar.
  - Papan tugas (Kanban): kartu tugas datar membulat (radius 18px), tanpa bayangan jatuh, border halus lavender saat hover, pil kode tugas/proyek/prioritas/tanggal, avatar inisial, dan tombol aksi cepat status (Mulai Kerja, Selesai, Buka Lagi) minimal 44px di layar sentuh. Kolom papan berlatar lembut radius 22px dengan gulir horizontal alami ber-scroll snap di ponsel.
  - Kotak tambah cepat Beranda (`.beranda-tambah`) dan tombol takik aksi (`.takik-aksi`) dipertegas dengan border 1px dan bayangan halus.
  - Selektor tab pada `scripts/audit-tampilan.mjs` diperbaiki sehingga audit visual seluruh tab halaman lolos 100%.
- Verifikasi: 473 tes / 80 berkas, typecheck, lint, `lint:ui`, build produksi lulus; JS awal 247 KB (batas 300 KB). Audit tampilan pada 375x812 dan 1440x900 (mode terang & gelap) menghasilkan 0 temuan.
- Belum: perangkat fisik, kalender dan Gantt tugas ke gaya Lekuk penuh, penyelarasan warna panel Dunia 3D ke Lavender.

## Ruang kerja Lavender Lekuk — 20 Oktober 2026

- Alasan: pemilik meminta web menjadi task manager harian yang enak dipakai manajer KDMP. Setelah banyak putaran prototipe (arsip `docs/desain/`), dipilih bentuk Lekuk dan warna Lavender; gaya Senja, Kebun, Teal, Cerah, Taskflow, dan Merah Putih dicoba lalu ditinggalkan.
- Perubahan:
  - Data: migrasi 10 (simpanan, penjualan gerai, pembelian, inventaris aset, jadwal & absensi), anggaran proyek vs uang keluar, preset laporan bulanan, lonceng pengingat, pemisah ribuan pada input angka, dan kolom jenis kegiatan agenda (tanpa migrasi SQL).
  - Gaya: token Lavender (#6A55C8), kartu datar bertakik, pil, mode gelap ungu malam; sistem tercatat di `DESIGN.md`.
  - Kerangka: sidebar Kerja (Beranda, Hari ini, Tugas, Agenda, Proyek, Linimasa) + Ruang lain + kartu Tim, dok pil ponsel, palet Ctrl+K dengan perintah dan "Buat tugas".
  - Beranda: rutin harian, agenda hari ini, perlu tindakan, pita minggu, tambah cepat satu kalimat, salin laporan harian untuk WhatsApp pengurus.
  - Tugas dan Agenda: penanggung jawab dari Tim, ubin status yang menyaring, geser kartu di ponsel dengan Batalkan, jenis kegiatan dan Catat hasil.
  - Riwayat 62 commit dirapikan menjadi tujuh commit berformat `jenis: ringkasan`; aturan commit dan alur sesi agen dicatat di AGENTS.md.
- Verifikasi: 473 tes / 80 berkas, typecheck, lint, `lint:ui`, build lulus; JS awal 247 KB. `audit:tampilan` Beranda, Tugas, Agenda, form, dan palet 0 temuan pada 375/768/1024/1440 px (mode demo).
- Belum: perangkat fisik, UAT cloud, migrasi 9–10 di Supabase, papan/kalender/Gantt dan panel Dunia ke gaya baru.

## Rapikan mobile dan panel Dunia Koperasi — 13 Oktober 2026

- Selisih kas mendapat baris penuh di Beranda pada ponsel; label dan nominal tidak lagi dipaksa muat dalam kolom sempit. Ringkasan buku memisahkan label, nilai, dan keterangan; judul tugas panjang membungkus.
- Perubahan rutinitas lokal disatukan dengan perbaikan mobile: jam di atas judul, rel dengan centang, kemajuan dan penanda berikutnya menurut WIB, isian berlabel, serta tombol dialog berjajar. Input checkbox/radio memakai gaya pilihan, bukan kolom teks.
- Tombol formulir, kartu catatan, rapat, kontak, buku, dan proyek dirapikan pada ponsel; aksi penting tidak terjepit dan kontrol yang diubah mencapai 44 px. PIN mendapat latar biru, pola jendela, lantai hangat, dan ikon kantor dalam panel.
- Dunia 3D: aturan grid KPI sebelumnya menimpa `hidden`, membuat kartu ringkasan ikut muncul pada panel lain. Aturan panel tersembunyi dipertegas tanpa menghapus data, tab, atau tautan catatan.
- Browser demo: Beranda, PIN, rutinitas/dialog, buku kas, tugas/formulir, proyek, rapat, barang, risiko, dokumen, dan mitra diperiksa pada ukuran relevan 360/390/430/768/1024/1440 px. Pergantian empat panel dunia diuji pada enam ukuran di Kantor dan 360/1440 di empat lokasi lainnya; hanya satu isi panel terlihat. Konsol tanpa galat/peringatan. Perangkat fisik belum diperiksa.
- Seluruh 372 tes / 59 berkas, typecheck, lint tanpa peringatan, `lint:ui`, dan build produksi lulus. Tidak ada push, deploy, atau perubahan database cloud pada paket ini.

## Pemeriksaan alur fitur dan detail — 13 Oktober 2026

- Impor CSV tugas memakai parser yang menerima koma, kutip, dan baris baru dalam sel. Semua baris divalidasi sebelum penyimpanan; kegagalan jaringan menyebut jumlah baris yang telah tersimpan. Ditambahkan unduhan format CSV, kendali keyboard, batas ukuran berkas, dan penguncian dialog selama penyimpanan.
- Cadangan membaca tabel bertahap dengan jumlah pasti, menolak hasil tidak lengkap atau melebihi 5.000 baris per tabel. Arsip laporan dapat memuat halaman lebih lama; keadaan memuat/galat/kosong dan pemilihan dengan keyboard diperbaiki. API memvalidasi paginasi dan ID penghapusan.
- Pengaturan tidak lagi menampilkan editor umum yang ganda. Riwayat catatan dan tugas memakai pemformat waktu WIB yang sama. Demo tidak menggandakan tugas berulang saat disimpan ulang dan menerima asal localhost/127.0.0.1 pada port sendiri; aturan hosting produksi tetap berlaku.
- Pemeriksaan browser lokal mencakup halaman menu pada 360/768/1024/1440 px serta lima lokasi dunia. Simpan tugas demo berhasil; tidak ada galat konsol. Perangkat fisik, data cloud, dan performa perangkat lemah belum diuji.
- Tes: cakupan penuh 371 kasus; suite lengkap menghasilkan 369 lulus dan dua timeout. Setelah menghilangkan penanaman 5.000 baris yang tidak diperlukan serta pencarian role atas ratusan kartu, kedua berkas diulang dan seluruh 18 tes lulus. Seluruh kasus terverifikasi; batas waktu pemeriksaan penuh 20 detik, tanpa mengurangi cakupan.
- Typecheck, lint (tanpa peringatan), `lint:ui`, dan build produksi lulus. Perubahan pengguna yang sudah ada dipertahankan dan tidak dimasukkan ke commit paket ini.

## Pemulihan cadangan dan konsistensi aturan — 13 Oktober 2026

- Cadangan laporan menerima ringkasan kas, status draf/final di snapshot dan kolom laporan, serta cadangan lama tanpa kolom baru. Validasi tetap ketat; status snapshot mengatasi kolom status lama yang tertinggal. API laporan menyelaraskan kedua lokasi status saat membuat, mengubah, dan finalisasi.
- Migrasi 9 menyelaraskan status laporan lama dan mempertahankan status pada pemulihan atomik. SQL install/reset dibuat ulang; migrasi belum dijalankan di cloud. Tes regresi memakai ekspor dan pemulihan API dengan PostgreSQL lokal, termasuk penolakan isi tidak sah, sesi/Origin, dan rollback yang menjaga profil serta laporan lama.
- Tombol bersama, isian, navigasi hari, aksi kartu/tabel buku, dan tombol dunia diperbesar menjadi 44 px. Tugas Harian membatasi lebar kisi dan membungkus isi kartu agar tidak terpotong di 360 px; deretan hari bergulir di dalam kontainer.
- AGENTS menjadi sumber ketentuan Graphify opsional; aturan Claude/Gemini/Cursor/agen lain menunjuk ke sana. Skill memakai rute pratinjau yang tersedia dan ukuran pemeriksaan 360/768/1024/1440, lalu disinkronkan. Peta gaya pada clean-code memakai `monitoring.css` yang aktif.
- CI menjalankan `lint:ui`; ESLint mengabaikan semua folder build `.next-*`, termasuk hasil pemeriksaan lokal.
- Verifikasi: 350 tes / 56 berkas, typecheck, lint, `lint:ui`, dan build produksi lulus. Beranda, Tugas Harian, Barang dan formulir Barang diperiksa pada 360/768/1024/1440 px; tombol dunia terukur 44 px, kartu Harian tidak terpotong, tanpa luber halaman dan tanpa galat browser. Perangkat fisik dan pemulihan cloud belum diuji.

## Rutinitas garis waktu dan audit tata letak — 12 Oktober 2026

- Rutinitas harian menjadi garis waktu: batang kemajuan bersegmen, rel jam dengan simpul yang berubah menjadi centang hijau, rutinitas berikutnya menurut jam WIB (diperbarui tiap menit) ditandai biru, jam yang sudah lewat tanpa centang ditandai kuning halus, dan baris hijau bila semua sudah dicentang. Judul ganda di dalam lipatan dihapus. Kotak centang asli tetap ada untuk papan ketik dan pembaca layar.
- Kotak centang tidak lagi tampil sebagai kolom teks selebar penuh: komponen `Input` tidak memberi gaya `ui-input` ke checkbox/radio (terlihat di rutinitas dan formulir).
- Tombol berupa `label.button` (Pilih Berkas Cadangan JSON) kini bergaya tombol.
- Tinjauan mingguan: satu baris per tugas dengan tanggal di kanan (sebelumnya tautan menumpuk). Keputusan terkait rapat: judul dan alasan di baris terpisah agar tidak saling menimpa. Titik hari ini di grafik tidak keluar dari kolom.
- Perbaikan di atas ditemukan lewat audit otomatis CDP di luar repo (375 px): setiap halaman, tampilan Tugas/Kegiatan, tab, laci, editor, dan dialog dibuka dengan semua lipatan terbuka, lalu dicek kontrol berukuran janggal, teks luber, elemen keluar layar, isi tombol meluap, dan elemen yang saling menimpa.

## Sistem gaya baru berbahasa dunia 3D — 12 Oktober 2026

Gaya web dibangun ulang dari nol karena beberapa bagian tidak serasi dan kurang berkarakter. Lapisan lama (`personal.css`, `ui.css`, `tokens.css`, `tema.css`) dihapus, bukan ditimpa.

- Struktur baru `src/styles/`: `token.css` (warna, dinding, lantai, kayu, status, radius, bayangan, gerak; terang/gelap) → `dasar.css` → `komponen.css` → `kerangka.css` → `halaman/*.css` (satu berkas per kelompok halaman).
- Bahasa dunia: menu samping berupa dinding biru-lavender dengan item aktif sebagai kartu putih; setiap kelompok menu punya lantai sendiri (`data-ruang` di `<main>`) dengan pita papan isometrik dan nama ruang tercat samar; aksen kayu untuk rapat, layar PIN, laporan, hari ini, dan milestone.
- Ringkasan angka berupa pil ganda "angka · label"; dok ponsel mengambang; dialog menjadi lembar bawah di ponsel; laci detail di kanan.
- Beranda: baris label kecil di atas judul dihapus, tanggal menjadi cip.
- Beranda tablet: kartu rapat setinggi isinya; angka Catatan koperasi maksimal dua kolom dan satu kolom di kolom sempit agar nilai uang tidak luber.
- Cincin progres Beranda tidak lagi terpotong dan busurnya mulai dari atas.
- Beranda lebih lega: jarak antara judul dan tanggal, antar-baris kartu angka, dan antar-grafik di lipatan Grafik pekerjaan; batang mingguan kini terisi (sebelumnya kosong karena gaya tombol dasar) dan sama tinggi termasuk hari ini; pil Rutinitas menempel ke judul; lipatan tertutup tidak menyisakan ruang kosong.
- Dialog Cari di ruang kerja: ikon di dalam kolom, pilihan jenis satu baris yang bisa digeser, judul kelompok dengan jumlah berupa pil, hasil berupa baris 44 px.
- Tugas: tombol Rencana/Selesai di Papan sejajar dengan ikon centang hijau; bulatan centang Harian bundar 24 px dengan area ketuk 44 px; jumlah tugas di strip minggu berupa pil status yang tidak terpotong; menu Lainnya selalu di kanan sehingga tidak keluar layar.
- Dialog Tambah: label kecil di atas judul dihapus, kepala dan tombol tutup tetap terlihat saat digulir. Laci tugas: bilah aksi tidak lagi naik melewati tepi atas.
- Halaman 404 di dalam kerangka tampil sebagai kartu biasa tanpa diorama layar masuk, tanpa `<main>` bersarang; judul bilah atas untuk rute tak dikenal menjadi "Ruang kerja", bukan "Beranda".
- Sentuh: chip filter, pilihan tampilan, judul kartu buku, dan tombol WhatsApp/Telepon setinggi 44 px pada layar sentuh.
- Perkakas: `npm run lint:ui` kini memeriksa `src/styles` (warna hex hanya di token, tanpa `!important` kecuali reduced-motion dan cetak); dependensi huruf Plus Jakarta Sans yang tidak dipakai dibuang. `PRODUCT.md` mencatat konteks produk untuk pekerjaan desain.
- Verifikasi: 340 tes / 54 berkas, typecheck, lint, lint:ui, build lulus; tangkapan CDP desktop, tablet, ponsel, dan mode gelap (rincian di STATUS).

## Tampilan ponsel dan tablet — 12 Oktober 2026

- Dunia Koperasi: tombol zoom dan putar kini tampil di ponsel; rentang zoom 0,6–5× (sebelumnya 0,7–2,4×) dengan langkah berlipat; layar potret membuka dengan denah diperbesar (ponsel ±1,5×, tablet ±1,2×).
- Beranda ponsel: filter proyek selebar penuh, Catat kegiatan dan Buat tugas berdampingan; angka minus tidak terlipat.
- Pilihan tampilan Tugas/Kegiatan satu baris yang bisa digeser di ponsel dan tablet (sebelumnya kisi bertumpuk tiga baris). Kartu tugas: sel selebar isi, penanggung jawab sebaris dengan Selesai.
- Kartu catatan: Opsi lainnya menjadi tombol "⋯" di ponsel sehingga aksi muat satu baris.
- Buku koperasi ponsel: angka ringkasan berupa baris label–angka (nilai panjang seperti estimasi persediaan tidak terpotong); kartu kas/barang lebih padat dengan aksi satu baris, Beli dan Opname menjadi tombol ikon berlabel.
- Linimasa ponsel: daftar rata kiri tanpa bingkai per baris.
- Verifikasi: 340 tes / 54 berkas, typecheck, lint, build lulus; tangkapan emulasi perangkat (CDP) 375×812 untuk 22 halaman dan 768×1024 untuk halaman utama, tanpa luber samping.

## Rilis awal repo 3D — 11 Oktober 2026

Repo `kopdes-manager-3d` dimulai bersih dari keadaan berikut.

### Dunia Koperasi 3D

- Diorama Three.js yang dibangun dari kode: Pulau melayang, Kantor delapan ruang, Gerai sepuluh unit, Gudang (rak A–F, dok D1–D4, truk), dan Cold storage (rak C1–C3).
- Tampilan panel logistik: bilah atas dengan pemilih lokasi dan pencarian, tiga KPI, panel detail per ruang, pelacak, daftar bertab, dok Detail/Ringkasan/Daftar/Agenda, pin perhatian, kontrol peta (perbesar, putar 15°–75°, tampilan awal), lembar bawah di ponsel.
- Figur chibi dari catatan Tim yang ditempatkan menurut rapat, kegiatan, pelatihan, tugas, seksi, dan unit gerai; kamera mengikuti figur pilihan dengan siku biru.
- Panel ruang memuat tugas, sprint dan milestone, dokumen, risiko, mitra, rapat dan keputusan, kegiatan dan pelatihan, barang, stok minimum, mutasi dan opname, uang masuk/keluar, anggota.
- Tautan dua arah dengan web (`?unit=`, `?orang=`, `?barang=`, `?kirim=`, `?tugas=`, `?rapat=`, `?lokasi=&pilih=`); aksi buat baru membuka formulir web.
- Render berhenti saat diam; panorama jendela mengikuti cuaca simulasi dan fase WIB.

### Halaman operasional

- Proyek, tugas (daftar, papan, harian, kalender, Gantt), milestone, sprint, kegiatan, rapat dengan ICS, dokumen, risiko dan isu, mitra, tim dan pelatihan, gerai dan kesiapan, laporan snapshot.
- Buku koperasi: anggota, buku kas (uang masuk/keluar tercatat), barang, stok opname, pengiriman, dan mutasi stok.
- Laci detail Detail/Terkait/Riwayat untuk semua catatan; Terkait dua arah dari kolom rujukan dan nama Tim; saran langkah berikut membuka formulir terisi tanpa menulis data.
- Beranda bento, judul halaman seragam berikon, tabel dan kartu rapi, tabel lebar menjadi kartu di area sempit, mode gelap.
- Tema biru senada dunia (`src/app/tema.css`), ikon dua nada, warna status token `--pastel-*`.

### Perkakas dan keamanan

- Mode demo `npm run dev:demo`: 191 catatan contoh di memori tanpa Supabase/PIN, tidak pernah aktif di Vercel.
- SQL install, reset, dan seed data contoh dibuat dari skrip; migrasi berurutan di `supabase/migrations/`.
- PIN ber-hash scrypt, sesi kedaluwarsa, cookie HttpOnly/SameSite, pemeriksaan asal mutasi, RLS.
- CI GitHub Actions: lint, typecheck, tes, build.

### Dirapikan saat pemisahan repo

- Sisa versi pixel dibuang: mesin PixiJS, aset gambar (`art-src`, `public/dunia`), skrip dan pratinjau pixel, dependensi `pixi.js`, serta prototipe 3D lama yang tidak dimuat. Model data dunia dipindah ke `src/features/dunia-3d/model/`.
- ID proyek Supabase diganti penanda `<project-ref>` di dokumen dan SQL karena repo publik.
- Aturan Git baru: cabang bertopik (`fitur/`, `perbaikan/`, `tampilan/`, `dokumen/`, `rapikan/`), tanpa awalan nama alat atau orang.
- Verifikasi: 340 tes / 54 berkas, typecheck, lint, build lulus; build juga lulus tanpa variabel rahasia.
