// Membuat supabase/seed/SEED_DATA_CONTOH.sql dan HAPUS_DATA_CONTOH.sql dari src/features/demo/sample-data.ts.
// Jalankan: node scripts/build-seed.mjs. Pembuatnya dijalankan lewat Vitest karena sumbernya
// TypeScript dengan alias @/; tanpa WRITE_SEED tes yang sama memeriksa berkas tidak usang.
import { spawnSync } from 'node:child_process';

const result = spawnSync('npx', ['vitest', 'run', 'tests/unit/seed-sql.test.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, WRITE_SEED: '1' },
});
process.exit(result.status ?? 1);
