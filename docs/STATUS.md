# Status

Satu-satunya catatan keadaan untuk semua AI dan manusia. Timpa bagian yang berubah; jangan menumpuk catatan sesi. Riwayat ada di Git dan [CHANGELOG](../CHANGELOG.md).

## Sekarang (23 Oktober 2026)

- Cabang kerja: `tampilan/redesain-total` (belum digabung ke `main`, belum di-push).
- **Redesain total selesai dibangun di aplikasi**: semua halaman memakai tampilan baru (acuan TaskTrack, pastel tanpa gradasi, Urbanist, aksi biru tua, 5 warna sorotan, terang/gelap). Kode dan alamat halaman berbahasa Inggris; alamat lama dialihkan.
- Beranda: rutin hari ini → tenggat dekat → ringkasan tugas → linimasa hari ini + perlu perhatian + proyek berjalan.
- Rutin harian pindah ke database (**migrasi 11**, `supabase/migrations/20261023000011_rutin_harian.sql`). Sebelum dijalankan, Beranda menampilkan pesan migrasi; rutin lama di peramban bisa dipindahkan dengan satu tombol setelah migrasi aktif.
- Pemeriksaan terakhir: typecheck dan lint bersih, 30 berkas tes / 206 tes lulus, build lulus, JS awal halaman utama 402–477 KB (batas 500 KB).
- Mode demo diperiksa di peramban: Beranda (centang rutin tersimpan), Tugas (seret-lepas papan tersimpan dengan Urungkan).

## Langkah berikut

1. Pemilik meninjau tampilan di `npm run dev:demo -- -p 3200` (HP, tablet, laptop) dan memberi koreksi.
2. Pemilik menjalankan migrasi 11 di Supabase (setelah migrasi 1–10), lalu seed contoh bila perlu (`docs/DATABASE.md`).
3. Setelah disetujui: `npm run cek:penuh`, push cabang, buka pull request ke `main`.
4. Belum dikerjakan: menerjemahkan nama dalam kode Dunia 3D (`src/features/world`) dan `lib/server/demo-db.ts` ke bahasa Inggris; halaman Agenda masih tampilan daftar umum (belum kalender pekan khusus); tes perilaku UI baru belum ditulis (hanya tes logika).

## Keputusan pemilik yang berlaku

Daftar lengkap ada di [PRODUK](PRODUK.md). Yang paling baru:

- 23 Okt 2026: acuan tampilan TaskTrack; warna kartu per proyek; hiasan lengkung halus; navigasi bawah HP putih dengan kapsul pastel; semua modal formulir diganti laci/lembar bawah; Beranda mendahulukan rutin; rutin di database dengan hari aktif per rutin; aksi biru tua; huruf Urbanist; langsung dibangun di aplikasi (prototipe HTML dihapus).
- 23 Okt 2026: tanpa gradasi di mana pun.
- 22 Okt 2026: redesain total; kode dan alamat halaman bahasa Inggris, teks layar bahasa Indonesia sehari-hari; satu aturan untuk semua AI di AGENTS.md; skill proyek hanya `grilling`; CHANGELOG hanya perubahan besar; pemeriksaan dipercepat (`npm run cek`).

## Menjalankan pemeriksaan

```sh
npm run cek          # saat bekerja
npm run cek:penuh    # sebelum digabung ke main
npm run dev:demo -- -p 3200
```
