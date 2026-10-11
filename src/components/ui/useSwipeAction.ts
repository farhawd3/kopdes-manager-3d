'use client';
import { useRef, type PointerEvent } from 'react';

/** Swipe horizontal pada badan kartu; kontrol form dan scroll vertikal dikecualikan. */
export function useSwipeAction(onRight: (id: string) => void, onLeft: (id: string) => void, disabled: boolean) {
  const gesture = useRef<{ id: string; pointer: number; x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (disabled || event.pointerType === 'mouse' || window.innerWidth >= 768 || !event.isPrimary) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest('button, a, input, select, textarea, [role="listbox"]')) return;
      const id = target.closest<HTMLElement>('[data-swipe-task]')?.dataset.swipeTask;
      if (id) gesture.current = { id, pointer: event.pointerId, x: event.clientX, y: event.clientY };
    },
    onPointerUp(event: PointerEvent<HTMLDivElement>) {
      const current = gesture.current;
      gesture.current = null;
      if (!current || disabled || current.pointer !== event.pointerId) return;
      const dx = event.clientX - current.x, dy = event.clientY - current.y;
      if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      suppressClickUntil.current = Date.now() + 500;
      if (dx > 0) onRight(current.id); else onLeft(current.id);
    },
    onPointerCancel() { gesture.current = null; },
    onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
      if (Date.now() < suppressClickUntil.current) { suppressClickUntil.current = 0; event.preventDefault(); event.stopPropagation(); }
    },
  };
}
