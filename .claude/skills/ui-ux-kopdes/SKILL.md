---
name: ui-ux-kopdes
description: Wajib dipakai setiap kali mengubah tampilan web Kopdes — CSS di src/styles, komponen src/components/ui, halaman/tampilan/laci/dialog/formulir di src/features, warna, jarak, ikon, ponsel/tablet, mode gelap, atau laporan pemilik "tidak rapi", "mepet", "tidak serasi", "terpotong". Berisi aturan gaya, jebakan CSS yang sudah pernah terjadi, dan alat periksa (lint:ui, audit:tampilan).
---

# UI/UX Kopdes

Sumber gaya: `docs/RENCANA-REDESAIN.md` (Arah disetujui: Lantai Dunia), `src/styles/` (token & kerangka), dan `docs/DESAIN-ANTARMUKA.md`. Konteks produk: `PRODUCT.md`. `DESIGN.md` lama berstatus usang/transisi. Untuk keputusan desain baru boleh memakai skill global `impeccable` / `ui-ux-pro-max`; aturan di bawah tetap menang.

## Peta
- `src/styles/token.css` (satu-satunya tempat warna mentah, terang/gelap) → `dasar.css` → `komponen.css` → `kerangka.css` (rel biru batu, bilah atas, dok ponsel, lantai ruang `data-ruang`) → `halaman/*.css` (satu berkas per kelompok halaman).
- Komponen bersama: `src/components/ui` (`Button`, `Input`, `Select`, `DateField`, `Modal`, `EmptyState`, `Ikon3D`).
- Dunia 3D: `src/features/dunia-3d/monitoring.css` (lihat skill dunia-koperasi), diselaraskan dengan aksen jingga kayu web.

## Bahasa visual
- Gaya Lantai Dunia (20 Oktober 2026, `docs/RENCANA-REDESAIN.md`):
  - Rel navigasi biru batu `#2F3B63` dengan swatch lantai ruang diorama.
  - Latar halaman memakai warna lantai ruang penuh: Kerja (pandan `#DCE8D6`), Koperasi/Kas (kayu madu `#F1DDBB`), Agenda/Rapat (lila `#E3DDF3`), Usaha/Gerai (persik `#F8DCC8`), Dunia (air `#D6EAEE`).
  - Permukaan modul putih hangat `#FFFCF6`, tinta `#23263A`.
  - Aksen tunggal jingga kayu `--brand` (`#AC5108` / `#C8680F`), kontras teks terjaga.
  - Gerakan khas lempeng: modul tampil seperti lempeng lantai diorama dengan sudut lembut dan tepi tebal (desktop 6px, ponsel 3–4px) warna lantai lebih gelap. Menu aktif terangkat. Tombol, isian, dan cip tetap datar.
  - Huruf: display/heading berkarakter (lokal `@fontsource`), teks isi netral dan bersih, angka tabular `tabular-nums`.
  - Sidebar dari `components/layout/navigasi.ts`: Kerja (`MENU_KERJA`) + Ruang lain (`RUANG_LAIN`) + kartu Tim. Ponsel: dok pil + tombol tambah bulat. `h1` hanya di kepala kerangka; isi halaman memakai `h2`.
- Grafik: `components/charts/GrafikLembut.tsx` (`GrafikBanding`, `Donat`, `Gauge`) dengan token `--grafik-*`; SVG tanpa pustaka, setiap grafik ber-`aria-label` berisi angka; tanpa tren karangan.
- Halaman baru memakai grid modul seimbang: `.modul` + `lebar-separuh`/`lebar-sepertiga`, tinggi rata per baris, setiap data bisa ditindaklanjuti.
- Status hanya `--ok/--late/--warn` (+ `-bg`, `-line`); status selalu bertuliskan, bukan warna saja.
- Judul halaman: ikon `Ikon3D` + judul tebal; tanpa label kecil di atas judul (eyebrow).
- Tabel → kartu di area sempit (container query `halaman`, < 900 px). Aksi kartu satu baris di dasar kartu.
- Laci detail: kanan di desktop, lembar bawah di ponsel. Dialog: lembar bawah di ponsel.

## Jebakan yang sudah pernah terjadi (periksa setiap kali)
1. `svg` dibuat `display:block` oleh preflight Tailwind: ikon di dalam `<span>`/`<label>` biasa yang juga berisi teks turun ke baris sendiri. Wadah ikon+teks harus `display:inline-flex; align-items:center; gap`.
2. `.ui-btn` memusatkan isi (`align-items/justify-content: center`, `min-height: 40px`, bayangan). Tombol yang berisi grid/kolom (batang grafik, judul tugas, kolom linimasa) wajib menimpa `align-items`, `justify-content`, `min-height`, `padding`, `box-shadow` dengan selektor `.ui-btn.namakelas`.
3. Selektor tombol dasar hanya `.ui-btn, a.button, button.button, label.button`; elemen lain berkelas `button` tidak bergaya.
4. `Input` memberi `ui-check` (bukan `ui-input`) untuk checkbox/radio; jangan memberi kelas kolom teks pada kotak centang.
5. `<details>` tertutup tetap punya slot isi: wadah grid dengan `gap` menyisakan ruang kosong → `details:not([open]) { gap: 0 }`.
6. Elemen sticky di dialog bergulir: `top: 0` dan latar `--surface`, jangan `top` negatif (tombol menabrak sudut melengkung).
7. Kelas di TSX tanpa aturan CSS = sisa gaya lama. Saat menyentuh komponen, cari kelasnya di `src/styles` (`grep -rn "\.namakelas" src/styles`).
8. Identitas (nama koperasi, orang) tidak boleh ditulis tetap di kode atau contoh isian; ambil dari profil.
9. Jangan menamai kelas seperti utilitas Tailwind (`m-4`, `p-2`, `flex`, `grid`, `w-full`, …): Tailwind ikut menghasilkan gaya margin/padding untuknya. Pakai nama Indonesia (`lebar-separuh`, `lebar-sepertiga`).

## Wajib
- Area sentuh ≥ 44 px (boleh visual kecil + `::after` transparan), fokus terlihat, label form, reduced-motion, safe area.
- Memuat/kosong/galat/belum aktif dibedakan; tanpa angka palsu; buku kas hanya uang masuk/keluar.
- Tanpa `!important` dan tanpa hex di luar `token.css` (dijaga `npm run lint:ui`).

## Verifikasi tampilan
1. `npm run lint:ui`.
2. `npm run dev:demo -- -p 3200`, lalu `npm run audit:tampilan -- 375 812` (juga `768 1024` dan `1440 900`; argumen ketiga menyaring nama keadaan, mis. `editor`). Laporan + tangkapan di `<tmp>/kopdes-audit/<lebar>/`. Temuan SVG internal, teks `sr-only`, dan area ketuk `::after` adalah positif palsu.
3. Lihat tangkapan keadaan yang diubah — audit geometri tidak menangkap gaya yang hilang (mis. tombol tanpa gaya).
4. Laporkan ukuran yang benar-benar diperiksa; jangan menandai perangkat fisik bila belum.
