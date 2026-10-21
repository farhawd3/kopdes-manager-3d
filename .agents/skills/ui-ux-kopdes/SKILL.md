---
name: ui-ux-kopdes
description: Wajib dipakai setiap kali mengubah tampilan web Kopdes — CSS di src/styles, komponen src/components/ui, halaman/tampilan/laci/dialog/formulir di src/features, warna, jarak, ikon, grafik, ponsel/tablet, mode gelap, atau laporan pemilik "tidak rapi", "mepet", "tidak serasi", "terpotong". Berisi batas kerja, jebakan CSS yang sudah pernah terjadi, dan alat periksa (lint:ui, check:ui, audit:tampilan).
---

# UI/UX Kopdes

Arah gaya web: **`docs/REDESAIN-TOTAL.md`** (redesain total, arahan pemilik 21 Oktober 2026) adalah satu-satunya acuan visual. Gaya lama (Workbench, Indigo Studio, Lantai Dunia, Lavender Lekuk, Merah Putih, Taskflow) tidak mengikat; dokumennya ada di `docs/arsip/` hanya sebagai riwayat. Pola fungsi dan perilaku halaman: `docs/DESAIN-ANTARMUKA.md`. Konteks produk: `PRODUCT.md`. Skill ini hanya menyimpan batas kerja, jebakan, dan cara memeriksa; keputusan visual boleh memakai skill global `impeccable` / `ui-ux-pro-max` selama sesuai REDESAIN-TOTAL.

## Peta
- `src/styles/token.css` (satu-satunya tempat warna mentah; terang di `:root`, gelap di `:root.dark`, palet aksen lewat `data-palet`) → `dasar.css` → `komponen.css` → `kerangka.css` → `halaman/*.css` (satu berkas per kelompok halaman).
- Komponen bersama: `src/components/ui` (`Button`, `Input`, `Select`, `DateField`, `Modal`, `EmptyState`, `SegmentedControl`, …). Kontrol form mentah di luar folder ini ditolak `npm run check:ui`.
- Grafik: `src/components/charts/` (SVG tanpa pustaka). Agregasi data untuk grafik berupa fungsi murni teruji; rumus progres hanya di `lib/progress.ts`, tanggal di `lib/date.ts`.
- Navigasi: sumber tunggal `src/components/layout/navigasi.ts`; `h1` hanya di kepala kerangka, isi halaman memakai `h2`.
- Dunia 3D: `src/features/dunia-3d/monitoring.css` (skill dunia-koperasi) — tidak termasuk redesain web.

## Wajib
- Area sentuh ≥ 44 px (boleh visual kecil + `::after` transparan), fokus terlihat, label form, reduced-motion, safe area.
- Status selalu bertuliskan, bukan warna saja. Grafik punya ringkasan teks dan cadangan tabel; tidak ada tren atau angka karangan.
- Memuat/kosong/galat/belum aktif dibedakan; tanpa angka palsu; buku kas hanya uang masuk/keluar (bukan saldo/laba).
- Tanpa `!important` dan tanpa hex di luar `token.css` (dijaga `npm run lint:ui`).
- Tabel/Gantt bergulir dalam kontainer atau menjadi kartu di area sempit; periksa 360/375, 768, 1024, 1440 px.

## Jebakan yang sudah pernah terjadi (periksa setiap kali)
1. `svg` dibuat `display:block` oleh preflight Tailwind: ikon di dalam `<span>`/`<label>` biasa yang juga berisi teks turun ke baris sendiri. Wadah ikon+teks harus `display:inline-flex; align-items:center; gap`.
2. `.ui-btn` memusatkan isi (`align-items/justify-content: center`, `min-height`). Tombol yang berisi grid/kolom (batang grafik, judul tugas, kolom linimasa) wajib menimpa `align-items`, `justify-content`, `min-height`, `padding`, `box-shadow` dengan selektor `.ui-btn.namakelas`.
3. Selektor tombol dasar hanya `.ui-btn, a.button, button.button, label.button`; elemen lain berkelas `button` tidak bergaya.
4. `Input` memberi `ui-check` (bukan `ui-input`) untuk checkbox/radio; jangan memberi kelas kolom teks pada kotak centang.
5. `<details>` tertutup tetap punya slot isi: wadah grid dengan `gap` menyisakan ruang kosong → `details:not([open]) { gap: 0 }`.
6. Elemen sticky di dialog bergulir: `top: 0` dan latar permukaan, jangan `top` negatif (tombol menabrak sudut melengkung).
7. Kelas di TSX tanpa aturan CSS = sisa gaya lama. Saat menyentuh komponen, cari kelasnya di `src/styles` (`grep -rn "\.namakelas" src/styles`).
8. Identitas (nama koperasi, orang) tidak boleh ditulis tetap di kode atau contoh isian; ambil dari profil.
9. Jangan menamai kelas seperti utilitas Tailwind (`m-4`, `p-2`, `flex`, `grid`, `w-full`, …): Tailwind ikut menghasilkan gaya untuknya. Pakai nama Indonesia.
10. `scripts/audit-tampilan.mjs` dan beberapa tes UI memakai nama kelas tetap; bila kelas diganti, perbarui selektor/tes di commit yang sama.
11. Label ubin/ringkasan jangan dipotong elipsis pada lebar sempit; biarkan membungkus atau ubah grid.

## Verifikasi tampilan
1. `npm run lint:ui` dan `npm run check:ui`.
2. `npm run dev:demo -- -p 3200`, lalu `npm run audit:tampilan -- 375 812` (juga `768 1024`, `1024 768`, dan `1440 900`; argumen ketiga menyaring nama keadaan, mis. `editor`). Laporan + tangkapan di `<tmp>/kopdes-audit/<lebar>/`. Temuan SVG internal, teks `sr-only`, dan area ketuk `::after` adalah positif palsu.
3. Lihat tangkapan keadaan yang diubah, terang dan gelap — audit geometri tidak menangkap gaya yang hilang.
4. Laporkan ukuran yang benar-benar diperiksa; jangan menandai perangkat fisik bila belum.
