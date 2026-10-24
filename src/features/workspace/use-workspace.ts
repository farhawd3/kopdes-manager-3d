'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Entity, Item } from '../records/schemas';
import {
  administrationEntities,
  logisticsEntities,
  operationEntities,
  routineEntities,
} from '../records/constants';
import { api, apiBatch, cacheGenerationNow, invalidateCache } from '@/lib/client';
import { readDeviceCache, writeDeviceCache } from '@/lib/device-cache';
import { pageEntities } from './scope';
import type { ListQuery } from '../records/query';
export type Workspace = Partial<Record<Entity, Item[]>>;
type Page = { items: Item[]; hasMore: boolean; nextOffset: number };
export type LoadScope = Pick<ListQuery, 'scope' | 'q' | 'from' | 'to' | 'project'>;
type WorkspaceCacheEntry = {
  data: Workspace;
  more: Partial<Record<Entity, number>>;
  operations: boolean;
  logistics?: boolean;
  administration?: boolean;
  routines?: boolean;
  /** Penanda versi data server saat entri dimuat (lihat /api/version). */
  version?: string;
};

const workspaceCache = new Map<string, WorkspaceCacheEntry>();
const MAX_CACHED_SCOPES = 24;

function cacheWorkspace(key: string, entry: WorkspaceCacheEntry) {
  workspaceCache.delete(key);
  workspaceCache.set(key, entry);
  while (workspaceCache.size > MAX_CACHED_SCOPES) {
    const oldest = workspaceCache.keys().next().value;
    if (oldest !== undefined) workspaceCache.delete(oldest);
  }
}

type Capabilities = {
  operations: boolean;
  logistics?: boolean;
  administration?: boolean;
  routines?: boolean;
};
// Kemampuan server hanya berubah setelah migrasi, jadi cukup diminta sekali per sesi browser; gagal tidak di-cache.
let capabilitiesRequest: Promise<Capabilities> | null = null;
export function loadCapabilities() {
  capabilitiesRequest ??= api<Capabilities>('capabilities').catch((error) => {
    capabilitiesRequest = null;
    throw error;
  });
  return capabilitiesRequest;
}

/** Jenis catatan halaman yang tabelnya sudah ada di server (migrasi yang belum dipasang dilewati). */
function availableEntities(slug: string, capabilities: Capabilities) {
  return pageEntities(slug)
    .filter((entity) => capabilities.operations || !operationEntities.includes(entity))
    .filter((entity) => capabilities.logistics || !logisticsEntities.includes(entity))
    .filter((entity) => capabilities.administration || !administrationEntities.includes(entity))
    .filter((entity) => capabilities.routines || !routineEntities.includes(entity));
}

/**
 * Muat data halaman lebih dulu (saat kursor/jari menyentuh menu) dengan saringan bawaan halaman,
 * sehingga saat halaman dibuka datanya sudah ada di cache baca.
 */
export function prefetchWorkspace(slug: string) {
  // Halaman Proyek membaca semua proyek (aktif dan riwayat); halaman lain hanya yang berjalan.
  const scope = slug === 'world' || slug === 'projects' ? 'all' : 'current';
  void loadCapabilities()
    .then((capabilities) =>
      apiBatch(
        availableEntities(slug, capabilities).map(
          (entity) => `${entity}?${new URLSearchParams({ limit: '50', offset: '0', scope })}`,
        ),
      ),
    )
    .catch(() => undefined);
}

// Penanda versi data: satu permintaan kecil dipakai bersama semua pemanggil dalam 2 detik.
let versionRequest: { at: number; generation: number; promise: Promise<string> } | null = null;
let seenVersion = '';
export function dataVersion() {
  // Setelah menyimpan (cache dibuang) versi lama tidak boleh dipakai ulang.
  if (
    versionRequest &&
    versionRequest.generation === cacheGenerationNow() &&
    Date.now() - versionRequest.at < 2000
  )
    return versionRequest.promise;
  const promise = api<{ version: string }>('version', undefined, 'GET', { bypassCache: true })
    .then(({ version }) => {
      // Data server berubah sejak terakhir dilihat: cache baca 60 detik ikut dibuang.
      if (seenVersion && version !== seenVersion) invalidateCache();
      seenVersion = version;
      return version;
    })
    .catch(() => {
      versionRequest = null;
      return '';
    });
  versionRequest = { at: Date.now(), generation: cacheGenerationNow(), promise };
  return promise;
}

export function invalidateWorkspaceCache(pattern?: string) {
  if (!pattern) {
    workspaceCache.clear();
    capabilitiesRequest = null;
  } else {
    for (const key of workspaceCache.keys()) {
      if (key.includes(pattern)) workspaceCache.delete(key);
    }
  }
}

