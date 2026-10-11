'use client';
import { forwardRef, useEffect, useRef, type DialogHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** Permukaan dialog bersama; pemanggil lama mempertahankan siklus buka/tutupnya. */
export const DialogSurface = forwardRef<HTMLDialogElement, DialogHTMLAttributes<HTMLDialogElement>>(
  function DialogSurface({ className, ...props }, ref) {
    return <dialog {...props} ref={ref} className={cn('ui-modal', className)} />;
  },
);
export function Modal({ onDismiss, children, ...props }: DialogHTMLAttributes<HTMLDialogElement> & { onDismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement;
    node?.showModal();
    return () => { node?.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, []);
  return <DialogSurface {...props} ref={ref} onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onDismiss(); }} onClick={(event) => { if (event.target === event.currentTarget) { event.stopPropagation(); onDismiss(); } }}>{children}</DialogSurface>;
}
