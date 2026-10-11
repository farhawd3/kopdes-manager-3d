# Menyiapkan Supabase baru

Proyek tujuan: **kopdes-management-web**, ID **<project-ref>**, Free, Singapore.
Proyek lama tidak digunakan atau diubah oleh aplikasi baru.

## 1. Tentukan keadaan skema

Panduan berikut menjelaskan fondasi awal. Pada proyek kosong gunakan SQL instalasi gabungan; pada proyek yang sudah dipakai jalankan hanya migrasi tambahan yang belum terpasang. Ikuti [MIGRASI-SQL](MIGRASI-SQL.md), bukan mengulang migrasi awal atau reset.

Berkas: `supabase/migrations/20260930000001_manager_hub.sql`.

Migrasi membuat enam tabel:

| Tabel | Isi |
|---|---|
| hub_records | 16 domain awal; migrasi berikutnya memperluas menjadi 21, divalidasi Zod |
| manager_security | Hash PIN dan batas percobaan persisten |
| manager_sessions | Hash token sesi dengan kedaluwarsa |
| manager_reports | Snapshot laporan yang tidak berubah ketika pekerjaan diedit |
| activity_log | Jejak tindakan dan waktu, tanpa isi catatan pribadi |
| template_runs | Penanda agar template tidak terpasang dua kali |

SQL juga membuat indeks, pemeriksaan relasi/dependensi, log perubahan, transaksi template/pemulihan/tugas berulang, dan fungsi keamanan. Semua tabel memakai RLS. Anon dan authenticated tidak diberi akses; server menggunakan kunci layanan setelah memeriksa sesi. PIN awal tidak ditulis di SQL. Tidak ada penghapusan database lama atau data lama.

Fungsi pemulihan baru menghapus dan mengganti data ketika **fitur Pulihkan** digunakan; membuat fungsi ini tidak menjalankan pemulihan. Fungsi pergantian PIN mencabut sesi ketika diminta dari aplikasi.

**Sebelum eksekusi cloud, pemilik harus menyetujui berkas dan proyek tujuan ini.**

## 2. Jalankan oleh pemilik

1. Buka proyek `kopdes-management-web` pada Supabase, pastikan ID `<project-ref>`.
2. Buka SQL Editor → New query.
3. Salin SQL instalasi atau migrasi tambahan yang telah dipilih sesuai MIGRASI-SQL, lalu Run setelah dampak dan targetnya disetujui.
4. Pastikan hasil sukses. Jangan menjalankannya pada proyek lama atau mengulang migrasi yang sudah berhasil.
5. Beri tahu AI bahwa migrasi selesai, atau salin pesan error tanpa kunci rahasia.

Migrasi telah diuji dengan PostgreSQL lokal (PGlite). Hasil lokal tidak menggantikan verifikasi cloud.

## 3. Isi konfigurasi lokal

Buka `.env.local`:

- `HUB_SUPABASE_URL`: URL proyek baru, sudah disiapkan.
- `HUB_SUPABASE_SERVICE_KEY`: isi kunci server/secret key proyek baru dari Settings → API Keys. Jangan gunakan publishable/anon key.
- `HUB_SETUP_TOKEN`: token acak untuk pengaturan PIN pertama, sudah dibuat secara lokal. Jangan kirim di chat.
- `HUB_APP_ORIGIN`: `http://127.0.0.1:3000` saat memakai `npm run dev`; domain HTTPS tepat saat hosting. Alamat pada browser harus memakai host, protokol dan port yang sama. Jika sengaja memakai `localhost`, ubah origin menjadi `http://localhost:3000` dan jalankan ulang server.

Simpan berkas dan jalankan ulang server setelah mengubah env. Nama variabel HUB sengaja berbeda agar kredensial lama tidak terpakai tanpa sengaja. `.env.local` dan arsipnya diabaikan Git.

## 4. PIN dan data awal

1. Jalankan `npm run dev`, buka `http://127.0.0.1:3000/pin`.
2. Klik Pengaturan PIN pertama kali.
3. Masukkan PIN baru 6–12 digit dan token dari `HUB_SETUP_TOKEN`.
4. Simpan lalu masuk dengan PIN. Hapus `HUB_SETUP_TOKEN` dari konfigurasi hosting setelah inisialisasi sukses.
5. Isi profil di Pengaturan, lalu buat proyek dan tugas sendiri.
6. Gunakan status sesuai pelaksanaan nyata; jangan menandai selesai hanya untuk mengisi dashboard.

Pemulihan PIN yang hilang dilakukan melalui administrator server/database. Tidak ada PIN bawaan atau tombol membuka akses tanpa pemeriksaan.

## Sebelum hosting

Gunakan HTTPS, isi origin dan kunci server pada environment hosting, jalankan seluruh pemeriksaan, lalu verifikasi login/logout, kedaluwarsa sesi, simpan data, cadangan dan pemulihan pada proyek uji. Jangan mengaktifkan paket berbayar atau integrasi migrasi otomatis.

## Jika muncul “Asal permintaan tidak diizinkan” di Vercel

Untuk domain aktif saat ini, isi `HUB_APP_ORIGIN` pada environment Production dengan `https://kopdes-management-web.vercel.app`. Jangan sertakan `/pin`, tanda kutip, atau nilai localhost. Setelah menyimpan perubahan, Redeploy agar konfigurasi baru dipakai.

Server juga menerima alamat deployment/branch dari `VERCEL_URL` dan `VERCEL_BRANCH_URL` ketika berjalan di Vercel. Domain produksi dari `VERCEL_PROJECT_PRODUCTION_URL` hanya ditambahkan pada environment production. Ini adalah metadata server Vercel, bukan nilai Host/Forwarded dari pengunjung. Domain lain, Origin kosong, dan wildcard seluruh `vercel.app` tetap ditolak. Domain kustom tambahan memakai `HUB_APP_ORIGIN`.

Tidak perlu membuat PIN atau menjalankan migrasi ulang. Login produksi tetap perlu dicoba pemilik setelah Redeploy.
