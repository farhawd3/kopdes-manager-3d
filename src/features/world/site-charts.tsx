'use client';
// Grafik ringkas di panel Ringkasan dunia. Batang CSS murni (tanpa pustaka grafik) agar halaman
// dunia tidak bertambah berat. Hanya data tercatat; modul belum aktif ditulis, bukan nol.
import { addDays } from '@/lib/date';
import type { Item } from '../records/schemas';
import type { Workspace } from '@/features/workspace/use-workspace';
import { coldRackIds, isBelowMinimum, rackIds, type WorldModel } from './model/world-model';
import type { Tone } from './monitor-data';
import type { WorldSite } from './office-rooms';
import { cn } from '@/lib/utils';
import { Bar, Section } from './monitor-cards';

type Segment = { label: string; value: number; tone: Tone | 'pink' };
export type Chart =
  | {
      kind: 'harian';
      title: string;
      meta: string;
      days: { label: string; value: number; highlight?: boolean }[];
      format?: (n: number) => string;
    }
  | { kind: 'tumpuk'; title: string; meta: string; segments: Segment[] }
  | {
      kind: 'daftar';
      title: string;
      meta: string;
      rows: { label: string; value: number; note?: string; tone?: Tone }[];
    }
  | { kind: 'catatan'; title: string; text: string };

const shortRupiah = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
    : n.toLocaleString('id-ID');
const dayName = (date: string) =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(date + 'T12:00:00Z'),
  );
const sevenDays = (day: string) => Array.from({ length: 7 }, (_, i) => addDays(day, i - 6));
const perDay = (
  rows: Item[],
  day: string,
  dateOf: (row: Item) => string,
  valueOf: (row: Item) => number = () => 1,
) =>
  sevenDays(day).map((date) => ({
    label: dayName(date),
    value: rows
      .filter((row) => dateOf(row) === date)
      .reduce((total, row) => total + valueOf(row), 0),
    highlight: date === day,
  }));

type ChartContext = {
  site: WorldSite;
  data: Workspace;
  model: WorldModel;
  day: string;
  stock: boolean;
  shipping: boolean;
  unavailable: boolean;
};

