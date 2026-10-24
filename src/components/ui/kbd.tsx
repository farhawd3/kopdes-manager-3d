import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

/** Tombol papan ketik pada petunjuk pintasan; satu bentuk di bilah atas, palet, Dunia 3D, dan daftar pintasan. */
export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'inline-grid h-[22px] min-w-[22px] place-items-center rounded-md bg-surface px-1.5 font-sans text-[11px] leading-none font-bold text-ink-2 shadow-[inset_0_-1.5px_0_var(--line-strong)] ring-1 ring-line-strong',
        className,
      )}
      {...props}
    />
  );
}
