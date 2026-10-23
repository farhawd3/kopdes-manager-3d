import { describe, expect, it } from 'vitest';
import { dataContoh } from '@/features/demo/sample-data';
import { detailRows, prefillFromQuery, suggestions, relatedGroups } from '@/features/records/related';
import type { Workspace } from '@/features/workspace/use-workspace';

const rows = dataContoh('2026-10-10');
const ws: Workspace = {};
for (const r of rows) (ws[r.entity] ??= []).push(r);
const cari = (entity: keyof Workspace, judul: string) => ws[entity]!.find((r) => r.data.title === judul)!;

describe('catatan terkait dua arah', () => {
  it('barang menampilkan gerai, kas, mutasi, opname yang merujuknya', () => {
    const minyak = cari('inventory-items', 'Minyak goreng 1 L');
    const k = relatedGroups('inventory-items', minyak, ws);
    expect(k.map((g) => g.entity)).toEqual(expect.arrayContaining(['stock-movements', 'stock-counts']));
    const paracetamol = cari('inventory-items', 'Paracetamol 500 mg');
    expect(relatedGroups('inventory-items', paracetamol, ws).find((g) => g.direction === 'refers')?.entity).toBe('units');
  });
  it('staf terhubung ke tugas, rapat, dan unit lewat nama', () => {
    const staf = ws.staff![4];
    const k = relatedGroups('staff', staf, ws);
    expect(k.some((g) => g.entity === 'work-items' && g.direction === 'name')).toBe(true);
    expect(k.some((g) => g.entity === 'meetings')).toBe(true);
  });
  it('rapat menampilkan keputusan dan peserta; detail memakai label terbaca', () => {
    const rapat = cari('meetings', 'Briefing pagi tim');
    const k = relatedGroups('meetings', rapat, ws);
    expect(k.find((g) => g.entity === 'decisions')?.rows.length).toBe(2);
    expect(k.find((g) => g.title === 'Peserta')?.rows.length).toBe(6);
    const d = detailRows('cash-entries', ws['cash-entries']![0], ws);
    expect(d.find((b) => b.field === 'amount')?.value).toMatch(/^Rp/);
  });
});

describe('saran langkah berikut', () => {
  it('barang di bawah minimum menyarankan belanja dan pengiriman dengan form terisi', () => {
    const s = suggestions('inventory-items', cari('inventory-items', 'Minyak goreng 1 L'), ws);
    expect(s.map((x) => x.id)).toEqual(['restock', 'delivery']);
    expect(prefillFromQuery(new URLSearchParams(s[0].href.split('?')[1]))).toMatchObject({ category: 'Pembelian' });
  });
  it('pengiriman diperiksa tanpa mutasi menyarankan mutasi masuk; rapat menyarankan tugas', () => {
    const kirim = cari('deliveries', 'Kiriman minyak goreng');
    expect(suggestions('deliveries', kirim, ws)[0].href).toContain('fill.delivery_id=');
    const rapat = cari('meetings', 'Briefing pagi tim');
    expect(suggestions('meetings', rapat, ws).length).toBe(2);
    const aman = cari('inventory-items', 'Beras medium 5 kg');
    expect(suggestions('inventory-items', aman, ws)).toEqual([]);
  });
});
