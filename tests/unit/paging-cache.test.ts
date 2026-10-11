// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
import { listQuerySchema } from '@/features/records/query';
import { pageEntities } from '@/features/workspace/workspace-scope';
import { api, invalidateCache } from '@/lib/client';

afterEach(() => {
  vi.unstubAllGlobals();
  invalidateCache();
});

it('halaman tugas meminta domain terkait saja dan membatasi ukuran halaman', () => {
  const entities = pageEntities('tugas');
  expect(entities).toContain('work-items');
  expect(entities).not.toContain('cash-entries');
  expect(listQuerySchema.parse({}).limit).toBe(50);
  expect(() => listQuerySchema.parse({ limit: 5000 })).toThrow();
});

it('dua pembacaan serentak memakai satu permintaan dan hasilnya masuk cache', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [1] }) });
  vi.stubGlobal('fetch', fetcher);
  const [first, second] = await Promise.all([
    api('work-items?limit=50'),
    api('work-items?limit=50'),
  ]);
  expect(first).toEqual(second);
  await api('work-items?limit=50');
  expect(fetcher).toHaveBeenCalledTimes(1);
  invalidateCache();
  await api('work-items?limit=50');
  expect(fetcher).toHaveBeenCalledTimes(2);
});
