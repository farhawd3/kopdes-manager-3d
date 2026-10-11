# Panduan sistem — Kopdes Manager 3D

Dokumen ini berisi panduan komprehensif mengenai struktur, fitur, alur kerja, dan integrasi visual 3D pada **Kopdes Manager 3D** (Sistem Manajemen Koperasi Desa Merah Putih / KDMP Puntukrejo).

---

## 1. Ikhtisar & Tujuan Sistem

Kopdes Manager 3D dirancang sebagai **ruang kerja terpadu (digital workspace)** bagi Manajer Koperasi Desa untuk mengelola seluruh aspek operasional nyata, sekaligus memvisualisasikannya secara langsung ke dalam **Dunia Koperasi 3D**.

Prinsip utama sistem:
- **Satu Sumber Kebenaran Data**: Dunia 3D bukan sekadar hiasan atau game terpisah, melainkan mencerminkan data riil dari database (truk di dok berasal dari data pengiriman, stok di rak gudang berasal dari data barang).
- **Integritas Tanpa Data Palsu**: Jika fitur atau tabel belum diisi/diaktifkan, sistem menampilkan status *kosong* atau *belum aktif*, tanpa mengarang angka atau capaian fiktif.
- **Zona Waktu & Bahasa**: Berbahasa Indonesia ringkas dan berbasis zona waktu Asia/Jakarta (WIB).

---

## 2. Modul Operasional Web

### A. Tugas & Proyek (Task & Project Manager)
- **Tujuan**: Mengatur rencana kerja manajer terinspirasi dari antarmuka fleksibel ala Notion.
- **Fitur Utama**:
  - **Tugas (Tasks)**: Pembuatan tugas dengan prioritas, tenggat waktu, penanggung jawab, dan keterkaitan antar tugas.
  - **Proyek & Bidang Kerja**: Pengelompokan tugas berdasarkan bidang kerja (kelembagaan, unit usaha, digitalisasi, logistik).
  - **Tampilan Multi-View**: Daftar (List), Papan KanBan (Board), Linimasa Gantt Chart, dan Kalender bulanan.
  - **Pelacakan Progres**: Menggunakan rumus tunggal terpadu (`lib/progress.ts`).

### B. Gerai Usaha & Kesiapan Lahan (Readiness & Units)
- **Tujuan**: Mengawal pembukaan unit-unit gerai usaha koperasi desa.
- **Unit Gerai yang Didukung**:
  1. Gerai Sembako / Ritel Desa
  2. Apotek Desa
  3. Klinik Kesehatan Desa
  4. Unit Simpan Pinjam (USP) / Loket Keuangan
  5. Gudang Distribusi & Cold Storage
- **Fitur Utama**:
  - Checklist kesiapan fisik bangunan (pondasi, rangka, dinding, perizinan, pengisian rak).
  - Indikator status: Kosong / Perencanaan / Konstruksi / Siap Buka / Beroperasi.

### C. Pencatatan Operasional Bersama (Hub Records)
Pencatatan data inti menggunakan sistem terstandarisasi di `src/features/records/`:

1. **Buku Kas**:
   - Mencatat arus kas masuk (*pemasukan*) dan arus kas keluar (*pengeluaran*).
   - Menjaga integritas riil: selisih kas dicatat sebagai catatan pembukuan tanpa mengklaim saldo bank otomatis.
2. **Data Anggota**:
   - Pendataan nomor anggota, identitas warga, nomor kontak, dan status keaktifan.
   - Terhubung dengan riwayat transaksi kas anggota.
3. **Barang & Stok Opname**:
   - Master data barang desa: kode produk, satuan, harga pokok/jual, batas stok minimum.
   - Penempatan rak gudang (Rak A1–A3, B1–B3, C1–C3).
   - Fitur stok opname untuk merekam selisih fisik vs catatan buku.

### D. Logistik & Pengiriman Armada (Deliveries)
- **Tujuan**: Mengelola alur rantai pasok barang masuk/keluar dari gudang logistik.
- **Fitur Utama**:
  - Jadwal tiba armada truk (Jam Kedatangan WIB).
  - Identitas armada: Nama sopir, nomor plat kendaraan, dan nama suplier/ekspedisi.
  - Alokasi pintu dok muat gudang (Dok D1 s.d. Dok D4).
  - Rincian muatan dan jumlah koli/palet.

