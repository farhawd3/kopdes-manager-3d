'use client';
import { useEffect, useState } from 'react';

/**
 * Benar saat pengguna menggulir ke bawah, agar bilah melayang di HP minggir dan tidak menutupi isi
 * halaman; muncul lagi saat menggulir ke atas atau sampai di ujung halaman.
 */
export function useHideOnScroll(threshold = 8) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 24;
      if (y < 80 || atEnd) setHidden(false);
      else if (y - last > threshold) setHidden(true);
      else if (last - y > threshold) setHidden(false);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return hidden;
}
