# Arah Desain Web — Workbench

Tanggal: 21 Oktober 2026
Status: **Disetujui dan diterapkan** pada token, kerangka, komponen bersama, Beranda, dan halaman tugas. Menggantikan rencana Lantai Dunia (20 Oktober 2026) dan seluruh arah sebelumnya.

Arahan pemilik: "lakukan redesain secara total agar tampilan seperti website task manager profesional. jangan hanya mempertahankan desain lama."

---

## 1. Keputusan arah

**Workbench**: ruang kerja padat dan presisi seperti alat manajemen tugas profesional. Perubahan bukan repaint: struktur Beranda, sidebar, kepadatan daftar, dan pilihan bentuk ikut diubah.

Yang dipertahankan hanya fungsi, data, rute, teks operasional, dan aturan aksesibilitas. Tidak ada fitur atau angka yang dikarang untuk mempercantik tampilan.

## 2. Bahasa visual

| Bagian | Aturan |
|---|---|
| Rel navigasi | Gelap `#0E1015`, permukaan `#14171E`, menu aktif `#1C2130` dengan garis indigo tipis |
| Kanvas | Abu sejuk `#F7F8FA`; tanpa warna lantai atau gradien hias |
| Panel | Putih `#FFFFFF`, garis rambut 1px `#E4E7EC`, sudut 8–12 px, bayangan sangat tipis |
| Aksen | Indigo tunggal `#4F46E5` (`#4338CA` hover) untuk aksi utama, menu aktif, dan pilihan |
| Status | Hijau/merah/kuning semantik, selalu disertai teks; tidak hanya warna |
| Tipografi | Bricolage Grotesque untuk judul dan merek; Plus Jakarta Sans untuk isi; angka `tabular-nums` |
| Kepadatan | Baris pemisah dan daftar rapat lebih diutamakan daripada tumpukan kartu mengambang |
| Kontrol | Tombol, isian, cip, dan tab datar; tidak ada tepi lempeng, takik, atau pil dekoratif |

Mode gelap dirancang dari arah yang sama: rel lebih gelap dari kanvas, panel `#14171E`–`#1A1D26`, garis `#262B36`, aksen indigo yang lebih terang, status tetap terbaca.

## 3. Perubahan struktur yang sudah dibangun

- **Kerangka:** sidebar memuat merek, kelompok Kerja, Ruang lain, kartu Tim, dan kaki Pengaturan/Panduan. Kartu profil manajer, pil streak "Operasional Aktif", dan swatch lantai dihapus. Bilah atas memuat judul halaman, pencarian, notifikasi, tombol Tambah, dan profil.
- **Beranda:** hero gradien "Saat Hari Ini" diganti empat ubin metrik (Terlambat, Jatuh tempo hari ini, Tugas terbuka, Agenda hari ini). Tambah cepat tetap di bawahnya. Rutin, agenda, perlu tindakan, dan minggu ini memakai baris berpenisah, bukan kartu mengambang.
- **Tugas:** ubin status, papan Kanban, kartu tugas, dan pengalih tampilan dibuat lebih datar, rapat, dan persegi. Laci dan formulir tugas memakai bidang ringkas dengan garis tipis.
- **Halaman operasional:** kartu catatan memakai tombol aksi netral; hanya tautan "Lihat di dunia" yang memakai latar indigo lembut. Pencarian buku, layar PIN, dan pesan kosong diselaraskan ke kanvas netral.
- **Ponsel/tablet:** rel menjadi ikon di tablet tanpa teks merek yang terpotong; ponsel memakai dok pil dan tombol tambah bulat. Sasaran sentuh tetap minimal 44 px.

## 4. Batas

- Dunia Koperasi 3D tetap memakai gaya dan `monitoring.css` sendiri. Jangan menyalin gaya Workbench ke dunia tanpa paket terpisah dan persetujuan pemilik.
- Jangan mengembalikan kartu pastel, tepi tebal, gradien hias, atau sudut 18–20 px ke halaman web.
- Warna mentah hanya di `token.css`; jalankan `npm run lint:ui` setelah mengubah gaya.
- Setiap perubahan tampilan diverifikasi dengan `npm run audit:tampilan` pada 375, 768, 1024, dan 1440 px, terang dan gelap sesuai kebutuhan.

## 5. Verifikasi paket ini

- `npm run typecheck`, `npm run lint`, `npm run lint:ui`, seluruh tes, build, dan `npm run ukur:bundel`.
- Audit visual 1440x900 untuk seluruh halaman, tampilan tugas, laci, editor, dan dialog: 0 temuan.
- Audit 768x1024 dan 375x812 untuk Beranda, serta mode gelap Beranda dan papan tugas: 0 temuan.
- Pemeriksaan perangkat fisik oleh pemilik belum dilakukan.
