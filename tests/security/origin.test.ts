// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sameOrigin } from '@/lib/server/http';
const request = (origin?: string, headers: Record<string, string> = {}) =>
  new Request('https://internal.invalid/api/auth/pin', {
    method: 'POST',
    headers: { ...(origin ? { origin } : {}), ...headers },
  });
beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('HUB_APP_ORIGIN', '');
  vi.stubEnv('VERCEL', '1');
  vi.stubEnv('VERCEL_ENV', 'production');
  vi.stubEnv('VERCEL_URL', 'kopdes-build123.vercel.app');
  vi.stubEnv('VERCEL_BRANCH_URL', 'kopdes-git-main.vercel.app');
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'kopdes.vercel.app');
});
afterEach(() => vi.unstubAllEnvs());
describe('Origin deployment Vercel', () => {
  it.each([
    'https://kopdes.vercel.app',
    'https://kopdes-build123.vercel.app',
    'https://kopdes-git-main.vercel.app',
  ])('menerima alamat deployment sendiri: %s', (origin) =>
    expect(() => sameOrigin(request(origin))).not.toThrow(),
  );
  it('alamat localhost tertinggal tidak memblokir domain produksi yang terverifikasi', () => {
    vi.stubEnv('HUB_APP_ORIGIN', 'http://localhost:3000');
    expect(() => sameOrigin(request('https://kopdes.vercel.app'))).not.toThrow();
    expect(() => sameOrigin(request('http://localhost:3000'))).toThrow('ORIGIN_FORBIDDEN');
  });
  it('menormalkan spasi dan slash akhir konfigurasi domain kustom', () => {
    vi.stubEnv('HUB_APP_ORIGIN', ' https://kelola.example.id/ ');
    expect(() => sameOrigin(request('https://kelola.example.id'))).not.toThrow();
  });
  it.each([
    'https://evil.example',
    'https://other.vercel.app',
    'https://kopdes.vercel.app.evil.example',
    'http://kopdes.vercel.app',
    'null',
    'https://kopdes.vercel.app/path',
  ])('menolak origin di luar allowlist: %s', (origin) =>
    expect(() => sameOrigin(request(origin))).toThrow('ORIGIN_FORBIDDEN'),
  );
  it('menolak Origin yang hilang', () =>
    expect(() => sameOrigin(request())).toThrow('ORIGIN_FORBIDDEN'));
  it('header host palsu tidak memperluas domain yang diizinkan', () =>
    expect(() =>
      sameOrigin(
        request('https://evil.example', {
          host: 'evil.example',
          'x-forwarded-host': 'evil.example',
          'x-forwarded-proto': 'https',
        }),
      ),
    ).toThrow('ORIGIN_FORBIDDEN'));
  it('metadata Vercel diabaikan di luar platform', () => {
    vi.stubEnv('VERCEL', '');
    expect(() => sameOrigin(request('https://kopdes.vercel.app'))).toThrow('ORIGIN_FORBIDDEN');
  });
  it('preview tidak otomatis menerima origin domain produksi', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(() => sameOrigin(request('https://kopdes.vercel.app'))).toThrow('ORIGIN_FORBIDDEN');
  });
  it('konfigurasi lokal eksplisit tetap berfungsi', () => {
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('HUB_APP_ORIGIN', 'http://localhost:3000');
    expect(() => sameOrigin(request('http://localhost:3000'))).not.toThrow();
  });
});
