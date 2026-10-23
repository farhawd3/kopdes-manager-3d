'use client';
import { useSyncExternalStore } from 'react';

/** Benar bila media query cocok; selalu salah saat render di server. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (callback) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', callback);
      return () => list.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
