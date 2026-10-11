import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const migrations = readdirSync('supabase/migrations')
  .filter((file) => file.endsWith('.sql'))
  .sort();
const header = `-- INSTALASI BERSIH Kopdes Management Web pada proyek Supabase KOSONG.
-- Target proyek yang dipakai pemilik: <project-ref>.
-- Jangan jalankan pada proyek yang sudah memiliki tabel aplikasi atau data.
-- Dibuat dari seluruh migrasi aktif oleh scripts/build-install.mjs.
begin;
set local lock_timeout = '5s';
do $$ begin
  if to_regclass('public.hub_records') is not null
    or to_regclass('public.manager_reports') is not null
    or to_regclass('public.manager_security') is not null then
    raise exception 'Instalasi dibatalkan: skema aplikasi sudah ada. Gunakan migrasi tambahan yang belum terpasang.';
  end if;
end $$;
`;
const body = migrations
  .map((file) => {
    const source = readFileSync(`supabase/migrations/${file}`, 'utf8');
    return `\n-- Sumber: ${file}\n${source.replace(/^\s*(begin|commit);\s*$/gim, '')}`;
  })
  .join('\n');
mkdirSync('supabase/install', { recursive: true });
writeFileSync('supabase/install/INSTALL_SCHEMA_KOSONG.sql', `${header}${body}\ncommit;\n`);
