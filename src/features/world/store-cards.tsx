'use client';
// Kartu lokasi Gerai: status buka dari catatan Gerai di web, staf yang ditugaskan, dan stok di
// unit. Unit belum aktif ditandai terkunci; tidak ada angka penjualan yang dikarang.
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ClipboardCheck,
  PackageCheck,
  Snowflake,
  Store,
  Warehouse,
  Wrench,
  Briefcase,
} from 'lucide-react';
import { isBelowMinimum, type WorldModel } from './model/world-model';
import { recordHref } from '@/features/notifications/follow-ups';
import type { Checklist, Item } from '../records/schemas';
import type { WorldSite } from './office-rooms';
import { ACTION_LABEL, type CharacterPlan } from './character-plan';
import { STORES, UNIT_STEPS, storeInfo, type StoreId, type StoreInfo } from './store';
import { ACTION_TONE, itemRow } from './monitor-data';
import { readiness } from '@/lib/progress';
import { cn } from '@/lib/utils';
import {
  ACTIONS,
  BTN_PRIMARY,
  EMPTY,
  HEAD_NOTE,
  HEAD_TILE,
  IconTile,
  Links,
  NOTE,
  NOTE_LINK,
  STATUS,
  TRACKER_BODY,
  TRACKER_HEAD,
  TRACKER_TITLE,
  PanelHead,
  Pill,
  Rows,
  Section,
  Stats,
  Stepper,
  type KpiCard,
  type RowView,
  type Step,
  type Tab,
} from './monitor-cards';
import { itemThumbKind, type Icon3DKind } from '@/features/world/icon-3d';

const STORE_ICON: Partial<Record<StoreId, Icon3DKind>> = {
  kantor: 'kantor',
  logistik: 'gudang',
  'cold-storage': 'salju',
};
export const storeIcon = (g: StoreInfo): Icon3DKind =>
  g.open ? (STORE_ICON[g.id] ?? 'toko') : 'gembok';
const STATUS_LABEL: Record<string, string> = {
  rencana: 'Rencana',
  persiapan: 'Persiapan',
  'siap uji': 'Siap uji',
  'siap buka': 'Siap buka',
  aktif: 'Aktif',
  'belum tercatat': 'Belum tercatat',
};
/** Pintu lokasi lain dari ruang gerai tertentu. */
const DOORS: Partial<Record<StoreId, [Exclude<WorldSite, 'pulau'>, string]>> = {
  kantor: ['kantor', 'Masuk kantor'],
  logistik: ['gudang', 'Masuk gudang'],
  'cold-storage': ['pendingin', 'Masuk cold storage'],
};
const DOOR_ICON = { kantor: Briefcase, gudang: Warehouse, pendingin: Snowflake, gerai: Store };

type Input = {
  model: WorldModel;
  plans: CharacterPlan[];
  selected: string;
  unavailable: boolean;
  stock: boolean;
  choose: (key: string) => void;
  go: (loc: WorldSite) => void;
  /** Daftar periksa kesiapan dari halaman Kesiapan (opsional). */
  checklist?: Item[];
};

const unitStaff = (model: WorldModel, unit?: Item) =>
  unit ? model.staff.filter((s) => String(s.data.unit_id || '') === unit.id) : [];
const unitStock = (model: WorldModel, unit?: Item) =>
  unit ? model.inventory.atUnits.filter((b) => String(b.data.unit_id || '') === unit.id) : [];

