# Panduan AI — Kopdes Manager 3D

Ruang kerja manajer KDMP dengan **Dunia Koperasi 3D** (Three.js, diorama isometrik lembut, model dibangun dari kode). Repo: `kopdes-manager-3d`, cabang utama `main`. Versi pixel lama (PixiJS) hidup di repo terpisah `kopdes-manager-web`; jangan menyunting atau menyalin kode pixel ke repo ini.

## Urutan membaca

1. Periksa Git (`git status -sb`) dan `docs/LANJUTAN-AI.md` untuk melanjutkan sesi.
2. Dunia Koperasi: `docs/DUNIA-KOPERASI.md` (satu kontrak gaya, data, dan peta kode). Keadaan dan bukti: `docs/STATUS.md`.
3. Baca dokumen lain sesuai pekerjaan: `docs/DESAIN-ANTARMUKA.md` (halaman operasional), `docs/KEGIATAN-DAN-TUGAS.md`, `docs/ARSITEKTUR.md` (koneksi data), `docs/MIGRASI-SQL.md` sebelum perubahan SQL.
4. PRD/KEPUTUSAN menyimpan batas produk, CHECKLIST menyimpan penerimaan. Tidak perlu membaca seluruh Markdown untuk setiap perubahan.
5. Abaikan `not-use/`. Graphify bersifat opsional: baca `graphify-out/` hanya bila pemilik meminta peta kode atau penelusuran Graphify; selain itu gunakan pencarian sumber langsung.

Arahan langsung pemilik terbaru mengatasi konflik. Jangan membuat kontrak gaya dunia lain. Jangan menghapus catatan pengguna atau fitur operasional untuk merapikan dokumen.

## Produk

- Ruang kerja pribadi manajer koperasi: proyek fleksibel tanpa durasi wajib, tugas, milestone, kesiapan gerai, koordinasi, dokumen, risiko, laporan kerja.
- Pencatatan terpisah dari ruang kerja: anggota, buku kas, barang, stok opname, pengiriman dan mutasi stok, serta (migrasi 10) simpanan anggota, penjualan harian gerai, pembelian ke pemasok, inventaris aset, jadwal & absensi. Simpanan anggota hanya setoran/penarikan pokok, wajib, sukarela (disetujui pemilik 15 Oktober 2026). Belum mencakup POS, akuntansi lengkap, pinjaman, atau kunci AI pengguna.
- Dunia Koperasi 3D menampilkan data yang sama (kantor bersekat, gerai, gudang, cold storage, pulau). Dunia dan web bertautan dua arah; dunia tidak menulis data sendiri.
- Identitas berasal dari profil. Jangan mengarang nama, kontak, capaian, atau data operasional. Data contoh hanya di mode demo dan seed berawalan id `c0de0000`.
- Pengalaman task/project manager terinspirasi Notion: daftar/papan/kalender/Gantt dan catatan terformat. Jangan mengklaim editor blok drag-and-drop, baseline, jalur kritis otomatis, atau kolaborasi real-time.
- Domain `workstreams` adalah proyek; pertahankan kompatibilitas data lama. Jangan memasang kembali program 90 hari.
- Bahasa Indonesia sederhana, zona waktu Asia/Jakarta.

## Kode yang mudah dirawat

- Next.js App Router, React, TypeScript strict, Tailwind, Zod, Supabase, Three.js.
- `app/`: rute tipis; `features/<domain>/`: skema, layanan, UI domain; `components/`: UI bersama; `lib/`: utilitas bersama. Kode dunia di `src/features/dunia-3d/` (model data di `dunia-3d/model/`).
- Hindari repository serbaguna, abstraksi spekulatif, `any`, dan duplikasi rumus. Satu sumber progres di `lib/progress.ts`; tanggal di `lib/date.ts`.
- Nama fungsi menjelaskan tindakan; komentar menjelaskan alasan bisnis.
- Tangani memuat, kosong, galat, dan data. Galat database tidak boleh berubah menjadi angka palsu.

## Keamanan

- Gunakan Supabase BARU; konfigurasi lama bukan izin menulis database lama.
- Sebelum migrasi cloud: jelaskan berkas SQL, dampak, dan proyek tujuan, lalu minta konfirmasi. AI tidak menjalankan SQL cloud; reset dan seed dijalankan pemilik.
- RLS aktif, akses bawaan ditolak, setiap aksi server divalidasi Zod dan sesi.
- Rahasia server tidak masuk browser, Git, atau log. Repo ini publik: periksa diff dari kunci, token, dan data pribadi sebelum commit. Jangan mengaktifkan layanan berbayar.
- PIN minimal 6 digit, hash yang sesuai, batas percobaan persisten, sesi kedaluwarsa, cookie HttpOnly/Secure/SameSite, pemeriksaan asal mutasi.
- Mode demo (`NEXT_PUBLIC_MODE_DEMO=1`) tidak pernah aktif di Vercel (`modeDemo()` memeriksa `VERCEL`).

## Multiplatform

