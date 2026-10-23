'use client';
import { useSyncExternalStore } from 'react';
import { jakartaTime } from './date';

const subscribeClock = (callback: () => void) => {
  const timer = window.setInterval(callback, 30_000);
  return () => window.clearInterval(timer);
};

/** Jam WIB "HH:MM", diperbarui tiap 30 detik; kosong saat render di server. */
export function useJakartaClock() {
  return useSyncExternalStore(
    subscribeClock,
    () => jakartaTime(),
    () => '',
  );
}

/** Sapaan sesuai jam WIB; "Halo" selama jam belum diketahui (render server). */
export function greeting(now: string) {
  if (!now) return 'Halo';
  const hour = Number(now.slice(0, 2));
  return hour < 11
    ? 'Selamat pagi'
    : hour < 15
      ? 'Selamat siang'
      : hour < 18
        ? 'Selamat sore'
        : 'Selamat malam';
}
