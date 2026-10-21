# Checklist produk

Implementasi, bukti pemeriksaan, dan penerimaan dibedakan. [STATUS](STATUS.md) adalah keadaan terbaru; [CHANGELOG](../CHANGELOG.md) menyimpan sejarah paket.

## Dunia Koperasi 3D

- [x] Rute `/dunia-koperasi` memakai kantor bersekat, gerai, gudang, cold storage, dan pulau melayang dari data workspace.
- [x] Tampilan panel logistik: bilah atas, tiga KPI, panel detail, pelacak, daftar bertab, pin perhatian, label pil, kontrol peta.
- [x] Figur dari catatan Tim dengan jadwal teruji (rapat, kegiatan, pelatihan, seksi, unit gerai); keterangan bukan kehadiran.
- [x] Siku biru dan kamera mengikuti figur pilihan; penanda ruang mengikuti bentuk lantai.
- [x] Render berhenti saat diam; geometri digabung, sumber GPU dibersihkan, fallback WebGL tersedia.
- [x] Keadaan memuat/galat/kosong/belum aktif/parsial dibedakan; angka tidak tersedia menjadi —.
- [x] Tautan dua arah dengan web (`?unit=`, `?orang=`, `?barang=`, `?kirim=`, `?tugas=`, `?rapat=`, `?lokasi=&pilih=`) dan aksi buat baru dari panel ruang.
- [x] Sprint, milestone, mitra, pelatihan, serta mutasi/opname tampil di ruang terkait.
- [x] Pemeriksaan Chromium 375/768/1024/1440, klik ruang/figur, zoom, putar, dan reduced-motion.
- [ ] Penerimaan visual final pemilik, perangkat fisik, dan UAT data cloud.

## Halaman operasional

- [x] Proyek fleksibel, properti, catatan, tugas/milestone, dan progres bersama.
- [x] Tugas daftar/papan/harian/kalender/Gantt, filter, subtugas, dependensi, dan pengulangan.
- [x] Beranda bento dan Hari ini dari data asli; Perlu perhatian menjadi bagian Beranda.
- [x] Rapat/ICS, koordinasi, dokumen, risiko, kegiatan, mitra, tim/pelatihan, dan laporan snapshot.
- [x] Anggota, buku kas, barang, stok opname, pengiriman, dan mutasi stok dengan gerbang kemampuan database.
- [x] Laci detail Detail/Terkait/Riwayat dan saran langkah berikut tanpa menulis data otomatis.
- [x] PIN/sesi/RLS/Origin, profil, dan cadangan JSON.
- [x] Regresi lokal cadangan laporan: kas, draf/final, format lama, validasi, dan rollback pemulihan (API + PGlite).
- [x] Impor CSV tugas (koma/kutip/baris baru, validasi semua baris, pesan impor sebagian), laporan lebih dari 100, waktu riwayat WIB, dan demo tanpa duplikasi tugas berulang memiliki tes regresi lokal.
- [x] Warna status lewat token dan mode gelap web.
- [ ] Redesain total web menurut [REDESAIN-TOTAL](REDESAIN-TOTAL.md) (paket 1–9), termasuk pemilih palet dan kit grafik.
- [x] Semua halaman diperiksa di 375/768/1024/1440 px tanpa luber samping; tabel berubah menjadi kartu di area sempit.
- [x] Pemeriksaan tambahan 360/768/1024/1440 px: Beranda, Tugas Harian, Barang, dan formulir Barang; kontrol bersama dan tombol dunia yang diubah terukur 44 px.
- [x] Mode demo lokal dan seed SQL data contoh.
- [x] Perbaikan mobile: nominal kas utuh di 360/390/430 px, rutinitas/dialog dan aksi kartu dirapikan, latar PIN terang/gelap, serta panel dunia hanya menampilkan satu isi terpilih (browser, lima lokasi).
- [ ] Penerimaan visual pemilik dan perangkat fisik.

## Penerimaan cloud terbuka

- [ ] Konfirmasi PIN/simpan setelah reset serta keadaan migrasi cloud 6/7.
- [ ] Reset dan seed data contoh oleh pemilik; UAT data nyata dan konsistensi lintas tampilan.
- [ ] Cadangan/pemulihan di lingkungan uji.
- [x] Audit gaya: sistem gaya lama (`personal.css`, `ui.css`, `tokens.css`, `tema.css`) diganti `src/styles/`; `npm run lint:ui` bersih.
- [ ] Lighthouse/performa data besar dan smoke test produksi setelah deployment yang diizinkan.

## Di luar lingkup saat ini

- [ ] Editor blok bebas, kolaborasi real-time, PWA/offline, dan unggah berkas.
- [ ] Baseline/jalur kritis, penjadwalan otomatis dependensi, dan impor CSV buku.
- [ ] AI chat, POS, akuntansi lengkap, simpan pinjam.

SQL cloud tetap memerlukan penjelasan berkas, dampak, proyek tujuan, dan persetujuan pemilik. Program 90 hari bukan instruksi aktif.
