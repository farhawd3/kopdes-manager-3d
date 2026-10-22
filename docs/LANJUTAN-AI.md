# Serah terima AI

Berkas ini untuk agen berikutnya (Claude, Codex, Antigravity, OpenCode, dll.). Isinya hanya keadaan sekarang dan langkah berikut; timpa, jangan menambah catatan sesi.

## Keadaan (23 Oktober 2026)

- Cabang: `tampilan/redesain-total`. Pemilik mengganti arah redesain (22 Okt): arah ClickUp/Monday dan paket 1–9 lama **dibatalkan**.
- **Fase 0 selesai menunggu persetujuan pemilik:** prototipe `docs/desain/prototipe.html` (jalankan `python -m http.server 3300 -d docs/desain`, buka `/prototipe.html`). Isi: Beranda (cincin hari ini, kartu Mendesak melayang, strip tanggal, daftar tugas), Tugas (Papan seret-lepas, Daftar), laci detail, Ctrl K, pemilih tema/aksen/huruf, tata letak HP/tablet/laptop.
- Checkpoint pemilih tema lama ada di commit `b76e2c6`; logika `src/lib/tampilan.ts` dipakai lagi, CSS-nya diganti.
- Prototipe lama di `docs/desain/` sudah dihapus. `docs/REDESAIN-TOTAL.md` usang, dihapus di Fase 1.

## Rencana redesain total (disetujui pemilik 22 Okt 2026)

- **Arah:** acuan video "Figma Modern Task Manager App" (Dsanis): pastel lembut, kartu putih membulat, cincin progres, strip tanggal, elemen melayang; sederhana, bersih. HP, tablet, laptop sama-sama utama. Tampilan harus bisa diganti kapan saja lewat token per tema; tema Terang Lembut + Gelap, lima aksen, huruf bawaan Plus Jakarta Sans (pilihan akhir dari pengalih di prototipe).
- **Teknologi:** Next.js tetap; Tailwind v4 + shadcn/ui (Radix) + Motion; CSS kustom lama (~6.950 baris) dibuang. Lapisan data tetap (`hub_records`, Zod, PIN, mode demo); boleh diperbaiki, SQL baru berupa berkas migrasi yang dijalankan pemilik. Tautan antardata (proyek, subtugas, menunggu tugas lain, rapat/dokumen/risiko ↔ proyek/tugas) cukup field id tanpa SQL baru.
- **Interaksi v1:** kanban seret-lepas, Ctrl K, geser kartu di HP, animasi selesai, pembaruan langsung + Urungkan, pintasan papan ketik, Beranda Fokus Hari Ini. Tambah cepat bahasa alami menyusul. Hormati reduced-motion.
- **Menu (13 dalam 4 grup):** Kerja (Beranda = gabungan Beranda+Hari ini, Tugas: Daftar/Papan/Kalender/Linimasa, Proyek: tab Ringkasan/Tugas/Catatan/Dokumen/Risiko, Agenda); Catatan (Catatan = jurnal+laporan, Dokumen, Kontak = dulu Mitra); Usaha (Gerai: Kesiapan/Penjualan, Barang: Daftar/Stok opname/Pengiriman/Pembelian, Aset); Koperasi (Anggota: Daftar/Simpanan, Kas = dulu Keuangan, Tim: Anggota tim/Absensi); lalu Dunia 3D, Pengaturan, Bantuan. HP: dok Beranda · Tugas · ＋ · Agenda · Menu. Setiap laci detail punya bagian "Terkait" dua arah.
- **Beranda:** sapaan, cincin hari ini, tiga angka klik (Terlambat · Sisa hari ini · Minggu ini), strip tanggal, daftar tugas hari ini, panel kanan (jadwal, tenggat, proyek aktif). Tanpa angka kas/stok. Kosong = pesan pendek + satu tombol.
- **Bahasa:** folder, berkas, kode, dan **alamat halaman** bahasa Inggris (`/tasks`); alamat lama dialihkan. Teks layar bahasa Indonesia sehari-hari, tidak terjemahan, tidak lebay. Nama dokumen tetap bahasa Indonesia.
- **Skill:** hapus semua skill proyek dan `.agents/skills` kecuali `grilling`; AGENTS.md menunjuk skill global (ponytail, impeccable, ui-styling, superpowers). Pengetahuan proyek pindah ke dokumen.
- **Dokumen:** 21 berkas jadi `README.md`, `AGENTS.md` (pendek), `CHANGELOG.md` (diringkas; ke depan hanya perubahan besar), `docs/PRODUK.md`, `docs/KODE.md`, `docs/DATABASE.md`, `docs/TAMPILAN.md`, `docs/DUNIA-3D.md`, `docs/STATUS.md`. Keputusan pemilik yang masih berlaku dipertahankan.
- **Bersih-bersih:** hapus `docs/arsip/`, sub-halaman `/dev` (sisakan galeri komponen + tema), tes UI lama (diganti tes perilaku per area), stylelint/`lint:ui`/`check:ui`/`audit-ui`. `build-force-reset.mjs` dipertahankan. `artifacts/` dan `.local-backup/` dihapus pemilik sendiri.
- **Data contoh:** ±3 proyek, 40 tugas, isi semua modul; id `c0de0000`; mode demo + SQL seed + SQL hapus-contoh.
- **Pemeriksaan:** `npm run cek` (typecheck, eslint, `vitest --changed`) saat kerja; `npm run cek:penuh` (semua tes, build, ukur bundel) sebelum gabung `main` dan di CI; audit tampilan hanya halaman yang diubah, terhadap build produksi, 375/768/1440 (+1 gelap).

## Langkah berikut (urut)

1. Pemilik meninjau prototipe dan memilih huruf + aksen bawaan. Koreksi dulu prototipe bila diminta.
2. **Fase 1 Fondasi** (cabang ini, lalu PR ke `main`): bersih-bersih di atas, Tailwind v4 + shadcn + Motion, token tema, struktur folder bahasa Inggris, kerangka (sidebar, dok HP, panel kanan), rute baru + pengalihan, Ctrl K, skrip `cek`, AGENTS.md + 7 dokumen, data contoh + SQL. Halaman lama dibungkus kerangka baru agar `main` tidak rusak (periksa bentrok CSS di awal fase).
3. Fase 2 Beranda (`tampilan/beranda`), 3 Tugas, 4 Proyek + Agenda, 5 Catatan/Dokumen/Kontak, 6 Usaha + Koperasi, 7 Pengaturan/Bantuan/Dunia 3D + penutup. Satu PR per fase.

Tidak ada migrasi, deploy, atau push tanpa permintaan pemilik.
