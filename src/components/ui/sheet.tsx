'use client';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Laci untuk membuat dan mengubah data: panel kanan di tablet/laptop, lembar bawah di HP.
 * Menggantikan semua modal formulir lama; konteks halaman tetap terlihat di belakangnya.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  headerExtra,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  headerExtra?: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay fixed inset-0 z-50 bg-[var(--scrim)] backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            'sheet fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[1.75rem] bg-surface shadow-float outline-none',
            'md:inset-y-3 md:right-3 md:left-auto md:max-h-none md:w-[min(30rem,calc(100vw-1.5rem))] md:rounded-[1.75rem]',
            wide && 'md:w-[min(44rem,calc(100vw-1.5rem))]',
          )}
        >
          <span className="mx-auto mt-2.5 h-1.5 w-11 shrink-0 rounded-full bg-line-strong md:hidden" aria-hidden="true" />
          <header className="flex items-start gap-3 px-5 pt-4 pb-3 md:px-6 md:pt-6">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-xl font-bold tracking-tight text-ink">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-ink-3">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">Formulir</Dialog.Description>
              )}
            </div>
            {headerExtra}
            <Dialog.Close className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-3 transition hover:bg-surface-3 hover:text-ink" aria-label="Tutup">
              <X className="size-5" />
            </Dialog.Close>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-6">{children}</div>
          {footer && (
            <footer className="flex items-center gap-2 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
              {footer}
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
