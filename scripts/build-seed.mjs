// Membuat supabase/seed/SEED_DATA_CONTOH.sql dan HAPUS_DATA_CONTOH.sql dari src/features/demo/sample-data.ts.
// Jalankan: node scripts/build-seed.mjs. Pembuatnya dijalankan lewat Vitest karena sumbernya
// TypeScript dengan alias @/; tanpa TULIS_SEED tes yang sama memeriksa berkas tidak usang.
import { spawnSync } from 'node:child_process';

const hasil = spawnSync('npx', ['vitest', 'run', 'tests/unit/seed-sql.test.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, TULIS_SEED: '1' },
});
process.exit(hasil.status ?? 1);
