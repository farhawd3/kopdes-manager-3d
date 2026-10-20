# Changelog

Semua perubahan penting dicatat di sini, satu entri per paket kerja (terbaru di atas). Format entri ada di AGENTS.md bagian Proses. Riwayat sebelum repo ini (versi pixel dan pengembangan awal 3D) ada di repo `kopdes-manager-web`.

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