export function useWorkspace(
  slug = 'home',
  scope: LoadScope = { scope: 'current' },
  record?: { entity: Entity; id: string },
) {
  const scopeKey = JSON.stringify(scope),
    recordKey = JSON.stringify(record);
  const cacheKey = `${slug}:${scopeKey}:${recordKey}`;
  const initialCache = workspaceCache.get(cacheKey);

  const [data, setData] = useState<Workspace>(() => initialCache?.data || {}),
    [loading, setLoading] = useState(() => !initialCache),
    [error, setError] = useState('');
  const [operations, setOperations] = useState(() => initialCache?.operations || false);
  const [logistics, setLogistics] = useState(() => initialCache?.logistics || false);
  const [administration, setAdministration] = useState(() => initialCache?.administration || false);
  const [routines, setRoutines] = useState(() => initialCache?.routines || false);
  const [more, setMore] = useState<Partial<Record<Entity, number>>>(() => initialCache?.more || {});
  const [fetching, setFetching] = useState<Entity | null>(null);
  const [renderedCacheKey, setRenderedCacheKey] = useState(cacheKey);
  if (renderedCacheKey !== cacheKey) {
    // Halaman atau saringan baru tidak boleh menampilkan data milik saringan sebelumnya.
    setRenderedCacheKey(cacheKey);
    setData(initialCache?.data || {});
    setMore(initialCache?.more || {});
    setOperations(initialCache?.operations || false);
    setLogistics(initialCache?.logistics || false);
    setAdministration(initialCache?.administration || false);
    setRoutines(initialCache?.routines || false);
    setLoading(!initialCache);
    setError('');
    setFetching(null);
  }
  const generation = useRef(0);
  const paginationRequest = useRef<number | null>(null);
  const pathFor = useCallback(
    (entity: Entity, offset = 0) => {
      const selection: LoadScope = JSON.parse(scopeKey);
      const params = new URLSearchParams({
        limit: '50',
        offset: String(offset),
        scope: slug === 'world' ? 'all' : selection.scope,
      });
      const primary = pageEntities(slug).filter(
        (name) => !['organization', 'workstreams'].includes(name),
      );
      if (entity === primary[0] || (slug === 'projects' && entity === 'workstreams')) {
        for (const key of ['q', 'from', 'to'] as const)
          if (selection[key]) params.set(key, selection[key]);
      }
      if (selection.project && ['work-items', 'milestones', 'checklist'].includes(entity))
        params.set('project', selection.project);
      return `${entity}?${params}`;
    },
    [scopeKey, slug],
  );
  const apply = useCallback((entry: WorkspaceCacheEntry) => {
    setData(entry.data);
    setMore(entry.more);
    setOperations(entry.operations);
    setLogistics(Boolean(entry.logistics));
    setAdministration(Boolean(entry.administration));
    setRoutines(Boolean(entry.routines));
    setError('');
    setLoading(false);
    window.dispatchEvent(new CustomEvent('hub-workspace', { detail: entry.data }));
  }, []);
  const load = useCallback(
    async (force = false) => {
      const current = ++generation.current;
      setFetching(null);
      try {
        // 1. Data dari perangkat tampil langsung (juga setelah aplikasi dimuat ulang).
        let cached = workspaceCache.get(cacheKey);
        if (!cached) {
          cached = await readDeviceCache<WorkspaceCacheEntry>(cacheKey);
          if (current !== generation.current) return;
          if (cached) {
            cacheWorkspace(cacheKey, cached);
            apply(cached);
          }
        }
        // 2. Tanya server apakah ada perubahan; sama = tidak perlu meminta data lagi.
        const version = await dataVersion();
        if (current !== generation.current) return;
        if (!force && version && cached?.version === version) return;
        const capabilities = await loadCapabilities();
        const entities = availableEntities(slug, capabilities);
        // Halaman pertama semua jenis catatan dalam satu permintaan (satu cek sesi di server).
        const firstPages = await apiBatch<Page>(entities.map((entity) => pathFor(entity)));
        const entries = await Promise.all(
          entities.map(async (entity, index) => {
            let page = firstPages[index];
            if (slug === 'world') {
              // Ringkasan, rak, dan jadwal harus membaca semua halaman, bukan hanya 50 catatan pertama.
              const rows = new Map(page.items.map((row) => [row.id, row]));
              let offset = 0;
              while (page.hasMore && current === generation.current) {
                if (page.nextOffset <= offset || page.nextOffset > 10000)
                  throw new Error(
                    'Catatan dunia belum dapat dimuat lengkap. Buka halaman operasional atau coba lagi.',
                  );
                offset = page.nextOffset;
                page = await api<Page>(pathFor(entity, offset));
                for (const row of page.items) rows.set(row.id, row);
              }
              page = { ...page, items: [...rows.values()] };
            }
            return [entity, page] as const;
          }),
        );
        if (current !== generation.current) return;
        const next: Workspace = Object.fromEntries(
          entries.map(([entity, page]) => [entity, page.items]),
        );
        const selected: { entity: Entity; id: string } | undefined = recordKey
          ? JSON.parse(recordKey)
          : undefined;
        if (selected && !next[selected.entity]?.some((row) => row.id === selected.id)) {
          const detail = await api<Page>(
            `${selected.entity}?id=${encodeURIComponent(selected.id)}`,
          );
          next[selected.entity] = [...(next[selected.entity] || []), ...detail.items];
        }
        if (current !== generation.current) return;
        const nextMore = Object.fromEntries(
          entries
            .filter(([, page]) => page.hasMore)
            .map(([entity, page]) => [entity, page.nextOffset]),
        );
        setData(next);
        setMore(nextMore);
        const entry: WorkspaceCacheEntry = {
          data: next,
          more: nextMore,
          operations: capabilities.operations,
          logistics: Boolean(capabilities.logistics),
          administration: Boolean(capabilities.administration),
          routines: Boolean(capabilities.routines),
          version,
        };
        cacheWorkspace(cacheKey, entry);
        void writeDeviceCache(cacheKey, entry);
        window.dispatchEvent(new CustomEvent('hub-workspace', { detail: next }));
        setOperations(capabilities.operations);
        setLogistics(Boolean(capabilities.logistics));
        setAdministration(Boolean(capabilities.administration));
        setRoutines(Boolean(capabilities.routines));
        setError('');
      } catch (e) {
        if (current === generation.current) {
          window.dispatchEvent(new CustomEvent('hub-workspace', { detail: null }));
          setError((e as Error).message);
        }
      } finally {
        if (current === generation.current) setLoading(false);
      }
    },
    [slug, pathFor, recordKey, cacheKey, apply],
  );
  // Muat ulang yang diminta pengguna atau setelah menyimpan selalu ke server, bukan cache baca 60 detik.
  const refresh = useCallback(() => {
    invalidateCache();
    return load(true);
  }, [load]);
  const loadMore = async (entity: Entity) => {
    if (
      loading ||
      fetching ||
      paginationRequest.current === generation.current ||
      more[entity] === undefined
    )
      return;
    const current = generation.current;
    paginationRequest.current = current;
    setFetching(entity);
    setError('');
    try {
      const page = await api<Page>(pathFor(entity, more[entity]));
      if (current !== generation.current) return;
      const existingIds = new Set((data[entity] || []).map((row) => row.id));
      const next = {
        ...data,
        [entity]: [
          ...(data[entity] || []),
          ...page.items.filter((row) => !existingIds.has(row.id)),
        ],
      };
      const nextMore = { ...more };
      if (page.hasMore) nextMore[entity] = page.nextOffset;
      else delete nextMore[entity];
      setData(next);
      setMore(nextMore);
      const entry: WorkspaceCacheEntry = {
        data: next,
        more: nextMore,
        operations,
        logistics,
        administration,
        routines,
        version: workspaceCache.get(cacheKey)?.version,
      };
      cacheWorkspace(cacheKey, entry);
      void writeDeviceCache(cacheKey, entry);
      window.dispatchEvent(new CustomEvent('hub-workspace', { detail: next }));
    } catch (e) {
      if (current === generation.current) setError((e as Error).message);
    } finally {
      if (paginationRequest.current === current) paginationRequest.current = null;
      if (current === generation.current) setFetching(null);
    }
  };
  useEffect(() => {
    // Data dari cache tampil langsung (tanpa kedip), lalu dimuat ulang dari server di belakang.
    const cached = workspaceCache.get(cacheKey);
    if (cached) {
      window.dispatchEvent(new CustomEvent('hub-workspace', { detail: cached.data }));
    } else {
      window.dispatchEvent(new CustomEvent('hub-workspace', { detail: null }));
    }
    // Batalkan pemasangan usang sebelum sempat meminta data (termasuk percobaan StrictMode).
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return load();
    });
    // Kembali ke tab ini: periksa versi lagi agar perubahan dari perangkat lain ikut tampil.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);
    const requestRef = generation;
    return () => {
      active = false;
      requestRef.current++;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load, cacheKey]);
  return {
    data,
    loading,
    error,
    refresh,
    operations,
    logistics,
    administration,
    routines,
    more,
    loadMore,
    fetching,
  };
}