### E. Kalender & Agenda Rapat (Meetings & Activities)
- **Tujuan**: Penjadwalan rapat pengurus, musyawarah desa, dan kegiatan operasional.
- **Fitur Utama**:
  - Tautan ruang pertemuan daring (Google Meet / Zoom).
  - Unduhan berkas kalender standar (.ics).
  - Rapat hari ini tampil di Beranda, Hari ini, dan ruang Rapat di Dunia 3D.

---

## 3. Dunia Koperasi 3D

Diorama isometrik lembut yang dibangun dari kode dengan Three.js di `src/features/dunia-3d/`. Tampilan mengikuti panel logistik: bilah atas, tiga KPI, panel detail kanan, pelacak, daftar bertab, pin perhatian, dan kontrol peta. Kontrak lengkap di [DUNIA-KOPERASI](DUNIA-KOPERASI.md).

### A. Lima lokasi dalam satu kanvas

1. **Pulau melayang**: empat bangunan (Kantor, Gerai, Gudang, Cold storage). Klik bangunan untuk masuk, klik tanah untuk kembali ke Kantor.
2. **Kantor** delapan ruang bersekat kaca: Karyawan gerai, Kas & anggota, Ruang manajer, Gym & kegiatan, Stok & barang, Rapat, Ruang kerja, serta Ngopi & istirahat.
3. **Gerai**: sepuluh unit usaha. Unit yang belum aktif di halaman Gerai digambar transparan bergembok.
4. **Gudang**: rak A–F dari data Barang, dok D1–D4, dan truk dari data Pengiriman.
5. **Cold storage**: rak pendingin C1–C3.

### B. Figur dan data

- Figur chibi dibuat dari catatan Tim (baju, kulit, rambut/hijab/peci, seragam per seksi). Tempatnya mengikuti rapat berlangsung, kegiatan dan pelatihan hari ini, status tugas, seksi, dan unit gerai. Ini visualisasi, bukan absensi.
- Setiap ruang punya panel: tugas dan sprint di Ruang kerja, dokumen/risiko/mitra di Ruang manajer, rapat dan keputusan di Rapat, kegiatan dan pelatihan di Gym, barang/stok/mutasi di Stok, uang masuk/keluar dan anggota di Kas.
- Dunia tidak menulis data. Semua baris bertautan ke catatan aslinya; aksi "buat baru" membuka formulir web.
- Render berhenti saat diam; cahaya dan panorama jendela mengikuti fase waktu WIB dan cuaca simulasi.

### C. Tautan web ke dunia

Tombol **Lihat di dunia** pada catatan unit, staf, barang, pengiriman, tugas, dan rapat membuka `/dunia-koperasi?unit=|orang=|barang=|kirim=|tugas=|rapat=<id>`, langsung ke lokasi dan objek yang tepat.

---

## 4. Struktur berkas

```text
kopdes-manager-3d/
├── docs/                      # Kontrak dunia, status, desain, database, panduan
├── scripts/                   # Pembuat SQL install/reset/seed, mode demo, audit
├── supabase/                  # Migrasi berurutan, SQL install/reset, seed data contoh
├── src/
│   ├── app/                   # App Router: rute, API, tema (tema.css), pratinjau /dev
│   ├── components/            # UI bersama: tombol, modal, ikon dua nada, AppShell
│   ├── features/
│   │   ├── dunia-3d/          # Dunia Koperasi 3D (Three.js) dan kartu monitoring
│   │   │   └── model/         # Adapter workspace → dunia, unit → bangunan, jadwal figur
│   │   ├── records/           # Catatan, laci detail, Terkait, saran, skema Zod
│   │   ├── operations/        # Buku kas, anggota, barang, stok opname
│   │   ├── tasks/, projects/  # Tugas, proyek, milestone, linimasa
│   │   ├── dashboard/         # Beranda dan Hari ini
│   │   └── demo/              # Data contoh mode demo
│   └── lib/                   # Supabase, sesi, progres, tanggal Asia/Jakarta
└── tests/                     # unit, ui, database (PGlite), security
```

---

## 5. Alur navigasi cepat

1. **Beranda** (`/beranda`): fokus tugas, rapat berikutnya, perlu perhatian, kegiatan terbaru.
2. **Tugas & proyek** (`/tugas`, `/proyek`, `/roadmap`): daftar, papan, kalender, linimasa.
3. **Buku koperasi** (`/keuangan`, `/barang`, `/stok-opname`, `/anggota`, `/pengiriman`): pencatatan uang, stok, anggota, dan armada.
4. **Dunia Koperasi** (`/dunia-koperasi`): pilih lokasi di bilah atas, klik ruang atau figur untuk membuka panel, gunakan dok bawah Detail/Ringkasan/Daftar/Agenda.
