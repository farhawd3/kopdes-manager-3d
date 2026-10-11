'use client';
import { useCallback, useEffect, useState } from 'react';

/** Grafik dimulai sekali ketika terlihat; fallback dan reduced-motion langsung ke hasil. */
export function useMotionEntry<T extends Element>() {
  const [node, setNode] = useState<T | null>(null);
  const [entered, setEntered] = useState(false);
  const ref = useCallback((element: T | null) => { setNode(element); }, []);
  useEffect(() => {
    const element = node;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      const timeout = setTimeout(() => setEntered(true), 0);
      return () => clearTimeout(timeout);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setEntered(true); observer.disconnect(); }
    }, { threshold: 0.05 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [node]);
  return { ref, entered };
}
