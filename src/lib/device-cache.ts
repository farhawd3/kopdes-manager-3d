'use client';
/**
 * Cache data halaman di perangkat (IndexedDB) agar halaman yang pernah dibuka langsung tampil,
 * juga setelah aplikasi dimuat ulang. Isinya catatan kerja, jadi dihapus saat aplikasi dikunci
 * atau sesi berakhir. Bila IndexedDB tidak tersedia (mode privat, ditolak), semua fungsi diam.
 */
const DB_NAME = 'kopdes-cache';
const STORE = 'workspace';

let opening: Promise<IDBDatabase | null> | null = null;
function open() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  opening ??= new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return opening;
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  return open().then(
    (db) =>
      new Promise<T | undefined>((resolve) => {
        if (!db) return resolve(undefined);
        try {
          const request = action(db.transaction(STORE, mode).objectStore(STORE));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(undefined);
        } catch {
          resolve(undefined);
        }
      }),
  );
}

export const readDeviceCache = <T>(key: string) =>
  run<T>('readonly', (store) => store.get(key) as IDBRequest<T>);
export const writeDeviceCache = (key: string, value: unknown) =>
  run('readwrite', (store) => store.put(value, key));
export const clearDeviceCache = () => run('readwrite', (store) => store.clear());
