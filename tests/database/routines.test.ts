// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let database: PGlite;
const insert = (entity: string, data: Record<string, unknown>, id = randomUUID()) =>
  database
    .query('insert into public.hub_records(id,entity,data) values($1,$2,$3::jsonb)', [id, entity, JSON.stringify(data)])
    .then(() => id);

beforeAll(async () => {
  database = new PGlite();
  await database.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  for (const file of readdirSync('supabase/migrations').filter((name) => name.endsWith('.sql')).sort())
    await database.exec(readFileSync(`supabase/migrations/${file}`, 'utf8'));
}, 60000);
afterAll(async () => {
  await database?.close();
});

describe('Migrasi 11: rutin harian', () => {
  it('kesiapan hanya untuk server; jam dan hari rutin diperiksa', async () => {
    const { rows } = await database.query<{ ready: boolean; anon: boolean }>(
      `select public.hub_routines_ready() as ready, has_function_privilege('anon','public.hub_routines_ready()','EXECUTE') as anon`,
    );
    expect(rows[0]).toEqual({ ready: true, anon: false });
    await expect(insert('routines', { title: 'Salah jam', time: '25:00', days: [1], active: true })).rejects.toThrow('Invalid routine time');
    await expect(insert('routines', { title: 'Salah hari', time: '07:00', days: [8], active: true })).rejects.toThrow('Invalid routine days');
  });

  it('satu centang per rutin per hari, dan centang harus menunjuk rutin yang ada', async () => {
    const routine = await insert('routines', { title: 'Buka gerai', time: '07:30', days: [1, 2, 3], active: true });
    await insert('routine-checks', { routine_id: routine, date: '2026-10-23' });
    await expect(insert('routine-checks', { routine_id: routine, date: '2026-10-23' })).rejects.toThrow();
    await insert('routine-checks', { routine_id: routine, date: '2026-10-24' });
    await expect(insert('routine-checks', { routine_id: randomUUID(), date: '2026-10-23' })).rejects.toThrow('Missing related record');
  });
});
