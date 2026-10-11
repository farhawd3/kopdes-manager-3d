---
name: hemat-token
description: Cara kerja hemat token untuk proyek Kopdes tanpa mengurangi kualitas hasil. Pakai di setiap sesi kerja panjang (paket dunia, fitur web, dokumentasi).
---

# Hemat token, hasil tetap sama

Penghematan hanya pada cara kerja dan laporan; pemeriksaan wajib di AGENTS tetap dijalankan.

## Membaca
- Bila `graphify-out/graph.json` ada, orientasi dulu dengan `graphify query "<pertanyaan>"`, `graphify explain "<nama>"`, atau `graphify path "A" "B"`; perbarui dengan `graphify update .` setelah mengubah kode.
- Mulai dari `docs/LANJUTAN-AI.md` dan bagian relevan `docs/DUNIA-KOPERASI.md`; jangan membaca semua MD.
- Pakai `grep -n` untuk menemukan baris, lalu baca potongan kecil (`sed -n a,bp`). Jangan membaca ulang berkas yang baru diedit.
- Jangan membuka berkas besar (`personal.css`, `tema.css`, `Records.tsx`, `Operations.tsx`, `MonitoringDashboard.tsx`, `monitoring-scene.ts`) utuh; grep lalu baca potongan.
- Abaikan `not-use/` dan `graphify-out/` kecuali diminta.

## Mengedit
- Kelompokkan banyak penggantian dalam satu skrip Node di scratchpad (`fs.readFileSync` + `replace` + cek MISSING). Hindari heredoc berisi backtick; tulis skrip dengan alat Write.
- Jalankan Prettier hanya pada berkas yang memang diformat Prettier; kembalikan berkas yang ikut terformat tanpa disentuh.
- Satu commit lokal per paket; push hanya bila pemilik meminta.

## Memeriksa
- Urutan: `npx tsc --noEmit` → eslint folder terkait → tes terfokus → seluruh tes (`--maxWorkers=2`, keluaran ke berkas, tampilkan ringkasan) → build.
- Tes gagal karena timeout saat mesin sibuk: ulangi berkas itu saja sebelum menyimpulkan.
- Visual: satu screenshot per perubahan penting di `/dev/dunia-koperasi?contoh=1`; pakai `find`/ref untuk klik; error konsol diperiksa di tab baru (sisa hot reload bukan bug).

## Melapor
- Ringkas: apa berubah, bukti pemeriksaan, batas yang belum diperiksa, langkah berikut. Tanpa mengulang isi kode atau daftar berkas panjang.
- Bahasa Indonesia sederhana untuk pemilik; istilah teknis hanya bila perlu.
