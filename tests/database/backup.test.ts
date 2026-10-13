// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest';

let database: PGlite;
const mocks = vi.hoisted(() => ({ session: vi.fn(), rpc: vi.fn(), range: vi.fn(), cap: 1000, count: null as number | null }));
vi.mock('@/lib/server/auth', () => ({ requireSession: mocks.session }));
vi.mock('@/lib/server/db', () => ({
  db: () => ({
    from: (table: string) => ({
      select: () => ({
        order: () => ({
          range: async (start: number, end: number) => {
            mocks.range(table, start, end);
            return {
              // PostgREST mengirim kolom date sebagai YYYY-MM-DD, bukan objek Date milik PGlite.
              data: (
                await database.query<{ row: unknown }>(
                  `select row_to_json(r) as row from public.${table} r order by id limit $1 offset $2`,
                  [Math.min(end - start + 1, mocks.cap), start],
                )
              ).rows.map((result) => result.row),
              error: null,
              count: mocks.count ?? (
                await database.query<{ count: number }>(
                  `select count(*)::integer as count from public.${table}`,
                )
              ).rows[0].count,
            };
          },
        }),
      }),
    }),
    rpc: mocks.rpc,
  }),
}));
import { GET, POST } from '@/app/api/backup/route';

const snapshot = {
  organization: 'Koperasi uji',
  completed: [],
  overdue: [],
  next: [],
  decisions: [],
  risks: [],
  milestones: [],
  notes: '',
};
const report = () => ({
  id: randomUUID(),
  title: 'Laporan uji',
  period_start: '2026-10-01',
  period_end: '2026-10-07',
  created_at: '2026-10-07T12:00:00Z',
  snapshot: { ...snapshot },
});
const request = (body: unknown, origin = 'http://localhost:3000') =>
  new Request('http://localhost:3000/api/backup', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeAll(async () => {
  database = new PGlite();
  await database.exec(
    'create role anon; create role authenticated; create role service_role bypassrls;',
  );
  for (const file of readdirSync('supabase/migrations')
    .filter((name) => name.endsWith('.sql'))
    .sort())
    await database.exec(readFileSync(`supabase/migrations/${file}`, 'utf8'));
}, 60000);
afterAll(async () => {
  await database?.close();
  vi.unstubAllEnvs();
});
beforeEach(async () => {
  vi.resetAllMocks();
  mocks.cap = 1000;
  mocks.count = null;
  vi.stubEnv('HUB_APP_ORIGIN', 'http://localhost:3000');
  mocks.session.mockResolvedValue(undefined);
  mocks.rpc.mockImplementation(
    async (_name: string, args: { records: unknown; reports: unknown }) => {
      try {
        await database.query('select public.restore_manager_data($1::jsonb,$2::jsonb)', [
          JSON.stringify(args.records),
          JSON.stringify(args.reports),
        ]);
        return { error: null };
      } catch {
        return { error: { message: 'Pemulihan gagal' } };
      }
    },
  );
  await database.exec('delete from public.hub_records; delete from public.manager_reports;');
  await database.query(
    "insert into public.hub_records(entity,data) values('organization',$1::jsonb)",
    [JSON.stringify({ title: 'Koperasi uji', start_date: '2026-10-01' })],
  );
});

it('ekspor lalu pulihkan laporan mempertahankan kas dan status draf', async () => {
  const item = report();
  const cash = { in: 25000, out: 40000, net: -15000, count: 2 };
  await database.query(
    'insert into public.manager_reports(id,title,period_start,period_end,created_at,snapshot,status) values($1,$2,$3,$4,$5,$6::jsonb,$7)',
    [
      item.id,
      item.title,
      item.period_start,
      item.period_end,
      item.created_at,
      JSON.stringify({ ...snapshot, cash, status: 'draft' }),
      'draft',
    ],
  );
  const exported = await (await GET()).json();
  const response = await POST(request(exported));
  expect(response.status, await response.text()).toBe(200);
  expect(mocks.rpc).toHaveBeenCalledWith('restore_manager_data', expect.any(Object));
  const restored = (
    await database.query<{ status: string; snapshot: unknown }>(
      'select status,snapshot from public.manager_reports where id=$1',
      [item.id],
    )
  ).rows[0];
  expect(restored).toEqual({ status: 'draft', snapshot: { ...snapshot, cash, status: 'draft' } });
});

it.each(['tanpa status', 'kolom saja', 'snapshot saja', 'kolom tertinggal'])(
  'cadangan lama: %s',
  async (kind) => {
    const exported = await (await GET()).json();
    const item = report();
    exported.reports = [
      {
        ...item,
        ...(kind === 'kolom saja' ? { status: 'draft' } : {}),
        ...(kind === 'kolom tertinggal' ? { status: 'final' } : {}),
        snapshot: {
          ...snapshot,
          ...(['snapshot saja', 'kolom tertinggal'].includes(kind) ? { status: 'draft' } : {}),
        },
      },
    ];
    expect((await POST(request(exported))).status).toBe(200);
    const expected = kind === 'tanpa status' ? 'final' : 'draft';
    const restored = (
      await database.query<{ status: string; snapshot: Record<string, unknown> }>(
        'select status,snapshot from public.manager_reports',
      )
    ).rows[0];
    expect(restored.status).toBe(expected);
    expect(restored.snapshot.status).toBe(expected);
    expect(restored.snapshot).not.toHaveProperty('cash');
  },
);

it('migrasi menyelaraskan kolom status lama dengan snapshot tanpa mengubah isi laporan', async () => {
  const data = { ...snapshot, status: 'draft' };
  await database.query(
    "insert into public.manager_reports(title,period_start,period_end,snapshot) values('Draf','2026-10-01','2026-10-07',$1::jsonb)",
    [JSON.stringify(data)],
  );
  await database.exec(readFileSync('supabase/migrations/20261013000009_report_backup.sql', 'utf8'));
  expect((await database.query('select status,snapshot from public.manager_reports')).rows).toEqual(
    [{ status: 'draft', snapshot: data }],
  );
});

it('isi laporan tidak sah ditolak sebelum pemulihan database', async () => {
  const exported = await (await GET()).json();
  for (const invalid of [
    { ...snapshot, status: 'invalid' },
    { ...snapshot, cash: { in: -1, out: 0, net: -1, count: 1 } },
    { ...snapshot, unexpected: true },
  ]) {
    exported.reports = [{ ...report(), snapshot: invalid }];
    expect((await POST(request(exported))).status).toBe(400);
  }
  expect(mocks.rpc).not.toHaveBeenCalled();
});

it('pemulihan yang gagal mempertahankan profil dan laporan sebelumnya', async () => {
  await database.query(
    "insert into public.manager_reports(title,period_start,period_end,snapshot,status) values('Laporan sebelumnya','2026-10-01','2026-10-07',$1::jsonb,'draft')",
    [JSON.stringify({ ...snapshot, status: 'draft' })],
  );
  const before = (await database.query('select * from public.manager_reports')).rows;
  const exported = await (await GET()).json();
  const item = report();
  exported.reports = [item, item];
  expect((await POST(request(exported))).status).toBe(503);
  expect((await database.query('select data from public.hub_records')).rows).toEqual([
    { data: { title: 'Koperasi uji', start_date: '2026-10-01' } },
  ]);
  expect((await database.query('select * from public.manager_reports')).rows).toEqual(before);
});

it('origin asing dan sesi kedaluwarsa tidak dapat memulihkan data', async () => {
  expect((await POST(request({}, 'https://asing.example'))).status).toBe(403);
  mocks.session.mockRejectedValue(new Error('UNAUTHORIZED'));
  expect((await POST(request({}))).status).toBe(401);
  expect(mocks.rpc).not.toHaveBeenCalled();
});

it('cadangan mengambil seluruh 1.201 catatan walau respons server dibatasi 100 baris', async () => {
  mocks.cap = 100;
  await database.exec(
    "insert into public.hub_records(entity,data) select 'journal',jsonb_build_object('title','Kegiatan ' || n,'date','2026-10-13') from generate_series(1,1200) n;",
  );
  const response = await GET();
  expect(response.status).toBe(200);
  const exported = await response.json();
  expect(exported.records).toHaveLength(1201);
  expect(new Set(exported.records.map((row: { id: string }) => row.id)).size).toBe(1201);
  expect(mocks.range).toHaveBeenCalledWith('hub_records', 1200, 1699);
}, 20_000);

it('cadangan di atas batas ditolak tanpa menghasilkan unduhan sebagian', async () => {
  mocks.count = 5001;
  const response = await GET();
  expect(response.status).toBe(503);
  expect((await response.json()).error).toContain('5.000');
  expect(mocks.range).toHaveBeenCalledTimes(1);
});
