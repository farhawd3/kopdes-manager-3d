import { describe, expect, it } from 'vitest';
import {
  getWorldModel,
  meetingTimeline,
  summarizeInventory,
  placeTrucks,
  isBelowMinimum,
} from '@/features/world/model/world-model';
import type { Item } from '@/features/records/schemas';
import { listedIn, sameName } from '@/lib/people';
import { allBuildings } from '@/features/world/model/district';
const row = (
  id: string,
  data: Record<string, unknown>,
  created = '2026-10-01T00:00:00Z',
): Item => ({ id, data, created_at: created, updated_at: created });
describe('pemetaan dunia koperasi', () => {
  it('menyediakan bangunan unit kosong (rencana) tanpa mengarang unit atau identitas', () => {
    const result = getWorldModel({}, new Date('2026-10-04T05:00:00Z'));
    expect(result.plots).toHaveLength(8);
    expect(result.plots.every((plot) => !plot.unit)).toBe(true);
    expect(result.manager).toBe('Manajer');
    expect(result.activity).toBe('idle');
  });
  it('penempatan stabil terhadap urutan respons dan melaporkan gerai di luar kavling', () => {
    const units = Array.from({ length: 9 }, (_, i) => row(`unit-${i}`, { title: `Gerai ${i}` }));
    const first = getWorldModel({ units }, new Date());
    const reversed = getWorldModel({ units: [...units].reverse() }, new Date());
    expect(first.plots.map((plot) => plot.unit?.id)).toEqual(
      reversed.plots.map((plot) => plot.unit?.id),
    );
    expect(first.units).toHaveLength(9);
  });
  it('rapat aktif berdasarkan waktu Jakarta dan durasi, bukan seluruh hari', () => {
    const data = {
      meetings: [
        row('meeting', { title: 'Rapat', date: '2026-10-04', time: '09:00', duration: 60 }),
      ],
    };
    expect(getWorldModel(data, new Date('2026-10-04T01:59:00Z')).activity).toBe('idle');
    expect(getWorldModel(data, new Date('2026-10-04T02:00:00Z')).activity).toBe('meeting');
    expect(getWorldModel(data, new Date('2026-10-04T02:59:00Z')).activity).toBe('meeting');
    expect(getWorldModel(data, new Date('2026-10-04T03:00:00Z')).activity).toBe('idle');
  });
  it('kegiatan hari Jakarta memicu olahraga; catatan kemarin tidak', () => {
    const journal = [row('activity', { title: 'Kunjungan', date: '2026-10-05' })];
    expect(getWorldModel({ journal }, new Date('2026-10-04T17:01:00Z')).activity).toBe('gym');
    expect(getWorldModel({ journal }, new Date('2026-10-05T17:01:00Z')).activity).toBe('idle');
  });
  it('tugas selesai dan dibatalkan tidak menggerakkan aktivitas kerja', () => {
    const tasks = ['selesai', 'dibatalkan', 'rencana', 'proses'].map((status) =>
      row(status, { title: status, status }),
    );
    const model = getWorldModel({ 'work-items': tasks }, new Date());
    expect(model.tasks).toHaveLength(2);
    expect(model.activity).toBe('work');
  });
});

describe('bangunan gerai menurut jenis', () => {
  const unit = (id: string, kind: string, slot: string | undefined, created: string) =>
    row(id, { title: id, kind, ...(slot ? { slot } : {}) }, created);
  const at = (model: ReturnType<typeof getWorldModel>, id: string) =>
    model.plots.find((plot) => plot.id === id)?.unit?.id ?? null;
  it('gerai menempati bangunan sesuai jenisnya; jenis logistik menjadi catatan gudang', () => {
    const model = getWorldModel(
      {
        units: [
          unit('s', 'Sembako', undefined, '2026-10-01T00:00:00Z'),
          unit('a', 'apotek desa', undefined, '2026-10-02T00:00:00Z'),
          unit('k', 'Klinik', undefined, '2026-10-03T00:00:00Z'),
          unit('g', 'logistik', undefined, '2026-10-04T00:00:00Z'),
        ],
      },
      new Date(),
    );
    expect(at(model, 'sembako')).toBe('s');
    expect(at(model, 'apotek')).toBe('a');
    expect(at(model, 'klinik')).toBe('k');
    expect(model.warehouseUnit?.id).toBe('g');
    expect(at(model, 'simpan-pinjam')).toBeNull();
  });
  it('jenis lain mengisi kavling gerai tambahan menurut kolom Lahan lalu urutan dibuat', () => {
    const model = getWorldModel(
      {
        units: [
          unit('x', 'kuliner', undefined, '2026-10-01T00:00:00Z'),
          unit('y', 'bengkel', '3', '2026-10-02T00:00:00Z'),
          unit('s2', 'sembako', undefined, '2026-10-03T00:00:00Z'),
        ],
      },
      new Date(),
    );
    expect(at(model, 'gerai-3')).toBe('y');
    expect(at(model, 'gerai-1')).toBe('x');
    // Sembako kedua tidak menggeser yang pertama: mengisi kavling tambahan berikutnya.
    expect(at(model, 'sembako')).toBe('s2');
  });
});

describe('jadwal rapat hari ini', () => {
  it('mengurutkan rapat dan menandai selesai, berlangsung, nanti menurut WIB', () => {
    const meetings = [
      row('sore', { title: 'Sore', date: '2026-10-06', time: '15:00', duration: 30 }),
      row('pagi', { title: 'Pagi', date: '2026-10-06', time: '08:00', duration: 60 }),
      row('siang', { title: 'Siang', date: '2026-10-06', time: '10:00', duration: 90 }),
    ];
    // 10:30 WIB
    const steps = meetingTimeline(meetings, new Date('2026-10-06T03:30:00Z'));
    expect(steps.map((step) => [step.row.id, step.state])).toEqual([
      ['pagi', 'selesai'],
      ['siang', 'berlangsung'],
      ['sore', 'nanti'],
    ]);
    expect(steps[1].end).toBe('11:30');
  });
});

