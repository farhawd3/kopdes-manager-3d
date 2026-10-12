# Changelog

Semua perubahan penting dicatat di sini, satu entri per paket kerja (terbaru di atas). Riwayat sebelum repo ini (versi pixel dan pengembangan awal 3D) ada di repo `kopdes-manager-web`.

## Sistem gaya baru berbahasa dunia 3D — 12 Oktober 2026

Gaya web dibangun ulang dari nol karena beberapa bagian tidak serasi dan kurang berkarakter. Lapisan lama (`personal.css`, `ui.css`, `tokens.css`, `tema.css`) dihapus, bukan ditimpa.

- Struktur baru `src/styles/`: `token.css` (warna, dinding, lantai, kayu, status, radius, bayangan, gerak; terang/gelap) → `dasar.css` → `komponen.css` → `kerangka.css` → `halaman/*.css` (satu berkas per kelompok halaman).
- Bahasa dunia: menu samping berupa dinding biru-lavender dengan item aktif sebagai kartu putih; setiap kelompok menu punya lantai sendiri (`data-ruang` di `<main>`) dengan pita papan isometrik dan nama ruang tercat samar; aksen kayu untuk rapat, layar PIN, laporan, hari ini, dan milestone.
- Ringkasan angka berupa pil ganda "angka · label"; dok ponsel mengambang; dialog menjadi lembar bawah di ponsel; laci detail di kanan.
- Beranda: baris label kecil di atas judul dihapus, tanggal menjadi cip.
- Beranda tablet: kartu rapat setinggi isinya; angka Catatan koperasi maksimal dua kolom dan satu kolom di kolom sempit agar nilai uang tidak luber.
- Cincin progres Beranda tidak lagi terpotong dan busurnya mulai dari atas.
- Dialog Cari di ruang kerja: ikon di dalam kolom, pilihan jenis satu baris yang bisa digeser, judul kelompok dengan jumlah berupa pil, hasil berupa baris 44 px.
- Tugas: tombol Rencana/Selesai di Papan sejajar dengan ikon centang hijau; bulatan centang Harian bundar 24 px dengan area ketuk 44 px; jumlah tugas di strip minggu berupa pil status yang tidak terpotong; menu Lainnya selalu di kanan sehingga tidak keluar layar.
- Dialog Tambah: label kecil di atas judul dihapus, kepala dan tombol tutup tetap terlihat saat digulir. Laci tugas: bilah aksi tidak lagi naik melewati tepi atas.
- Halaman 404 di dalam kerangka tampil sebagai kartu biasa tanpa diorama layar masuk.
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
