# Status

Satu-satunya catatan keadaan untuk semua AI dan manusia. Timpa bagian yang berubah; jangan menumpuk catatan sesi. Riwayat ada di Git dan [CHANGELOG](../CHANGELOG.md).

## Sekarang (24 Oktober 2026)

- Cabang kerja: `tampilan/redesain-total` (belum digabung ke `main`, belum di-push).
- **Redesain total selesai dibangun di aplikasi**: semua halaman memakai tampilan baru (acuan TaskTrack, pastel tanpa gradasi, Urbanist, aksi biru tua, 5 warna sorotan, terang/gelap). Kode dan alamat halaman berbahasa Inggris; alamat lama dialihkan.
- Beranda: rutin hari ini → tenggat dekat → ringkasan tugas → linimasa hari ini + perlu perhatian + proyek berjalan.
- Rutin harian pindah ke database (**migrasi 11**, `supabase/migrations/20261023000011_rutin_harian.sql`). Sebelum dijalankan, Beranda menampilkan pesan migrasi; rutin lama di peramban bisa dipindahkan dengan satu tombol setelah migrasi aktif.
- **Satu gaya kode untuk seluruh proyek**, termasuk Dunia 3D: nama kode, berkas, tes, dan skrip berbahasa Inggris; Dunia 3D memakai kelas Tailwind dan token warna aplikasi (ikut tema gelap), `monitoring.css` dihapus. Nilai string yang tersimpan atau tampil di alamat (`lokasi=`, `pilih=`, kunci ruang) sengaja tetap bahasa Indonesia.
- Audit kode selesai dan semua temuan diperbaiki: tombol muat ulang selalu ke server, aturan lewat tenggat dan jam WIB masing-masing satu fungsi, sisa kode dunia lama dan dependensi yang tidak dipakai dihapus.
- Pemeriksaan terakhir: `npm run cek:penuh` lulus (31 berkas tes / 198 tes, build, JS awal halaman utama 406–490 KB dari batas 500 KB).
- Mode demo diperiksa di peramban: Beranda, Tugas, dan Dunia 3D (lebar 375, 768/900, 1200, 1440, tema gelap).

## Langkah berikut

1. Pemilik meninjau tampilan di `npm run dev:demo -- -p 3200` (HP, tablet, laptop) dan memberi koreksi.
2. Pemilik menjalankan migrasi 11 di Supabase (setelah migrasi 1–10), lalu seed contoh bila perlu (`docs/DATABASE.md`).
3. Setelah disetujui: `npm run cek:penuh`, push cabang, buka pull request ke `main`.
4. Menunggu keputusan pemilik: cabang lama `rapikan/repo-3d` (belum digabung, di luar cabang kerja) dihapus atau tidak; gambar README (`docs/gambar/`) diambil ulang karena kartu dunia kini memakai warna aplikasi.
5. Belum dikerjakan: halaman Agenda masih tampilan daftar umum (belum kalender pekan khusus); tes perilaku UI baru belum ditulis (hanya tes logika).

## Keputusan pemilik yang berlaku

Daftar lengkap ada di [PRODUK](PRODUK.md). Yang paling baru:

- 23–24 Okt 2026: satu gaya kode untuk seluruh proyek, termasuk Dunia 3D (bahasa Inggris, Tailwind, token warna aplikasi); kode lama dirapikan sebelum fitur baru.
- 23 Okt 2026: acuan tampilan TaskTrack; warna kartu per proyek; hiasan lengkung halus; navigasi bawah HP putih dengan kapsul pastel; semua modal formulir diganti laci/lembar bawah; Beranda mendahulukan rutin; rutin di database dengan hari aktif per rutin; aksi biru tua; huruf Urbanist; langsung dibangun di aplikasi (prototipe HTML dihapus).
- 23 Okt 2026: tanpa gradasi di mana pun.
- 22 Okt 2026: redesain total; kode dan alamat halaman bahasa Inggris, teks layar bahasa Indonesia sehari-hari; satu aturan untuk semua AI di AGENTS.md; skill proyek hanya `grilling`; CHANGELOG hanya perubahan besar; pemeriksaan dipercepat (`npm run cek`).

## Menjalankan pemeriksaan

```sh
npm run cek          # saat bekerja
npm run cek:penuh    # sebelum digabung ke main
npm run dev:demo -- -p 3200
```
