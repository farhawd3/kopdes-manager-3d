# Database — panduan pemilik

Isinya langkah untuk pemilik. **AI tidak menjalankan SQL di cloud.** Sebelum SQL cloud apa pun, AI menjelaskan berkas, dampak, dan proyek tujuan, lalu pemilik yang menjalankan.

## Gambaran singkat

- Database: Supabase **baru** milik pemilik. Proyek lama tidak dipakai dan tidak diubah.
- Browser tidak pernah memegang kunci Supabase. Semua baca/tulis lewat Route Handler di server.
- Alur: halaman → API → periksa cookie dan sesi → validasi Zod → Supabase. RLS menolak akses langsung dari browser.
- Kunci layanan hanya dipakai di `src/lib/server/db.ts` (bertanda `server-only`).

Enam tabel:

| Tabel | Isi |
|---|---|
| `hub_records` | Semua catatan kerja. Kolom: `id`, `entity`, `data` (JSONB), `recurrence_key`, `created_at`, `updated_at` |
| `manager_security` | Hash PIN dan batas percobaan masuk |
| `manager_sessions` | Hash token sesi dan waktu kedaluwarsa |
| `manager_reports` | Snapshot laporan kerja (draf/final) |
| `activity_log` | Jejak tindakan dan waktu, tanpa isi catatan |
| `template_runs` | Penanda template lama, hanya untuk kompatibilitas |

`hub_records.entity` dibatasi daftar tetap. Setelah migrasi 11 ada 30 jenis catatan. Isi `data` divalidasi Zod per jenis di `src/features/records/schemas.ts`. Database juga memeriksa rujukan antar-catatan (`*_id`), prasyarat melingkar, profil tunggal, dan kode unik.

## 1. Siapkan Supabase baru

1. Buat proyek Supabase baru (paket gratis cukup). Jangan aktifkan layanan berbayar.
2. Catat project ref. Pastikan ref yang benar setiap kali membuka SQL Editor.
3. Pasang skema: lihat bagian **Install bersih** untuk proyek kosong.
4. Isi variabel lingkungan (bagian 2), jalankan aplikasi, lalu buat PIN (bagian 3).

## 2. Variabel lingkungan

Salin `.env.example` menjadi `.env.local`. File `.env.local` tidak masuk Git. Jangan kirim isinya lewat chat.

| Variabel | Isi |
|---|---|
| `HUB_SUPABASE_URL` | URL proyek Supabase baru |
| `HUB_SUPABASE_SERVICE_KEY` | Kunci server (secret/service key) dari Settings → API Keys. Bukan anon/publishable key |
| `HUB_SETUP_TOKEN` | Token acak minimal 32 karakter, hanya untuk membuat PIN pertama |
| `HUB_APP_ORIGIN` | Lokal: `http://127.0.0.1:3000`. Hosting: domain HTTPS aplikasi tanpa `/pin` |
| `NEXT_PUBLIC_MODE_DEMO` | Kosongkan. Isi `1` hanya untuk demo lokal |

Nama berawalan `HUB_` sengaja dibedakan agar kunci lama tidak terpakai tanpa sengaja. Ubah env, lalu jalankan ulang server.

`HUB_APP_ORIGIN` harus sama persis dengan alamat di browser (protokol, host, port). Bila memakai `localhost`, isi `http://localhost:3000`. Di Vercel, server juga mengenali `VERCEL_URL`, `VERCEL_BRANCH_URL`, dan (khusus production) `VERCEL_PROJECT_PRODUCTION_URL`. Domain lain dan Origin kosong ditolak. Bila muncul "Asal permintaan tidak diizinkan" di Vercel, isi `HUB_APP_ORIGIN` di environment Production, lalu Redeploy.

## 3. PIN pertama

1. Jalankan `npm run dev`, buka `http://127.0.0.1:3000/pin`.
2. Pilih pengaturan PIN pertama kali.
3. Isi PIN baru (6–12 digit) dan token dari `HUB_SETUP_TOKEN`.
4. Masuk dengan PIN. Setelah berhasil, hapus `HUB_SETUP_TOKEN` dari env hosting.
5. Isi profil koperasi di Pengaturan.

Tidak ada PIN bawaan. PIN yang hilang dipulihkan lewat administrator database.

## 4. Urutan migrasi

Semua berkas di `supabase/migrations/`. Jalankan berurutan, masing-masing **sekali**. Jangan ubah migrasi yang sudah terpasang; perubahan baru selalu berkas bernomor baru.

