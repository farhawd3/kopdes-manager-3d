'use client';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

type Gesture = {
  id: string;
  pointer: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  handle: HTMLElement;
  active: boolean;
  target: string | null;
  timer?: ReturnType<typeof setTimeout>;
};
export type DragPreview = { id: string; x: number; y: number };

/** Hanya handle menahan sentuhan. Scroll badan kartu tidak memulai perubahan data. */
export function useDragSort(onDrop: (id: string, target: string) => void, disabled = false) {
  const root = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const frame = useRef<number | null>(null);
  const callback = useRef(onDrop);
  useEffect(() => {
    callback.current = onDrop;
  }, [onDrop]);
  const [preview, setPreview] = useState<DragPreview | null>(null);
  const [over, setOver] = useState<string | null>(null);

  function findTarget(x: number, y: number) {
    const element = document.elementFromPoint?.(x, y)?.closest<HTMLElement>('[data-drop-zone]');
    return element && root.current?.contains(element) ? element.dataset.dropZone || null : null;
  }
  function clear() {
    const current = gesture.current;
    gesture.current = null;
    if (current?.timer) clearTimeout(current.timer);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (current?.handle.hasPointerCapture?.(current.pointer))
      current.handle.releasePointerCapture(current.pointer);
    setPreview(null);
    setOver(null);
  }
  function scrollEdges() {
    const current = gesture.current;
    if (!current?.active) return;
    // Gulir kontainer papan horizontal dan kontainer halaman vertikal masing-masing.
    for (
      let node: HTMLElement | null = current.handle.parentElement;
      node;
      node = node.parentElement
    ) {
      const style = getComputedStyle(node);
      const area = node.getBoundingClientRect();
      const speed = (position: number, low: number, high: number) =>
        position < low + 40 ? -8 : position > high - 40 ? 8 : 0;
      if (/(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth)
        node.scrollLeft += speed(current.x, area.left, area.right);
      if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight)
        node.scrollTop += speed(current.y, area.top, area.bottom);
    }
    const page = document.scrollingElement;
    if (page && page.scrollHeight > window.innerHeight) {
      const delta = current.y < 40 ? -8 : current.y > window.innerHeight - 40 ? 8 : 0;
      if (delta) window.scrollBy(0, delta);
    }
    current.target = findTarget(current.x, current.y);
    setOver(current.target);
    frame.current = requestAnimationFrame(scrollEdges);
  }
  function activate(current: Gesture) {
    if (gesture.current !== current) return;
    current.active = true;
    current.target = findTarget(current.x, current.y);
    setPreview({ id: current.id, x: current.x, y: current.y });
    setOver(current.target);
    navigator.vibrate?.(10);
    frame.current = requestAnimationFrame(scrollEdges);
  }
  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && gesture.current) {
        event.preventDefault();
        const current = gesture.current;
        gesture.current = null;
        if (current.timer) clearTimeout(current.timer);
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        if (current.handle.hasPointerCapture?.(current.pointer))
          current.handle.releasePointerCapture(current.pointer);
        setPreview(null);
        setOver(null);
      }
    };
    window.addEventListener('keydown', cancel);
    return () => {
      window.removeEventListener('keydown', cancel);
      const current = gesture.current;
      gesture.current = null;
      if (current?.timer) clearTimeout(current.timer);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (current?.handle.hasPointerCapture?.(current.pointer))
        current.handle.releasePointerCapture(current.pointer);
    };
  }, []);
  function handle(id: string) {
    return {
      onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        event.stopPropagation();
        if (disabled || event.button !== 0 || event.isPrimary === false || gesture.current) return;
        const current: Gesture = {
          id,
          pointer: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          x: event.clientX,
          y: event.clientY,
          handle: event.currentTarget,
          active: false,
          target: null,
        };
        gesture.current = current;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        if (event.pointerType === 'mouse') activate(current);
        else current.timer = setTimeout(() => activate(current), 220);
      },
      onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
        const current = gesture.current;
        if (!current || current.pointer !== event.pointerId) return;
        current.x = event.clientX;
        current.y = event.clientY;
        if (!current.active) {
          if (Math.hypot(current.x - current.startX, current.y - current.startY) > 8) clear();
          return;
        }
        event.preventDefault();
        current.target = findTarget(current.x, current.y);
        setPreview({ id: current.id, x: current.x, y: current.y });
        setOver(current.target);
      },
      onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
        const current = gesture.current;
        if (!current || current.pointer !== event.pointerId) return;
        const target = current.active ? findTarget(event.clientX, event.clientY) : null;
        clear();
        if (target) callback.current(current.id, target);
      },
      onPointerCancel: clear,
      onLostPointerCapture: clear,
      onClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
      },
      onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
        event.stopPropagation();
      },
    };
  }
  function attachRoot(node: HTMLDivElement | null) {
    root.current = node;
  }
  return { root: attachRoot, preview, over, handle };
}
