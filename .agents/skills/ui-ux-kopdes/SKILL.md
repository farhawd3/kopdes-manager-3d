---
name: ui-ux-kopdes
description: Pedoman UI/UX Kopdes — tema biru web dan dunia, pola tabel/kartu, laci detail, lembar bawah ponsel, aksesibilitas. Pakai saat mengubah tampilan atau interaksi.
---

# UI/UX Kopdes

Satu keluarga gaya untuk web dan dunia:
- **Halaman operasional**: `docs/DESAIN-ANTARMUKA.md`; sistem gaya `src/styles/` (`token.css` → `dasar.css` → `komponen.css` → `kerangka.css` → `halaman/*.css`), satu berkas per kelompok halaman di `halaman/`; warna mentah hanya di `token.css`; komponen `src/components/ui`.
- **Dunia Koperasi**: `src/features/dunia-3d/monitoring.css` (kelas `mt-*`); arahan di `docs/DUNIA-KOPERASI.md`.

## Pola
- Kanvas lavender muda, kartu putih bersudut lembut, aksen biru `#2F5BEA`, huruf Inter (kode/jam juga Inter berangka rata). Mode gelap untuk web; dunia selalu terang.
- Judul halaman: ikon halaman (`Ikon3D`, 30 px) + 22 px tebal + keterangan abu 14 px.
- Warna: biru tema untuk aksen dan kategori; token `--pastel-emerald/rose/amber-*` hanya untuk status selesai/terlambat/perlu perhatian; abu untuk netral. Jangan menambah hex baru di komponen.
- Tabel: judul teks rata kiri dengan ikon/avatar di kiri, kolom selebar isi, aksi satu baris (ikon bila lebih dari dua). Di area sempit tabel menjadi kartu.
- Kartu daftar: tinggi rata per baris, aksi di dasar kartu, informasi tidak diulang antara cip dan badan kartu.
- Detail catatan di laci kanan (ponsel: lembar bawah) dengan tab Detail/Terkait/Riwayat.

## Wajib di semua UI
- Area sentuh ≥ 44 px (boleh visual kecil dengan area transparan), fokus keyboard terlihat, label form, status tidak hanya warna.
- Keadaan memuat, kosong, galat, dan "belum aktif" dibedakan; tanpa angka palsu.
- Bahasa langsung tanpa slogan; judul menjelaskan isi atau tindakan.
- Periksa 360/768/1024/1440; hormati reduced-motion dan safe area.
- Gunakan `Button` bersama (bukan `<button>` mentah) agar tidak terkena gaya tombol global.
