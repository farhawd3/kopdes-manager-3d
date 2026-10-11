'use client';
// Kartu lokasi Gerai: status buka dari catatan Gerai di web, staf yang ditugaskan, dan stok di
// unit. Unit belum aktif ditandai terkunci; tidak ada angka penjualan yang dikarang.
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ClipboardCheck, PackageCheck, Snowflake, Store, Warehouse, Wrench, Briefcase } from 'lucide-react';
import { isBelowMinimum, type WorldModel } from './model/world-model';
import { recordHref } from '../workspace/workspace-navigation';
import type { Checklist, Item } from '../records/schemas';
import type { LokasiMonitoring } from './bidang';
import { ACTION_LABEL, type CharacterPlan } from './character-plan';
import { GERAI, UNIT_STEPS, infoGerai, type GeraiId, type GeraiInfo } from './gerai';
import { ACTION_NADA, itemRow } from './monitor-data';
import { readiness } from '@/lib/progress';
import { IconTile, Links, PanelHead, Pill, Rows, Section, Stats, Stepper, type KpiCard, type RowView, type Step, type Tab } from './monitor-cards';
import { thumbBarang, type Ikon3DKind } from '@/components/ui/Ikon3D';

const IKON: Partial<Record<GeraiId, Ikon3DKind>> = { kantor: 'kantor', logistik: 'gudang', 'cold-storage': 'salju' };
export const ikonGerai = (g: GeraiInfo): Ikon3DKind => (g.buka ? (IKON[g.id] ?? 'toko') : 'gembok');
const STATUS_LABEL: Record<string, string> = {
  rencana: 'Rencana',
  persiapan: 'Persiapan',
  'siap uji': 'Siap uji',
  'siap buka': 'Siap buka',
  aktif: 'Aktif',
  'belum tercatat': 'Belum tercatat',
};
/** Pintu lokasi lain dari ruang gerai tertentu. */
const PINTU: Partial<Record<GeraiId, [Exclude<LokasiMonitoring, 'pulau'>, string]>> = {
  kantor: ['kantor', 'Masuk kantor'],
  logistik: ['gudang', 'Masuk gudang'],
  'cold-storage': ['pendingin', 'Masuk cold storage'],
};
const PINTU_IKON = { kantor: Briefcase, gudang: Warehouse, pendingin: Snowflake, gerai: Store };

type Input = {
  model: WorldModel;
  plans: CharacterPlan[];
  selected: string;
  unavailable: boolean;
  stock: boolean;
  choose: (key: string) => void;
  go: (loc: LokasiMonitoring) => void;
  /** Daftar periksa kesiapan dari halaman Kesiapan (opsional). */
  checklist?: Item[];
};

const stafUnit = (model: WorldModel, unit?: Item) =>
  unit ? model.staff.filter((s) => String(s.data.unit_id || '') === unit.id) : [];
const stokUnit = (model: WorldModel, unit?: Item) =>
  unit ? model.inventory.atUnits.filter((b) => String(b.data.unit_id || '') === unit.id) : [];

