'use client';
// Grafik ringkas di panel Ringkasan dunia. Batang CSS murni (tanpa pustaka grafik) agar halaman
// dunia tidak bertambah berat. Hanya data tercatat; modul belum aktif ditulis, bukan nol.
import { addDays } from '@/lib/date';
import type { Item } from '../records/schemas';
import type { Workspace } from '@/features/workspace/use-workspace';
import { coldRackIds, isBelowMinimum, rackIds, type WorldModel } from './model/world-model';
import type { Tone } from './monitor-data';
import type { WorldSite } from './office-rooms';

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

export function ChartList({ grafik: charts }: { grafik: Chart[] }) {
  return (
    <div className="mt-grafik-daftar">
      {charts.map((g) => (
        <section key={g.title} className="mt-grafik" aria-label={g.title}>
          <h3 className="mt-sub">
            {g.title}
            {'meta' in g && <small>{g.meta}</small>}
          </h3>
          {g.kind === 'catatan' && <p className="mt-empty">{g.text}</p>}
          {g.kind === 'harian' && <DailyChart {...g} />}
          {g.kind === 'tumpuk' && <StackedChart segments={g.segments} />}
          {g.kind === 'daftar' &&
            (g.rows.length ? (
              <BarList rows={g.rows} />
            ) : (
              <p className="mt-empty">Belum ada catatan.</p>
            ))}
        </section>
      ))}
    </div>
  );
}

function DailyChart({ days, format = String, title }: Extract<Chart, { kind: 'harian' }>) {
  const peak = Math.max(1, ...days.map((h) => h.value));
  return (
    <div
      className="mt-harian"
      role="img"
      aria-label={`${title}: ${days.map((h) => `${h.label} ${format(h.value)}`).join(', ')}`}
    >
      {days.map((h, i) => (
        <div key={i} className={h.highlight ? 'is-sorot' : undefined}>
          <em>{h.value ? format(h.value) : ''}</em>
          <span>
            <i style={{ height: h.value ? `${Math.max(6, (h.value / peak) * 100)}%` : 0 }} />
          </span>
          <small>{h.label}</small>
        </div>
      ))}
    </div>
  );
}

function StackedChart({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((n, b) => n + b.value, 0);
  return (
    <>
      <div className="mt-tumpuk" aria-hidden="true">
        {total ? (
          segments
            .filter((b) => b.value)
            .map((b) => (
              <i key={b.label} className={`is-${b.tone}`} style={{ flexGrow: b.value }} />
            ))
        ) : (
          <i className="is-kosong" />
        )}
      </div>
      <ul className="mt-legenda">
        {segments.map((b) => (
          <li key={b.label}>
            <i className={`is-${b.tone}`} aria-hidden="true" />
            {b.label} <b>{b.value}</b>
          </li>
        ))}
      </ul>
    </>
  );
}

function BarList({ rows }: { rows: Extract<Chart, { kind: 'daftar' }>['rows'] }) {
  const peak = Math.max(1, ...rows.map((b) => b.value));
  return (
    <ul className="mt-batang-daftar">
      {rows.map((b) => (
        <li key={b.label}>
          <span>{b.label}</span>
          <span className={`mt-bar is-${b.tone || 'biru'}`} aria-hidden="true">
            <i style={{ width: `${(b.value / peak) * 100}%` }} />
          </span>
          <b>{b.note ?? b.value}</b>
        </li>
      ))}
    </ul>
  );
}
