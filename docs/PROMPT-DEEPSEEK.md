# Prompt untuk DeepSeek — Redesain Total Web

Salin blok di bawah ke DeepSeek di awal setiap sesi. Ganti `<NOMOR>` dengan paket berikutnya (lihat `docs/LANJUTAN-AI.md` atau bagian 10 [REDESAIN-TOTAL](REDESAIN-TOTAL.md)).

```text
Kamu mengerjakan redesain total tampilan web Kopdes Manager 3D di repo ini
(Next.js App Router, React 19, TypeScript strict, CSS kustom di src/styles).

Tujuan pemilik: web menjadi task manager yang bersih, rapi, dan profesional,
fitur mudah dijangkau, dengan grafik yang mudah dipahami. Desain lama TIDAK
mengikat; jangan sekadar mewarnai ulang.

BACA DULU, berurutan:
1. AGENTS.md — aturan proses, keamanan, Git, pencatatan (wajib dipatuhi).
2. docs/REDESAIN-TOTAL.md — satu-satunya acuan gaya dan urutan paket.
3. docs/LANJUTAN-AI.md — keadaan terakhir.
4. .agents/skills/ui-ux-kopdes/SKILL.md — jebakan CSS dan cara memeriksa.
Abaikan semua berkas di docs/arsip/ dan not-use/.

TUGAS SESI INI: kerjakan HANYA paket <NOMOR> dari bagian 10 REDESAIN-TOTAL.

ATURAN:
- Mulai dengan `git status -sb` dan `git branch`; bekerja di cabang
  tampilan/redesain-total. Jangan membuat cabang lain, jangan push.
- Perubahan terkecil yang lengkap untuk paket itu. Pertahankan fungsi, rute/slug,
  data, teks operasional, validasi, dan API. Jangan menyentuh
  src/features/dunia-3d/ atau monitoring.css.
- Jangan mengarang angka, nama, atau data. Memuat/kosong/galat/belum aktif
  harus berbeda; galat tidak boleh menjadi nol. Buku kas hanya uang masuk/keluar
  (jangan sebut saldo atau laba).
- Warna mentah hanya di src/styles/token.css; tanpa !important. Kontrol form
  hanya lewat src/components/ui. h1 hanya di kepala kerangka.
- Area sentuh 44 px, fokus keyboard terlihat, status selalu bertulisan,
  hormati prefers-reduced-motion dan safe area.
- Tanpa dependensi baru kecuali disebut di REDESAIN-TOTAL. Grafik = SVG sendiri.
- Bila mengganti nama kelas yang dipakai tes atau scripts/audit-tampilan.mjs,
  perbarui tes/selektor di commit yang sama, jangan menghapus maksud tesnya.

VERIFIKASI (wajib, jalankan sungguhan):
  npm test -- --maxWorkers=2
  npm run typecheck
  npm run lint
  npm run lint:ui
  npm run check:ui
  npm run build            (kembalikan next-env.d.ts bila berubah)
  npm run ukur:bundel      (JS awal <= 300 KB)
Lalu jalankan `npm run dev:demo -- -p 3200` dan
  npm run audit:tampilan -- 375 812
  npm run audit:tampilan -- 768 1024
  npm run audit:tampilan -- 1024 768
  npm run audit:tampilan -- 1440 900
pada mode terang dan gelap, lalu LIHAT tangkapan layarnya dan perbaiki temuan.

MENCATAT DAN MENUTUP:
- Tambah satu entri di atas CHANGELOG.md dengan format AGENTS.md
  (Alasan / Perubahan / Verifikasi / Belum).
- Timpa bagian yang berubah di docs/STATUS.md dan docs/LANJUTAN-AI.md
  (tulis paket berikutnya). Centang docs/CHECKLIST.md hanya bila selesai.
- Commit berformat `style: ringkasan bahasa indonesia` atau `feat: ...`
  (huruf kecil, tanpa titik), baris kosong, lalu alasan. TANPA baris atribusi AI.
- Periksa diff dari kunci, token, atau data pribadi sebelum commit (repo publik).

LAPORAN AKHIR (bahasa Indonesia, ringkas):
- Apa yang berubah bagi pengguna.
- Angka verifikasi yang benar-benar dijalankan (jumlah tes, error, ukuran JS,
  temuan audit per lebar).
- Yang belum diperiksa atau sisa pekerjaan. Jangan mengklaim pemeriksaan
  perangkat fisik.
```

## Catatan untuk pemilik

- Satu sesi DeepSeek = satu paket. Paket 1 (fondasi + pemilih palet) dulu; setelah itu buka demo (`npm run dev:demo -- -p 3200`), coba lima palet di menu profil atau Pengaturan › Tampilan, lalu beri tahu pilihan Anda di sesi paket 9 (atau kapan saja) untuk dijadikan bawaan.
- Bila DeepSeek mengusulkan mengubah fungsi, rute, data, atau Dunia 3D, tolak: redesain ini hanya tampilan.