- Periksa 360, 768, 1024, 1440 px. Halaman operasional memakai navigasi bawah/rel/sidebar; Dunia Koperasi memakai bilah dan panel sendiri.
- Area sentuh minimal 44 px, fokus keyboard, label form, status memakai teks selain warna.
- Tabel/Gantt bergulir dalam kontainer atau berubah menjadi kartu di area sempit; hormati reduced-motion dan safe area.
- Web memakai gaya "Lavender Lekuk" (keputusan pemilik 20 Oktober 2026; merah putih 19 Oktober dinilai tidak cocok, sebelumnya Taskflow biru; sistem lengkap di `DESIGN.md`): latar lavender sangat muda `#F5F3FA`, kartu putih datar sudut 22–24 px, kartu bertakik (`.bertakik` + `.takik-aksi`: pojok kanan atas dicekung berisi satu tombol aksi), pil dan tombol bulat, aksen tunggal ungu lavender `#6A55C8`, tinta ungu gelap `#221D2E`, huruf Plus Jakarta Sans (judul 24/600). Sidebar: kelompok Kerja (Beranda, Hari ini, Tugas, Agenda, Proyek, Linimasa), Ruang lain (Catatan, Usaha, Koperasi, Dunia), dan kartu Tim; sumber tunggal `src/components/layout/navigasi.ts` (`HUBS`, `MENU_KERJA`, `RUANG_LAIN`). Ponsel: dok pil (Beranda, Tugas, Agenda, Lainnya) + tombol tambah bulat. Halaman lama tampil sebagai tab hub di bawah judul dan URL lama tetap berlaku. Judul halaman (`h1`) hanya di kepala kerangka; isi halaman memakai `h2`. Kartu proyek memakai sampul pastel hub (`--sampul-*`) + ikon, tanpa foto; avatar berupa inisial. Bersih dan tenang: warna jenuh hanya untuk grafik, status, tombol utama, menu aktif, dan baris rutin berikutnya; ringkasan berupa teks, bukan deretan chip; kartu dan ubin ikon datar tanpa bayangan. Grafik lembut SVG tanpa pustaka (`components/charts/GrafikLembut.tsx`, token `--grafik-*`): garis tipis melengkung, isi gradien memudar, pembanding periode lalu putus-putus. Beranda dan halaman baru memakai komponen `.modul`. Sistem gaya web di `src/styles/` (`token.css` → `dasar.css` → `komponen.css` → `kerangka.css` → `halaman/*.css`); warna mentah hanya di `token.css`, tanpa `!important` (`npm run lint:ui`). Dunia di `src/features/dunia-3d/monitoring.css`; warnanya masih biru `#546FFF` sampai paket warna dunia, hurufnya sama. Warna status hanya token `--ok/--late/--warn` (alias `--pastel-*`). Mode gelap ungu malam tersedia untuk web; dunia selalu terang.
- Hindari angka operasional palsu, tombol dekoratif, dan slogan. Buku kas hanya uang masuk/keluar tercatat, bukan saldo atau laba.

## Proses (sama untuk semua agen)

**Mulai sesi**
1. `git status -sb` dan `git branch`. Ada cabang kerja yang belum masuk `main`? Lanjutkan di sana. Pertahankan perubahan pengguna yang belum di-commit.
2. Baca `docs/LANJUTAN-AI.md`, lalu hanya dokumen yang relevan dengan tugas.

**Bekerja**
3. Satu paket kerja konkret yang bisa diverifikasi. Perubahan terkecil yang lengkap.
4. Perubahan kode: `npm test` (boleh `-- --maxWorkers=2`, tetap seluruh suite), `npm run typecheck`, `npm run lint`, `npm run lint:ui`, `npm run build`, `npm run ukur:bundel` (JS awal ≤ 300 KB). Perubahan tampilan: juga `npm run audit:tampilan -- <lebar> <tinggi> [nama]` dengan `npm run dev:demo -- -p 3200` berjalan, pada 375/768/1024/1440 px, lalu lihat tangkapannya. Dokumentasi saja: periksa diff dan tautan, tanpa mengklaim tes baru. Setelah build, kembalikan `next-env.d.ts` bila berubah.

**Mencatat (wajib sebelum commit)**
5. `CHANGELOG.md`: satu entri per paket di paling atas, format:
   ```
   ## <ringkasan> — <tanggal>
   - Alasan: kenapa paket ini dibuat (arahan pemilik/masalah).
   - Perubahan: yang dirasakan pengguna, bukan daftar berkas.
   - Verifikasi: angka tes/build/audit yang benar-benar dijalankan.
   - Belum: yang tidak diperiksa atau sisa pekerjaan.
   ```
   Coba-coba yang dibatalkan dalam paket yang sama tidak diberi entri sendiri.
6. `docs/STATUS.md` dan `docs/LANJUTAN-AI.md`: hanya keadaan terkini; timpa bagian yang berubah, jangan menumpuk catatan sesi. `docs/CHECKLIST.md`: centang yang benar-benar selesai.

