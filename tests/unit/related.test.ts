import { describe, expect, it } from 'vitest';
import { sampleData } from '@/features/demo/sample-data';
import {
  detailRows,
  prefillFromQuery,
  suggestions,
  relatedGroups,
} from '@/features/records/related';
import type { Workspace } from '@/features/workspace/use-workspace';

const rows = sampleData('2026-10-10');
const ws: Workspace = {};
for (const r of rows) (ws[r.entity] ??= []).push(r);
const byTitle = (entity: keyof Workspace, title: string) =>
  ws[entity]!.find((r) => r.data.title === title)!;

describe('catatan terkait dua arah', () => {
  it('barang menampilkan gerai, kas, mutasi, opname yang merujuknya', () => {
    const oil = byTitle('inventory-items', 'Minyak goreng 1 L');
    const k = relatedGroups('inventory-items', oil, ws);
    expect(k.map((g) => g.entity)).toEqual(
      expect.arrayContaining(['stock-movements', 'stock-counts']),
    );
    const paracetamol = byTitle('inventory-items', 'Paracetamol 500 mg');
    expect(
      relatedGroups('inventory-items', paracetamol, ws).find((g) => g.direction === 'refers')
        ?.entity,
    ).toBe('units');
  });
  it('staf terhubung ke tugas, rapat, dan unit lewat nama', () => {
    const staffRow = ws.staff![4];
    const k = relatedGroups('staff', staffRow, ws);
    expect(k.some((g) => g.entity === 'work-items' && g.direction === 'name')).toBe(true);
    expect(k.some((g) => g.entity === 'meetings')).toBe(true);
  });
  it('rapat menampilkan keputusan dan peserta; detail memakai label terbaca', () => {
    const meeting = byTitle('meetings', 'Briefing pagi tim');
    const k = relatedGroups('meetings', meeting, ws);
    expect(k.find((g) => g.entity === 'decisions')?.rows.length).toBe(2);
    expect(k.find((g) => g.title === 'Peserta')?.rows.length).toBe(6);
    const d = detailRows('cash-entries', ws['cash-entries']![0], ws);
    expect(d.find((b) => b.field === 'amount')?.value).toMatch(/^Rp/);
  });
});

describe('saran langkah berikut', () => {
  it('barang di bawah minimum menyarankan belanja dan pengiriman dengan form terisi', () => {
    const s = suggestions('inventory-items', byTitle('inventory-items', 'Minyak goreng 1 L'), ws);
    expect(s.map((x) => x.id)).toEqual(['restock', 'delivery']);
    expect(prefillFromQuery(new URLSearchParams(s[0].href.split('?')[1]))).toMatchObject({
      category: 'Pembelian',
    });
  });
  it('pengiriman diperiksa tanpa mutasi menyarankan mutasi masuk; rapat menyarankan tugas', () => {
    const shipment = byTitle('deliveries', 'Kiriman minyak goreng');
    expect(suggestions('deliveries', shipment, ws)[0].href).toContain('fill.delivery_id=');
    const meeting = byTitle('meetings', 'Briefing pagi tim');
    expect(suggestions('meetings', meeting, ws).length).toBe(2);
    const safe = byTitle('inventory-items', 'Beras medium 5 kg');
    expect(suggestions('inventory-items', safe, ws)).toEqual([]);
  });
});
