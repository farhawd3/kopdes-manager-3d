import { describe, expect, it } from 'vitest';
import { dataContoh } from '@/features/demo/data-contoh';
import { detailBaris, isiDariQuery, saran, terkait } from '@/features/records/terkait';
import type { Workspace } from '@/features/workspace/useWorkspace';

const rows = dataContoh('2026-10-10');
const ws: Workspace = {};
for (const r of rows) (ws[r.entity] ??= []).push(r);
const cari = (entity: keyof Workspace, judul: string) => ws[entity]!.find((r) => r.data.title === judul)!;

describe('catatan terkait dua arah', () => {
  it('barang menampilkan gerai, kas, mutasi, opname yang merujuknya', () => {
    const minyak = cari('inventory-items', 'Minyak goreng 1 L');
    const k = terkait('inventory-items', minyak, ws);
    expect(k.map((g) => g.entity)).toEqual(expect.arrayContaining(['stock-movements', 'stock-counts']));
    const paracetamol = cari('inventory-items', 'Paracetamol 500 mg');
    expect(terkait('inventory-items', paracetamol, ws).find((g) => g.arah === 'merujuk')?.entity).toBe('units');
  });
  it('staf terhubung ke tugas, rapat, dan unit lewat nama', () => {
    const staf = ws.staff![4];
    const k = terkait('staff', staf, ws);
    expect(k.some((g) => g.entity === 'work-items' && g.arah === 'nama')).toBe(true);
    expect(k.some((g) => g.entity === 'meetings')).toBe(true);
  });
  it('rapat menampilkan keputusan dan peserta; detail memakai label terbaca', () => {
    const rapat = cari('meetings', 'Briefing pagi tim');
    const k = terkait('meetings', rapat, ws);
    expect(k.find((g) => g.entity === 'decisions')?.rows.length).toBe(2);
    expect(k.find((g) => g.judul === 'Peserta')?.rows.length).toBe(6);
    const d = detailBaris('cash-entries', ws['cash-entries']![0], ws);
    expect(d.find((b) => b.field === 'amount')?.nilai).toMatch(/^Rp/);
  });
});

describe('saran langkah berikut', () => {
  it('barang di bawah minimum menyarankan belanja dan pengiriman dengan form terisi', () => {
    const s = saran('inventory-items', cari('inventory-items', 'Minyak goreng 1 L'), ws);
    expect(s.map((x) => x.id)).toEqual(['belanja', 'pengiriman']);
    expect(isiDariQuery(new URLSearchParams(s[0].href.split('?')[1]))).toMatchObject({ category: 'Pembelian' });
  });
  it('pengiriman diperiksa tanpa mutasi menyarankan mutasi masuk; rapat menyarankan tugas', () => {
    const kirim = cari('deliveries', 'Kiriman minyak goreng');
    expect(saran('deliveries', kirim, ws)[0].href).toContain('isi.delivery_id=');
    const rapat = cari('meetings', 'Briefing pagi tim');
    expect(saran('meetings', rapat, ws).length).toBe(2);
    const aman = cari('inventory-items', 'Beras medium 5 kg');
    expect(saran('inventory-items', aman, ws)).toEqual([]);
  });
});
