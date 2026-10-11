---
name: clean-code
description: Pedoman penulisan kode Kopdes (TypeScript strict, modular, komentar alasan bisnis). Pakai saat menulis atau merapikan kode apa pun di proyek ini.
---

# Kode bersih Kopdes

Isi lengkap dipelihara di `.agents/skills/clean-code/SKILL.md` (dipakai juga oleh agen lain); baca berkas itu. Ringkasnya:

- Rute tipis di `app/`, logika domain di `features/<domain>/`, UI bersama di `components/`, utilitas di `lib/`.
- TypeScript strict, Zod, tanpa `any`, tanpa abstraksi spekulatif atau duplikasi rumus; progres dari `lib/progress.ts`, tanggal dari `lib/date.ts` (Asia/Jakarta).
- Nama fungsi menjelaskan tindakan; komentar menjelaskan alasan bisnis, bukan mengulang kode.
- Fungsi murni untuk aturan (jadwal, penempatan, ringkasan) beserta tes unit.
- Berkas besar dipecah saat disentuh, bukan sekaligus.
- Selesai: `npm test -- --maxWorkers=2`, `npm run typecheck`, `npm run lint`, `npm run build`.
