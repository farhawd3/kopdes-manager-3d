// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';

const migrations = readdirSync('supabase/migrations')
  .filter((file) => file.endsWith('.sql'))
  .sort();
const upgrade = readFileSync('supabase/upgrade/UPGRADE_KE_TERBARU.sql', 'utf8');
const ROLES = 'create role anon; create role authenticated; create role service_role bypassrls;';

async function withMigrations(count: number) {
  const db = new PGlite();
  await db.exec(ROLES);
  for (const file of migrations.slice(0, count))
    await db.exec(readFileSync(`supabase/migrations/${file}`, 'utf8'));
  return db;
}

it('upgrade memasang migrasi 9 sampai terbaru di atas migrasi 1–8, aman diulang', async () => {
  const db = await withMigrations(8);
  try {
    await db.exec(upgrade);
    await db.exec(upgrade);
    expect(
      (
        await db.query(
          'select public.hub_routines_ready() and public.hub_administration_ready() as ok',
        )
      ).rows,
    ).toEqual([{ ok: true }]);
    expect(
      (await db.query("select 1 from pg_indexes where indexname = 'hub_records_updated_idx'")).rows,
    ).toHaveLength(1);
    // Data contoh tetap bisa dimasukkan setelah upgrade.
    await db.exec(readFileSync('supabase/seed/SEED_DATA_CONTOH.sql', 'utf8'));
  } finally {
    await db.close();
  }
}, 120000);

it('upgrade melewati migrasi yang sudah terpasang dan menolak database kosong', async () => {
  const db = await withMigrations(migrations.length);
  try {
    await db.exec(upgrade);
  } finally {
    await db.close();
  }
  const empty = new PGlite();
  try {
    await empty.exec(ROLES);
    await expect(empty.exec(upgrade)).rejects.toThrow('Upgrade dibatalkan');
  } finally {
    await empty.close();
  }
}, 120000);
