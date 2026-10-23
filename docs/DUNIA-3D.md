# Dunia 3D

Ringkasan kontrak Dunia Koperasi 3D. Produk ada di [PRODUK](PRODUK.md), database di [DATABASE](DATABASE.md).

## Tujuan

Dunia 3D menampilkan data kerja koperasi sebagai diorama kantor yang bisa dijelajahi. Isinya diambil dari catatan yang sama dengan halaman web:

- truk di dok berasal dari Pengiriman;
- rak gudang berasal dari Barang;
- figur staf berasal dari Tim dan berpindah ruang mengikuti rapat, kegiatan, dan tugasnya;
- unit gerai berasal dari Gerai.

**Dunia tidak pernah menulis data.** Setiap baris di panel menaut ke catatan aslinya di web. Tombol "buat baru" membuka formulir web.

Alamat: `/world`. Alamat lama `/dunia-koperasi` dialihkan ke `/world`, parameter ikut terbawa.

## Kontrak gaya

- Diorama isometrik 3D yang lembut: sudut membulat, material doff pastel, bayangan lembut, perabot membulat.
- Semua model dibangun dari kode (Three.js, bentuk dasar). Tidak ada berkas model 3D dari luar.
- Hindari garis tipis dan papan nama melayang. Kode rak, dok, dan nama ruang dicat tipis di lantai. Nama lengkap muncul saat kursor diarahkan.
- Kartu, bilah, dan ikon dunia memakai kelas Tailwind dengan token warna `globals.css` (kelas bersama di `monitor-cards.tsx`): ikut tema terang/gelap dan nada sorotan aplikasi, tombol utama biru tua, tanpa gradasi. Benda di scene 3D tetap memakai palet pastel sendiri.
- Cahaya dan panorama jendela mengikuti jam Asia/Jakarta (Pagi/Siang/Senja/Malam). Cuaca bisa dipilih dan diberi label simulasi.

## Lima lokasi

1. **Pulau melayang**: empat bangunan (Kantor, Gerai, Gudang, Cold storage), jalan, alun-alun, pohon. Klik bangunan untuk masuk. Klik tanah untuk kembali ke Kantor.
2. **Kantor**: ruang bersekat kaca. Baris atas: Karyawan gerai, Kas & anggota, Ruang manajer, Gym & kegiatan. Baris bawah: Stok & barang, Rapat, Ruang kerja. Sayap terpisah: Ngopi & istirahat. Pintu gulung di ruang Stok menuju Gudang.
3. **Gerai**: sepuluh unit (Kantor koperasi, Simpan pinjam, Klinik desa, Apotek desa, Cold storage, Pergudangan & logistik, Sembako, Gerai potensi desa 1–3). Unit yang belum Aktif di halaman Gerai digambar transparan bergembok.
4. **Gudang**: rak A–F, dok D1–D4, truk.
5. **Cold storage**: rak pendingin C1–C3.

## Pemetaan data

| Di dunia | Sumber data |
|---|---|
| Figur chibi | Tim (baju, kulit, rambut/hijab/peci, kacamata, seragam per seksi). Rupa tidak ditebak dari nama |
| Isi rak | Barang (kolom rak) |
| Truk di dok | Pengiriman aktif |
| Status unit gerai | Gerai dan Kesiapan |
| Panel Ruang kerja | Tugas, sprint aktif, milestone terdekat, Proyek |
| Panel Ruang manajer | Dokumen, risiko, kontak dan interaksi terakhir |
| Panel Rapat | Rapat hari ini, keputusan |
| Panel Gym & kegiatan | Kegiatan dan pelatihan hari ini |
| Panel Stok & barang | Barang, stok di bawah minimum, pengiriman aktif, mutasi, opname |
| Panel Kas & anggota | Uang masuk/keluar tercatat dan anggota (bukan saldo, bukan laba) |
| Lonceng | Tugas lewat tenggat, risiko dan isu terbuka |

Tempat figur, berurutan:

1. Rapat yang sedang berlangsung dan mencantumkan namanya → Rapat.
2. Kegiatan atau pelatihan hari ini → Gym & kegiatan.
3. Manajer (nama di Pengaturan) → Ruang manajer.
4. Tugas berstatus proses → ruang seksinya (layanan anggota/keuangan → Kas & anggota; gudang/logistik → Stok & barang; usaha/gerai → Karyawan gerai; lainnya → Ruang kerja).
5. Staf dengan unit yang Aktif → unit itu di Gerai.
6. Tugas belum dikerjakan → Ruang kerja.
7. Selain itu → Ngopi & istirahat.

Ini visualisasi, bukan absensi. Figur hanya mengikuti catatan saat dimuat.

Pin (paling banyak lima) hanya untuk hal yang perlu perhatian: tugas lewat tenggat, rapat berlangsung, stok di bawah minimum, risiko terbuka, truk di dok, unit siap buka.

Angka yang tidak tersedia ditulis "—". Modul yang belum aktif ditulis belum aktif, bukan nol.

## Parameter alamat

Web membuka dunia di objek yang tepat lewat `worldHref()` di `world-link.tsx`. Dunia membacanya di `link-target.ts`.

