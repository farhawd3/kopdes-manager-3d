'use client';
import { useSyncExternalStore } from 'react';
const eventName = 'kopdes-preference';
// Private browsing can reject writes; keep the user's choice for this session.
const temporaryPreferences = new Map<string, string>();
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(eventName, callback);
  };
}
export function usePreference(key: string, fallback: string): [string, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      const temporary = temporaryPreferences.get(key);
      if (temporary !== undefined) return temporary;
      try {
        return localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    () => fallback,
  );
  return [
    value,
    (next) => {
      try {
        localStorage.setItem(key, next);
        temporaryPreferences.delete(key);
      } catch {
        temporaryPreferences.set(key, next);
      }
      window.dispatchEvent(new Event(eventName));
    },
  ];
}
