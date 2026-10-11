# Reset database kosong

Target tetap proyek **<project-ref>**. URL Supabase tidak berubah. Tidak perlu membuat proyek atau mengganti kunci selama kuncinya belum dirotasi.

## Yang dilakukan

`supabase/reset/RESET_DATABASE_KOSONG.sql` membuat kembali enam tabel aplikasi dari migrasi 1–7, termasuk indeks, pemeriksaan relasi, RLS, dan izin akses server. PIN, sesi masuk, log aktivitas, serta penanda template lama dihapus. Setelah selesai, buat PIN lagi.

Berkas berhenti jika `hub_records` atau `manager_reports` ternyata berisi data. Jangan menghapus pengaman ini. Unduh cadangan dan tinjau isinya terlebih dahulu. Tabel lain, Supabase Auth, dan Storage tidak dihapus. Seluruh langkah berada dalam satu transaksi: bila ada kesalahan, reset tidak disimpan.

**Sebelum eksekusi cloud**, jelaskan berkas, dampak dan proyek tujuan lalu minta persetujuan pemilik. Berkas FORCE di folder reset menghapus pengaman kosong dan tidak termasuk prosedur ini; jangan menggantikan berkas aman dengannya.

## Cara menjalankan

1. Tutup aplikasi Kopdes pada semua perangkat sementara reset berlangsung.
2. Buka dashboard Supabase. Pastikan project ref adalah **<project-ref>**.
3. Buka **SQL Editor → New query**.
4. Salin seluruh isi `supabase/reset/RESET_DATABASE_KOSONG.sql`. Periksa keterangan di bagian atas, lalu jalankan **Run** bila dampaknya sudah sesuai.
5. Jika gagal, jangan jalankan potongan SQL. Bila editor masih berada dalam transaksi gagal, jalankan `ROLLBACK;`. Catat pesan kesalahannya tanpa menyertakan kunci rahasia.
6. Jika berhasil, muat ulang aplikasi dan buka `/pin`. Pilih pengaturan PIN pertama kali. Isi token pengaturan dari konfigurasi server dan buat PIN baru. Jangan kirim PIN atau token ke chat.
7. Masuk kembali. Pastikan halaman tugas dan pencatatan terbuka tanpa pesan migrasi. Buat satu catatan nyata, muat ulang, lalu pastikan catatan tersimpan.

## Data contoh untuk menilai web

Setelah reset berhasil dan sebelum mencatat data nyata, jalankan `supabase/seed/SEED_DATA_CONTOH.sql` di SQL Editor yang sama. Isinya koperasi fiktif (nama dan angka acak); tanggal mengikuti hari saat dijalankan. Berkas berhenti bila data contoh atau profil koperasi sudah ada.

Sebelum memakai aplikasi sungguhan, jalankan `supabase/seed/HAPUS_DATA_CONTOH.sql`. Hanya catatan berawalan id `c0de0000` yang dihapus; berkas berhenti bila ada catatan nyata yang masih merujuk data contoh. Profil koperasi contoh ikut terhapus, jadi isi kembali Pengaturan.

Tanpa cloud: `npm run dev:demo` menampilkan data yang sama dari memori lokal, tanpa PIN, di `http://127.0.0.1:3000` (atau port lain dengan `npm run dev:demo -- -p 3200`).

## Batasan

Reset tidak menambah kapasitas paket Supabase dan tidak otomatis membuat pemuatan data bertahap. Paginasi, cache, serta ringkasan data besar perlu diverifikasi pada aplikasi secara terpisah. Jangan menjalankan berkas reset lagi setelah mulai mencatat data.

Untuk pemeliharaan kode: berkas reset dibuat dengan `node scripts/build-reset.mjs`. Setelah menambah migrasi, buat ulang dan uji berkasnya sebelum dipakai.
