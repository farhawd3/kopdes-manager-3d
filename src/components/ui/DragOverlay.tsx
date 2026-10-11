'use client';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { DragPreview } from './useDragSort';
export function DragOverlay({ preview, title }: { preview: DragPreview | null; title: string }) {
  if (!preview) return null;
  return createPortal(
    <div
      className="ui-drag-overlay"
      aria-hidden
      style={{ '--drag-x': `${preview.x}px`, '--drag-y': `${preview.y}px` } as CSSProperties}
    >
      {title}
    </div>,
    document.body,
  );
}
