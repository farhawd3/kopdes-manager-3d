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
const stores = storeInfo(model);
const targetOf = (url: string) =>
  linkTarget(new URLSearchParams(url.split('?')[1]), model, plans, stores);

describe('tautan web → dunia', () => {
  it('barang di rak gudang, rak pendingin, dan unit gerai', () => {
    const byTitle = (title: string) => rows.find((r) => r.data.title === title)!;
    expect(targetOf(worldHref('inventory-items', byTitle('Minyak goreng 1 L').id))).toEqual({
      site: 'gudang',
      pick: 'rak-A',
    });
    expect(targetOf(worldHref('inventory-items', byTitle('Ikan nila beku').id))).toEqual({
      site: 'pendingin',
      pick: 'rak-C1',
    });
    expect(targetOf(worldHref('inventory-items', byTitle('Paracetamol 500 mg').id))?.site).toBe(
      'gerai',
    );
  });
  it('unit gerai, staf, pengiriman, dan lokasi langsung', () => {
    const unit = rows.find((r) => r.entity === 'units' && r.data.kind === 'apotek')!;
    expect(targetOf(worldHref('units', unit.id))).toEqual({ site: 'gerai', pick: 'g:apotek' });
    const staffPlan = plans.find((p) => !p.mascot)!;
    expect(targetOf(worldHref('staff', staffPlan.id))?.pick).toBe(`orang:${staffPlan.id}`);
    const truck = model.trucks.find((t) => t.place === 'dok')!;
    expect(targetOf(worldHref('deliveries', truck.delivery.id))).toEqual({
      site: 'gudang',
      pick: `kirim-${truck.delivery.id}`,
    });
    expect(targetOf('/world?lokasi=pendingin&pilih=rak-C2')).toEqual({
      site: 'pendingin',
      pick: 'rak-C2',
    });
    expect(targetOf('/world?barang=tidak-ada')).toBeNull();
  });
});