| No | Berkas | Isi |
|---|---|---|
| 1 | `20260930000001_manager_hub.sql` | Enam tabel, 16 jenis catatan awal, RLS, fungsi PIN/sesi, tugas berulang, pemulihan cadangan |
| 2 | `20261001000002_operations.sql` | Pencatatan: anggota, kas, barang, stok opname; nomor anggota dan kode barang unik; `hub_operations_ready` |
| 3 | `20261001000003_cooperative_redesign.sql` | Jenis `sprints` (target periode), indeks kode tugas, relasi `sprint_id` |
| 4 | `20261001000004_interconnected_operations.sql` | Relasi kas ke anggota (`member_id`) dan barang, indeks pencarian per anggota/barang |
| 5 | `20261001000005_manager_superapp.sql` | Kolom `status` draf/final di `manager_reports`, indeks laporan |
| 6 | `20261002000006_paged_records.sql` | Indeks untuk daftar bertahap (paginasi) |
| 7 | `20261002000007_document_relation_check.sql` | Pemeriksaan relasi `document_id` ke dokumen |
| 8 | `20261006000008_world_logistics.sql` | Pengiriman (`deliveries`) dan mutasi stok (`stock-movements`), `hub_post_stock_movement`, `hub_logistics_ready` |
| 9 | `20261013000009_report_backup.sql` | Status laporan draf/final tetap terjaga saat pemulihan cadangan |
| 10 | `20261015000010_administrasi_usaha.sql` | `assets`, `attendance`, `purchase-orders`, `sales`, `savings`; relasi `purchase_id`; `hub_administration_ready` |
| 11 | `20261023000011_rutin_harian.sql` | `routines` (judul, jam, hari aktif 1–7) dan `routine-checks` (satu centang per rutin per hari); `hub_routines_ready` |

Catatan per migrasi:

- Migrasi 8: stok buku hanya berubah lewat `hub_post_stock_movement`. Mutasi tidak bisa diubah. Stok negatif ditolak.
- Migrasi 10: penarikan simpanan yang melebihi setoran per anggota dan jenis ditolak. Satu absensi per petugas per hari, satu penjualan per gerai per hari.
- Migrasi 11: jam rutin harus `HH:MM`. Centang wajib menyebut rutin dan tanggal. Dua perangkat yang mencentang bersamaan tidak membuat centang ganda.
- Fungsi `*_ready` dan fungsi stok hanya bisa dipanggil `service_role`. Tidak ada migrasi yang menghapus tabel, data, atau RLS.

Keadaan cloud yang tercatat (lihat `docs/STATUS.md`): migrasi 8 sudah dijalankan pemilik. Migrasi 9, 10, dan 11 belum. Status migrasi 6 dan beberapa sebelumnya belum terbukti. Jangan menebak; periksa dulu.

## 5. Cek migrasi yang sudah terpasang

Cara mudah: masuk ke aplikasi. Halaman yang migrasinya belum terpasang menulis "belum aktif". Server memeriksanya lewat `/api/capabilities`, yang memanggil empat fungsi `*_ready`.

Cara pasti: jalankan kueri baca ini di SQL Editor (tidak mengubah apa pun).

```sql
-- Fungsi penanda migrasi 2, 8, 10, 11
select proname from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('hub_operations_ready','hub_logistics_ready',
                  'hub_administration_ready','hub_routines_ready');

-- Daftar jenis catatan yang diizinkan (sprints = migrasi 3, routines = migrasi 11)
select pg_get_constraintdef(oid) from pg_constraint
where conname = 'hub_records_entity_check';

-- Migrasi 5: kolom status laporan
select column_name from information_schema.columns
where table_name = 'manager_reports' and column_name = 'status';

-- Migrasi 6: indeks daftar bertahap
select indexname from pg_indexes where indexname = 'hub_records_page_created_idx';

-- Migrasi 4, 7, 10, 11: relasi yang diperiksa
select prosrc ~ 'member_id' as m4, prosrc ~ 'document_id' as m7,
       prosrc ~ 'purchase_id' as m10, prosrc ~ 'routine_id' as m11
from pg_proc where proname = 'hub_check_relations';
```

Migrasi 9 tidak punya penanda sederhana. Bila migrasi 10 terpasang, migrasi 9 seharusnya sudah lebih dulu.

## 6. Menjalankan migrasi tambahan

1. Unduh cadangan JSON dari Pengaturan. Simpan di tempat pribadi.
2. Buka Supabase, pastikan project ref benar, buka **SQL Editor → New query**.
3. Salin seluruh isi satu berkas migrasi, jalankan **Run** sekali.
4. Bila gagal, seluruh transaksi batal. Jangan jalankan potongan SQL dan jangan hapus constraint manual. Bila editor masih dalam transaksi gagal, jalankan `ROLLBACK;`.
5. Muat ulang aplikasi. Tulisan "belum aktif" harus hilang.
6. Simpan satu catatan nyata, muat ulang, pastikan tersimpan.

