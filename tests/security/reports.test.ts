// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/server/auth', () => ({ requireSession: async () => {} }));
import { POST, PATCH, GET, DELETE } from '@/app/api/reports/route';
import { randomUUID } from 'node:crypto';
import { resetDemo, demoDb } from '@/lib/server/demo-db';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_MODE_DEMO', '1');
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('HUB_APP_ORIGIN', 'http://localhost:3000');
  resetDemo();
});

it('laporan lebih dari 100 dapat dipaginasi tanpa baris ganda dan offset buruk ditolak', async () => {
  for (let index = 0; index < 101; index++)
    await demoDb()
      .from('manager_reports')
      .insert({ id: randomUUID(), title: `Laporan ${index}`, snapshot: {} });
  const first = await (await GET(new Request('http://localhost:3000/api/reports'))).json();
  const next = await (
    await GET(new Request('http://localhost:3000/api/reports?offset=100'))
  ).json();
  expect(first).toHaveLength(100);
  expect(next).toHaveLength(1);
  expect(new Set([...first, ...next].map((row: { id: string }) => row.id)).size).toBe(101);
  expect((await GET(new Request('http://localhost:3000/api/reports?offset=-1'))).status).toBe(400);
});

it('ID laporan yang tidak sah tidak dapat dihapus', async () => {
  expect((await DELETE(request({ id: 'bukan-uuid' }, 'DELETE'))).status).toBe(400);
});
afterEach(() => {
  resetDemo();
  vi.unstubAllEnvs();
});
const request = (body: unknown, method = 'POST') =>
  new Request('http://localhost:3000/api/reports', {
    method,
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
it('buat, ubah, dan finalisasi laporan menyelaraskan status kolom dengan snapshot', async () => {
  const body = {
    title: 'Draf',
    start: '2026-10-01',
    end: '2026-10-07',
    notes: '',
    status: 'draft',
  };
  const created = await POST(request(body));
  expect(created.status).toBe(200);
  const row = await created.json();
  expect(row.status).toBe('draft');
  expect(row.snapshot.status).toBe('draft');
  const edited = await POST(request({ ...body, id: row.id, notes: 'Catatan baru' }));
  expect(edited.status).toBe(200);
  expect((await edited.json()).status).toBe('draft');
  const finalized = await PATCH(request({ id: row.id, status: 'final' }, 'PATCH'));
  expect(finalized.status).toBe(200);
  const result = await finalized.json();
  expect(result.status).toBe('final');
  expect(result.snapshot.status).toBe('final');
  const notes = await PATCH(request({ id: row.id, notes: 'Hanya catatan' }, 'PATCH'));
  expect((await notes.json()).status).toBe('final');
  expect((await demoDb().from('manager_reports').select().single()).error).toBeNull();
});
