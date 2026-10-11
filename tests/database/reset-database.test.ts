// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('reset kosong membangun ulang aplikasi, menjaga tabel lain, dan menolak data nyata', async () => {
  const db = new PGlite();
  const sql = readFileSync('supabase/reset/RESET_DATABASE_KOSONG.sql', 'utf8');
  try {
    await db.exec(
      'create role anon; create role authenticated; create role service_role bypassrls; create table public.unrelated (id integer); insert into public.unrelated values (7);',
    );
    await db.exec(sql);
    await db.exec(
      "select public.initialize_manager('hash-uji'); insert into public.manager_sessions values ('sesi-uji', now() + interval '1 day');",
    );
    await db.exec(sql);
    expect((await db.query('select pin_hash from public.manager_security')).rows).toEqual([
      { pin_hash: null },
    ]);
    expect((await db.query('select * from public.manager_sessions')).rows).toEqual([]);
    expect((await db.query('select * from public.unrelated')).rows).toEqual([{ id: 7 }]);
    expect((await db.query('select public.hub_operations_ready() as ready')).rows).toEqual([
      { ready: true },
    ]);
    expect(
      (
        await db.query(
          "select has_table_privilege('anon','public.hub_records','SELECT') as allowed",
        )
      ).rows,
    ).toEqual([{ allowed: false }]);
    const security = await db.query<{ secure: boolean }>(
      "select bool_and(relrowsecurity) as secure from pg_class where oid in ('public.hub_records'::regclass,'public.manager_reports'::regclass,'public.manager_security'::regclass,'public.manager_sessions'::regclass,'public.activity_log'::regclass,'public.template_runs'::regclass)",
    );
    expect(security.rows[0].secure).toBe(true);
    await db.exec(
      'insert into public.hub_records(entity,data) values (\'journal\',\'{"title":"Catatan nyata"}\');',
    );
    await expect(db.exec(sql)).rejects.toThrow('Reset dibatalkan');
    await db.exec('rollback;');
    expect((await db.query("select data->>'title' as title from public.hub_records")).rows).toEqual(
      [{ title: 'Catatan nyata' }],
    );
    await db.exec(
      "delete from public.hub_records; insert into public.manager_reports(title,period_start,period_end,snapshot) values ('Laporan nyata','2026-10-01','2026-10-02','{}');",
    );
    await expect(db.exec(sql)).rejects.toThrow('Reset dibatalkan');
    await db.exec('rollback;');
    expect((await db.query('select title from public.manager_reports')).rows).toEqual([
      { title: 'Laporan nyata' },
    ]);
  } finally {
    await db.close();
  }
}, 60000);
