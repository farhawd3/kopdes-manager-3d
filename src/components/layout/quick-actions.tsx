'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarPlus,
  ClipboardCheck,
  FilePlus2,
  ListPlus,
  NotebookPen,
  PackagePlus,
  PiggyBank,
  ReceiptText,
  ShieldAlert,
  UserPlus,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import type { Tone } from '@/lib/tones';

type Action = { label: string; href: string; icon: LucideIcon; tone: Tone; key?: string };

/** Pintasan membuat catatan; semuanya hanya membuka formulir di halaman tujuan, tidak menulis data. */
export const QUICK_ACTIONS: { group: string; items: Action[] }[] = [
  {
    group: 'Pekerjaan',
    items: [
      { label: 'Tugas', href: '/tasks?new=1', icon: ListPlus, tone: 'lavender', key: '1' },
      { label: 'Agenda', href: '/agenda?new=1', icon: CalendarPlus, tone: 'sky', key: '2' },
      { label: 'Kegiatan', href: '/notes?new=1', icon: NotebookPen, tone: 'mint', key: '3' },
      {
        label: 'Laporan kerja',
        href: '/notes?tab=reports&new=1',
        icon: FilePlus2,
        tone: 'peach',
        key: '4',
      },
      {
        label: 'Risiko',
        href: '/projects?tab=risks&new=1',
        icon: ShieldAlert,
        tone: 'rose',
        key: '5',
      },
    ],
  },
  {
    group: 'Buku koperasi',
    items: [
      {
        label: 'Kas masuk',
        href: '/cash?new=1&direction=masuk',
        icon: ArrowDownLeft,
        tone: 'mint',
        key: '6',
      },
      {
        label: 'Kas keluar',
        href: '/cash?new=1&direction=keluar',
        icon: ArrowUpRight,
        tone: 'rose',
        key: '7',
      },
      { label: 'Anggota', href: '/members?new=1', icon: UserPlus, tone: 'sky', key: '8' },
      { label: 'Barang', href: '/goods?new=1', icon: PackagePlus, tone: 'peach', key: '9' },
      {
        label: 'Stok opname',
        href: '/goods?tab=counts&new=1',
        icon: ClipboardCheck,
        tone: 'lemon',
      },
    ],
  },
  {
    group: 'Usaha harian',
    items: [
      { label: 'Penjualan', href: '/store?tab=sales&new=1', icon: ReceiptText, tone: 'lavender' },
      { label: 'Simpanan', href: '/members?tab=savings&new=1', icon: PiggyBank, tone: 'mint' },
      { label: 'Absensi', href: '/team?tab=attendance&new=1', icon: UserCheck, tone: 'sky' },
    ],
  },
];

export function QuickActionsPanel({ onPick }: { onPick: () => void }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const action = QUICK_ACTIONS.flatMap((group) => group.items).find(
        (item) => item.key === event.key,
      );
      if (!action) return;
      event.preventDefault();
      onPick();
      router.push(action.href);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPick, router]);
  return (
    <div className="flex flex-col gap-4">
      {QUICK_ACTIONS.map((group) => (
        <section key={group.group}>
          <h3 className="mb-2 text-xs font-bold tracking-wide text-ink-3 uppercase">
            {group.group}
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {group.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onPick}
                data-tone={item.tone}
                className="group relative flex flex-col items-start gap-2 rounded-2xl bg-tone p-3 text-tone-ink transition duration-300 hover:-translate-y-0.5 hover:shadow-card"
              >
                <item.icon className="size-5" aria-hidden="true" />
                <span className="text-[13px] leading-tight font-bold">{item.label}</span>
                {item.key && (
                  <kbd className="absolute top-2 right-2 hidden rounded-md bg-surface/70 px-1.5 text-[10px] font-bold sm:block">
                    {item.key}
                  </kbd>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
