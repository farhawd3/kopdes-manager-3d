'use client';
import { DropdownMenu, Popover } from 'radix-ui';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

/**
 * Permukaan menu dan popover: kartu putih melayang yang tumbuh dari tombol pemicunya
 * (asal gerak dari Radix), isinya menyusul berurutan (`.menu` di globals.css).
 */
const FLOATING = 'menu z-50 bg-surface shadow-float ring-1 ring-line/70 outline-none';

export const MENU_ITEM =
  'flex h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-2 outline-none transition-colors select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink [&_svg]:size-[18px] [&_svg]:shrink-0';

export function MenuContent({
  className,
  sideOffset = 8,
  collisionPadding = 12,
  ...props
}: ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          FLOATING,
          'min-w-52 origin-(--radix-dropdown-menu-content-transform-origin) rounded-2xl p-1.5',
          className,
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  );
}

/** Butir menu; `danger` untuk tindakan yang membatalkan atau menghapus. */
export function MenuItem({
  className,
  danger,
  ...props
}: ComponentProps<typeof DropdownMenu.Item> & { danger?: boolean }) {
  return (
    <DropdownMenu.Item
      className={cn(
        MENU_ITEM,
        danger && 'text-late-ink data-[highlighted]:bg-late data-[highlighted]:text-late-ink',
        className,
      )}
      {...props}
    />
  );
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="mx-1 my-1 h-px bg-line" />;
}

export function PopoverContent({
  className,
  sideOffset = 10,
  collisionPadding = 16,
  ...props
}: ComponentProps<typeof Popover.Content>) {
  return (
    <Popover.Portal>
      <Popover.Content
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          FLOATING,
          'origin-(--radix-popover-content-transform-origin) rounded-3xl',
          className,
        )}
        {...props}
      />
    </Popover.Portal>
  );
}
