<div align="center">

<img src="docs/gambar/dunia-kantor.png" alt="Dunia Koperasi 3D: kantor koperasi dengan ruang-ruang bersekat" width="100%" />

**Ruang kerja manajer koperasi desa: tugas, proyek, agenda, kas, barang, dan anggota dalam satu tempat, ditambah Dunia Koperasi 3D yang membaca data yang sama.**

</div>

## Tentang

Kopdes Manager dipakai manajer Koperasi Desa/Kelurahan Merah Putih (KDMP) setiap hari, di HP, tablet, dan laptop.

- **Beranda**: rutin harian yang dicentang tiap pagi, tenggat dekat, ringkasan tugas, dan linimasa hari ini.
- **Tugas dan proyek**: daftar, papan seret-lepas, kalender, linimasa (Gantt), subtugas, prasyarat, tugas berulang, milestone, anggaran proyek, periode kerja.
- **Agenda dan catatan**: rapat dengan tautan online dan unduhan jadwal (.ics), kegiatan harian, laporan kerja mingguan/bulanan siap cetak dan siap dikirim ke WhatsApp.
- **Pencatatan usaha**: buku kas, anggota dan simpanan, barang, stok opname, pengiriman, mutasi stok, pembelian, penjualan harian, aset, tim dan absensi.
- **Dunia Koperasi 3D**: diorama kantor, gerai, gudang, dan cold storage yang dibangun dari kode dengan Three.js; setiap objek bertautan ke catatan aslinya.

Prinsipnya: tanpa data karangan. Modul yang belum aktif atau gagal dimuat ditampilkan apa adanya, bukan angka nol. Buku kas hanya mencatat uang masuk dan keluar, tidak pernah disebut saldo atau laba.

## Coba dalam satu menit

```sh
npm ci
npm run dev:demo -- -p 3200
```

Buka `http://localhost:3200`. Mode demo memakai data contoh di memori, tanpa Supabase dan tanpa PIN, dan tidak pernah aktif di Vercel.

## Memakai data asli

1. Salin `.env.example` menjadi `.env.local`, isi alamat dan kunci Supabase baru serta token pengaturan PIN.
2. Pasang skema sesuai [docs/DATABASE.md](docs/DATABASE.md) (AI tidak menjalankan SQL di cloud; pemilik yang menjalankan).
3. `npm run dev`, buka `/pin`, atur PIN pertama kali.

## Perintah

| Perintah | Untuk |
|---|---|
| `npm run dev:demo -- -p 3200` | Jalankan dengan data contoh |
| `npm run cek` | Pemeriksaan cepat saat bekerja (tipe, lint, tes terkait) |
| `npm run cek:penuh` | Pemeriksaan lengkap sebelum digabung (semua tes, build, ukuran JS) |
| `npm run seed:contoh` | Buat ulang SQL data contoh dari `src/features/demo/sample-data.ts` |

## Dokumentasi

| Berkas | Isi |
|---|---|
| [AGENTS.md](AGENTS.md) | Aturan kerja untuk manusia dan semua AI |
| [docs/STATUS.md](docs/STATUS.md) | Keadaan sekarang, langkah berikut, keputusan pemilik |
| [docs/PRODUK.md](docs/PRODUK.md) | Fitur dan batas produk |
| [docs/KODE.md](docs/KODE.md) | Struktur kode dan aliran data |
| [docs/TAMPILAN.md](docs/TAMPILAN.md) | Token warna, komponen, gerak, kata-kata di layar |
| [docs/DATABASE.md](docs/DATABASE.md) | Supabase, migrasi, reset, data contoh |
| [docs/DUNIA-3D.md](docs/DUNIA-3D.md) | Dunia Koperasi 3D |
| [CHANGELOG.md](CHANGELOG.md) | Riwayat perubahan besar |

## Teknologi

Next.js (App Router), React, TypeScript strict, Tailwind v4, Radix, Motion, Zod, Supabase, Three.js, Vitest.
