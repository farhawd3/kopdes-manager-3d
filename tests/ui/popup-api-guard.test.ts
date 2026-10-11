import { afterEach, expect, it, vi } from 'vitest';
import { api } from '@/lib/client';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); window.history.replaceState({}, '', '/'); });
it('fixture popup tidak pernah memanggil fetch untuk baca, simpan atau hapus', async () => {
  vi.stubEnv('NODE_ENV', 'development');
  window.history.replaceState({}, '', '/dev/popup');
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
    await expect(api('work-items', method === 'GET' ? undefined : {}, method)).rejects.toThrow('database diblokir');
  }
  expect(fetchMock).not.toHaveBeenCalled();
});
