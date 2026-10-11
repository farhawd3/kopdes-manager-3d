// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}));
vi.mock('@/lib/server/db', () => ({ db: () => ({ rpc: mocks.rpc, from: mocks.from }) }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: mocks.set, get: mocks.get, delete: mocks.delete }),
}));
import { hashPin, verifyPin, requireSession } from '@/lib/server/auth';
import { POST } from '@/app/api/auth/pin/route';
const request = (body: unknown, origin = 'http://localhost:3000') =>
  new Request('http://localhost:3000/api/auth/pin', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('HUB_APP_ORIGIN', 'http://localhost:3000');
});
describe('Keamanan PIN dan API', () => {
  it('hash acak dengan verifikasi benar dan salah', () => {
    const first = hashPin('485921');
    expect(first).not.toBe(hashPin('485921'));
    expect(verifyPin('485921', first)).toBe(true);
    expect(verifyPin('111111', first)).toBe(false);
  });
  it('hash rusak tidak diterima', () => expect(verifyPin('485921', 'salt:broken')).toBe(false));
  it('menolak permintaan tanpa sesi', async () => {
    mocks.get.mockReturnValue(undefined);
    await expect(requireSession()).rejects.toThrow('UNAUTHORIZED');
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('menolak mutasi lintas origin sebelum akses DB', async () => {
    const response = await POST(
      request({ action: 'login', pin: '485921' }, 'https://evil.example'),
    );
    expect(response.status).toBe(403);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('menolak PIN pendek sebelum akses DB', async () => {
    const response = await POST(request({ action: 'login', pin: '1234' }));
    expect(response.status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('batas percobaan tidak menghasilkan cookie', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    expect((await POST(request({ action: 'login', pin: '485921' }))).status).toBe(429);
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('PIN salah tidak membuka sesi', async () => {
    mocks.rpc.mockResolvedValue({ data: hashPin('485921'), error: null });
    expect((await POST(request({ action: 'login', pin: '111111' }))).status).toBe(401);
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('cookie sesi produksi HttpOnly, Secure, Strict dan token acak', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    mocks.rpc
      .mockResolvedValueOnce({ data: hashPin('485921'), error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    expect((await POST(request({ action: 'login', pin: '485921' }))).status).toBe(200);
    expect(mocks.set).toHaveBeenCalledWith(
      'kopdes_manager_session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'strict', maxAge: 43200 }),
    );
    vi.unstubAllEnvs();
  });
  it('galat database tidak membuka sesi', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'failed' } });
    const response = await POST(request({ action: 'login', pin: '485921' }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain('tidak dapat terhubung ke Supabase');
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('fungsi PIN yang hilang mendapat pesan khusus tanpa membuka sesi', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'not found' } });
    const response = await POST(request({ action: 'login', pin: '485921' }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain('Fungsi keamanan belum tersedia');
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('token pengaturan salah tidak dapat membuat PIN', async () => {
    vi.stubEnv('HUB_SETUP_TOKEN', 'a'.repeat(64));
    expect(
      (await POST(request({ action: 'setup', pin: '485921', setupToken: 'b'.repeat(64) }))).status,
    ).toBe(403);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