export function storeView({
  model,
  plans,
  selected,
  unavailable,
  stock,
  choose,
  go,
  checklist = [],
}: Input) {
  const info = storeInfo(model);
  const openStores = info.filter((g) => g.open && g.id !== 'kantor');
  const serve = plans.filter((p) => p.action === 'serve');
  const low = info.flatMap((g) => unitStock(model, g.unit)).filter(isBelowMinimum);
  const na = unavailable ? 'Data belum tersedia' : '';
  const kpis: Parameters<typeof KpiCard>[0][] = [
    {
      icon: 'toko',
      label: 'Gerai buka',
      value: unavailable ? '—' : String(openStores.length),
      chip: unavailable ? undefined : { text: `dari ${info.length - 1}`, tone: 'hijau' },
      foot: na || 'unit berstatus aktif di web',
    },
    {
      icon: 'gembok',
      label: 'Belum dibuka',
      value: unavailable ? '—' : String(info.length - 1 - openStores.length),
      chip:
        unavailable || !stock || !low.length
          ? undefined
          : { text: `${low.length} stok minimum`, tone: 'kuning' },
      foot: na || 'terkunci sampai aktif',
    },
    {
      icon: 'tim',
      label: 'Staf di gerai',
      value: unavailable ? '—' : String(serve.length),
      foot: na || 'ditugaskan ke unit yang buka',
    },
  ];

  const id = (selected.startsWith('g:') ? selected.slice(2) : 'sembako') as StoreId;
  const g = info.find((i) => i.id === id) ?? info[0];
  const staff = unitStaff(model, g.unit);
  const goods = unitStock(model, g.unit);
  const door = DOORS[g.id];
  // Kesiapan: butir wajib berstatus selesai dari halaman Kesiapan untuk unit ini.
  const readyPct = g.unit
    ? readiness(
        checklist
          .filter((c) => c.data.unit_id === g.unit!.id)
          .map((c) => ({
            required: c.data.required !== false,
            status: String(c.data.status) as Checklist['status'],
          })),
      )
    : null;
  const statusTone = g.open ? 'hijau' : g.unit ? 'kuning' : 'abu';
  const tag = g.name;
  const panelBody: ReactNode = (
    <>
      <PanelHead
        icon={storeIcon(g)}
        eyebrow={`GERAI · ${(STATUS_LABEL[g.status] ?? g.status).toUpperCase()}`}
        title={g.name}
        sub={
          g.unit
            ? [g.unit.data.kind, g.unit.data.location].filter(Boolean).map(String).join(' · ') ||
              STORES[g.id].name
            : STORES[g.id].name
        }
        href={g.unit ? recordHref('units', g.unit) : '/store'}
      />
      <div className={STATUS}>
        <Pill tone={statusTone}>
          {g.open ? 'Buka' : `Terkunci · ${STATUS_LABEL[g.status] ?? g.status}`}
        </Pill>
        {g.unit?.data.assignee ? <span>PJ {String(g.unit.data.assignee)}</span> : null}
      </div>
      {!g.open && (
        <p className={cn(NOTE, NOTE_LINK)}>
          Unit ini belum dibuka di web. Ruangnya tampil transparan bergembok sampai statusnya Aktif
          di <Link href="/store">halaman Gerai</Link>.
        </p>
      )}
      {g.id === 'kantor' && (
        <p className={NOTE}>Kantor koperasi selalu terbuka; pintunya menuju ruang kantor.</p>
      )}
      {door && (
        <div className={ACTIONS}>
          <button type="button" className={BTN_PRIMARY} onClick={() => go(door[0])}>
            {(() => {
              const Icon = DOOR_ICON[door[0]];
              return <Icon size={15} />;
            })()}{' '}
            {door[1]}
          </button>
        </div>
      )}
      {g.id !== 'kantor' && (
        <Stats
          items={[
            { label: 'Staf ditugaskan', value: unavailable ? '—' : String(staff.length) },
            ...(readyPct === null
              ? []
              : [
                  {
                    label: 'Kesiapan wajib',
                    value: `${readyPct}%`,
                    bar: readyPct / 100,
                    tone: readyPct >= 100 ? ('hijau' as const) : ('biru' as const),
                  },
                ]),
            {
              label: 'Stok aman',
              value:
                unavailable || !stock
                  ? '—'
                  : String(goods.length - goods.filter(isBelowMinimum).length),
              total: unavailable || !stock || !goods.length ? undefined : String(goods.length),
              bar:
                unavailable || !stock || !goods.length
                  ? undefined
                  : 1 - goods.filter(isBelowMinimum).length / goods.length,
              tone: goods.some(isBelowMinimum) ? 'kuning' : 'hijau',
            },
          ]}
        />
      )}
      {g.id !== 'kantor' && (
        <>
          <Section title="Staf unit" meta="aktivitas" />
          <Rows
            rows={staff.map((s) => {
              const plan = plans.find((p) => p.id === s.id);
              return {
                key: s.id,
                title: String(s.data.title),
                sub: String(s.data.role || s.data.section || 'Peran belum diisi'),
                pill: plan ? ACTION_LABEL[plan.action] : undefined,
                tone: plan ? ACTION_TONE[plan.action] : undefined,
                avatar: String(s.data.title).slice(0, 1).toUpperCase(),
                href: recordHref('staff', s),
              };
            })}
            empty="Belum ada staf yang ditugaskan ke unit ini (kolom Unit pada Tim)."
          />
          <Section title="Barang di unit" meta="satuan" />
          {stock ? (
            <Rows
              rows={goods.map((b) => {
                const r = itemRow(b);
                return {
                  key: r.key,
                  title: String(b.data.title),
                  sub: `Minimum ${String(b.data.minimum_quantity ?? '—')}`,
                  value: String(b.data.book_quantity ?? '—'),
                  unit: String(b.data.measurement || ''),
                  pill: r.pill,
                  tone: r.tone,
                  thumb: itemThumbKind(String(b.data.title), String(b.data.measurement || '')),
                  href: recordHref('inventory-items', b),
                };
              })}
              empty="Belum ada barang yang ditempatkan di unit ini."
            />
          ) : (
            <p className={EMPTY}>Pencatatan barang belum aktif di server.</p>
          )}
        </>
      )}
      <Links
        items={[
          { href: '/store', label: 'Halaman Gerai' },
          ...(g.unit ? [{ href: '/store?tab=readiness', label: 'Kesiapan' }] : []),
        ]}
      />
    </>
  );

  // Kesiapan unit: rencana → persiapan → siap uji → siap buka → aktif.
  const stage = UNIT_STEPS.indexOf(g.status as (typeof UNIT_STEPS)[number]);
  const stageIcons = [ClipboardCheck, Wrench, PackageCheck, Store, Store];
  const steps: Step[] = UNIT_STEPS.map((s, i) => ({
    key: s,
    label: STATUS_LABEL[s],
    sub: i < stage ? 'Selesai' : i === stage ? 'Sekarang' : 'Menunggu',
    state: i < stage || (i === stage && s === 'aktif') ? 'done' : i === stage ? 'now' : 'next',
    icon: stageIcons[i],
  }));
  const tracker = (
    <section aria-label="Kesiapan gerai">
      <header className={TRACKER_HEAD}>
        <IconTile icon={storeIcon(g)} size={24} className={HEAD_TILE} />
        <h2 className={TRACKER_TITLE}>Kesiapan {g.name}</h2>
        <small className={HEAD_NOTE}>{STATUS_LABEL[g.status] ?? g.status}</small>
      </header>
      {unavailable ? (
        <p className={EMPTY}>Data belum tersedia.</p>
      ) : g.id === 'kantor' ? (
        <p className={EMPTY}>Kantor koperasi tidak memakai tahap kesiapan gerai.</p>
      ) : !g.unit ? (
        <p className={EMPTY}>
          Unit belum tercatat. Tambahkan di <Link href="/store">halaman Gerai</Link> untuk mulai
          dari tahap Rencana.
        </p>
      ) : (
        <div className={TRACKER_BODY}>
          <Stepper steps={steps} label="Tahap kesiapan unit" />
        </div>
      )}
    </section>
  );

  const tabs: Tab[] = [
    {
      id: 'gerai',
      label: 'Gerai',
      count: unavailable ? '—' : `${openStores.length}/${info.length - 1}`,
      empty: 'Data belum tersedia.',
      rows: unavailable
        ? []
        : info.map((i): RowView => ({
            key: i.id,
            title: i.name,
            sub:
              i.id === 'kantor'
                ? 'Selalu buka · pintu ke kantor'
                : i.unit
                  ? `${STATUS_LABEL[i.status] ?? i.status}${i.unit.data.kind ? ` · ${String(i.unit.data.kind)}` : ''}`
                  : 'Belum tercatat di web',
            pill: i.open ? 'Buka' : 'Terkunci',
            tone: i.open ? 'hijau' : 'abu',
            icon: storeIcon(i),
            active: selected === `g:${i.id}`,
            onClick: () => choose(`g:${i.id}`),
          })),
    },
    {
      id: 'staf',
      label: 'Staf',
      count: unavailable ? '—' : String(serve.length),
      empty: unavailable ? 'Data belum tersedia.' : 'Belum ada staf yang melayani gerai yang buka.',
      rows: serve.map((p) => ({
        key: p.id,
        title: p.name,
        sub: STORES[p.area.slice(6) as StoreId]?.name ?? p.reason,
        pill: ACTION_LABEL[p.action],
        tone: ACTION_TONE[p.action],
        avatar: p.name.slice(0, 1).toUpperCase(),
        active: selected === `orang:${p.id}`,
        onClick: () => choose(`orang:${p.id}`),
      })),
    },
    {
      id: 'stok',
      label: 'Stok minimum',
      count: unavailable || !stock ? '—' : String(low.length),
      empty: stock ? 'Tidak ada barang gerai di bawah minimum.' : 'Pencatatan barang belum aktif.',
      rows: stock
        ? low.map((b) => {
            const r = itemRow(b);
            return {
              key: r.key,
              title: String(b.data.title),
              sub: r.note,
              pill: r.pill,
              tone: r.tone,
              thumb: itemThumbKind(String(b.data.title), String(b.data.measurement || '')),
              href: recordHref('inventory-items', b),
            };
          })
        : [],
    },
  ];
  return { kpis, panelBody, tracker, tabs, tag };
}