describe('inventaris gudang', () => {
  it('mengelompokkan barang per rak, gerai dan staging serta menandai stok minimum', () => {
    const items = [
      row('a', { title: 'A', rack: 'A', book_quantity: 2, minimum_quantity: 5 }),
      row('b', { title: 'B', rack: 'A', book_quantity: 9, minimum_quantity: 5 }),
      row('c', { title: 'C', rack: 'belum ditentukan', unit_id: 'unit-1', book_quantity: 1 }),
      row('d', { title: 'D', book_quantity: 0, minimum_quantity: 0 }),
    ];
    const inventory = summarizeInventory(items);
    expect(inventory.racks.A.map((item) => item.id)).toEqual(['a', 'b']);
    expect(inventory.atUnits.map((item) => item.id)).toEqual(['c']);
    expect(inventory.staging.map((item) => item.id)).toEqual(['d']);
    expect(inventory.low.map((item) => item.id)).toEqual(['a']);
    // Batas minimum 0 berarti tidak dipantau, bukan kekurangan.
    expect(isBelowMinimum(items[3])).toBe(false);
  });
});

describe('truk dari pengiriman', () => {
  const delivery = (id: string, status: string, extra: Record<string, unknown> = {}) =>
    row(id, { title: id, direction: 'masuk', status, ...extra });
  it('dok mengikuti catatan; tanpa dok menunggu antrean', () => {
    const spots = placeTrucks([
      delivery('a', 'tiba', { dock: 'D3' }),
      delivery('b', 'diperiksa'),
      delivery('c', 'dikirim'),
      delivery('d', 'selesai'),
      delivery('e', 'tiba', { direction: 'keluar' }),
    ]);
    expect(spots.map((spot) => [spot.delivery.id, spot.place, spot.index])).toEqual([
      ['a', 'dok', 2],
      ['b', 'antre', 0],
      ['c', 'antre', 1],
    ]);
  });
  it('kelebihan truk tidak digambar melebihi jumlah dok dan antrean', () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      delivery(`t${i}`, 'tiba', { dock: `D${(i % 4) + 1}` }),
    );
    expect(placeTrucks(many).filter((spot) => spot.place === 'dok')).toHaveLength(4);
    expect(placeTrucks(many).filter((spot) => spot.place === 'antre')).toHaveLength(3);
  });
  it('penghuni tetap di dok ketika pengiriman lebih lama baru tiba', () => {
    const b = delivery('b', 'tiba', { dock: 'D2' });
    const previous = placeTrucks([b]);
    const result = placeTrucks([delivery('a', 'tiba', { dock: 'D2' }), b], 4, 3, previous);
    expect(result.find((s) => s.place === 'dok')?.delivery.id).toBe('b');
    expect(result.find((s) => s.delivery.id === 'a')?.place).toBe('antre');
  });
});

describe('denah distrik v4', () => {
  it('enam jenis unit KDMP punya bangunan tetap dan kantor selalu ada', () => {
    const ids = allBuildings().map((b) => b.id);
    for (const id of [
      'kantor',
      'simpan-pinjam',
      'sembako',
      'apotek',
      'klinik',
      'cold-storage',
      'gudang',
    ])
      expect(ids).toContain(id);
    expect(allBuildings().find((b) => b.id === 'kantor')?.kinds).toEqual([]);
  });
});

describe('rak pendingin cold storage', () => {
  it('barang berak C1–C3 masuk cold storage, bukan staging atau rak gudang', () => {
    const summary = summarizeInventory([
      row('a', { title: 'Ikan', rack: 'C1' }),
      row('b', { title: 'Beras', rack: 'A' }),
      row('c', { title: 'Kopi', rack: 'belum ditentukan' }),
    ]);
    expect(summary.coldRacks.C1.map((item) => item.id)).toEqual(['a']);
    expect(summary.racks.A.map((item) => item.id)).toEqual(['b']);
    expect(summary.staging.map((item) => item.id)).toEqual(['c']);
  });
});

describe('skema rupa Tim', () => {
  it('skema Tim menerima kolom rupa baru dan data lama tanpa kolom itu', async () => {
    const { schemas } = await import('@/features/records/schemas');
    const old = schemas.staff.parse({ title: 'Petugas', hair: 'topi' });
    expect(old.look_head).toBe('belum diisi');
    expect(old.position).toBe('karyawan');
    const fresh = schemas.staff.parse({ title: 'Petugas' });
    expect(fresh.hair).toBeUndefined();
    expect(schemas.staff.safeParse({ title: 'X', look_head: 'helm' }).success).toBe(false);
  });
});

describe('pencocokan nama', () => {
  it('penanggung jawab dicocokkan persis, bukan bagian nama', () => {
    expect(sameName(' ani ', 'Ani')).toBe(true);
    expect(sameName('Daniel', 'Ani')).toBe(false);
    expect(sameName('', '')).toBe(false);
  });
  it('peserta dibaca per nama, dipisah koma, titik koma, baris baru, atau "dan"', () => {
    expect(listedIn('Daniel dan Budi', 'Budi')).toBe(true);
    expect(listedIn('Daniel dan Budi', 'Ani')).toBe(false);
    expect(listedIn('Ani; Citra\nDodi', 'Citra')).toBe(true);
    expect(listedIn('', 'Ani')).toBe(false);
  });
});
