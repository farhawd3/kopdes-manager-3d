# Status produk

Keadaan terkini saja; timpa bagian yang berubah. Log per paket di [CHANGELOG](../CHANGELOG.md).

## Halaman operasional

Proyek fleksibel; tugas daftar/papan/kalender/Gantt/harian; milestone, subtugas, dependensi, pengulangan; catatan terformat; kegiatan; rapat dengan tautan pengguna dan unduhan ICS; dokumen; risiko dan isu; tim dan pelatihan; mitra; laporan snapshot; profil/PIN/cadangan; anggota, buku kas, barang, stok opname, pengiriman, mutasi stok. Riwayat proyek di `/proyek?tab=riwayat`.

Belum tersedia: editor blok bebas, kolaborasi real-time, PWA/offline, unggah berkas, baseline/jalur kritis, penjadwalan otomatis dependensi, POS, akuntansi lengkap, simpan pinjam. Kas hanya uang masuk/keluar tercatat; opname tidak mengubah stok otomatis.

Tampilan: tema biru senada dunia (`src/app/tema.css`), Beranda bento, laci detail Detail/Terkait/Riwayat dengan saran langkah berikut, judul halaman seragam berikon, warna status token `--pastel-*`, mode gelap. Semua halaman menu diperiksa di 375/768/1024/1440 px tanpa luber samping; tabel lebar berubah menjadi kartu di area sempit (Buku koperasi di layar < 1280 px, Tugas/Kegiatan bila area halaman < 900 px).

## Dunia Koperasi 3D

Kontrak aktif: [DUNIA-KOPERASI](DUNIA-KOPERASI.md). Lima lokasi dalam satu kanvas — Pulau melayang, Kantor (delapan ruang), Gerai (sepuluh unit; unit belum aktif transparan bergembok), Gudang, Cold storage. Tampilan panel logistik (bilah atas, tiga KPI, panel kanan, pelacak, daftar bertab, pin perhatian, label pil, putar kamera, lembar bawah ponsel). Tautan dua arah dengan web, aksi buat baru dari panel ruang, lonceng tugas/risiko/isu.

Figur chibi (maks. 12, rupa dari kolom staf) ditempatkan dari rapat, kegiatan, pelatihan, status tugas, seksi, dan unit gerai; manajer selalu tampil. Visualisasi, bukan kehadiran. Render hanya saat perubahan atau selama figur/kamera bergerak. Panorama jendela mengikuti cuaca simulasi dan fase WIB.

## Mode demo dan data contoh

`npm run dev:demo`: semua halaman dan dunia memakai 191 catatan contoh dari memori, tanpa Supabase/PIN; tidak aktif di Vercel. `supabase/seed/SEED_DATA_CONTOH.sql` dan `HAPUS_DATA_CONTOH.sql` siap dijalankan pemilik setelah reset; belum dijalankan di cloud.

## Cloud

Target Supabase baru milik pemilik. Migrasi 8 (pengiriman/mutasi stok) sudah dijalankan pemilik. PIN/simpan setelah reset, indeks paginasi migrasi 6, relasi dokumen migrasi 7, dan smoke test produksi belum dikonfirmasi. Jangan menjalankan migrasi/reset tanpa persetujuan.

## Pemeriksaan terakhir — 11 Oktober 2026

- 340 tes / 54 berkas, typecheck, lint, build lulus setelah sisa pixel dibuang (tes khusus pixel ikut dihapus).
- Audit warna terprogram semua halaman terang/gelap: tidak ada warna teks/ikon di luar token dan tidak ada teks berkontras < 3:1 di mode gelap.
- Belum: perangkat fisik, UAT data cloud, pemangkasan `personal.css`, temuan lama `npm run lint:ui`.

## Git

Repo `kopdes-manager-3d`, cabang `main`, riwayat dimulai bersih 11 Oktober 2026. Cabang fitur bertopik (lihat [CONTRIBUTING](../CONTRIBUTING.md)); commit tanpa atribusi AI; push dan deploy hanya bila pemilik meminta.
