# Changelog

Semua perubahan penting dicatat di sini, satu entri per paket kerja (terbaru di atas). Riwayat sebelum repo ini (versi pixel dan pengembangan awal 3D) ada di repo `kopdes-manager-web`.

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
