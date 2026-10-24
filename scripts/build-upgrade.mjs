// Membuat supabase/upgrade/UPGRADE_KE_TERBARU.sql: satu berkas untuk database yang sudah berisi
// skema aplikasi (minimal migrasi 8). Setiap migrasi sesudahnya hanya dijalankan bila penandanya
// belum ada, jadi aman dijalankan berulang. Jalankan: node scripts/build-upgrade.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// Penanda "sudah terpasang" per migrasi. Kosong = migrasi aman diulang (create or replace,
// update yang idempoten, atau if not exists), jadi selalu dijalankan.
const steps = [
  ['20261013000009_report_backup.sql', ''],
  ['20261015000010_administrasi_usaha.sql', "to_regprocedure('public.hub_administration_ready()')"],
  ['20261023000011_rutin_harian.sql', "to_regprocedure('public.hub_routines_ready()')"],
  ['20261024000012_versi_data.sql', ''],
];

const header = `-- UPGRADE Kopdes Management Web ke skema terbaru, untuk proyek yang SUDAH berisi skema dan data.
-- Target proyek yang dipakai pemilik: <project-ref>. Unduh cadangan JSON dari Pengaturan dulu.
-- Menjalankan migrasi 9 sampai terbaru yang belum terpasang, dalam satu transaksi: bila satu
-- langkah gagal, tidak ada yang berubah. Aman dijalankan ulang. Tidak menghapus tabel atau data.
-- Dibuat oleh scripts/build-upgrade.mjs dari supabase/migrations; jangan diedit tangan.
begin;
set local lock_timeout = '5s';
do $$ begin
  if to_regclass('public.hub_records') is null then
    raise exception 'Upgrade dibatalkan: skema aplikasi belum ada. Pakai supabase/install/INSTALL_SCHEMA_KOSONG.sql.';
  end if;
  if to_regprocedure('public.hub_logistics_ready()') is null then
    raise exception 'Upgrade dibatalkan: migrasi 8 belum terpasang. Jalankan migrasi 1–8 lebih dulu (docs/DATABASE.md).';
  end if;
end $$;
`;

const body = steps
  .map(([file, marker]) => {
    const source = readFileSync(`supabase/migrations/${file}`, 'utf8')
      .replace(/^\s*(begin|commit);\s*$/gim, '')
      .trim();
    const tag = `$m${file.slice(0, 14)}$`;
    if (source.includes(tag)) throw new Error(`Tanda ${tag} dipakai di ${file}`);
    const run = `execute ${tag}\n${source}\n${tag};`;
    return marker
      ? `\n-- ${file}: dilewati bila sudah terpasang.\ndo $outer$ begin\n  if ${marker} is null then\n    ${run}\n  end if;\nend $outer$;\n`
      : `\n-- ${file}: aman diulang.\ndo $outer$ begin\n  ${run}\nend $outer$;\n`;
  })
  .join('');

mkdirSync('supabase/upgrade', { recursive: true });
writeFileSync('supabase/upgrade/UPGRADE_KE_TERBARU.sql', `${header}${body}\ncommit;\n`);
console.log('UPGRADE_KE_TERBARU.sql generated successfully.');
