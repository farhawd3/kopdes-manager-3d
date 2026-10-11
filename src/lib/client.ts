// In-memory client cache with TTL & mutation invalidation to accelerate requests and save tokens
type CacheEntry<T> = { data: T; expiry: number };
const clientCache = new Map<string, CacheEntry<unknown>>();
const pendingReads = new Map<string, Promise<unknown>>();
let cacheGeneration = 0;
const DEFAULT_TTL_MS = 60_000; // 60 seconds cache for read queries

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
  // Fixture popup tidak boleh membaca atau mengubah database operasional.
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.pathname === '/dev/popup') {
    throw new Error('Mode pemeriksaan popup: permintaan database diblokir.');
  }
  const isRead = body === undefined && method === 'GET';
  const cacheKey = `${path}`;

  // Serve from cache if available and not expired for read requests
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

    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401 && path !== 'auth/pin') resetAuthNavigation('/pin');
      throw new Error(result.error || 'Permintaan gagal.');
    }

    // Cache read results
    if (isRead) {
      if (generation === cacheGeneration) {
        clientCache.set(cacheKey, {
          data: result,
          expiry: Date.now() + (options?.ttlMs ?? DEFAULT_TTL_MS),
        });
        if (clientCache.size > 100) clientCache.delete(clientCache.keys().next().value!);
      }
    } else {
      // Invalidate related cache on mutations (POST, PUT, DELETE)
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

// Muat ulang penuh setelah perubahan sesi agar cache halaman privat ikut dibuang.
export function resetAuthNavigation(path: '/pin' | '/beranda') {
  invalidateCache();
  if (path === '/pin') {
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith('hub-draft:'))
        .forEach((key) => sessionStorage.removeItem(key));
    } catch {
      /* Storage may be disabled. */
    }
  }
  window.location.assign(path);
}
