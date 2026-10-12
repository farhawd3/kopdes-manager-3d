# Arsitektur kode aktif

## Alur data

```mermaid
flowchart LR
  UI[Halaman manajer] --> API[Route Handler]
  API --> Sesi[Periksa cookie dan sesi database]
  Sesi --> Validasi[Zod dan aturan domain]
  Validasi --> DB[Supabase PostgreSQL]
  DB --> RLS[RLS: akses browser ditolak]
```

Browser tidak memakai kunci Supabase. Route Handler memeriksa sesi sebelum membaca/menulis data. Mutasi juga memeriksa Origin. Kunci layanan hanya digunakan dalam `lib/server/db.ts` yang diberi batas `server-only`.

## Penyimpanan ringkas

Skema enam tabel dijelaskan dalam [SUPABASE](SUPABASE.md), dan disetujui pemilik untuk proyek baru. `hub_records` berisi envelope `id`, `entity`, `data`, `created_at`, `updated_at`, dan `recurrence_key` opsional. `data` adalah JSONB dengan skema Zod **berbeda untuk setiap domain**. Dua puluh satu domain memiliki allowlist tetap, bukan nama tabel dari input pengguna.

Keputusan ini menyederhanakan fondasi satu manajer. Konsekuensinya, query analitik lintas domain dan paginasi skala besar belum dioptimalkan seperti tabel terpisah. Relasi ID, dependensi melingkar, profil tunggal, dan kode bidang kerja tetap diperiksa database. Daftar UI memakai paginasi; pembacaan lengkap untuk laporan/cadangan memakai batch dan batas pengaman yang gagal jelas, bukan memotong data diam-diam.

Kontrak API dan skema memisahkan kebutuhan UI dari penyimpanan. Bila skala membutuhkan normalisasi, pecah layanan dan migrasikan domain secara bertahap, disertai cadangan dan tes. Jangan menjalankan SQL reset lama.

## Modul kode

- `features/records/schemas.ts`: validasi dan tipe domain; tidak mengandung koneksi database.
- `features/records/catalog.ts`: label formulir, referensi, pilihan status, dan navigasi.
- `features/records/service.ts`: baca/simpan domain, pemeriksaan relasi dan dependensi.
- `features/records/Editor.tsx`: form lengkap atau tambah cepat; skema yang sama dipakai sebelum permintaan.
- `features/records/Records.tsx`: daftar/papan/aksi catatan. Kalender dipisah dalam `TaskCalendar`.
- `features/<domain>/`: komponen dan utilitas dikelompokkan berdasarkan domain sesuai tabel berikut.
- `features/reports/report-snapshot.ts`: pemilihan periode laporan yang dipakai server.
- `lib/progress.ts`: rumus bersama. Tanpa checklist wajib berarti belum dinilai, bukan 100% siap.
- `lib/date.ts`: tanggal kalender dan WIB, termasuk pengulangan bulanan pada akhir bulan.
- `tests/fixtures/legacy-plan.ts` dan `tests/fixtures/legacy-plan.json`: rencana historis untuk uji kompatibilitas transaksi SQL; tidak diimpor runtime.

## Struktur folder aktif

| Folder | Tanggung jawab |
|---|---|
| `src/features/dashboard/` | Beranda dan Hari Ini |
| `src/features/dunia-3d/` | Dunia Koperasi 3D: scene Three.js, ruang, figur, kartu monitoring, tautan web; model data di `model/`; lihat DUNIA-KOPERASI.md |
| `src/features/records/` | Laci detail, Terkait, saran langkah berikut, editor dan daftar catatan |
| `src/features/demo/` | Data contoh dan SQL seed untuk mode demo |
| `src/features/tasks/` | Daftar, papan, kalender, detail, jadwal berulang dan kode tugas |
| `src/features/projects/` | Proyek, catatan, milestone dan target periode |
| `src/features/follow-ups/` | Pengingat, sematan dan tinjauan mingguan |
| `src/features/operations/` | Buku pencatatan dan rumus kas/stok |
| `src/features/meetings/` | Tautan rapat dan ekspor kalender |
| `src/features/reports/` | Tampilan dan snapshot laporan |
| `src/features/settings/` | Pengaturan profil, PIN dan cadangan |
| `src/features/roadmap/` | Halaman Gantt |
| `src/features/workspace/` | Orkestrasi halaman, cache, pencarian, lingkup dan navigasi |

Enam berkas lintas-domain tetap di akar features: schemas.ts, catalog.ts, query.ts, service.ts, Editor.tsx, dan Records.tsx. Komponen umum tetap di components, utilitas umum di lib, keamanan server di lib/server. Tidak ada barrel atau wrapper kompatibilitas; pemanggil memakai lokasi modul yang sebenarnya.

Tes dikelompokkan menjadi tests/unit, tests/ui, tests/database, dan tests/security. Fixture historis tetap di tests/fixtures; setup dan stub server-only tetap di akar tests karena dirujuk konfigurasi Vitest. SQL, skrip instalasi/reset, rute Next.js, dan stylesheet tidak dipindah.

## Transaksi dan keamanan

PIN di-hash scrypt dengan salt acak. Token sesi 32 byte acak; database menyimpan SHA-256 token. Cookie HttpOnly, SameSite Strict, Secure pada produksi, masa berlaku 12 jam. PIN lama tidak memiliki fallback.

