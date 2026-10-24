'use client';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowDownLeft, ArrowUpRight, ClipboardCheck, ShoppingCart } from 'lucide-react';
import type { Entity, Item } from './schemas';
import type { QuickFilter } from './records-view';
import { riskLevel, riskScore, stockState } from './card-tone';
import type { Workspace } from '@/features/workspace/use-workspace';
import { StatGrid, StatTile } from '@/components/ui/stat';
import { Bar } from '@/components/ui/progress';
import { cashSummary, rupiah, stockDifference } from '@/lib/ledger';
import { addDays, today } from '@/lib/date';
import { readiness } from '@/lib/progress';
import type { Checklist } from './schemas';

type View = {
  metrics?: (rows: Item[], ws: Workspace) => ReactNode;
  quickFilters?: QuickFilter[];
  columns?: string[];
  cardExtra?: (row: Item, ws: Workspace) => ReactNode;
  sort?: 'date' | 'title';
};

const sum = (rows: Item[], field: string) =>
  rows.reduce((total, row) => total + Number(row.data[field] || 0), 0);
// Tanda minus menempel pada angka (spasi tak terputus) agar "−Rp 1,6 jt" tidak pecah baris.
const short = (value: number) => {
  const amount = Math.abs(value);
  const text =
    amount >= 1_000_000
      ? `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
      : rupiah(amount);
  return value < 0 ? `−${text}` : text;
};

const QUICK_LINK =
  'flex h-9 items-center gap-1.5 rounded-xl bg-surface/70 px-3 text-xs font-bold text-tone-ink transition hover:bg-surface [&_svg]:size-3.5';

/** Ringkasan, saringan cepat, kolom tabel, dan aksi kartu per jenis catatan. */
export const ENTITY_VIEWS: Partial<Record<Entity, View>> = {
  'cash-entries': {
    columns: ['date', 'title', 'direction', 'amount', 'category', 'account', 'unit_id'],
    quickFilters: [
      { id: 'in', label: 'Uang masuk', test: (row) => row.data.direction === 'masuk' },
      { id: 'out', label: 'Uang keluar', test: (row) => row.data.direction === 'keluar' },
    ],
    metrics: (rows) => {
      const cash = cashSummary(rows);
      return (
        <div className="flex flex-col gap-2">
          <StatGrid className="lg:grid-cols-3">
            <StatTile
              label="Uang masuk"
              value={short(cash.incoming)}
              tone="mint"
              icon={<ArrowDownLeft />}
              note={`${rows.filter((r) => r.data.direction === 'masuk').length} transaksi`}
            />
            <StatTile
              label="Uang keluar"
              value={short(cash.outgoing)}
              tone="rose"
              icon={<ArrowUpRight />}
              note={`${rows.filter((r) => r.data.direction === 'keluar').length} transaksi`}
            />
            <StatTile
              label="Selisih kas tercatat"
              value={short(cash.net)}
              tone="sky"
              note="Selisih transaksi; bukan saldo bank"
            />
          </StatGrid>
          <p className="text-xs text-ink-3">
            Ringkasan mengikuti saringan; bukan saldo rekening atau laporan laba rugi.
          </p>
        </div>
      );
    },
  },
  members: {
    columns: ['title', 'member_number', 'date', 'contact', 'status'],
    sort: 'title',
    metrics: (rows, ws) => {
      const all = ws.members || [];
      const active = all.filter((row) => row.data.status !== 'nonaktif').length;
      const ids = new Set(rows.map((row) => row.id));
      const deposits = (ws['cash-entries'] || []).filter(
        (row) => row.data.direction === 'masuk' && ids.has(String(row.data.member_id)),
      );
      return (
        <StatGrid className="lg:grid-cols-3">
          <StatTile
            label="Total anggota"
            value={rows.length}
            tone="sky"
            note={`${all.length} anggota tercatat`}
          />
          <StatTile
            label="Aktif"
            value={all.length ? `${Math.round((active / all.length) * 100)}%` : '—'}
            tone="mint"
            note={`${active} anggota aktif`}
          />
          <StatTile
            label="Setoran kas tercatat"
            value={short(sum(deposits, 'amount'))}
            tone="lavender"
            note="Uang masuk yang ditautkan ke anggota"
          />
        </StatGrid>
      );
    },
    cardExtra: (row) => (
      <div data-tone="sky" className="flex gap-2">
        <Link
          className={QUICK_LINK}
          href={`/cash?new=1&direction=masuk&fill.member_id=${row.id}&fill.title=${encodeURIComponent(`Setoran kas: ${String(row.data.title)}`)}&fill.account=${encodeURIComponent('Kas Utama Koperasi')}`}
        >
          <ArrowDownLeft />
          Catat kas
        </Link>
        <Link className={QUICK_LINK} href={`/members?tab=savings&new=1&fill.member_id=${row.id}`}>
          Simpanan
        </Link>
      </div>
    ),
  },
  'inventory-items': {
    columns: [
      'title',
      'sku',
      'unit_id',
      'measurement',
      'price',
      'book_quantity',
      'minimum_quantity',
    ],
    sort: 'title',
    quickFilters: [
      { id: 'safe', label: 'Stok aman', test: (row) => stockState(row) === 'aman' },
      { id: 'low', label: 'Menipis', test: (row) => stockState(row) === 'menipis' },
      { id: 'empty', label: 'Habis', test: (row) => stockState(row) === 'habis' },
    ],
    metrics: (rows) => (
      <StatGrid className="lg:grid-cols-3">
        <StatTile label="Jenis barang" value={rows.length} tone="peach" />
        <StatTile
          label="Perkiraan nilai persediaan"
          value={short(
            rows.reduce(
              (total, row) =>
                total + Number(row.data.book_quantity || 0) * Number(row.data.price || 0),
              0,
            ),
          )}
          tone="lavender"
          note="Stok buku × harga satuan"
        />
        <StatTile
          label="Stok menipis / perlu belanja"
          value={rows.filter((row) => stockState(row) !== 'aman').length}
          tone="rose"
          note={`${rows.filter((row) => stockState(row) === 'habis').length} habis`}
        />
      </StatGrid>
    ),
    cardExtra: (row, ws) => {
      const latest = (ws['stock-counts'] || [])
        .filter((c) => c.data.item_id === row.id)
        .sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)))[0];
      return (
        <div data-tone="peach" className="flex flex-wrap items-center gap-2">
          <Link className={QUICK_LINK} href={`/goods?tab=counts&new=1&item=${row.id}`}>
            <ClipboardCheck />
            Opname
          </Link>
          <Link
            className={QUICK_LINK}
            href={`/cash?new=1&direction=keluar&fill.item_id=${row.id}&fill.unit_id=${String(row.data.unit_id || '')}&fill.title=${encodeURIComponent(`Beli stok: ${String(row.data.title)}`)}&fill.account=${encodeURIComponent('Pengadaan Barang & Persediaan')}&fill.amount=${Number(row.data.price || 0) * 10}`}
          >
            <ShoppingCart />
            Beli stok
          </Link>
          {latest && stockDifference(latest) !== 0 && (
            <span className="text-xs font-semibold text-warn-ink">
              Opname terakhir selisih {stockDifference(latest)}
            </span>
          )}
        </div>
      );
    },
  },
  'stock-counts': {
    columns: ['date', 'item_id', 'book_quantity', 'counted_quantity', 'assignee'],
    quickFilters: [
      { id: 'match', label: 'Fisik sesuai', test: (row) => stockDifference(row) === 0 },
      { id: 'diff', label: 'Ada selisih', test: (row) => stockDifference(row) !== 0 },
    ],
    metrics: (rows) => (
      <div className="flex flex-col gap-2">
        <StatGrid className="lg:grid-cols-3">
          <StatTile label="Pemeriksaan" value={rows.length} tone="lemon" />
          <StatTile
            label="Ada selisih"
            value={rows.filter((row) => stockDifference(row) !== 0).length}
            tone="peach"
          />
          <StatTile
            label="Fisik sesuai"
            value={rows.filter((row) => stockDifference(row) === 0).length}
            tone="mint"
          />
        </StatGrid>
        <p className="text-xs text-ink-3">
          Menyimpan opname tidak mengoreksi stok buku. Koreksi dicatat sebagai mutasi stok.
        </p>
      </div>
    ),
  },
  savings: {
    columns: ['date', 'member_id', 'kind', 'direction', 'amount', 'reference_number'],
    metrics: (rows) => {
      const balance = (kind: string) =>
        rows
          .filter((row) => row.data.kind === kind)
          .reduce(
            (total, row) =>
              total + (row.data.direction === 'tarik' ? -1 : 1) * Number(row.data.amount || 0),
            0,
          );
      return (
        <StatGrid>
          <StatTile label="Simpanan pokok" value={short(balance('pokok'))} tone="sky" />
          <StatTile label="Simpanan wajib" value={short(balance('wajib'))} tone="mint" />
          <StatTile label="Simpanan sukarela" value={short(balance('sukarela'))} tone="lavender" />
          <StatTile
            label="Anggota penyimpan"
            value={new Set(rows.map((row) => row.data.member_id)).size}
            tone="peach"
          />
        </StatGrid>
      );
    },
  },
  sales: {
    columns: ['date', 'unit_id', 'amount', 'transactions'],
    metrics: (rows) => {
      const date = today();
      const week = rows.filter(
        (row) => String(row.data.date) >= addDays(date, -6) && String(row.data.date) <= date,
      );
      const yesterday = rows.filter((row) => row.data.date === addDays(date, -1));
      return (
        <StatGrid className="lg:grid-cols-3">
          <StatTile
            label="Omzet 7 hari"
            value={short(sum(week, 'amount'))}
            tone="lavender"
            note="Bukan laba"
          />
          <StatTile
            label="Transaksi 7 hari"
            value={sum(week, 'transactions').toLocaleString('id-ID')}
            tone="sky"
          />
          <StatTile
            label="Omzet kemarin"
            value={short(sum(yesterday, 'amount'))}
            tone="mint"
            note={`${new Set(yesterday.map((row) => row.data.unit_id)).size} gerai melapor`}
          />
        </StatGrid>
      );
    },
  },
  attendance: {
    columns: ['date', 'staff_id', 'status', 'shift', 'check_in_time', 'check_out_time'],
    metrics: (rows) => {
      const todays = rows.filter((row) => row.data.date === today());
      const count = (...statuses: string[]) =>
        todays.filter((row) => statuses.includes(String(row.data.status))).length;
      return (
        <StatGrid>
          <StatTile
            label="Hadir hari ini"
            value={`${count('hadir', 'terlambat')}/${todays.length}`}
            tone="mint"
          />
          <StatTile label="Terlambat" value={count('terlambat')} tone="peach" />
          <StatTile
            label="Izin, sakit, cuti, alpa"
            value={count('izin', 'sakit', 'cuti', 'alpa')}
            tone="rose"
          />
          <StatTile label="Belum absen" value={count('terjadwal')} tone="lavender" />
        </StatGrid>
      );
    },
  },
  'purchase-orders': {
    columns: ['date', 'title', 'stakeholder_id', 'status', 'total', 'expected_date'],
    metrics: (rows) => {
      const open = rows.filter((row) => row.data.status === 'dipesan');
      return (
        <StatGrid className="lg:grid-cols-3">
          <StatTile label="Menunggu barang" value={open.length} tone="lavender" />
          <StatTile label="Nilai pesanan terbuka" value={short(sum(open, 'total'))} tone="sky" />
          <StatTile
            label="Lewat perkiraan tiba"
            value={
              open.filter(
                (row) => row.data.expected_date && String(row.data.expected_date) < today(),
              ).length
            }
            tone="rose"
          />
        </StatGrid>
      );
    },
  },
  assets: {
    columns: ['title', 'code', 'category', 'condition', 'unit_id', 'value', 'assignee'],
    sort: 'title',
    metrics: (rows) => {
      const kept = rows.filter((row) => row.data.condition !== 'dihapuskan');
      return (
        <StatGrid className="lg:grid-cols-3">
          <StatTile label="Aset tercatat" value={kept.length} tone="sky" />
          <StatTile label="Nilai perolehan" value={short(sum(kept, 'value'))} tone="lavender" />
          <StatTile
            label="Perlu perbaikan / rusak"
            value={
              kept.filter((row) =>
                ['perlu perbaikan', 'rusak'].includes(String(row.data.condition)),
              ).length
            }
            tone="peach"
          />
        </StatGrid>
      );
    },
  },
  journal: {
    metrics: (rows) => {
      const month = today().slice(0, 7);
      return (
        <StatGrid>
          <StatTile label="Total kegiatan" value={rows.length} tone="lavender" />
          <StatTile
            label="Bulan ini"
            value={rows.filter((row) => String(row.data.date).startsWith(month)).length}
            tone="sky"
          />
          <StatTile
            label="Tindak lanjut tugas"
            value={rows.filter((row) => row.data.work_item_id).length}
            tone="mint"
          />
          <StatTile
            label="Koordinasi rapat"
            value={rows.filter((row) => row.data.meeting_id).length}
            tone="peach"
          />
        </StatGrid>
      );
    },
  },
  risks: {
    metrics: (rows) => <RiskMatrix rows={rows} />,
  },
  units: {
    sort: 'title',
    cardExtra: (row, ws) => {
      const items = (ws.checklist || [])
        .filter((item) => item.data.unit_id === row.id)
        .map((item) => item.data as unknown as Checklist);
      const score = readiness(items);
      return (
        <div data-tone="sky" className="rounded-2xl bg-surface p-3 shadow-card">
          <p className="mb-2 flex justify-between text-xs font-bold text-ink-2">
            Kesiapan buka{' '}
            <span className="tabular">{score === null ? 'Belum dinilai' : `${score}%`}</span>
          </p>
          <Bar value={score ?? 0} label="Kesiapan gerai" />
        </div>
      );
    },
  },
  meetings: {
    columns: ['date', 'time', 'title', 'jenis', 'mode', 'location'],
    quickFilters: [
      {
        id: 'upcoming',
        label: 'Hari ini & mendatang',
        test: (row) => String(row.data.date) >= today(),
      },
      { id: 'past', label: 'Sebelumnya', test: (row) => String(row.data.date) < today() },
    ],
  },
  decisions: { columns: ['date', 'title', 'meeting_id', 'reason'] },
  staff: { sort: 'title' },
  stakeholders: { sort: 'title' },
  documents: { sort: 'title' },
};

/** Matriks risiko 3×3 (peluang × dampak) untuk risiko yang belum ditutup. */
function RiskMatrix({ rows }: { rows: Item[] }) {
  const open = rows.filter((row) => row.data.status !== 'ditutup');
  const rowsOf = (p: number, i: number) =>
    open.filter((row) => {
      const prob = Number(row.data.probability || 3);
      const impact = Number(row.data.impact || 3);
      const pBand = prob >= 4 ? 2 : prob === 3 ? 1 : 0;
      const iBand = impact >= 4 ? 2 : impact === 3 ? 1 : 0;
      return pBand === p && iBand === i;
    });
  const tone = (p: number, i: number) => (p + i >= 3 ? 'rose' : p + i >= 2 ? 'peach' : 'mint');
  const levels = { Kritis: 0, Waspada: 0, Terkendali: 0 };
  for (const row of open) levels[riskLevel(riskScore(row)) as keyof typeof levels]++;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
      <div className="overflow-x-auto rounded-[var(--radius-card)] bg-surface p-4 shadow-card">
        <p className="mb-3 text-sm font-bold">Matriks risiko terbuka</p>
        <div className="grid min-w-[30rem] grid-cols-[5rem_repeat(3,1fr)] gap-2 text-xs">
          <span />
          {['Ringan', 'Sedang', 'Fatal'].map((label) => (
            <span key={label} className="text-center font-bold text-ink-3">
              {label}
            </span>
          ))}
          {[2, 1, 0].map((p) => (
            <div key={p} className="contents">
              <span className="self-center font-bold text-ink-3">
                {['Jarang', 'Kadang', 'Sering'][p]}
              </span>
              {[0, 1, 2].map((i) => {
                const cell = rowsOf(p, i);
                return (
                  <div
                    key={i}
                    data-tone={tone(p, i)}
                    className="min-h-20 rounded-2xl bg-tone p-2 text-tone-ink"
                  >
                    <span className="tabular text-lg font-extrabold">{cell.length}</span>
                    {cell.slice(0, 2).map((row) => (
                      <span key={row.id} className="block truncate font-semibold">
                        {String(row.data.title)}
                      </span>
                    ))}
                    {cell.length > 2 && (
                      <span className="block opacity-75">+{cell.length - 2} lainnya</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
        <StatTile label="Kritis" value={levels.Kritis} tone="rose" note="Skor ≥ 15" />
        <StatTile label="Waspada" value={levels.Waspada} tone="peach" note="Skor 8–14" />
        <StatTile label="Terkendali" value={levels.Terkendali} tone="mint" note="Skor < 8" />
      </div>
    </div>
  );
}
