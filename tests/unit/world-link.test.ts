import { describe, expect, it } from 'vitest';
import { getWorldModel } from '@/features/world/model/world-model';
import { monitoringPlans } from '@/features/world/character-plan';
import { storeInfo } from '@/features/world/store';
import { linkTarget } from '@/features/world/link-target';
import { sampleData } from '@/features/demo/sample-data';
import type { Workspace } from '@/features/workspace/use-workspace';
import { worldHref } from '@/features/world/world-link';

const rows = sampleData('2026-10-10');
const data: Workspace = {};
for (const r of rows) (data[r.entity] ??= []).push(r);
const model = getWorldModel(data, new Date('2026-10-10T03:00:00Z'));
const plans = monitoringPlans(model);
const gerai = storeInfo(model);
const buka = (url: string) =>
  linkTarget(new URLSearchParams(url.split('?')[1]), model, plans, gerai);

describe('tautan web → dunia', () => {
  it('barang di rak gudang, rak pendingin, dan unit gerai', () => {
    const cari = (judul: string) => rows.find((r) => r.data.title === judul)!;
    expect(buka(worldHref('inventory-items', cari('Minyak goreng 1 L').id))).toEqual({
      site: 'gudang',
      pick: 'rak-A',
    });
    expect(buka(worldHref('inventory-items', cari('Ikan nila beku').id))).toEqual({
      site: 'pendingin',
      pick: 'rak-C1',
    });
    expect(buka(worldHref('inventory-items', cari('Paracetamol 500 mg').id))?.site).toBe('gerai');
  });
  it('unit gerai, staf, pengiriman, dan lokasi langsung', () => {
    const unit = rows.find((r) => r.entity === 'units' && r.data.kind === 'apotek')!;
    expect(buka(worldHref('units', unit.id))).toEqual({ site: 'gerai', pick: 'g:apotek' });
    const staf = plans.find((p) => !p.mascot)!;
    expect(buka(worldHref('staff', staf.id))?.pick).toBe(`orang:${staf.id}`);
    const kirim = model.trucks.find((t) => t.place === 'dok')!;
    expect(buka(worldHref('deliveries', kirim.delivery.id))).toEqual({
      site: 'gudang',
      pick: `kirim-${kirim.delivery.id}`,
    });
    expect(buka('/world?lokasi=pendingin&pilih=rak-C2')).toEqual({
      site: 'pendingin',
      pick: 'rak-C2',
    });
    expect(buka('/world?barang=tidak-ada')).toBeNull();
  });
});
