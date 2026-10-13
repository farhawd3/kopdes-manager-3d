// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/server/auth', () => ({ requireSession: async () => {} }));
import { POST, PATCH } from '@/app/api/reports/route';
import { aturUlangDemo, demoDb } from '@/lib/server/demo-db';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_MODE_DEMO', '1');
  vi.stubEnv('VERCEL', '');
  vi.stubEnv('HUB_APP_ORIGIN', 'http://localhost:3000');
  aturUlangDemo();
});
afterEach(() => {
  aturUlangDemo();
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
