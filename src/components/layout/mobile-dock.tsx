'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as motion from 'motion/react-m';
import { LayoutGrid, Plus } from 'lucide-react';
import { PageIcon } from '@/components/ui/icon';
import { DOCK, PAGES } from './nav';
import { activePage } from './sidebar';
import { cn } from '@/lib/utils';
import { useHideOnScroll } from '@/lib/use-hide-on-scroll';

const CAPSULE = { type: 'spring', stiffness: 460, damping: 36 } as const;

/**
 * Navigasi bawah HP: bilah putih melayang. Item aktif mengembang menjadi kapsul pastel berlabel
 * yang meluncur saat pindah tab; tombol tambah koral (warna logo) di tengah. Bilah minggir saat
 * menggulir ke bawah supaya tidak menutupi isi halaman.
 */
export function MobileDock({
  onAdd,
  onMenu,
  adding,
}: {
  onAdd: () => void;
  onMenu: () => void;
  adding?: boolean;
}) {
  const pathname = usePathname();
  const hidden = useHideOnScroll();
  const active = activePage(pathname);
  const inDock = active && DOCK.includes(active);
  const items = DOCK.map((id) => ({ id, label: PAGES[id].label, icon: PAGES[id].icon }));
  const renderItem = (
    id: string,
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    href?: string,
  ) => {
    const content = (
      <>
        {isActive && (
          <motion.span
            layoutId="dock-capsule"
            transition={CAPSULE}
            className="absolute inset-0 rounded-[18px] bg-accent"
          />
        )}
        <span className="relative flex items-center gap-1.5">
          {icon}
          {isActive && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[13px] font-bold"
            >
              {label}
            </motion.span>
          )}
        </span>
      </>
    );
    const className = cn(
      'relative flex h-12 min-w-12 items-center justify-center rounded-[18px] px-3.5 transition-colors',
      isActive ? 'text-accent-ink' : 'text-ink-3',
    );
    return href ? (
      <Link
        key={id}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
        className={className}
      >
        {content}
      </Link>
    ) : (
      <button key={id} type="button" onClick={onMenu} aria-label={label} className={className}>
        {content}
      </button>
    );
  };
  return (
    <nav
      aria-label="Navigasi utama"
      data-hidden={hidden || undefined}
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex h-[68px] max-w-[26rem] items-center justify-between rounded-[26px] bg-surface/95 px-2 shadow-float ring-1 ring-line/70 backdrop-blur-md dark:bg-surface-2/95 dark:ring-line-strong transition-transform duration-300 ease-[var(--ease-out)] data-[hidden]:translate-y-[calc(100%+2rem)] md:hidden"
    >
      {items
        .slice(0, 2)
        .map((item) =>
          renderItem(
            item.id,
            item.label,
            <PageIcon name={item.icon} className="size-[22px]" />,
            active === item.id,
            `/${item.id}`,
          ),
        )}
      <button
        type="button"
        onClick={onAdd}
        aria-label="Tambah catatan"
        aria-expanded={adding}
        className="grid size-[52px] shrink-0 place-items-center rounded-[18px] bg-action text-on-action shadow-[0_10px_22px_-8px_var(--action)] transition hover:bg-action-hover active:scale-95"
      >
        <Plus
          className={cn('size-6 transition-transform duration-300', adding && 'rotate-45')}
          strokeWidth={2.6}
        />
      </button>
      {items
        .slice(2)
        .map((item) =>
          renderItem(
            item.id,
            item.label,
            <PageIcon name={item.icon} className="size-[22px]" />,
            active === item.id,
            `/${item.id}`,
          ),
        )}
      {renderItem(
        'menu',
        'Menu',
        <LayoutGrid className="size-[22px]" />,
        Boolean(active && !inDock),
      )}
    </nav>
  );
}
