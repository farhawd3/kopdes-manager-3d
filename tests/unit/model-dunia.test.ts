import { describe, expect, it } from 'vitest';
import {
  getWorldModel,
  meetingTimeline,
  summarizeInventory,
  placeTrucks,
  noticeBoard,
  isBelowMinimum,
  worldPreferencesSchema,
  zoneSummaries,
  weekCounts,
} from '@/features/dunia-3d/model/world-model';
import type { Item } from '@/features/records/schemas';
import { planManager, planStaff } from '@/features/dunia-3d/model/schedule';
import { allBuildings } from '@/features/dunia-3d/model/district';
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
    // Tanpa Jenis, gerai hanya mengisi tiga kavling gerai tambahan; sisanya overflow.
    expect(first.overflow).toBe(6);
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
  it('preferensi menolak nilai tidak dikenal', () => {
    expect(worldPreferencesSchema.safeParse({ weather: 'salju' }).success).toBe(false);
    // Bawaan siang seperti video (keputusan pemilik v4); otomatis WIB tetap pilihan.
    expect(worldPreferencesSchema.parse({}).time).toBe('siang');
  });
});

describe('fondasi render dunia', () => {
  it('preferensi lama tanpa kualitas tetap valid dengan bawaan otomatis', () => {
    const old = worldPreferencesSchema.parse({
      version: 1,
      weather: 'hujan',
      time: 'malam',
      outfit: 'hijau',
    });
    expect(old.quality).toBe('otomatis');
    expect(old.weather).toBe('hujan');
    expect(worldPreferencesSchema.safeParse({ quality: 'ultra' }).success).toBe(false);
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
    const many = Array.from({ length: 9 }, (_, i) => delivery(`t${i}`, 'tiba', { dock: `D${i % 4 + 1}` }));
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

describe('jadwal karakter tim', () => {
  const staff = (id: string, extra: Record<string, unknown> = {}) =>
    row(id, { title: id, status: 'aktif', work_hours: '08:00-16:00', ...extra });
  // 10:00 WIB
  const at10 = new Date('2026-10-06T03:00:00Z');
  const empty = { tasks: [], deliveries: [] };
  it('rapat mengalahkan kegiatan lain; peserta dicocokkan dengan nama', () => {
    const meeting = row('m', { title: 'Rapat', participants: 'Ani, Budi' });
    const plans = planStaff(
      [staff('Ani'), staff('Citra')],
      { ...empty, currentMeeting: meeting },
      at10,
    );
    expect(plans.map((plan) => plan.activity)).toEqual(['rapat', 'kerja']);
  });
  it('peserta dibaca per nama; Peserta kosong tidak menarik staf ke rapat', () => {
    const named = row('m', { title: 'Rapat', participants: 'Daniel dan Budi' });
    const [ani, budi] = planStaff(
      [staff('Ani'), staff('Budi')],
      { ...empty, currentMeeting: named },
      at10,
    );
    expect(ani.activity).not.toBe('rapat');
    expect(budi.activity).toBe('rapat');
    const unnamed = row('m2', { title: 'Rapat', participants: '' });
    expect(
      planStaff([staff('Ani')], { ...empty, currentMeeting: unnamed }, at10)[0].activity,
    ).not.toBe('rapat');
  });
  it('penanggung jawab tugas dicocokkan persis, bukan bagian nama', () => {
    const tasks = [row('t', { title: 'Cek kas', status: 'proses', assignee: 'Daniel' })];
    expect(planStaff([staff('Ani')], { tasks, deliveries: [] }, at10)[0].reason).not.toContain(
      'Cek kas',
    );
    const exact = [row('t', { title: 'Cek kas', status: 'proses', assignee: ' ani ' })];
    expect(planStaff([staff('Ani')], { tasks: exact, deliveries: [] }, at10)[0].reason).toBe(
      'Tugas: Cek kas',
    );
  });
  it('bongkar untuk seksi gudang saat truk di dok, tugas proses, istirahat dan pulang', () => {
    const deliveries = [row('d', { title: 'Kiriman', direction: 'masuk', status: 'tiba' })];
    const tasks = [row('t', { title: 'Cek kas', status: 'proses', assignee: 'Budi' })];
    const plans = planStaff(
      [staff('Dodi', { section: 'gudang & logistik', workplace: 'gudang' }), staff('Budi')],
      { tasks, deliveries },
      at10,
    );
    expect(plans.map((plan) => [plan.activity, plan.location])).toEqual([
      ['bongkar', 'gudang'],
      ['kerja', 'dalam'],
    ]);
    expect(planStaff([staff('Eka')], empty, new Date('2026-10-06T05:30:00Z'))[0].activity).toBe(
      'istirahat',
    );
    const night = planStaff([staff('Eka')], empty, new Date('2026-10-06T13:00:00Z'))[0];
    expect([night.activity, night.location]).toEqual(['pulang', null]);
  });
  it('staf nonaktif tidak digambar', () => {
    expect(planStaff([staff('Fajar', { status: 'nonaktif' })], empty, at10)).toHaveLength(0);
  });
});

describe('briefing dan rencana manajer', () => {
  const staff = (id: string, extra: Record<string, unknown> = {}) =>
    row(id, { title: id, status: 'aktif', work_hours: '08:00-16:00', ...extra });
  it('15 menit pertama jam kerja staf kantor ikut briefing, staf gudang tidak', () => {
    // 08:05 WIB
    const plans = planStaff(
      [staff('Ani'), staff('Dodi', { workplace: 'gudang' })],
      { tasks: [], deliveries: [] },
      new Date('2026-10-06T01:05:00Z'),
    );
    expect(plans[0].activity).toBe('briefing');
    expect(plans[1].activity).not.toBe('briefing');
    expect(planManager(plans, { tasks: [], deliveries: [] }, new Date(), '2026-10-06').kind).toBe(
      'briefing',
    );
  });
  it('manajer mendatangi meja staf dengan tugas lewat tenggat, lalu dok, lalu ruangannya', () => {
    const at10 = new Date('2026-10-06T03:00:00Z');
    const plans = planStaff([staff('Citra')], { tasks: [], deliveries: [] }, at10).map((plan) => ({
      ...plan,
      activity: 'kerja' as const,
    }));
    const late = [row('t', { title: 'Susun rak', due_date: '2026-10-01', assignee: 'Citra' })];
    const visit = planManager(plans, { tasks: late, deliveries: [] }, at10, '2026-10-06');
    expect(visit).toMatchObject({ kind: 'meja-staf', staffId: 'Citra' });
    const dock = [row('d', { title: 'Kiriman', direction: 'masuk', status: 'tiba' })];
    expect(planManager(plans, { tasks: [], deliveries: dock }, at10, '2026-10-06').kind).toBe(
      'dok',
    );
    expect(planManager(plans, { tasks: [], deliveries: [] }, at10, '2026-10-06').kind).toBe(
      'ruang',
    );
  });
});

describe('papan pengumuman', () => {
  it('keputusan terbaru dan dokumen yang habis dalam 30 hari', () => {
    const decisions = ['2026-09-01', '2026-10-05', '2026-08-01', '2026-10-01'].map((date, i) =>
      row(`k${i}`, { title: `K${i}`, date }),
    );
    const documents = [
      row('lama', { title: 'Lama', expires_date: '2026-09-30' }),
      row('dekat', { title: 'Dekat', expires_date: '2026-10-20' }),
      row('jauh', { title: 'Jauh', expires_date: '2027-01-01' }),
      row('tanpa', { title: 'Tanpa' }),
    ];
    const board = noticeBoard(decisions, documents, '2026-10-06');
    expect(board.decisions.map((item) => item.id)).toEqual(['k1', 'k3', 'k0']);
    expect(board.documents.map((item) => item.id)).toEqual(['lama', 'dekat']);
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

describe('ringkasan zona', () => {
  it('menghitung dok terisi, gerai tercatat dan tanpa angka lahan karangan', () => {
    const model = getWorldModel(
      {
        units: [row('k', { title: 'K', kind: 'klinik' })],
        deliveries: [
          row('d', { title: 'D', status: 'tiba', dock: 'D1' }),
          row('e', { title: 'E', status: 'dikirim' }),
        ],
      },
      new Date(),
    );
    const summary = zoneSummaries(model);
    expect(summary.gudang).toMatchObject({ value: 1, total: 4 });
    expect(summary.gudang.note).toContain('1 antre');
    expect(summary.kesehatan).toMatchObject({ value: 1, total: 2 });
    expect(summary.lahan.value).toBeUndefined();
  });
});

describe('riwayat 7 hari', () => {
  it('menghitung per hari dari tanggal tercatat, lama ke baru', () => {
    const rows = [
      row('a', { date: '2026-10-06' }),
      row('b', { date: '2026-10-06' }),
      row('c', { date: '2026-10-01' }),
      row('d', { date: '2026-09-20' }),
    ];
    expect(weekCounts(rows, (r) => String(r.data.date), '2026-10-06')).toEqual([
      0, 1, 0, 0, 0, 0, 2,
    ]);
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

describe('balasan sapaan staf', () => {
  it('balasan: terlambat bila ada tugas lewat tenggat, proses bila ada tugas terbuka, selain itu beres', async () => {
    const { taskReply } = await import('@/features/dunia-3d/model/schedule');
    const late = row('t1', {
      title: 'Kas',
      status: 'proses',
      assignee: 'Ani',
      due_date: '2026-10-01',
    });
    const open = row('t2', { title: 'Stok', status: 'belum mulai', assignee: 'ani' });
    const done = row('t3', {
      title: 'Lama',
      status: 'selesai',
      assignee: 'Ani',
      due_date: '2026-09-01',
    });
    expect(taskReply([late, open], 'Ani', '2026-10-06')).toBe('terlambat');
    expect(taskReply([open, done], 'Ani', '2026-10-06')).toBe('proses');
    expect(taskReply([done], 'Ani', '2026-10-06')).toBe('beres');
    expect(taskReply([open], 'Anita', '2026-10-06')).toBe('beres');
  });
});