**Menutup**
7. Commit di cabang kerja (format di bagian Git). Jangan meninggalkan perubahan belum di-commit.
8. Laporkan hasil dan batasan secara jujur; tes lama bukan bukti fitur baru selesai, dan pemeriksaan perangkat yang belum dilakukan tidak ditandai.

## Git

- `main` selalu lulus tes dan bisa dibangun. Kerjakan paket di cabang bertopik, lalu gabungkan lewat pull request.
- Nama cabang menjelaskan pekerjaan, bukan alat atau orang: `fitur/<topik>`, `perbaikan/<topik>`, `tampilan/<topik>`, `dokumen/<topik>`, `rapikan/<topik>`. Huruf kecil, kata dipisah tanda hubung. Jangan memakai awalan nama AI atau pribadi (mis. `codex/`, `claude/`).
- Satu cabang kerja aktif untuk semua AI (Claude, Codex, Antigravity, dll.):
  1. Sebelum mulai, jalankan `git status -sb` dan `git branch`. Bila ada cabang kerja yang belum masuk `main`, lanjutkan di cabang itu; jangan membuat cabang baru.
  2. Cabang baru hanya dibuat dari `main` terbaru yang bersih, untuk paket baru.
  3. Setelah paket masuk `main`, hapus cabangnya di lokal dan remote.
  4. Jangan meninggalkan perubahan belum di-commit di akhir sesi; commit di cabang kerja (boleh belum di-push).
- Satu paket = satu commit atau beberapa commit kecil per tema (bukan per langkah coba-coba). Pesan berformat `jenis: ringkasan bahasa Indonesia` (huruf kecil, tanpa titik), baris kosong, lalu isi yang menjelaskan alasan. Jenis: `feat` fitur baru, `fix` perbaikan, `style` tampilan, `refactor` rapikan kode, `docs` dokumen, `test` tes, `chore` alat/konfigurasi. Contoh: `fix: perbaiki nominal kas yang terpotong di ponsel`. Tanpa baris atribusi AI.
- Jangan force-push ke `main`, jangan menulis ulang riwayat yang sudah dibagikan. Push dan deploy hanya atas permintaan pemilik. Panduan lengkap: `CONTRIBUTING.md`.

## Skill dan peta kode untuk semua AI

- Titik masuk tiap agen: Codex dan OpenCode membaca AGENTS.md langsung; Claude Code lewat CLAUDE.md; Antigravity/Gemini lewat GEMINI.md dan `.agents/rules/`; Cursor lewat `.cursor/rules/`. Semuanya hanya menunjuk ke berkas ini.
- Skill proyek: `.claude/skills/` (Claude Code) dan salinannya `.agents/skills/` (Codex, Antigravity, OpenCode, agen lain). Ubah di `.claude/skills`, lalu jalankan `node scripts/sync-skills.mjs`; `clean-code` bersumber di `.agents/skills`. Sumber/lisensi pihak ketiga: `.claude/skills/SUMBER.md`.
- Skill utama: hemat-token, dunia-koperasi, ui-ux-kopdes, backend-kopdes, clean-code; opsional caveman, grill-me/grilling. Skill global `ponytail` (perubahan terkecil yang lengkap; `ponytail-review`/`ponytail-audit` untuk tinjauan) dipasang pemilik untuk Claude, Codex, Antigravity, dan OpenCode. AI tanpa dukungan skill cukup membaca SKILL.md yang relevan.
- Ubah aturan hanya di AGENTS.md. CLAUDE.md dan GEMINI.md mengimpor berkas ini (@AGENTS.md) dan hanya menambah bagian Graphify; `.cursor/rules/` dan `.agents/rules/` menunjuk ke sini.
- Hook Graphify lokal (`.claude/settings.json`, `.codex/`, `.gemini/settings.json`) berisi path komputer pemilik dan tidak di-commit.
- rtk (dipasang global oleh pemilik) meringkas keluaran shell. Bila galat terpotong, jalankan `rtk proxy <perintah>`.
- Bila pemilik meminta Graphify, gunakan `graphify query`, `graphify path`, atau `graphify explain` pada peta yang ada. Peta kode (`graphify-out/`, tidak di-commit) dibuat ulang dengan `graphify update .` (hanya kode, tanpa AI); tidak wajib diperbarui pada pekerjaan lain. Jangan memproses `docs/` dengan ekstraksi AI tanpa izin pemilik.

## Pencatatan dan rapat

- Acuan aktivasi: `docs/PENCATATAN.md`. Pemeriksaan kemampuan server menentukan apakah pencatatan aktif; jangan menyamarkan migrasi belum terpasang sebagai data nol.
- Opname menyimpan snapshot stok buku tanpa koreksi stok otomatis.
- Rapat online memakai tautan pengguna dan unduhan ICS; bukan konferensi video bawaan atau undangan otomatis.
- Bahasa UI langsung, ringkas, tanpa slogan motivasi. Pilih judul yang menjelaskan isi atau tindakan.
