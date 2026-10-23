import { coldRackIds, rackIds, type WorldModel } from './model/world-model';
import type { LokasiMonitoring } from './bidang';
import { BIDANG } from './bidang';
import { isOffice, type CharacterPlan } from './character-plan';
import { sameName } from './model/schedule';
import type { GeraiInfo } from './gerai';

export type Tujuan = { lokasi: LokasiMonitoring; pilih: string };
const LOKASI: LokasiMonitoring[] = ['kantor', 'gerai', 'gudang', 'pendingin', 'pulau'];

/**
 * Tautan dari halaman operasional (`/world?barang=…`) menjadi lokasi dan objek yang
 * dipilih di dunia. Mengembalikan null bila catatannya tidak ada di data yang dimuat.
 */
export function tujuanTautan(
  params: URLSearchParams,
  model: WorldModel,
  plans: CharacterPlan[],
  gerai: GeraiInfo[],
): Tujuan | null {
  const orang = (p?: CharacterPlan): Tujuan | null =>
    p ? { lokasi: isOffice(p.area) ? 'kantor' : 'gerai', pilih: `orang:${p.id}` } : null;

  const unit = params.get('unit');
  if (unit) {
    const g = gerai.find((i) => i.unit?.id === unit);
    return g ? { lokasi: 'gerai', pilih: `g:${g.id}` } : null;
  }
  const staf = params.get('orang');
  if (staf) return orang(plans.find((p) => p.id === staf));
  const barang = params.get('barang');
  if (barang) {
    const item = model.inventory.items.find((i) => i.id === barang);
    if (!item) return null;
    const rak = String(item.data.rack || '');
    if ((coldRackIds as readonly string[]).includes(rak)) return { lokasi: 'pendingin', pilih: `rak-${rak}` };
    if ((rackIds as readonly string[]).includes(rak)) return { lokasi: 'gudang', pilih: `rak-${rak}` };
    const g = gerai.find((i) => i.unit && i.unit.id === item.data.unit_id);
    return g ? { lokasi: 'gerai', pilih: `g:${g.id}` } : { lokasi: 'kantor', pilih: 'stok' };
  }
  const kirim = params.get('kirim');
  if (kirim) {
    if (!model.deliveries.some((d) => d.id === kirim)) return null;
    return {
      lokasi: 'gudang',
      pilih: model.trucks.some((t) => t.delivery.id === kirim) ? `kirim-${kirim}` : 'rak-A',
    };
  }
  const tugas = params.get('tugas');
  if (tugas) {
    const task = model.tasks.find((t) => t.id === tugas);
    if (!task) return { lokasi: 'kantor', pilih: 'kerja' };
    return orang(plans.find((p) => sameName(task.data.assignee, p.name))) ?? { lokasi: 'kantor', pilih: 'kerja' };
  }
  if (params.get('rapat')) return { lokasi: 'kantor', pilih: 'rapat' };
  const lokasi = params.get('lokasi') as LokasiMonitoring | null;
  if (lokasi && LOKASI.includes(lokasi)) {
    const pilih = params.get('pilih') || '';
    if (lokasi === 'kantor' && pilih && !(pilih in BIDANG) && !pilih.startsWith('orang:')) return { lokasi, pilih: 'kerja' };
    return { lokasi, pilih };
  }
  return null;
}
