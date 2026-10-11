import { expect, it } from 'vitest';
import { getWorldModel } from '@/features/dunia-3d/model/world-model';
import { monitoringPlans } from '@/features/dunia-3d/character-plan';
import {
  deliveryInfo,
  deliveryStage,
  dockList,
  roomRows,
  roomStats,
  searchRecords,
  type Konteks,
} from '@/features/dunia-3d/monitor-data';
import type { Item } from '@/features/records/schemas';

const row = (id: string, data: Item['data']): Item => ({ id, data, created_at: '2026-10-01', updated_at: 'u' });
// 10:00 WIB
const now = new Date('2026-10-09T03:00:00Z');
const date = '2026-10-09';
const data = {
  organization: [row('o', { title: 'KDMP', manager: 'Sari' })],
  staff: [
    row('s1', { title: 'Ani', status: 'aktif' }),
    row('s2', { title: 'Budi', status: 'aktif', outfit: 'hijau' }),
    row('s3', { title: 'Citra', status: 'aktif', hair: 'berkerudung' }),
    row('s4', { title: 'Dodi', status: 'aktif' }),
    row('s5', { title: 'Lama', status: 'nonaktif' }),
  ],
  'work-items': [
    row('t1', { title: 'Cek stok', status: 'proses', assignee: 'Budi', due_date: '2026-10-01' }),
    row('t2', { title: 'Susun rak', status: 'rencana', assignee: 'Citra', due_date: '2026-10-20' }),
  ],
  meetings: [row('m1', { title: 'Briefing', date, time: '09:30', duration: 60, participants: 'Ani, Sari' })],
  journal: [
    row('j1', { title: 'Senam', date, work_item_id: 't2' }),
    row('j2', { title: 'Kerja bakti', date }),
  ],
  deliveries: [
    row('d1', { title: 'Beras', status: 'tiba', dock: 'D2', driver_name: 'Agus', license_plate: '' }),
    row('d2', { title: 'Selesai', status: 'selesai' }),
  ],
};
const model = getWorldModel(data, now);
const plans = monitoringPlans(model);
const ctx: Konteks = { model, date, now, documents: [], plans };

it('aktivitas tercatat menentukan ruang figur; nonaktif tidak tampil', () => {
  const by = Object.fromEntries(plans.map((p) => [p.name, [p.area, p.action]]));
  expect(by).toEqual({
    Sari: ['rapat', 'meeting'], // manajer dari Pengaturan, tercantum di rapat berlangsung
    Ani: ['rapat', 'meeting'],
    Budi: ['kerja', 'work'],
    Citra: ['gym', 'gym'],
    Dodi: ['istirahat', 'rest'],
  });
  expect(plans.find((p) => p.name === 'Sari')?.mascot).toBe(true);
  expect(plans.find((p) => p.name === 'Citra')?.rupa.rambut).toBe('hijab');
  expect(plans.find((p) => p.name === 'Budi')?.rupa.baju).toBe(0x86c3a3);
  expect(plans.find((p) => p.name === 'Sari')?.rupa.seragam).toBe('jas');
});

it('daftar ruang: tugas terlambat lebih dulu, saring per anggota', () => {
  const rows = roomRows('kerja', ctx);
  expect(rows.map((r) => [r.item.id, r.pill])).toEqual([
    ['t1', 'Lewat tenggat'],
    ['t2', 'Terbuka'],
  ]);
  expect(roomRows('kerja', ctx, { person: 'Citra' }).map((r) => r.item.id)).toEqual(['t2']);
  expect(roomRows('kerja', ctx, { lateOnly: true }).map((r) => r.item.id)).toEqual(['t1']);
  expect(roomRows('gym', ctx).map((r) => r.note)).toEqual(['Tugas: Susun rak', 'Jurnal hari ini']);
  expect(roomRows('rapat', ctx)[0].pill).toBe('Berlangsung');
  expect(roomStats('kerja', ctx)[0]).toEqual({ label: 'Dikerjakan', value: '1 / 2', bar: 0.5 });
});

it('tugas proses mengikuti seksi; tugas belum dikerjakan ke Tim & tugas', () => {
  const m = getWorldModel(
    {
      staff: [
        row('a', { title: 'Admin', status: 'aktif', section: 'administrasi & keuangan' }),
        row('g', { title: 'Gudang', status: 'aktif', section: 'gudang & logistik' }),
        row('r', { title: 'Rencana', status: 'aktif' }),
      ],
      'work-items': [
        row('1', { title: 'Laporan', status: 'proses', assignee: 'Admin' }),
        row('2', { title: 'Bongkar', status: 'proses', assignee: 'Gudang' }),
        row('3', { title: 'Susun', status: 'rencana', assignee: 'Rencana' }),
      ],
    },
    now,
  );
  expect(monitoringPlans(m).map((p) => [p.name, p.area, p.action])).toEqual([
    ['Manajer', 'manajer', 'manage'],
    ['Admin', 'kas', 'work'],
    ['Gudang', 'stok', 'work'],
    ['Rencana', 'kerja', 'plan'],
  ]);
  expect(roomRows('istirahat', ctx).map((r) => r.item.id)).toEqual(['s4']);
});

it('kemampuan belum aktif ditandai —, bukan nol', () => {
  const stats = roomStats('kas', { ...ctx, operations: false, logistics: false });
  expect(stats.map((s) => s.value)).toEqual(['—', '—']);
  expect(roomRows('kas', { ...ctx, operations: false, logistics: false })).toEqual([]);
});

it('pengiriman: dok, tahap, dan rincian hanya yang tercatat', () => {
  const docks = dockList(model);
  expect(docks.map((d) => d.spot?.delivery.id ?? null)).toEqual([null, 'd1', null, null]);
  expect(deliveryStage(data.deliveries[0])).toBe(2);
  const info = Object.fromEntries(deliveryInfo(data.deliveries[0]));
  expect(info.Sopir).toBe('Agus');
  expect(info.Dok).toBe('D2');
  expect('Plat' in info).toBe(false);
});

it('pencarian lintas catatan', () => {
  expect(searchRecords(ctx, 'beras').map((r) => r.kind)).toEqual(['Pengiriman']);
  expect(searchRecords(ctx, 'beras').length).toBe(1);
  expect(searchRecords({ ...ctx, logistics: false }, 'beras')).toEqual([]);
  expect(searchRecords(ctx, '  ')).toEqual([]);
});
