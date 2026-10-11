// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('installs the consolidated schema once on an empty database', async () => {
  const database = new PGlite();
  try {
    await database.exec('create role anon; create role authenticated; create role service_role bypassrls;');
    const sql = readFileSync('supabase/install/INSTALL_SCHEMA_KOSONG.sql', 'utf8');
    await database.exec(sql);
    const result = await database.query<{ ready: boolean }>(
      'select public.hub_operations_ready() as ready',
    );
    expect(result.rows[0].ready).toBe(true);
    await expect(database.exec(sql)).rejects.toThrow('Instalasi dibatalkan');
  } finally {
    await database.close();
  }
}, 60000);
