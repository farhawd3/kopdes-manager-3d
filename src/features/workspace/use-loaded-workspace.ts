'use client';
import { useSyncExternalStore } from 'react';
import type { Workspace } from './use-workspace';

// Data yang sudah dimuat halaman aktif; kerangka (pencarian, profil) membacanya tanpa meminta ulang ke server.
let latest: Workspace = {};
const EMPTY: Workspace = {};
const listeners = new Set<() => void>();
if (typeof window !== 'undefined')
  window.addEventListener('hub-workspace', (event) => {
    const detail = (event as CustomEvent<Workspace | null>).detail;
    if (detail) latest = { ...latest, ...detail };
    listeners.forEach((listener) => listener());
  });

export function useLoadedWorkspace(): Workspace {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => latest,
    // Server dan hidrasi pertama selalu kosong agar HTML sama; data masuk sesudahnya.
    () => EMPTY,
  );
}

export function organizationInfo(data: Workspace) {
  const org = data.organization?.[0]?.data;
  return {
    name: String(org?.title || '').trim(),
    manager: String(org?.manager || '').trim(),
  };
}
