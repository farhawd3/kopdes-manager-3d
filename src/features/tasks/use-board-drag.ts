'use client';
import { useEffect, useRef, useState } from 'react';

type DragState = { id: string; ghost: HTMLElement; offsetX: number; offsetY: number; over: string | null };

/**
 * Seret-lepas kartu antar kolom untuk mouse, sentuh, dan pena. Di layar sentuh kartu harus
 * ditahan sebentar agar gulir tetap normal. Kolom tujuan ditandai `data-drop="<nilai>"`.
 */
export function useBoardDrag(onDrop: (id: string, column: string) => void) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const state = useRef<DragState | null>(null);
  const pending = useRef<{ id: string; card: HTMLElement; x: number; y: number; touch: boolean; timer: number } | null>(null);
  const drop = useRef(onDrop);
  useEffect(() => {
    drop.current = onDrop;
  });

  useEffect(() => {
    const begin = (x: number, y: number) => {
      const start = pending.current;
      if (!start) return;
      const rect = start.card.getBoundingClientRect();
      const ghost = start.card.cloneNode(true) as HTMLElement;
      Object.assign(ghost.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        zIndex: '80',
        pointerEvents: 'none',
        transform: 'rotate(2deg) scale(1.03)',
        boxShadow: 'var(--shadow-float)',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      });
      document.body.appendChild(ghost);
      document.body.style.cursor = 'grabbing';
      state.current = { id: start.id, ghost, offsetX: x - rect.left, offsetY: y - rect.top, over: null };
      setDragging(start.id);
      navigator.vibrate?.(8);
    };
    const move = (event: PointerEvent) => {
      const start = pending.current;
      if (!start) return;
      if (!state.current) {
        const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
        if (start.touch) {
          if (distance > 10) {
            window.clearTimeout(start.timer);
            pending.current = null;
          }
          return;
        }
        if (distance < 6) return;
        begin(event.clientX, event.clientY);
      }
      const drag = state.current!;
      drag.ghost.style.left = `${event.clientX - drag.offsetX}px`;
      drag.ghost.style.top = `${event.clientY - drag.offsetY}px`;
      const target = (document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-drop]');
      const column = target?.dataset.drop ?? null;
      if (column !== drag.over) {
        drag.over = column;
        setOver(column);
      }
      // Gulir otomatis saat kartu dibawa ke tepi papan atau layar.
      const board = target?.closest<HTMLElement>('[data-board]') ?? document.querySelector<HTMLElement>('[data-board]');
      if (board) {
        const box = board.getBoundingClientRect();
        if (event.clientX < box.left + 48) board.scrollLeft -= 14;
        else if (event.clientX > box.right - 48) board.scrollLeft += 14;
      }
      if (event.clientY < 80) window.scrollBy(0, -12);
      else if (event.clientY > window.innerHeight - 80) window.scrollBy(0, 12);
    };
    const end = (cancel: boolean) => {
      const start = pending.current;
      if (start) window.clearTimeout(start.timer);
      pending.current = null;
      const drag = state.current;
      if (!drag) return;
      state.current = null;
      drag.ghost.remove();
      document.body.style.cursor = '';
      setDragging(null);
      setOver(null);
      if (!cancel && drag.over) drop.current(drag.id, drag.over);
      // Klik yang menyusul akhir seret tidak boleh membuka laci kartu.
      const swallow = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
      };
      window.addEventListener('click', swallow, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 300);
    };
    const up = () => end(false);
    const cancel = () => end(true);
    const key = (event: KeyboardEvent) => event.key === 'Escape' && end(true);
    const touchMove = (event: TouchEvent) => {
      if (state.current) event.preventDefault();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', key);
    document.addEventListener('touchmove', touchMove, { passive: false });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', key);
      document.removeEventListener('touchmove', touchMove);
    };
  }, []);

  const handle = (id: string) => (event: React.PointerEvent<HTMLElement>) => {
    if (event.button > 0 || (event.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    const card = event.currentTarget;
    const touch = event.pointerType !== 'mouse';
    pending.current = {
      id,
      card,
      x: event.clientX,
      y: event.clientY,
      touch,
      timer: touch
        ? window.setTimeout(() => {
            if (pending.current?.id !== id) return;
            // Tahan selesai: perlakukan seperti mouse yang sudah bergerak, lalu mulai seret di posisi jari.
            pending.current.touch = false;
            pending.current.x = event.clientX - 10;
            window.dispatchEvent(new PointerEvent('pointermove', { clientX: event.clientX, clientY: event.clientY }));
          }, 320)
        : 0,
    };
  };
  return { dragging, over, handle };
}
