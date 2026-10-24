import { clearDeviceCache } from './device-cache';

// Cache baca di memori browser: bacaan yang sama dalam 60 detik tidak meminta ulang ke server;
// setiap penyimpanan mengosongkan cache.
type CacheEntry<T> = { data: T; expiry: number };
const clientCache = new Map<string, CacheEntry<unknown>>();
const pendingReads = new Map<string, Promise<unknown>>();
let cacheGeneration = 0;
const DEFAULT_TTL_MS = 60_000;

/** Naik setiap kali cache dibuang (termasuk setelah menyimpan); dipakai pemeriksa versi data. */
export const cacheGenerationNow = () => cacheGeneration;

export function invalidateCache(pathPrefix?: string) {
  cacheGeneration++;
  pendingReads.clear();
  if (!pathPrefix) {
    clientCache.clear();
  } else {
    for (const key of clientCache.keys()) {
      if (
        key === pathPrefix ||
        key.startsWith(pathPrefix + '/') ||
        key.startsWith(pathPrefix + '?')
      ) {
        clientCache.delete(key);
      }
    }
  }
}

export async function api<T>(
  path: string,
  body?: unknown,
  method = body === undefined ? 'GET' : 'POST',
  options?: { bypassCache?: boolean; ttlMs?: number },
): Promise<T> {
  const isRead = body === undefined && method === 'GET';
  const cacheKey = path;

  if (isRead && !options?.bypassCache) {
    const cached = clientCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    const pending = pendingReads.get(cacheKey);
    if (pending) return pending as Promise<T>;
  }
  const generation = cacheGeneration;
  const request = async (): Promise<T> => {
    const response = await fetch(
      '/api/' + path,
      body === undefined
        ? { method, cache: 'no-store' }
        : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    );

    // Hosting bisa membalas halaman galat HTML (mis. batas waktu habis); jangan tampilkan galat parse.
    const result = await response.json().catch(() => null);
    if (!response.ok || result === null) {
      if (response.status === 401 && path !== 'auth/pin') resetAuthNavigation('/pin');
      throw new Error(
        result?.error ||
          (result === null
            ? 'Server sedang bermasalah. Coba lagi sebentar lagi.'
            : 'Permintaan gagal.'),
      );
    }

    if (isRead) {
      if (generation === cacheGeneration) {
        clientCache.set(cacheKey, {
          data: result,
          expiry: Date.now() + (options?.ttlMs ?? DEFAULT_TTL_MS),
        });
        if (clientCache.size > 100) clientCache.delete(clientCache.keys().next().value!);
      }
    } else {
      invalidateCache();
    }

    return result as T;
  };
  const promise = request();
  if (isRead && !options?.bypassCache) pendingReads.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    if (pendingReads.get(cacheKey) === promise) pendingReads.delete(cacheKey);
  }
}

/**
 * Banyak bacaan dalam satu permintaan ke /api/batch. Hasil disimpan per alamat di cache yang sama
 * dengan `api`, jadi bacaan berikutnya (halaman lain, muat ulang ringan) langsung dari memori.
 */
export async function apiBatch<T>(paths: string[]): Promise<T[]> {
  const now = Date.now();
  const missing = [
    ...new Set(
      paths.filter((path) => {
        const cached = clientCache.get(path);
        return !(cached && cached.expiry > now) && !pendingReads.has(path);
      }),
    ),
  ];
  if (missing.length) {
    const generation = cacheGeneration;
    const request = api<{ results: T[] }>(
      'batch?' + new URLSearchParams(missing.map((path) => ['r', path])).toString(),
      undefined,
      'GET',
      { bypassCache: true },
    ).then(({ results }) => {
      if (generation === cacheGeneration)
        missing.forEach((path, index) =>
          clientCache.set(path, { data: results[index], expiry: Date.now() + DEFAULT_TTL_MS }),
        );
      return results;
    });
    missing.forEach((path, index) => {
      const result = request.then((results) => results[index]);
      // Galat dilaporkan lewat `await request` di bawah; janji turunan tidak boleh jadi galat liar.
      result.catch(() => undefined);
      pendingReads.set(path, result);
    });
    try {
      await request;
    } finally {
      missing.forEach((path) => pendingReads.delete(path));
    }
  }
  return Promise.all(paths.map((path) => api<T>(path)));
}

// Muat ulang penuh setelah perubahan sesi agar cache halaman privat ikut dibuang.
export function resetAuthNavigation(path: '/pin' | '/home') {
  invalidateCache();
  if (path === '/pin') {
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith('kopdes-draft:'))
        .forEach((key) => sessionStorage.removeItem(key));
    } catch {
      /* Storage may be disabled. */
    }
  }
  // Catatan yang tersimpan di perangkat dihapus dulu: aplikasi terkunci tidak meninggalkan data.
  void clearDeviceCache().finally(() => window.location.assign(path));
}
