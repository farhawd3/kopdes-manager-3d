// Salin skill proyek dari .claude/skills (Claude Code) ke .agents/skills (Codex, Antigravity,
// dan agen lain yang membaca folder standar .agents). Jalankan setelah menambah/mengubah skill:
//   node scripts/sync-skills.mjs
// clean-code dikecualikan karena sumber utamanya justru .agents/skills/clean-code.
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const from = '.claude/skills';
const to = '.agents/skills';
const keep = new Set(['clean-code']);

for (const name of readdirSync(from, { withFileTypes: true })) {
  if (keep.has(name.name)) continue;
  const source = join(from, name.name);
  const target = join(to, name.name);
  if (name.isDirectory() && existsSync(target)) rmSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
  console.log(`disalin: ${source} -> ${target}`);
}
