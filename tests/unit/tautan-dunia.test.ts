import { describe, expect, it } from 'vitest';
import { getWorldModel } from '@/features/dunia-3d/model/world-model';
import { monitoringPlans } from '@/features/dunia-3d/character-plan';
import { infoGerai } from '@/features/dunia-3d/gerai';
import { tujuanTautan } from '@/features/dunia-3d/tautan';
import { dataContoh } from '@/features/demo/data-contoh';
import type { Workspace } from '@/features/workspace/useWorkspace';
import { tautanDunia } from '@/components/ui/LihatDiDunia';

const rows = dataContoh('2026-10-10');
const data: Workspace = {};
for (const r of rows) (data[r.entity] ??= []).push(r);
const model = getWorldModel(data, new Date('2026-10-10T03:00:00Z'));
const plans = monitoringPlans(model);
const gerai = infoGerai(model);
const buka = (url: string) =>
  tujuanTautan(new URLSearchParams(url.split('?')[1]), model, plans, gerai);

describe('tautan web → dunia', () => {
  it('barang di rak gudang, rak pendingin, dan unit gerai', () => {
    const cari = (judul: string) => rows.find((r) => r.data.title === judul)!;
    expect(buka(tautanDunia('inventory-items', cari('Minyak goreng 1 L').id))).toEqual({ lokasi: 'gudang', pilih: 'rak-A' });
    expect(buka(tautanDunia('inventory-items', cari('Ikan nila beku').id))).toEqual({ lokasi: 'pendingin', pilih: 'rak-C1' });
    expect(buka(tautanDunia('inventory-items', cari('Paracetamol 500 mg').id))?.lokasi).toBe('gerai');
  });
  it('unit gerai, staf, pengiriman, dan lokasi langsung', () => {
    const unit = rows.find((r) => r.entity === 'units' && r.data.kind === 'apotek')!;
    expect(buka(tautanDunia('units', unit.id))).toEqual({ lokasi: 'gerai', pilih: 'g:apotek' });
    const staf = plans.find((p) => !p.mascot)!;
    expect(buka(tautanDunia('staff', staf.id))?.pilih).toBe(`orang:${staf.id}`);
    const kirim = model.trucks.find((t) => t.place === 'dok')!;
    expect(buka(tautanDunia('deliveries', kirim.delivery.id))).toEqual({ lokasi: 'gudang', pilih: `kirim-${kirim.delivery.id}` });
    expect(buka('/dunia-koperasi?lokasi=pendingin&pilih=rak-C2')).toEqual({ lokasi: 'pendingin', pilih: 'rak-C2' });
    expect(buka('/dunia-koperasi?barang=tidak-ada')).toBeNull();
  });
});