export function geraiView({ model, plans, selected, unavailable, stock, choose, go, checklist = [] }: Input) {
  const info = infoGerai(model);
  const buka = info.filter((g) => g.buka && g.id !== 'kantor');
  const serve = plans.filter((p) => p.action === 'serve');
  const rendah = info.flatMap((g) => stokUnit(model, g.unit)).filter(isBelowMinimum);
  const na = unavailable ? 'Data belum tersedia' : '';
  const kpis: Parameters<typeof KpiCard>[0][] = [
    {
      icon: 'toko',
      label: 'Gerai buka',
      value: unavailable ? '—' : String(buka.length),
      chip: unavailable ? undefined : { text: `dari ${info.length - 1}`, nada: 'hijau' },
      foot: na || 'unit berstatus aktif di web',
    },
    {
      icon: 'gembok',
      label: 'Belum dibuka',
      value: unavailable ? '—' : String(info.length - 1 - buka.length),
      chip:
        unavailable || !stock || !rendah.length
          ? undefined
          : { text: `${rendah.length} stok minimum`, nada: 'kuning' },
      foot: na || 'terkunci sampai aktif',
    },
    {
      icon: 'tim',
      label: 'Staf di gerai',
      value: unavailable ? '—' : String(serve.length),
      foot: na || 'ditugaskan ke unit yang buka',
    },
  ];

  const id = (selected.startsWith('g:') ? selected.slice(2) : 'sembako') as GeraiId;
  const g = info.find((i) => i.id === id) ?? info[0];
  const staf = stafUnit(model, g.unit);
  const barang = stokUnit(model, g.unit);
  const pintu = PINTU[g.id];
  // Kesiapan: butir wajib berstatus selesai dari halaman Kesiapan untuk unit ini.
  const siap = g.unit
    ? readiness(
        checklist
          .filter((c) => c.data.unit_id === g.unit!.id)
          .map((c) => ({ required: c.data.required !== false, status: String(c.data.status) as Checklist['status'] })),
      )
    : null;
  const statusNada = g.buka ? 'hijau' : g.unit ? 'kuning' : 'abu';
  const tag = g.nama;
  const panelBody: ReactNode = (
    <>
      <PanelHead
        icon={ikonGerai(g)}
        eyebrow={`GERAI · ${(STATUS_LABEL[g.status] ?? g.status).toUpperCase()}`}
        title={g.nama}
        sub={g.unit ? [g.unit.data.kind, g.unit.data.location].filter(Boolean).map(String).join(' · ') || GERAI[g.id].nama : GERAI[g.id].nama}
        href={g.unit ? recordHref('units', g.unit) : '/gerai'}
      />
      <div className="mt-status">
        <Pill nada={statusNada}>{g.buka ? 'Buka' : `Terkunci · ${STATUS_LABEL[g.status] ?? g.status}`}</Pill>
        {g.unit?.data.assignee ? <span>PJ {String(g.unit.data.assignee)}</span> : null}
      </div>
      {!g.buka && (
        <p className="mt-note">
          Unit ini belum dibuka di web. Ruangnya tampil transparan bergembok sampai statusnya Aktif di{' '}
          <Link href="/gerai">halaman Gerai</Link>.
        </p>
      )}
      {g.id === 'kantor' && <p className="mt-note">Kantor koperasi selalu terbuka; pintunya menuju ruang kantor.</p>}
      {pintu && (
        <div className="mt-actions">
          <button type="button" className="mt-btn is-primary" onClick={() => go(pintu[0])}>
            {(() => {
              const Icon = PINTU_IKON[pintu[0]];
              return <Icon size={15} />;
            })()}{' '}
            {pintu[1]}
          </button>
        </div>
      )}
      {g.id !== 'kantor' && (
        <Stats
          items={[
            { label: 'Staf ditugaskan', value: unavailable ? '—' : String(staf.length) },
            ...(siap === null
              ? []
              : [{ label: 'Kesiapan wajib', value: `${siap}%`, bar: siap / 100, nada: siap >= 100 ? ('hijau' as const) : ('biru' as const) }]),
            {
              label: 'Stok aman',
              value: unavailable || !stock ? '—' : String(barang.length - barang.filter(isBelowMinimum).length),
              total: unavailable || !stock || !barang.length ? undefined : String(barang.length),
              bar: unavailable || !stock || !barang.length ? undefined : 1 - barang.filter(isBelowMinimum).length / barang.length,
              nada: barang.some(isBelowMinimum) ? 'kuning' : 'hijau',
            },
          ]}
        />
      )}
      {g.id !== 'kantor' && (
        <>
          <Section title="Staf unit" meta="aktivitas" />
          <Rows
            rows={staf.map((s) => {
              const plan = plans.find((p) => p.id === s.id);
              return {
                key: s.id,
                title: String(s.data.title),
                sub: String(s.data.role || s.data.section || 'Peran belum diisi'),
                pill: plan ? ACTION_LABEL[plan.action] : undefined,
                nada: plan ? ACTION_NADA[plan.action] : undefined,
                avatar: String(s.data.title).slice(0, 1).toUpperCase(),
                href: recordHref('staff', s),
              };
            })}
            empty="Belum ada staf yang ditugaskan ke unit ini (kolom Unit pada Tim)."
          />
          <Section title="Barang di unit" meta="satuan" />
          {stock ? (
            <Rows
              rows={barang.map((b) => {
                const r = itemRow(b);
                return {
                  key: r.key,
                  title: String(b.data.title),
                  sub: `Minimum ${String(b.data.minimum_quantity ?? '—')}`,
                  value: String(b.data.book_quantity ?? '—'),
                  unit: String(b.data.measurement || ''),
                  pill: r.pill,
                  nada: r.nada,
                  thumb: thumbBarang(String(b.data.title), String(b.data.measurement || '')),
                  href: recordHref('inventory-items', b),
                };
              })}
              empty="Belum ada barang yang ditempatkan di unit ini."
            />
          ) : (
            <p className="mt-empty">Pencatatan barang belum aktif di server.</p>
          )}
        </>
      )}
      <Links items={[{ href: '/gerai', label: 'Halaman Gerai' }, ...(g.unit ? [{ href: '/kesiapan', label: 'Kesiapan' }] : [])]} />
    </>
  );

  // Kesiapan unit: rencana → persiapan → siap uji → siap buka → aktif.
  const tahap = UNIT_STEPS.indexOf(g.status as (typeof UNIT_STEPS)[number]);
  const ikonTahap = [ClipboardCheck, Wrench, PackageCheck, Store, Store];
  const steps: Step[] = UNIT_STEPS.map((s, i) => ({
    key: s,
    label: STATUS_LABEL[s],
    sub: i < tahap ? 'Selesai' : i === tahap ? 'Sekarang' : 'Menunggu',
    state: i < tahap || (i === tahap && s === 'aktif') ? 'done' : i === tahap ? 'now' : 'next',
    icon: ikonTahap[i],
  }));
  const tracker = (
    <section className="mt-card mt-tracker" aria-label="Kesiapan gerai">
      <header>
        <IconTile icon={ikonGerai(g)} size={24} />
        <h2>Kesiapan {g.nama}</h2>
        <small>{STATUS_LABEL[g.status] ?? g.status}</small>
      </header>
      {unavailable ? (
        <p className="mt-empty">Data belum tersedia.</p>
      ) : g.id === 'kantor' ? (
        <p className="mt-empty">Kantor koperasi tidak memakai tahap kesiapan gerai.</p>
      ) : !g.unit ? (
        <p className="mt-empty">
          Unit belum tercatat. Tambahkan di <Link href="/gerai">halaman Gerai</Link> untuk mulai dari tahap Rencana.
        </p>
      ) : (
        <div className="mt-tracker-body">
          <Stepper steps={steps} label="Tahap kesiapan unit" />
        </div>
      )}
    </section>
  );

  const tabs: Tab[] = [
    {
      id: 'gerai',
      label: 'Gerai',
      count: unavailable ? '—' : `${buka.length}/${info.length - 1}`,
      empty: 'Data belum tersedia.',
      rows: unavailable
        ? []
        : info.map(
            (i): RowView => ({
              key: i.id,
              title: i.nama,
              sub:
                i.id === 'kantor'
                  ? 'Selalu buka · pintu ke kantor'
                  : i.unit
                    ? `${STATUS_LABEL[i.status] ?? i.status}${i.unit.data.kind ? ` · ${String(i.unit.data.kind)}` : ''}`
                    : 'Belum tercatat di web',
              pill: i.buka ? 'Buka' : 'Terkunci',
              nada: i.buka ? 'hijau' : 'abu',
              ikon: ikonGerai(i),
              active: selected === `g:${i.id}`,
              onClick: () => choose(`g:${i.id}`),
            }),
          ),
    },
    {
      id: 'staf',
      label: 'Staf',
      count: unavailable ? '—' : String(serve.length),
      empty: unavailable ? 'Data belum tersedia.' : 'Belum ada staf yang melayani gerai yang buka.',
      rows: serve.map((p) => ({
        key: p.id,
        title: p.name,
        sub: GERAI[p.area.slice(6) as GeraiId]?.nama ?? p.reason,
        pill: ACTION_LABEL[p.action],
        nada: ACTION_NADA[p.action],
        avatar: p.name.slice(0, 1).toUpperCase(),
        active: selected === `orang:${p.id}`,
        onClick: () => choose(`orang:${p.id}`),
      })),
    },
    {
      id: 'stok',
      label: 'Stok minimum',
      count: unavailable || !stock ? '—' : String(rendah.length),
      empty: stock ? 'Tidak ada barang gerai di bawah minimum.' : 'Pencatatan barang belum aktif.',
      rows: stock
        ? rendah.map((b) => {
            const r = itemRow(b);
            return {
              key: r.key,
              title: String(b.data.title),
              sub: r.note,
              pill: r.pill,
              nada: r.nada,
              thumb: thumbBarang(String(b.data.title), String(b.data.measurement || '')),
              href: recordHref('inventory-items', b),
            };
          })
        : [],
    },
  ];
  return { kpis, panelBody, tracker, tabs, tag };
}
