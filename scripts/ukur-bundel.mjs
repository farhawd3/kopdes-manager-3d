// Ukuran JS awal halaman (chunk yang dimuat sebelum komponen dinamis), dari hasil `npm run build`.
// Batas menjaga halaman tetap cepat di HP; naikkan hanya dengan alasan yang dicatat.
// 500 KB mentah (±150 KB terkompresi) sejak redesain Okt 2026: Radix (aksesibilitas laci/menu)
// dan Motion (animasi) disepakati pemilik; formulir, Zod, dan palet Ctrl K tetap dimuat belakangan.
import fs from 'node:fs';

const BATAS_KB = 500;
const halaman = ['home', 'tasks', 'projects', 'goods'];
let gagal = false;
for (const nama of halaman) {
  const manifest = `.next/server/app/(app)/${nama}/page_client-reference-manifest.js`;
  if (!fs.existsSync(manifest)) throw new Error('Jalankan `npm run build` dulu.');
  const chunks = [...new Set(fs.readFileSync(manifest, 'utf8').match(/static\/chunks\/[^"]+\.js/g) || [])];
  const kb = Math.round(chunks.reduce((total, chunk) => total + fs.statSync(`.next/${chunk}`).size, 0) / 1024);
  console.log(`/${nama}: ${kb} KB JS awal dari ${chunks.length} chunk (batas ${BATAS_KB} KB).`);
  if (kb > BATAS_KB) gagal = true;
}
if (gagal) {
  console.error('Melebihi batas: pindahkan komponen berat ke next/dynamic.');
  process.exit(1);
}