| Parameter | Isi | Membuka |
|---|---|---|
| `unit=<id>` | Unit gerai | Unit itu di Gerai |
| `orang=<id>` | Staf | Figur itu di Kantor atau Gerai |
| `barang=<id>` | Barang | Raknya di Gudang/Cold storage, atau unitnya di Gerai, atau ruang Stok |
| `kirim=<id>` | Pengiriman | Truknya di Gudang |
| `tugas=<id>` | Tugas | Figur penanggung jawab, atau Ruang kerja |
| `rapat=<id>` | Rapat | Ruang Rapat |
| `lokasi=` | `kantor`, `gerai`, `gudang`, `pendingin`, `pulau` | Lokasi itu |
| `pilih=` | Kunci ruang atau objek (dipakai bersama `lokasi`) | Objek yang dipilih |

Bila catatan tidak ada di data yang dimuat, dunia tidak memilih apa pun.

## Kontrol dan layar

- Bilah atas: pencarian (pintasan `/`), pemilih lokasi, tombol Tambah (pusat aksi yang sama dengan web), jam WIB, lonceng, menu profil (muat ulang, suasana, Pengaturan, Beranda).
- Kartu: tiga KPI per lokasi, panel detail, pelacak, daftar bertab. Panel Ringkasan memuat grafik ringkas per lokasi (`site-charts.tsx`, batang CSS tanpa pustaka grafik).
- Kontrol peta: perbesar/perkecil 0,6–5×, putar kiri/kanan, tampilan awal. Pilih figur untuk diikuti kamera; geser atau reset melepasnya.
- Layar ≥1280 px tata letak penuh. 768–1279 panel diringkas. Di bawah 768 px detail tampil di lembar bawah; geser satu jari, cubit dua jari. Layar potret mulai dalam keadaan diperbesar.

## Aturan performa

- Tidak ada loop render saat diam. Render hanya saat ukuran berubah, memilih, zoom/geser, data atau suasana berubah, atau selama figur/kamera bergerak.
- Reduced-motion: figur dan kamera langsung di tempat.
- Pixel ratio paling tinggi 1,5. Shadow map 1024, diperbarui hanya saat lokasi atau suasana berganti. Tanpa pascaproses.
- Geometri statis digabung per ruang/objek. Kaca satu mesh transparan. Satu figur ±6 panggilan gambar.
- Geometri dan material dipakai bersama (cache). Tulisan lantai memakai tekstur kanvas kecil.
- Gudang dibangun ulang hanya bila data rak atau truk berubah.
- Sumber GPU dibersihkan saat halaman ditutup. Bila WebGL gagal, tampil pesan dan tombol coba lagi; data tetap terbaca di kartu.

## Peta kode

Semua di `src/features/world/`.

| Berkas | Isi |
|---|---|
| `world-page.tsx` | Halaman `/world`: memuat workspace lalu memanggil dashboard |
| `world-link.tsx` | `worldHref()` dan `hasWorldPlace()` untuk tombol "Lihat di dunia" di web |
| `link-target.ts` | Membaca parameter alamat menjadi lokasi dan objek terpilih |
| `monitoring-dashboard.tsx` | Lokasi, KPI, panel detail, pelacak, daftar bertab, pencarian, keadaan data |
| `monitoring-stage.tsx` | Jembatan React ke WebGL, lazy load, kontrol peta, label pilihan, fallback |
| `monitoring-scene.ts` | Kamera, cahaya, lokasi, figur berjalan, pin, raycast, geser/zoom, pembersihan |
| `monitor-cards.tsx`, `store-cards.tsx`, `site-charts.tsx` | Kartu panel dan kelas Tailwind bersama (kartu, tombol, nada), kartu gerai, grafik ringkas |
| `monitor-data.ts`, `character-plan.ts` | Turunan data murni: baris dan angka per ruang, rencana tempat figur |
| `office-rooms.ts`, `monitoring-room.ts` | Tata ruang kantor, sekat kaca, titik lewat figur, pintu gudang |
| `store.ts`, `store-room.ts` | Status unit gerai dan model kawasan gerai |
| `warehouse-room.ts`, `logistics.ts` | Gudang, cold storage, rak, palet, forklift, truk |
| `island.ts`, `soft-building.ts` | Pulau melayang dan bangunan bergaya mainan |
| `ambience.ts` | Panorama jendela dan fase waktu Jakarta |
| `character.ts`, `person.ts` | Figur chibi dan bagian yang dianimasikan |
| `shapes.ts`, `furniture.ts`, `floor-text.ts`, `moving.ts` | Bentuk dasar, perabot, tulisan lantai, penanda benda bergerak |
| `icon-3d.tsx` | Ikon dan thumbnail barang berbasis SVG |
| `model/world-model.ts` | Adapter workspace → model dunia |
| `model/district.ts` | Unit KDMP yang punya bangunan |

## Batas

- Belum ada sinkronisasi real-time atau kehadiran. Data terbaru diambil lewat Muat ulang di menu profil.
- Mode demo lokal: `npm run dev:demo`.
- Penerimaan visual pemilik, uji perangkat fisik, dan UAT cloud belum diklaim.
