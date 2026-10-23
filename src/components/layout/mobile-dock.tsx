'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as motion from 'motion/react-m';
import { LayoutGrid, Plus } from 'lucide-react';
import { PageIcon } from '@/components/ui/icon';
import { DOCK, PAGES } from './nav';
import { activePage } from './sidebar';
import { cn } from '@/lib/utils';

const CAPSULE = { type: 'spring', stiffness: 460, damping: 36 } as const;

/**
 * Navigasi bawah HP: bilah putih melayang. Item aktif mengembang menjadi kapsul pastel berlabel
 * yang meluncur saat pindah tab; tombol tambah bulat di tengah.
 */
export function MobileDock({ onAdd, onMenu }: { onAdd: () => void; onMenu: () => void }) {
  const pathname = usePathname();
  const active = activePage(pathname);
  const inDock = active && DOCK.includes(active);
  const items = DOCK.map((id) => ({ id, label: PAGES[id].label, icon: PAGES[id].icon }));
  const renderItem = (id: string, label: string, icon: React.ReactNode, isActive: boolean, href?: string) => {
    const content = (
      <>
        {isActive && <motion.span layoutId="dock-capsule" transition={CAPSULE} className="absolute inset-0 rounded-full bg-accent" />}
        <span className="relative flex items-center gap-1.5">
          {icon}
          {isActive && (
            <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="text-[13px] font-bold">
              {label}
            </motion.span>
          )}
        </span>
      </>
    );
    const className = cn(
      'relative flex h-12 items-center justify-center rounded-full px-3.5 transition-colors',
      isActive ? 'text-accent-ink' : 'text-ink-3',
    );
    return href ? (
      <Link key={id} href={href} aria-current={isActive ? 'page' : undefined} aria-label={label} className={className}>
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
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex h-16 items-center justify-between rounded-full bg-surface px-2 shadow-float md:hidden"
    >
      {items.slice(0, 2).map((item) => renderItem(item.id, item.label, <PageIcon name={item.icon} className="size-[22px]" />, active === item.id, `/${item.id}`))}
      <button
        type="button"
        onClick={onAdd}
        aria-label="Tambah catatan"
        className="grid size-14 -translate-y-3 place-items-center rounded-full bg-action text-on-action shadow-float transition active:scale-95"
      >
        <Plus className="size-7" strokeWidth={2.4} />
      </button>
      {items.slice(2).map((item) => renderItem(item.id, item.label, <PageIcon name={item.icon} className="size-[22px]" />, active === item.id, `/${item.id}`))}
      {renderItem('menu', 'Menu', <LayoutGrid className="size-[22px]" />, Boolean(active && !inDock))}
    </nav>
  );
}
