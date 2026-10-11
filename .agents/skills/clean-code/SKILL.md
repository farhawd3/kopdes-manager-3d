---
name: clean-code
description: Pedoman kode modular, TypeScript strict, dan UI aksesibel untuk Kopdes Manager Web.
---

# Kode bersih Kopdes

Ikuti [AGENTS](../../../AGENTS.md) untuk proses, keamanan dan prioritas. Skill ini tidak menentukan style atau mengalahkan arahan pemilik. Dunia Koperasi memakai [kontrak dunia](../../../docs/DUNIA-KOPERASI.md); halaman operasional memakai [desain antarmuka](../../../docs/DESAIN-ANTARMUKA.md).

## Struktur dan data
- Next.js App Router: rute tipis di app, UI/adapter/layanan domain di features, komponen bersama di components, utilitas di lib. Struktur aktual pada docs/ARSITEKTUR.md.
- TypeScript strict, tipe konkret dan Zod; hindari any, repository generik, factory spekulatif serta duplikasi rumus. Progres memakai lib/progress.ts; tanggal memakai lib/date.ts dan Asia/Jakarta.
- Pertahankan kompatibilitas domain/workstreams dan data lama. Identitas/catatan berasal dari sumber asli; loading, kosong dan galat harus berbeda.
- Mutasi memakai API/validasi/sesi yang ada. Setelah mutasi, perbarui cache atau refresh workspace. Jangan menyalin data operasional ke state simulasi sebagai sumber kedua.

## UI dan dunia
- Target sentuh 44 px, label dan fokus keyboard, safe area, reduced-motion, kontainer scroll tabel/Gantt. Ponsel satu kolom/panel bawah bila sesuai; dunia memakai layout khusus dalam kontraknya.
- UI operasional memakai komponen/token bersama. Dunia memakai world.css yang terisolasi dan palet mesh objects/primitives.ts; nilai geometri/warna mesh boleh dimiliki domain dunia. Jangan memaksa palet operasional ke scene atau menyebarkan palet dunia ke form.
- Scene modular, animasi berbasis delta waktu, disposal resource saat unmount; jangan rebuild geometri setiap tick. Simulasi kendaraan/cuaca/karakter tidak menjadi klaim pengiriman atau kehadiran nyata.
- Gunakan dependensi sesuai kebutuhan konkret; pembatasan paket pada rencana Astra historis bukan aturan pekerjaan dunia. Jangan upgrade stack besar tanpa kebutuhan terkait.

## Pemeriksaan

Ikuti pemeriksaan di AGENTS. Tes animasi/scene tiruan tidak membuktikan kualitas WebGL; periksa render dan interaksi nyata pada viewport relevan. Dokumentasi saja cukup diff/tautan. Catat hasil yang benar-benar dilakukan pada STATUS, bukan mengulang angka lama sebagai bukti baru.
