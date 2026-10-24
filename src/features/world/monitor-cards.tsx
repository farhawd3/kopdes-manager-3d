'use client';
// Kartu melayang Dunia 3D: putih bersih, sudut 14–18 px, warna dari token aplikasi. Komponen
// generik; isi datanya disusun MonitoringDashboard. Kelas bersama (kartu, tombol, nada) ada di
// sini agar semua kartu dunia memakai bentuk yang sama.
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tone } from './monitor-data';
import { Icon3D, ItemThumb, type Icon3DKind, type ThumbKind } from '@/features/world/icon-3d';

export const CARD = 'rounded-[16px] border border-line bg-surface shadow-card';
/** Panggung 3D di antara bilah atas dan dok; menyempit saat inspektur terbuka. */
export const STAGE =
  'absolute inset-x-0 top-(--mt-top) bottom-[88px] group-data-[panel]/root:right-[396px] max-lg:group-data-[panel]/root:right-[344px] max-md:bottom-[calc(88px+env(safe-area-inset-bottom))] max-md:group-data-[panel]/root:right-0 max-md:group-data-[panel]/root:bottom-[calc(44dvh+100px+env(safe-area-inset-bottom))]';
/** Kartu melayang kecil (menu, daftar lokasi) di bawah pemicunya; di ponsel selebar layar. */
export const POP =
  'absolute top-[calc(100%+8px)] right-0 z-9 min-w-[260px] p-1.5 max-md:fixed max-md:top-[calc(var(--mt-top)+6px)] max-md:right-2.5 max-md:left-2.5 max-md:w-auto max-md:min-w-0';
const BTN_BASE =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[10px] border border-line bg-surface font-semibold transition-[border-color,color,background-color] duration-150 hover:border-line-strong hover:text-accent-strong';
export const BTN = cn(BTN_BASE, 'px-3.5 disabled:cursor-wait disabled:opacity-60');
export const BTN_PRIMARY = cn(
  BTN,
  'border-action bg-action text-on-action shadow-[0_6px_14px_color-mix(in_srgb,var(--accent-strong)_25%,transparent)] hover:bg-action-hover hover:text-on-action',
);
export const ICON_BTN = cn(BTN_BASE, 'relative w-10 min-w-10 p-0 text-ink-3');
export const ICON_BTN_SMALL = cn(ICON_BTN, 'w-8 min-w-8 min-h-8 rounded-[8px]');
/** Teks kosong; di dalam inspektur diberi ruang lebih lega. */
export const EMPTY =
  'leading-[1.6] text-ink-3 in-[#world-inspector]:px-1 in-[#world-inspector]:py-5 in-[#world-inspector]:leading-[1.65]';
export const NOTE = 'rounded-[10px] bg-surface-2 text-[12px] leading-[1.5] text-ink-2';
export const NOTE_LINK = '[&_a]:font-semibold [&_a]:text-accent-strong [&_a]:underline';
export const STATUS = 'mt-3.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-3';
/** Tombol aksi panel selebar panel: satu tombol penuh, dua tombol berbagi rata. */
export const ACTIONS = 'mt-3 grid auto-cols-fr grid-flow-col gap-2 [&>button]:min-h-11';
/** Judul kecil di kanan kepala pelacak/daftar; disembunyikan di ponsel. */
export const HEAD_NOTE = 'ml-auto truncate font-semibold text-ink-3 max-md:hidden';
export const HEAD_TILE = 'size-[34px] rounded-[10px]';
export const TRACKER_HEAD = 'flex min-w-0 items-center gap-2.5';
export const TRACKER_TITLE = 'text-[15px] font-extrabold tracking-[-0.2px] whitespace-nowrap';
export const TRACKER_BODY = 'mt-3 flex flex-col items-stretch gap-5';

