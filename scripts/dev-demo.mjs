// Menjalankan `next dev` dalam mode demo: data contoh di memori, tanpa Supabase dan tanpa PIN.
// Argumen tambahan diteruskan, mis. `npm run dev:demo -- -p 3200`.
import { spawnSync } from 'node:child_process';

const result = spawnSync('npx', ['next', 'dev', '--hostname', '127.0.0.1', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, NEXT_PUBLIC_MODE_DEMO: '1' },
});
process.exit(result.status ?? 1);
