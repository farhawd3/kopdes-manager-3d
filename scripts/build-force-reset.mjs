import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dir = 'supabase/migrations';
const files = readdirSync(dir)
  .filter((name) => name.endsWith('.sql'))
  .sort();
const sources = files.map((name) => readFileSync(`${dir}/${name}`, 'utf8'));
const signatures = new Set();
for (const source of sources) {
  for (const match of source.matchAll(
    /create (?:or replace )?function public\.(\w+)\(([^)]*)\)/gi,
  )) {
    const args = match[2]
      .split(',')
      .filter((s) => s.trim())
      .map((s) => s.trim().split(/\s+/)[1])
      .join(', ');
    signatures.add(`${match[1]}(${args})`);
  }
}

const header = `-- =============================================================================
-- RESET FORCE CLEAN: Kopdes Management Web
-- Proyek Tujuan: <project-ref> (KDMP Puntukrejo)
-- PERINGATAN: SCRIPT INI AKAN MENGHAPUS SEMUA DATA LAMA PADA TABEL APLIKASI.
--
-- Karakteristik:
-- 1. Menghapus tabel dan function lama tanpa gagal meski ada data uji tersimpan.
-- 2. Membangun skema bersih secara menyeluruh dari seluruh migrasi aktif.
-- 3. Memisahkan secara tegas Tugas ('work-items') dan Kegiatan Lapangan ('journal')
--    dengan indeks performa khusus pada tanggal, status, dan foreign relation.
-- 4. Mengaktifkan RLS, proteksi brute-force PIN, audit log, dan relasi integritas.
-- =============================================================================

begin;
set local lock_timeout = '10s';

-- Hapus tabel aplikasi lama secara total
drop table if exists public.hub_records, public.manager_reports,
  public.manager_sessions, public.manager_security, public.activity_log, public.template_runs cascade;
`;

const output =
  header +
  [...signatures].map((s) => `drop function if exists public.${s} cascade;`).join('\n') +
  '\n\n' +
  sources
    .map(
      (source, i) => `-- Sumber: ${files[i]}\n` + source.replace(/^\s*(begin|commit);\s*$/gim, ''),
    )
    .join('\n\n') +
  '\n-- Indeks pemisahan tegas Tugas (work-items) vs Kegiatan Lapangan (journal)\n' +
  "create index if not exists hub_task_entity_due_idx on public.hub_records ((data->>'due_date')) where entity = 'work-items';\n" +
  "create index if not exists hub_task_entity_status_idx on public.hub_records ((data->>'status')) where entity = 'work-items';\n" +
  "create index if not exists hub_journal_entity_date_idx on public.hub_records ((data->>'date')) where entity = 'journal';\n" +
  "create index if not exists hub_journal_entity_task_idx on public.hub_records ((data->>'work_item_id')) where entity = 'journal';\n\n" +
  'commit;\n';

writeFileSync('supabase/reset/RESET_DATABASE_FORCE_CLEAN.sql', output);
console.log('RESET_DATABASE_FORCE_CLEAN.sql generated successfully.');