const PILL_TONE: Record<Tone, string> = {
  biru: 'bg-accent text-accent-ink',
  hijau: 'bg-done text-done-ink',
  kuning: 'bg-warn text-warn-ink',
  merah: 'bg-late text-late-ink',
  abu: 'bg-surface-3 text-ink-3',
};
export const TEXT_TONE: Record<Tone, string> = {
  biru: 'text-accent-strong',
  hijau: 'text-done-ink',
  kuning: 'text-warn-ink',
  merah: 'text-late-ink',
  abu: 'text-ink-3',
};
const BAR_FILL: Partial<Record<Tone, string>> = {
  hijau: 'bg-done-bar',
  kuning: 'bg-warn-bar',
  merah: 'bg-late-ink',
};

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[7px] px-[9px] py-[3px] text-[11px] leading-[1.45] font-semibold whitespace-nowrap',
        PILL_TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Bilah progres tipis; `width` = lebar isian (mis. "40%"). */
export function Bar({
  width,
  tone,
  className,
}: {
  width: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn('block h-[5px] overflow-hidden rounded-[99px] bg-surface-3', className)}
      aria-hidden="true"
    >
      <i
        className={cn(
          'block h-full rounded-[inherit]',
          (tone && BAR_FILL[tone]) || 'bg-accent-strong',
        )}
        style={{ width }}
      />
    </span>
  );
}

/** Ikon 3D dalam pembungkus yang hanya mengatur posisi (ikon membawa ubinnya sendiri). */
export function IconTile({
  icon,
  size = 30,
  className,
}: {
  icon: Icon3DKind;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn('grid shrink-0 place-items-center', className)} aria-hidden="true">
      <Icon3D kind={icon} size={size} className="overflow-visible" />
    </span>
  );
}

/** Popover sederhana: tutup saat klik di luar atau Escape, fokus kembali ke pemicu. */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  return { open, setOpen, root, trigger };
}

export type KpiChip = { text: string; tone: Tone };
export function KpiCard({
  icon,
  label,
  value,
  chip,
  foot,
  onClick,
}: {
  icon: Icon3DKind;
  label: string;
  value: string;
  chip?: KpiChip;
  foot: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        CARD,
        'flex w-full min-w-0 items-center gap-3 p-4 text-left transition-[transform,box-shadow] duration-150 ease-[ease] disabled:cursor-default max-xl:gap-2.5 not-disabled:hover:shadow-[0_16px_36px_color-mix(in_srgb,var(--ink)_13%,transparent)] motion-safe:not-disabled:hover:-translate-y-0.5',
      )}
      onClick={onClick}
      disabled={!onClick}
    >
      <IconTile icon={icon} size={34} className="max-xl:size-10" />
      <span className="grid min-w-0">
        <small className="text-[12px] font-semibold text-ink-2">{label}</small>
        <span className="flex items-baseline gap-2">
          <strong className="text-[24px] leading-[1.2] font-extrabold tracking-[-0.6px] tabular-nums max-xl:text-[20px]">
            {value}
          </strong>
          {chip && (
            <em className={cn('text-[11px] font-bold whitespace-nowrap', TEXT_TONE[chip.tone])}>
              {chip.text}
            </em>
          )}
        </span>
        <span className="truncate text-[11px] text-ink-3">{foot}</span>
      </span>
    </button>
  );
}