/** Susun grafik untuk lokasi aktif; fungsi murni agar mudah diuji. */
export function siteCharts({
  site,
  data,
  model,
  day,
  stock,
  shipping,
  unavailable,
}: ChartContext): Chart[] {
  if (unavailable) return [{ kind: 'catatan', title: 'Grafik', text: 'Data belum tersedia.' }];
  const tasks = data['work-items'] || [];
  const open = tasks.filter((row) => ['rencana', 'proses'].includes(String(row.data.status)));
  const isOverdue = (row: Item) => String(row.data.due_date || '9999') < day;
  const taskCharts: Chart[] = [
    {
      kind: 'tumpuk',
      title: 'Tugas terbuka',
      meta: `${open.length} tugas`,
      segments: [
        { label: 'Lewat tenggat', value: open.filter(isOverdue).length, tone: 'merah' },
        {
          label: 'Dikerjakan',
          value: open.filter((row) => !isOverdue(row) && row.data.status === 'proses').length,
          tone: 'biru',
        },
        {
          label: 'Rencana',
          value: open.filter((row) => !isOverdue(row) && row.data.status === 'rencana').length,
          tone: 'abu',
        },
      ],
    },
    {
      kind: 'harian',
      title: 'Tugas selesai 7 hari',
      meta: 'per hari',
      days: perDay(
        tasks.filter((row) => row.data.status === 'selesai'),
        day,
        (row) => String(row.data.completed_at || ''),
      ),
    },
  ];
  const attendance = data.attendance;
  const attendanceCharts: Chart[] = attendance
    ? (() => {
        const todayRows = attendance.filter((row) => row.data.date === day);
        return todayRows.length
          ? [
              {
                kind: 'tumpuk' as const,
                title: 'Kehadiran hari ini',
                meta: `${todayRows.length} petugas terjadwal`,
                segments: [
                  {
                    label: 'Hadir',
                    value: todayRows.filter((row) =>
                      ['hadir', 'terlambat'].includes(String(row.data.status)),
                    ).length,
                    tone: 'hijau' as const,
                  },
                  {
                    label: 'Izin/sakit/cuti/alpa',
                    value: todayRows.filter((row) =>
                      ['izin', 'sakit', 'cuti', 'alpa'].includes(String(row.data.status)),
                    ).length,
                    tone: 'kuning' as const,
                  },
                  {
                    label: 'Belum absen',
                    value: todayRows.filter((row) => row.data.status === 'terjadwal').length,
                    tone: 'abu' as const,
                  },
                ],
              },
            ]
          : [
              {
                kind: 'catatan' as const,
                title: 'Kehadiran hari ini',
                text: 'Belum ada jadwal atau absensi untuk hari ini.',
              },
            ];
      })()
    : [];
  const cash = data['cash-entries'];
  const cashCharts: Chart[] = !stock
    ? [{ kind: 'catatan', title: 'Kas 7 hari', text: 'Buku kas belum aktif.' }]
    : [
        {
          kind: 'harian',
          title: 'Uang keluar 7 hari',
          meta: 'Rp tercatat',
          days: perDay(
            (cash || []).filter((row) => row.data.direction === 'keluar'),
            day,
            (row) => String(row.data.date),
            (row) => Number(row.data.amount || 0),
          ),
          format: shortRupiah,
        },
      ];

  if (site === 'kantor') return [...taskCharts, ...attendanceCharts];
  if (site === 'pulau') return [...taskCharts, ...cashCharts, ...attendanceCharts];
  if (site === 'gerai') {
    const sales = data.sales;
    if (!sales)
      return [
        {
          kind: 'catatan',
          title: 'Penjualan gerai',
          text: 'Penjualan harian belum aktif (migrasi 10).',
        },
      ];
    const unitName = (id: unknown) =>
      String((data.units || []).find((row) => row.id === id)?.data.title || 'Gerai');
    const week = sales.filter(
      (row) => String(row.data.date) >= addDays(day, -6) && String(row.data.date) <= day,
    );
    const perStore = Object.entries(
      week.reduce<Record<string, number>>((total, row) => {
        total[String(row.data.unit_id)] =
          (total[String(row.data.unit_id)] || 0) + Number(row.data.amount || 0);
        return total;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);
    return [
      {
        kind: 'harian',
        title: 'Omzet 7 hari',
        meta: 'Rp per hari',
        days: perDay(
          week,
          day,
          (row) => String(row.data.date),
          (row) => Number(row.data.amount || 0),
        ),
        format: shortRupiah,
      },
      {
        kind: 'daftar',
        title: 'Omzet per gerai',
        meta: '7 hari',
        rows: perStore.map(([id, value]) => ({
          label: unitName(id),
          value,
          note: `Rp ${shortRupiah(value)}`,
        })),
      },
    ];
  }
  if (site === 'gudang') {
    const result: Chart[] = stock
      ? [
          {
            kind: 'daftar',
            title: 'Barang per rak',
            meta: 'jenis barang',
            rows: rackIds.map((id) => {
              const items = model.inventory.racks[id];
              const minimum = items.filter(isBelowMinimum).length;
              return {
                label: `Rak ${id}`,
                value: items.length,
                note: minimum ? `${items.length} · ${minimum} minimum` : String(items.length),
                tone: minimum ? ('kuning' as const) : undefined,
              };
            }),
          },
        ]
      : [{ kind: 'catatan', title: 'Barang per rak', text: 'Pencatatan barang belum aktif.' }];
    if (!shipping)
      return [...result, { kind: 'catatan', title: 'Pengiriman', text: 'Pengiriman belum aktif.' }];
    const shipments = (data.deliveries || []).filter(
      (row) => !['selesai', 'dibatalkan'].includes(String(row.data.status)),
    );
    const status = (s: string) => shipments.filter((row) => row.data.status === s).length;
    return [
      ...result,
      {
        kind: 'tumpuk',
        title: 'Pengiriman aktif',
        meta: `${shipments.length} pengiriman`,
        segments: [
          { label: 'Dipesan', value: status('dipesan'), tone: 'abu' },
          { label: 'Dikirim', value: status('dikirim'), tone: 'biru' },
          { label: 'Tiba', value: status('tiba'), tone: 'kuning' },
          { label: 'Diperiksa', value: status('diperiksa'), tone: 'hijau' },
        ],
      },
    ];
  }
  if (!stock)
    return [{ kind: 'catatan', title: 'Rak pendingin', text: 'Pencatatan barang belum aktif.' }];
  return [
    {
      kind: 'daftar',
      title: 'Isi rak pendingin',
      meta: 'jenis barang',
      rows: coldRackIds.map((id) => {
        const items = model.inventory.coldRacks[id];
        const minimum = items.filter(isBelowMinimum).length;
        return {
          label: `Rak ${id}`,
          value: items.length,
          note: minimum ? `${items.length} · ${minimum} minimum` : String(items.length),
          tone: minimum ? ('kuning' as const) : undefined,
        };
      }),
    },
  ];
}

const SEGMENT: Record<Segment['tone'], string> = {
  merah: 'bg-late-ink',
  biru: 'bg-accent-strong',
  hijau: 'bg-done-bar',
  kuning: 'bg-warn-bar',
  pink: 'bg-late-bar',
  abu: 'bg-line-strong',
};

export function ChartList({ charts }: { charts: Chart[] }) {
  return (
    <div className="mt-[18px] grid gap-[18px]">
      {charts.map((g) => (
        <section
          key={g.title}
          className="rounded-[16px] border border-line bg-surface px-4 pt-3.5 pb-4"
          aria-label={g.title}
        >
          <Section title={g.title} meta={'meta' in g ? g.meta : undefined} />
          {g.kind === 'catatan' && <p className={CHART_EMPTY}>{g.text}</p>}
          {g.kind === 'harian' && <DailyChart {...g} />}
          {g.kind === 'tumpuk' && <StackedChart segments={g.segments} />}
          {g.kind === 'daftar' &&
            (g.rows.length ? (
              <BarList rows={g.rows} />
            ) : (
              <p className={CHART_EMPTY}>Belum ada catatan.</p>
            ))}
        </section>
      ))}
    </div>
  );
}

const CHART_EMPTY = 'px-0 pt-1 pb-0 leading-[1.65] text-ink-3';

function DailyChart({ days, format = String, title }: Extract<Chart, { kind: 'harian' }>) {
  const peak = Math.max(1, ...days.map((h) => h.value));
  return (
    <div
      className="grid h-[124px] grid-cols-[repeat(7,minmax(0,1fr))] gap-1.5"
      role="img"
      aria-label={`${title}: ${days.map((h) => `${h.label} ${format(h.value)}`).join(', ')}`}
    >
      {days.map((h, i) => (
        <div key={i} className="grid min-w-0 grid-rows-[auto_1fr_auto] justify-items-center gap-1">
          <em className="min-h-[14px] text-[10.5px] whitespace-nowrap text-ink-3 not-italic tabular-nums">
            {h.value ? format(h.value) : ''}
          </em>
          <span className="flex w-full max-w-[24px] items-end">
            <i
              className={cn(
                'block w-full rounded-[5px_5px_2px_2px] bg-accent-strong opacity-45',
                h.highlight && 'opacity-100',
              )}
              style={{ height: h.value ? `${Math.max(6, (h.value / peak) * 100)}%` : 0 }}
            />
          </span>
          <small className="text-[11px] font-semibold text-ink-3">{h.label}</small>
        </div>
      ))}
    </div>
  );
}

function StackedChart({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((n, b) => n + b.value, 0);
  return (
    <>
      <div className="flex h-3 gap-[3px] overflow-hidden rounded-[99px]" aria-hidden="true">
        {total ? (
          segments
            .filter((b) => b.value)
            .map((b) => (
              <i
                key={b.label}
                className={cn('block min-w-[6px] rounded-[99px]', SEGMENT[b.tone])}
                style={{ flexGrow: b.value }}
              />
            ))
        ) : (
          <i className="block min-w-[6px] grow rounded-[99px] bg-surface-3" />
        )}
      </div>
      <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12px] text-ink-3">
        {segments.map((b) => (
          <li key={b.label} className="inline-flex items-center gap-1.5">
            <i className={cn('size-[9px] rounded-[3px]', SEGMENT[b.tone])} aria-hidden="true" />
            {b.label} <b className="text-ink tabular-nums">{b.value}</b>
          </li>
        ))}
      </ul>
    </>
  );
}

function BarList({ rows }: { rows: Extract<Chart, { kind: 'daftar' }>['rows'] }) {
  const peak = Math.max(1, ...rows.map((b) => b.value));
  return (
    <ul className="m-0 grid list-none gap-2.5 p-0">
      {rows.map((b) => (
        <li
          key={b.label}
          className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_auto] items-center gap-2.5 text-[12.5px]"
        >
          <span className="truncate">{b.label}</span>
          <Bar className="h-2" tone={b.tone || 'biru'} width={`${(b.value / peak) * 100}%`} />
          <b className="whitespace-nowrap tabular-nums">{b.note ?? b.value}</b>
        </li>
      ))}
    </ul>
  );
}
