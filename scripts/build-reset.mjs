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
const header = `-- RESET MANUAL: Kopdes Management Web
-- Tujuan: <project-ref>. Periksa project ref di dashboard sebelum Run.
-- Hapus PIN, sesi, log, dan struktur aplikasi; buat kembali dari migrasi aktif.
-- Berhenti jika catatan kerja atau laporan ternyata sudah ada.
-- Tidak menghapus schema public, auth, storage, atau tabel aplikasi lain.
-- Dibuat oleh scripts/build-reset.mjs; jangan masukkan ke folder migrations.
begin;
set local lock_timeout = '5s';
DO $$
declare table_name text; has_data boolean;
begin
  foreach table_name in array array['hub_records','manager_reports'] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('lock table public.%I in access exclusive mode', table_name);
      execute format('select exists(select 1 from public.%I)', table_name) into has_data;
      if has_data then
        raise exception 'Reset dibatalkan: tabel % berisi data. Unduh cadangan dan tinjau data dahulu.', table_name;
      end if;
    end if;
  end loop;
end $$;
-- Tanpa CASCADE: dependensi tambahan yang tidak dikenal akan menghentikan reset.
drop table if exists public.hub_records, public.manager_reports,
  public.manager_sessions, public.manager_security, public.activity_log, public.template_runs;
`;
const output =
  header +
  [...signatures].map((s) => `drop function if exists public.${s};`).join('\n') +
  '\n\n' +
  sources
    .map(
      (source, i) => `-- Sumber: ${files[i]}\n` + source.replace(/^\s*(begin|commit);\s*$/gim, ''),
    )
    .join('\n\n') +
  '\ncommit;\n';
writeFileSync('supabase/reset/RESET_DATABASE_KOSONG.sql', output);