## 7. Install bersih

Untuk proyek yang **belum punya skema aplikasi sama sekali**: `supabase/install/INSTALL_SCHEMA_KOSONG.sql`. Berkas ini menggabungkan semua migrasi dalam satu transaksi. Berkas menolak berjalan bila tabel aplikasi sudah ada.

Berkas ini dibuat dengan `node scripts/build-install.mjs` dari semua berkas di `supabase/migrations/` (saat ini migrasi 1–11). Setelah menambah migrasi, jalankan generator lagi.

## 8. Reset

`supabase/reset/RESET_DATABASE_KOSONG.sql` membuat ulang enam tabel aplikasi dari semua migrasi. PIN, sesi, log, dan penanda template ikut terhapus. Setelah itu buat PIN lagi.

- **Jangan reset database yang berisi data.** Berkas berhenti sendiri bila `hub_records` atau `manager_reports` berisi data. Jangan hapus pengaman ini.
- Tabel lain, Supabase Auth, dan Storage tidak disentuh.
- Semua langkah dalam satu transaksi.
- `RESET_DATABASE_FORCE_CLEAN.sql` menghapus tabel **walau berisi data**. Bukan bagian prosedur normal. Jangan dipakai tanpa keputusan tegas pemilik.
- Berkas dibuat dengan `node scripts/build-reset.mjs` dan `node scripts/build-force-reset.mjs` dari semua migrasi (saat ini 1–11). Buat ulang setelah menambah migrasi.

Langkah reset:

1. Tutup aplikasi di semua perangkat.
2. Pastikan project ref benar di dashboard Supabase.
3. SQL Editor → New query → salin seluruh isi berkas reset → baca keterangan di atasnya → Run.
4. Bila gagal: jangan jalankan potongan; `ROLLBACK;` bila perlu.
5. Bila berhasil: buka `/pin`, buat PIN baru dengan token setup.
6. Masuk, pastikan halaman tugas dan pencatatan terbuka tanpa pesan migrasi.

## 9. Data contoh

Untuk menilai tampilan dengan data, di database **kosong** yang baru direset:

- `supabase/seed/SEED_DATA_CONTOH.sql`: ratusan catatan fiktif (nama dan angka acak). Semua id diawali `c0de0000`. Tanggal menyesuaikan hari saat dijalankan (WIB). Berhenti bila data contoh atau profil koperasi sudah ada.
- `supabase/seed/HAPUS_DATA_CONTOH.sql`: hapus semua catatan berawalan `c0de0000`. Berhenti bila ada catatan nyata yang masih merujuk data contoh. Profil contoh ikut terhapus, jadi isi lagi Pengaturan.

Jalankan penghapus sebelum mulai mencatat data nyata. Kedua berkas dibuat dengan `npm run seed:contoh` (`scripts/build-seed.mjs`, lewat `tests/unit/seed-sql.test.ts`) dari `src/features/demo/sample-data.ts`. Jangan sunting tangan.

## 10. Mode demo lokal

```
npm run dev:demo
npm run dev:demo -- -p 3200
```

- Menjalankan Next dengan `NEXT_PUBLIC_MODE_DEMO=1`.
- Data contoh di memori. Tanpa Supabase, tanpa PIN. Folder build terpisah (`.next-demo`).
- `isDemoMode()` di `src/lib/demo.ts` mematikan demo bila `VERCEL=1`. Demo tidak pernah aktif di Vercel.

## 11. Keamanan

- RLS aktif di semua tabel. `anon` dan `authenticated` tidak diberi akses. Server memakai `service_role` setelah memeriksa sesi.
- Setiap aksi server divalidasi Zod dan sesi. Mutasi juga memeriksa Origin.
- PIN di-hash scrypt dengan salt acak. Lima percobaan gagal mengunci 15 menit; batas ini tersimpan di database. Ganti PIN mencabut semua sesi.
- Token sesi acak 32 byte; database hanya menyimpan hash SHA-256. Cookie HttpOnly, SameSite Strict, Secure di produksi, berlaku 12 jam.
- Cadangan pengguna tidak memuat sesi, hash PIN, atau log. Pemulihan mengganti catatan dan laporan sekaligus dalam satu transaksi.
- Rahasia server tidak masuk browser, Git, atau log. Repo ini publik.
- **AI tidak menjalankan SQL cloud.** Reset, seed, dan migrasi dijalankan pemilik.

## 12. Menambah migrasi baru

1. Buat berkas bernomor baru di `supabase/migrations/`.
2. Jalankan tes database lokal (PGlite, `tests/database/`).
3. Buat ulang SQL install dan reset dengan generatornya.
4. Jangan hapus migrasi lama. Berkas yang pernah dijalankan di cloud adalah jejak audit.
