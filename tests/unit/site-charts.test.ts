import { expect, it } from 'vitest';
import { siteCharts } from '@/features/world/site-charts';
import type { WorldModel } from '@/features/world/model/world-model';
import type { Item } from '@/features/records/schemas';

const row = (id: string, data: Record<string, unknown>) => ({ id, data }) as unknown as Item;
const model = {
  inventory: {
    racks: { A: [], B: [], C: [], D: [], E: [], F: [] },
    coldRacks: { C1: [], C2: [], C3: [] },
  },
} as unknown as WorldModel;
const dasar = { model, day: '2026-10-15', stock: true, shipping: true, unavailable: false };

it('tugas terbuka dipisah: lewat tenggat, dikerjakan, rencana', () => {
  const [tumpuk] = siteCharts({
    ...dasar,
    site: 'kantor',
    data: {
      'work-items': [
        row('1', { status: 'proses', due_date: '2026-10-10' }),
        row('2', { status: 'proses', due_date: '2026-10-20' }),
        row('3', { status: 'rencana', due_date: '2026-10-20' }),
        row('4', { status: 'selesai', due_date: '2026-10-01', completed_at: '2026-10-15' }),
      ],
    },
  });
  expect(tumpuk).toMatchObject({
    kind: 'tumpuk',
    segments: [
      { label: 'Lewat tenggat', value: 1 },
      { label: 'Dikerjakan', value: 1 },
      { label: 'Rencana', value: 1 },
    ],
  });
});

it('gerai tanpa migrasi 10 menulis belum aktif, bukan nol', () => {
  const [grafik] = siteCharts({ ...dasar, site: 'gerai', data: {} });
  expect(grafik).toMatchObject({ kind: 'catatan', text: expect.stringContaining('belum aktif') });
});

it('data belum tersedia tidak menghasilkan angka', () => {
  expect(siteCharts({ ...dasar, unavailable: true, site: 'gudang', data: {} })).toEqual([
    { kind: 'catatan', title: 'Grafik', text: 'Data belum tersedia.' },
  ]);
});