export type Stat = { label: string; value: string; total?: string; bar?: number; tone?: Tone };
/** Kotak statistik 2 × 2: label kecil, angka tebal "x / y", bilah progres berwarna. */
export function Stats({ items }: { items: Stat[] }) {
  return (
    <div className="mt-3 grid grid-cols-[1fr_1fr] gap-2">
      {items.map((s) => (
        <div key={s.label} className="rounded-[12px] border border-line bg-surface px-3 py-2.5">
          <small className="block text-[11px] font-semibold text-ink-3">{s.label}</small>
          <strong className="mt-0.5 mb-1.5 block text-[18px] font-extrabold tracking-[-0.4px] tabular-nums max-md:text-[16px]">
            {s.value}
            {s.total && <span className="text-[12px] font-semibold text-ink-3"> / {s.total}</span>}
          </strong>
          {s.bar !== undefined && (
            <Bar
              tone={s.tone || 'biru'}
              width={`${Math.round(Math.max(0, Math.min(1, s.bar)) * 100)}%`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function PanelHead({
  icon,
  eyebrow,
  title,
  sub,
  href,
  onClose,
}: {
  icon: Icon3DKind;
  eyebrow: string;
  title: string;
  sub?: string;
  href?: string;
  onClose?: () => void;
}) {
  const action = cn(ICON_BTN, 'w-[34px] min-w-[34px] min-h-[34px] rounded-[9px]');
  // Tautan mewarisi warna teks kepala (bukan abu tombol ikon), sama seperti tampilan sebelumnya.
  const link = cn(action, 'text-inherit');
  return (
    <header className="flex items-start gap-3">
      <IconTile icon={icon} size={36} />
      <span className="min-w-0 flex-1">
        <small className="block text-[10px] font-extrabold tracking-[0.8px] text-accent-strong">
          {eyebrow}
        </small>
        <h2 className="text-[17px] leading-[1.3] font-extrabold tracking-[-0.3px]">{title}</h2>
        {sub && <em className="mt-px block text-[12px] leading-[1.45] text-ink-3">{sub}</em>}
      </span>
      <span className="flex gap-1">
        {href && (
          <Link className={link} href={href} aria-label={`Buka halaman ${title}`}>
            <ArrowUpRight size={16} />
          </Link>
        )}
        {onClose && (
          <button type="button" className={action} onClick={onClose} aria-label="Tutup pilihan">
            <X size={16} />
          </button>
        )}
      </span>
    </header>
  );
}

/** Judul bagian dalam panel dengan keterangan kecil di kanan (mis. "satuan"). */
export function Section({ title, meta }: { title: string; meta?: string }) {
  // Berjarak dari isi di atasnya (tombol, angka, saringan); di awal kartu tidak perlu jarak.
  return (
    <h3 className="flex items-baseline justify-between gap-2 text-[13px] font-extrabold text-ink not-first:mt-5">
      {title}
      {meta && <small className="text-[11px] font-semibold text-ink-3">{meta}</small>}
    </h3>
  );
}

/** Tautan ke halaman operasional terkait, berupa pil kecil di bawah panel. */
export function Links({ items }: { items: { href: string; label: string; isNew?: boolean }[] }) {
  if (!items.length) return null;
  return (
    <nav
      className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3"
      aria-label="Halaman terkait"
    >
      {items.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            'inline-flex min-h-8 items-center gap-1 rounded-[8px] bg-accent px-2.5 text-[12px] font-bold text-accent-ink hover:bg-accent',
            l.isNew &&
              'bg-action text-on-action shadow-[0_4px_10px_color-mix(in_srgb,var(--accent-strong)_25%,transparent)] hover:bg-action-hover',
          )}
        >
          {l.isNew && <Plus size={13} aria-hidden="true" />}
          {l.label}
          {!l.isNew && <ArrowUpRight size={13} aria-hidden="true" />}
        </Link>
      ))}
    </nav>
  );
}

export type RowView = {
  key: string;
  title: string;
  sub: string;
  pill?: string;
  tone?: Tone;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  bar?: number;
  /** Teks kecil di samping bilah, mis. "2/6". */
  barText?: string;
  icon?: Icon3DKind;
  thumb?: ThumbKind;
  /** Inisial nama sebagai avatar bila baris mewakili orang. */
  avatar?: string;
  value?: string;
  unit?: string;
};
const ROW =
  'flex min-h-12 w-full items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-1.5 py-[7px] text-left hover:bg-accent aria-pressed:bg-accent';
const ROW_ICON = 'grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2';
export function Rows({ rows, empty }: { rows: RowView[]; empty: string }) {
  if (!rows.length) return <p className={EMPTY}>{empty}</p>;
  return (
    <ul className="[&>li+li]:border-t [&>li+li]:border-line">
      {rows.map((r) => {
        const body = (
          <>
            {r.thumb ? (
              <span className={ROW_ICON} aria-hidden="true">
                <ItemThumb kind={r.thumb} size={30} />
              </span>
            ) : r.icon ? (
              <span className={ROW_ICON} aria-hidden="true">
                <Icon3D kind={r.icon} size={26} />
              </span>
            ) : null}
            {r.avatar && (
              <span
                className="grid size-8 shrink-0 place-items-center rounded-[50%] bg-accent text-[12px] font-extrabold text-accent-ink"
                aria-hidden="true"
              >
                {r.avatar}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-[13px] font-semibold">{r.title}</strong>
              <small className="block truncate text-[11px] text-ink-3">{r.sub}</small>
            </span>
            {r.value !== undefined && (
              <span className="text-right text-[13px] font-extrabold tabular-nums">
                {r.value}
                {r.unit && (
                  <small className="block text-[10px] font-medium text-ink-3">{r.unit}</small>
                )}
              </span>
            )}
            {r.pill && <Pill tone={r.tone || 'abu'}>{r.pill}</Pill>}
            {r.bar !== undefined && (
              <span className="grid w-[46px] shrink-0 gap-0.5 text-right">
                <Bar
                  tone={r.tone === 'kuning' || r.tone === 'merah' ? r.tone : 'hijau'}
                  width={`${Math.round(r.bar * 100)}%`}
                />
                {r.barText && (
                  <small className="text-[10px] text-ink-3 tabular-nums">{r.barText}</small>
                )}
              </span>
            )}
            <ChevronRight size={15} className="shrink-0 text-ink-3" aria-hidden="true" />
          </>
        );
        return (
          <li key={r.key}>
            {r.href ? (
              <Link className={ROW} href={r.href}>
                {body}
              </Link>
            ) : (
              <button type="button" className={ROW} aria-pressed={r.active} onClick={r.onClick}>
                {body}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export type Step = {
  key: string;
  label: string;
  sub: string;
  state: 'done' | 'now' | 'next';
  icon: LucideIcon;
};
/** Pelacak bertahap: bulatan berikon terhubung garis, tahap aktif berlingkar biru. */
export function Stepper({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <ol className="flex min-w-0 flex-1" aria-label={label}>
      {steps.map((s) => {
        const Icon = s.state === 'done' ? Check : s.icon;
        return (
          <li
            key={s.key}
            className={cn(
              "relative flex min-w-0 flex-[1_1_0] flex-col items-center gap-[3px] text-center not-first:before:absolute not-first:before:top-[17px] not-first:before:right-[calc(50%+21px)] not-first:before:left-[calc(-50%+21px)] not-first:before:h-0.5 not-first:before:rounded-[2px] not-first:before:bg-line-strong not-first:before:content-['']",
              s.state !== 'next' && 'not-first:before:bg-accent-strong',
            )}
            aria-current={s.state === 'now' ? 'step' : undefined}
          >
            <span
              className={cn(
                'grid size-9 place-items-center rounded-[50%] border-2 border-line-strong bg-surface text-ink-3',
                s.state === 'done' &&
                  'border-accent-strong bg-accent-strong text-on-action shadow-[inset_0_-2px_0_color-mix(in_srgb,var(--ink)_25%,transparent)]',
                s.state === 'now' &&
                  'border-[3px] border-accent-strong text-accent-strong shadow-[0_0_0_5px_color-mix(in_srgb,var(--accent-strong)_14%,transparent)]',
              )}
              aria-hidden="true"
            >
              <Icon size={s.state === 'now' ? 16 : 14} strokeWidth={2.4} />
            </span>
            <strong
              className={cn(
                'mt-1 max-w-full truncate text-[12px] font-bold max-md:hidden',
                s.state === 'now' && 'text-accent-strong max-md:block',
              )}
            >
              {s.label}
            </strong>
            <small className="text-[11px] whitespace-nowrap text-ink-3">{s.sub}</small>
          </li>
        );
      })}
    </ol>
  );
}

export function Pager({
  index,
  total,
  onMove,
  label,
}: {
  index: number;
  total: number;
  onMove: (d: number) => void;
  label: string;
}) {
  if (total < 2) return null;
  return (
    <span className="inline-flex items-center gap-1 text-ink-3">
      <button
        type="button"
        className={ICON_BTN_SMALL}
        aria-label={`${label} sebelumnya`}
        onClick={() => onMove(-1)}
      >
        <ChevronLeft size={15} />
      </button>
      <small aria-live="polite">
        {index + 1}/{total}
      </small>
      <button
        type="button"
        className={ICON_BTN_SMALL}
        aria-label={`${label} berikutnya`}
        onClick={() => onMove(1)}
      >
        <ChevronRight size={15} />
      </button>
    </span>
  );
}

export type Tab = { id: string; label: string; count: string; rows: RowView[]; empty: string };
export function TabsCard({
  icon,
  title,
  tabs,
  label,
}: {
  icon: Icon3DKind;
  title: string;
  tabs: Tab[];
  label: string;
}) {
  const [current, setCurrent] = useState(tabs[0]?.id);
  const tab = tabs.find((t) => t.id === current) || tabs[0];
  const id = useId();
  return (
    <section className="flex flex-col" aria-label={label}>
      <header className="mb-4 flex min-w-0 flex-wrap items-center gap-2.5">
        <IconTile icon={icon} size={24} className={HEAD_TILE} />
        <div
          role="tablist"
          aria-label={label}
          className="flex w-full min-w-0 flex-wrap gap-1 overflow-x-auto rounded-[10px] bg-surface-3 p-[3px] [scrollbar-width:none]"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`${id}-${t.id}`}
              type="button"
              role="tab"
              aria-selected={t.id === tab?.id}
              onClick={() => setCurrent(t.id)}
              className="min-h-11 flex-[1_1_auto] rounded-[8px] border-0 bg-transparent px-2.5 text-[12px] font-bold whitespace-nowrap text-ink-3 aria-selected:bg-surface aria-selected:text-ink aria-selected:shadow-[0_1px_4px_color-mix(in_srgb,var(--ink)_12%,transparent)]"
            >
              {t.label} <span className="ml-0.5 font-semibold text-ink-3">{t.count}</span>
            </button>
          ))}
        </div>
        <small className={cn(HEAD_NOTE, 'max-w-[120px]')}>{title}</small>
      </header>
      {tab && (
        <div
          role="tabpanel"
          aria-labelledby={`${id}-${tab.id}`}
          className="mt-1.5 min-h-0 flex-1 overscroll-contain"
        >
          <Rows rows={tab.rows} empty={tab.empty} />
        </div>
      )}
    </section>
  );
}

export type SiteOption = { id: string; code: string; label: string; sub: string };
const BADGE =
  'grid h-8 min-w-[38px] place-items-center rounded-[8px] bg-action px-1.5 text-[11px] font-extrabold tracking-[0.3px] text-on-action max-md:h-7 max-md:min-w-8 max-md:text-[10px]';
/** Pemilih lokasi ala "WH-01 Riverside Hub": lencana kode, nama, ringkasan, daftar pilihan. */
export function SitePicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SiteOption[];
  onChange: (id: string) => void;
}) {
  const { open, setOpen, root, trigger } = usePopover();
  const now = options.find((o) => o.id === value) || options[0];
  const list = useId();
  return (
    <div className="relative ml-auto max-md:ml-0 max-md:min-w-0 max-md:flex-[0_1_auto]" ref={root}>
      <button
        ref={trigger}
        type="button"
        className="flex min-h-11 items-center gap-2.5 rounded-[12px] border border-line bg-surface py-1 pr-2.5 pl-[5px] text-left hover:border-line-strong max-md:gap-1.5 max-md:pr-1.5"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={list}
        aria-label={`Lokasi: ${now.label}. Ganti lokasi`}
        onClick={() => setOpen(!open)}
      >
        <b className={BADGE}>{now.code}</b>
        <span>
          <strong className="block text-[13px] font-bold whitespace-nowrap">{now.label}</strong>
          <small className="block text-[11px] whitespace-nowrap text-ink-3 max-md:hidden">
            {now.sub}
          </small>
        </span>
        <ChevronDown size={16} aria-hidden="true" className="text-ink-3" />
      </button>
      {open && (
        <ul
          id={list}
          role="listbox"
          aria-label="Pilih lokasi"
          className={cn(CARD, POP, 'right-auto left-0 p-0')}
        >
          {options.map((o) => (
            <li key={o.id} role="option" aria-selected={o.id === value}>
              <button
                type="button"
                className={cn(
                  'flex min-h-12 w-full items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-2 py-1.5 text-left hover:bg-accent',
                  o.id === value && 'bg-accent',
                )}
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                <b className={BADGE}>{o.code}</b>
                <span className="flex-1">
                  <strong className="block text-[13px] font-bold whitespace-nowrap">
                    {o.label}
                  </strong>
                  <small className="block text-[11px] whitespace-nowrap text-ink-3">{o.sub}</small>
                </span>
                {o.id === value && (
                  <Check size={16} aria-hidden="true" className="text-accent-strong" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