Pembatasan lima percobaan dan penguncian 15 menit disimpan pada satu baris terkunci PostgreSQL. Jeda antarpencobaan bertambah. Login memverifikasi bahwa hash PIN belum berubah sebelum menyimpan sesi. Pergantian PIN mencabut semua sesi.

Tugas berulang dan pemulihan berjalan sebagai transaksi database. Fungsi template historis tetap tersedia di SQL untuk kompatibilitas, tetapi tidak dipanggil runtime. Tugas lanjutan memakai kunci unik dari ID asal dan tenggat agar klik selesai berulang tidak menggandakannya. Restore mengganti catatan dan snapshot laporan secara atomik; sesi, hash PIN, dan log audit tidak termasuk cadangan pengguna.

## Batas yang perlu dijaga

- Grafik penyelesaian menampilkan delapan minggu bergulir dari status/tanggal tugas saat ini; bukan arsip perubahan status.
- Gantt menyediakan rentang tanggal, zoom, geser/resize, tinjau/simpan dan formulir. Baseline serta jalur kritis otomatis belum tersedia.
- Laporan berisi kondisi saat snapshot dibuat. Status historis risiko/tugas yang sudah dibuka ulang tidak direkonstruksi ke masa lalu.
- Tautan dokumen divalidasi HTTP/HTTPS; unggah berkas belum tersedia.
- Aplikasi belum offline/PWA, dan tidak mengirim WhatsApp/email otomatis.
- UAT tiga hari, Lighthouse, dan perangkat Safari iOS/Chrome Android tetap perlu verifikasi terpisah.

## Proyek dan pengalaman ruang kerja

`Projects.tsx` menampilkan galeri dan detail proyek melalui `/proyek?id=<uuid>`. Sumber datanya tetap `workstreams`, diperkaya tujuan, catatan, PIC, tanggal mulai dan target. Nilai baru memiliki default agar catatan template lama tetap terbaca. `Records` menerima `scopeId` untuk menyaring tugas tanpa membuang konteks relasi/prasyarat dari workspace. Tugas baru dari proyek otomatis membawa `workstream_id`.

Tampilan daftar memakai tabel yang bergulir di dalam kontainer; papan dan kalender memakai sumber data/filter yang sama. Semua penyimpanan melewati API dan schema server yang sama, bukan penyimpanan terpisah di browser.

## Gantt dan catatan proyek

- `TaskTimeline.tsx` digunakan pada halaman global dan tab Gantt tugas proyek. `timeline.ts` menghitung potongan bar, pergeseran/resize, dan benturan prasyarat.
- Rentang render maksimal 366 hari; periode dapat digeser tanpa membatasi durasi proyek. Tugas di luar rentang tidak ditampilkan sebagai bar palsu di tepi.
- Pointer/keyboard hanya mengubah draf jadwal. Tombol Simpan mengirim satu tugas ke API; error mempertahankan draf. Perubahan tidak memindahkan prasyarat/turunan otomatis.
- `ProjectNotes.tsx` merender format judul/daftar/checklist/kutipan sebagai elemen React. Tidak ada `innerHTML`; catatan lama tetap terbaca sebagai teks.
- Gaya web di `src/styles/` (`token.css` → `dasar.css` → `komponen.css` → `kerangka.css` → `halaman/*.css`); `src/app/globals.css` hanya memuat lapisan Tailwind.

## Peta rute

| Rute | Implementasi |
|---|---|
| `/` | Alihkan ke `/beranda` |
| `/pin` | PIN, pengaturan PIN awal |
| `/beranda` | Dashboard, perhatian, progres, grafik |
| `/hari-ini` | Terlambat, hari ini, tujuh hari berikutnya, rapat |
| `/tugas` | Daftar, papan, kalender, Gantt, form tugas |
| `/proyek` | Galeri proyek, tujuan/catatan, progres, milestone, tugas dalam lingkup proyek |
| `/roadmap` | Gantt interaktif, rentang/skala, geser/resize jadwal, milestone |
| `/kesiapan`, `/gerai` | Checklist dan kesiapan lima dimensi |
| `/mitra`, `/rapat` | Kontak/interaksi, rapat/keputusan/tindak lanjut |
| `/tindak-lanjut` | Pengingat dan catatan sematan |
| `/pencatatan`, `/anggota`, `/keuangan`, `/barang`, `/stok-opname` | Ringkasan buku, anggota, kas, barang, snapshot opname; memerlukan migrasi pencatatan aktif |
| `/dokumen`, `/risiko` | Registri dokumen, risiko/isu |
| `/tim`, `/jurnal` | Petugas/pelatihan dan catatan kerja |
| `/laporan` | Snapshot, cetak/PDF, salin teks |
| `/pengaturan`, `/panduan` | Profil, PIN, backup, petunjuk |

Rute dinamis `(app)/[slug]` memakai allowlist navigasi, sehingga satu file tidak berarti menerima sembarang halaman. Layout memeriksa sesi server. Halaman domain memakai komponen terpisah di `features`.

## API

- `/api/auth/pin`: setup, login, change, logout.
- `/api/[entity]`: domain yang terdaftar dalam `schemas.ts` saja.
- Endpoint template lama dilepas; data tersimpan dan fungsi SQL historis tetap dipertahankan.
- `/api/capabilities`: pemeriksaan kemampuan pencatatan database dari server.
- `/api/reports`: daftar dan snapshot laporan server.
- `/api/backup`: ekspor dan pemulihan transaksi.

Semua API selain setup/login memerlukan sesi. Setup memerlukan token acak server; login memakai pembatasan persisten.
