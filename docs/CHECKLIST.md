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
- [x] Tema biru senada dunia, ikon dua nada, warna status token, mode gelap.
- [x] Semua halaman diperiksa di 375/768/1024/1440 px tanpa luber samping; tabel berubah menjadi kartu di area sempit.
- [x] Mode demo lokal dan seed SQL data contoh.
- [ ] Penerimaan visual pemilik dan perangkat fisik.

## Penerimaan cloud terbuka

- [ ] Konfirmasi PIN/simpan setelah reset serta keadaan migrasi cloud 6/7.
- [ ] Reset dan seed data contoh oleh pemilik; UAT data nyata dan konsistensi lintas tampilan.
- [ ] Cadangan/pemulihan di lingkungan uji.
- [ ] Audit gaya lama: `npm run lint:ui` masih melaporkan temuan di `ui.css`; `personal.css` belum dipangkas.
- [ ] Lighthouse/performa data besar dan smoke test produksi setelah deployment yang diizinkan.

## Di luar lingkup saat ini

- [ ] Editor blok bebas, kolaborasi real-time, PWA/offline, dan unggah berkas.
- [ ] Baseline/jalur kritis, penjadwalan otomatis dependensi, dan impor CSV buku.
- [ ] AI chat, POS, akuntansi lengkap, simpan pinjam.

SQL cloud tetap memerlukan penjelasan berkas, dampak, proyek tujuan, dan persetujuan pemilik. Program 90 hari bukan instruksi aktif.
