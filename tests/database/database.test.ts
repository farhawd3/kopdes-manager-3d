// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { buildPlan } from '../fixtures/legacy-plan';
let database: PGlite;
beforeAll(async () => {
  database = new PGlite();
  await database.exec(
    'create role anon; create role authenticated; create role service_role bypassrls;',
  );
  await database.exec(readFileSync('supabase/migrations/20260930000001_manager_hub.sql', 'utf8'));
  await database.exec(readFileSync('supabase/migrations/20261001000002_operations.sql', 'utf8'));
  await database.exec(
    readFileSync('supabase/migrations/20261001000003_cooperative_redesign.sql', 'utf8'),
  );
  await database.exec(
    readFileSync('supabase/migrations/20261001000004_interconnected_operations.sql', 'utf8'),
  );
  await database.exec(
    readFileSync('supabase/migrations/20261001000005_manager_superapp.sql', 'utf8'),
  );
  await database.exec(readFileSync('supabase/migrations/20261002000006_paged_records.sql', 'utf8'));
  await database.exec(
    readFileSync('supabase/migrations/20261002000007_document_relation_check.sql', 'utf8'),
  );
}, 60000);
afterAll(async () => {
  await database?.close();
});
describe('Migrasi PostgreSQL nyata di mesin lokal', () => {
  it('modul pencatatan aktif hanya untuk server', async () => {
    const result = await database.query<{ ready: boolean; anon_access: boolean }>(
      "select public.hub_operations_ready() as ready, has_function_privilege('anon','public.hub_operations_ready()','EXECUTE') as anon_access",
    );
    expect(result.rows[0]).toEqual({ ready: true, anon_access: false });
  });
  it('nomor anggota unik dan nilai kas negatif ditolak', async () => {
    await database.query(
      "insert into public.hub_records(entity,data) values('members',$1::jsonb)",
      [JSON.stringify({ title: 'Anggota uji', member_number: 'A-001' })],
    );
    await expect(
      database.query("insert into public.hub_records(entity,data) values('members',$1::jsonb)", [
        JSON.stringify({ title: 'Duplikat', member_number: 'a-001' }),
      ]),
    ).rejects.toThrow();
    await expect(
      database.query(
        "insert into public.hub_records(entity,data) values('cash-entries',$1::jsonb)",
        [JSON.stringify({ title: 'Tidak sah', direction: 'keluar', amount: -100 })],
      ),
    ).rejects.toThrow();
  });
  it('opname wajib merujuk barang dan tidak mengubah stok buku', async () => {
    const product = randomUUID();
    await database.query(
      "insert into public.hub_records(id,entity,data) values($1,'inventory-items',$2::jsonb)",
      [
        product,
        JSON.stringify({
          title: 'Barang uji',
          sku: 'TEST-001',
          book_quantity: 10,
          minimum_quantity: 2,
        }),
      ],
    );
    await expect(
      database.query(
        "insert into public.hub_records(entity,data) values('stock-counts',$1::jsonb)",
        [
          JSON.stringify({
            title: 'Tidak sah',
            item_id: randomUUID(),
            book_quantity: 10,
            counted_quantity: 8,
          }),
        ],
      ),
    ).rejects.toThrow();
    await database.query(
      "insert into public.hub_records(entity,data) values('stock-counts',$1::jsonb)",
      [
        JSON.stringify({
          title: 'Opname uji',
          item_id: product,
          book_quantity: 10,
          counted_quantity: 8,
        }),
      ],
    );
    const result = await database.query<{ quantity: number }>(
      "select (data->>'book_quantity')::integer as quantity from public.hub_records where id=$1",
      [product],
    );
    expect(result.rows[0].quantity).toBe(10);
    await expect(
      database.query('delete from public.hub_records where id=$1', [product]),
    ).rejects.toThrow();
  });
  it('RLS aktif pada seluruh tabel publik', async () => {
    const result = await database.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class join pg_namespace on pg_namespace.oid=relnamespace where nspname='public' and relkind='r'",
    );
    expect(result.rows.length).toBe(6);
    expect(result.rows.every((row) => row.relrowsecurity)).toBe(true);
  });
  it('anon tidak memiliki izin baca maupun menjalankan fungsi keamanan', async () => {
    const result = await database.query<{ table_access: boolean; function_access: boolean }>(
      "select has_table_privilege('anon','public.hub_records','SELECT') as table_access, has_function_privilege('anon','public.reserve_pin_attempt()','EXECUTE') as function_access",
    );
    expect(result.rows[0]).toEqual({ table_access: false, function_access: false });
  });
  it('PIN hanya dapat diinisialisasi sekali', async () => {
    const first = await database.query<{ ok: boolean }>(
      "select public.initialize_manager('test-hash') as ok",
    );
    const second = await database.query<{ ok: boolean }>(
      "select public.initialize_manager('other') as ok",
    );
    expect(first.rows[0].ok).toBe(true);
    expect(second.rows[0].ok).toBe(false);
  });
  it('lima percobaan membatasi percobaan berikut selama 15 menit', async () => {
    for (let i = 0; i < 5; i++) {
      await database.exec('update public.manager_security set next_attempt_at=null');
      const result = await database.query<{ hash: string }>(
        'select public.reserve_pin_attempt() as hash',
      );
      expect(result.rows[0].hash).toBe('test-hash');
    }
    const denied = await database.query<{ hash: null }>(
      'select public.reserve_pin_attempt() as hash',
    );
    expect(denied.rows[0].hash).toBeNull();
    const lock = await database.query<{ locked: boolean }>(
      "select blocked_until>now()+interval '14 minutes' as locked from public.manager_security",
    );
    expect(lock.rows[0].locked).toBe(true);
  });
  it('login menyimpan sesi acak dan menolak hash PIN lama', async () => {
    const invalid = await database.query<{ ok: boolean }>(
      "select public.finish_pin_login('old','invalid') as ok",
    );
    expect(invalid.rows[0].ok).toBe(false);
    const valid = await database.query<{ ok: boolean }>(
      "select public.finish_pin_login('test-hash','session-1') as ok",
    );
    expect(valid.rows[0].ok).toBe(true);
    const sessions = await database.query('select * from public.manager_sessions');
    expect(sessions.rows).toHaveLength(1);
  });
  it('template atomik dan idempoten', async () => {
    const records = buildPlan('2026-10-01', randomUUID);
    const first = await database.query<{ ok: boolean }>(
      'select public.install_plan($1::jsonb) as ok',
      [JSON.stringify(records)],
    );
    const second = await database.query<{ ok: boolean }>(
      'select public.install_plan($1::jsonb) as ok',
      [JSON.stringify(buildPlan('2026-10-01', randomUUID))],
    );
    expect(first.rows[0].ok).toBe(true);
    expect(second.rows[0].ok).toBe(false);
    const count = await database.query<{ count: number }>(
      "select count(*)::integer as count from public.hub_records where entity='work-items'",
    );
    expect(count.rows[0].count).toBe(43);
  });
  it('penyelesaian berulang tidak menggandakan tugas berikut', async () => {
    const task = { title: 'Rutin', status: 'proses', due_date: '2026-10-01' };
    const created = await database.query<{ record: { id: string } }>(
      'select public.save_work_item(null,$1::jsonb,null) as record',
      [JSON.stringify(task)],
    );
    const id = created.rows[0].record.id;
    for (let i = 0; i < 2; i++)
      await database.query('select public.save_work_item($1,$2::jsonb,$3::jsonb)', [
        id,
        JSON.stringify({ ...task, status: 'selesai' }),
        JSON.stringify({ ...task, due_date: '2026-10-02', status: 'rencana' }),
      ]);
    const count = await database.query<{ count: number }>(
      "select count(*)::integer as count from public.hub_records where data->>'title'='Rutin'",
    );
    expect(count.rows[0].count).toBe(2);
  });
  it('pemulihan gagal tidak menghapus data sebelumnya', async () => {
    const before = await database.query<{ count: number }>(
      'select count(*)::integer as count from public.hub_records',
    );
    await expect(
      database.query('select public.restore_manager_data($1::jsonb,$2::jsonb)', [
        JSON.stringify([{ id: 'not-a-uuid', entity: 'units', data: { title: 'A' } }]),
        '[]',
      ]),
    ).rejects.toThrow();
    const after = await database.query<{ count: number }>(
      'select count(*)::integer as count from public.hub_records',
    );
    expect(after.rows[0].count).toBe(before.rows[0].count);
  });
  it('referensi yang hilang ditolak database', async () => {
    await expect(
      database.query("insert into public.hub_records(entity,data) values('checklist',$1)", [
        JSON.stringify({ title: 'Checklist', unit_id: randomUUID() }),
      ]),
    ).rejects.toThrow('Missing related record');
    await expect(
      database.query("insert into public.hub_records(entity,data) values('work-items',$1)", [
        JSON.stringify({ title: 'Tugas dokumen', due_date: '2026-10-01', document_id: randomUUID() }),
      ]),
    ).rejects.toThrow('Missing related record');
  });
  it('gerai yang masih dipakai checklist tidak dapat dihapus', async () => {
    const result = await database.query<{ id: string }>(
      "select id from public.hub_records where entity='units' limit 1",
    );
    await expect(
      database.query('delete from public.hub_records where id=$1', [result.rows[0].id]),
    ).rejects.toThrow('Record is still referenced');
  });
  it('dependensi melingkar ditolak database', async () => {
    const id = randomUUID();
    await expect(
      database.query("insert into public.hub_records(id,entity,data) values($1,'work-items',$2)", [
        id,
        JSON.stringify({ title: 'Loop', dependencies: [id] }),
      ]),
    ).rejects.toThrow('Circular dependency');
  });
  it('perubahan PIN mencabut seluruh sesi', async () => {
    await database.query("select public.change_manager_pin('test-hash','new-hash')");
    expect((await database.query('select * from public.manager_sessions')).rows).toHaveLength(0);
  });
  it('entitas sprints dapat disimpan dan dirujuk oleh tugas', async () => {
    const sprintId = randomUUID();
    await database.query(
      "insert into public.hub_records(id,entity,data) values($1,'sprints',$2::jsonb)",
      [
        sprintId,
        JSON.stringify({ title: 'Sprint 1 Persiapan', goal: 'Kesiapan toko', status: 'aktif' }),
      ],
    );
    const taskId = randomUUID();
    await database.query(
      "insert into public.hub_records(id,entity,data) values($1,'work-items',$2::jsonb)",
      [
        taskId,
        JSON.stringify({
          title: 'Tugas sprint',
          sprint_id: sprintId,
          code: 'KD-44001',
          due_date: '2026-10-01',
        }),
      ],
    );
    const result = await database.query<{ id: string }>(
      "select id from public.hub_records where entity='work-items' and data->>'sprint_id'=$1",
      [sprintId],
    );
    expect(result.rows[0].id).toBe(taskId);
  });
  it('relasi member_id pada kas divalidasi dan ditolak jika anggota tidak ditemukan', async () => {
    const memberId = randomUUID();
    await database.query(
      "insert into public.hub_records(id,entity,data) values($1,'members',$2::jsonb)",
      [memberId, JSON.stringify({ title: 'Budi Santoso', member_number: 'A-999' })],
    );
    const cashId = randomUUID();
    await database.query(
      "insert into public.hub_records(id,entity,data) values($1,'cash-entries',$2::jsonb)",
      [
        cashId,
        JSON.stringify({
          title: 'Simpanan pokok',
          direction: 'masuk',
          amount: 100000,
          member_id: memberId,
        }),
      ],
    );
    const found = await database.query<{ id: string }>(
      'select id from public.hub_records where id=$1',
      [cashId],
    );
    expect(found.rows[0].id).toBe(cashId);
    await expect(
      database.query(
        "insert into public.hub_records(entity,data) values('cash-entries',$1::jsonb)",
        [
          JSON.stringify({
            title: 'Kas tak bertuan',
            direction: 'masuk',
            amount: 50000,
            member_id: randomUUID(),
          }),
        ],
      ),
    ).rejects.toThrow('Missing related record');
  });
  it('laporan manajer mendukung kolom status draf/final dan dapat dihapus', async () => {
    const reportId = randomUUID();
    await database.query(
      "insert into public.manager_reports(id,title,period_start,period_end,snapshot,status) values($1,'Laporan Mingguan','2026-10-01','2026-10-07','{}'::jsonb,'draft')",
      [reportId],
    );
    const res = await database.query<{ status: string }>(
      'select status from public.manager_reports where id=$1',
      [reportId],
    );
    expect(res.rows[0].status).toBe('draft');
    await database.query("update public.manager_reports set status='final' where id=$1", [
      reportId,
    ]);
    const updated = await database.query<{ status: string }>(
      'select status from public.manager_reports where id=$1',
      [reportId],
    );
    expect(updated.rows[0].status).toBe('final');
    await database.query('delete from public.manager_reports where id=$1', [reportId]);
    const afterDelete = await database.query('select id from public.manager_reports where id=$1', [
      reportId,
    ]);
    expect(afterDelete.rows).toHaveLength(0);
  });
});
