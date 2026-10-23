import { coldRackIds, rackIds, type WorldModel } from './model/world-model';
import type { WorldSite } from './office-rooms';
import { OFFICE_ROOMS } from './office-rooms';
import { isOffice, type CharacterPlan } from './character-plan';
import { sameName } from '@/lib/people';
import type { StoreInfo } from './store';

export type LinkTarget = { site: WorldSite; pick: string };
const SITES: WorldSite[] = ['kantor', 'gerai', 'gudang', 'pendingin', 'pulau'];

/**
 * Tautan dari halaman operasional (`/world?barang=…`) menjadi lokasi dan objek yang
 * dipilih di dunia. Mengembalikan null bila catatannya tidak ada di data yang dimuat.
 */
export function linkTarget(
  params: URLSearchParams,
  model: WorldModel,
  plans: CharacterPlan[],
  stores: StoreInfo[],
): LinkTarget | null {
  const personTarget = (p?: CharacterPlan): LinkTarget | null =>
    p ? { site: isOffice(p.area) ? 'kantor' : 'gerai', pick: `orang:${p.id}` } : null;

  const unit = params.get('unit');
  if (unit) {
    const g = stores.find((i) => i.unit?.id === unit);
    return g ? { site: 'gerai', pick: `g:${g.id}` } : null;
  }
  const staffId = params.get('orang');
  if (staffId) return personTarget(plans.find((p) => p.id === staffId));
  const itemId = params.get('barang');
  if (itemId) {
    const item = model.inventory.items.find((i) => i.id === itemId);
    if (!item) return null;
    const rack = String(item.data.rack || '');
    if ((coldRackIds as readonly string[]).includes(rack))
      return { site: 'pendingin', pick: `rak-${rack}` };
    if ((rackIds as readonly string[]).includes(rack))
      return { site: 'gudang', pick: `rak-${rack}` };
    const g = stores.find((i) => i.unit && i.unit.id === item.data.unit_id);
    return g ? { site: 'gerai', pick: `g:${g.id}` } : { site: 'kantor', pick: 'stok' };
  }
  const deliveryId = params.get('kirim');
  if (deliveryId) {
    if (!model.deliveries.some((d) => d.id === deliveryId)) return null;
    return {
      site: 'gudang',
      pick: model.trucks.some((t) => t.delivery.id === deliveryId)
        ? `kirim-${deliveryId}`
        : 'rak-A',
    };
  }
  const taskId = params.get('tugas');
  if (taskId) {
    const task = model.tasks.find((t) => t.id === taskId);
    if (!task) return { site: 'kantor', pick: 'kerja' };
    return (
      personTarget(plans.find((p) => sameName(task.data.assignee, p.name))) ?? {
        site: 'kantor',
        pick: 'kerja',
      }
    );
  }
  if (params.get('rapat')) return { site: 'kantor', pick: 'rapat' };
  const site = params.get('lokasi') as WorldSite | null;
  if (site && SITES.includes(site)) {
    const pick = params.get('pilih') || '';
    if (site === 'kantor' && pick && !(pick in OFFICE_ROOMS) && !pick.startsWith('orang:'))
      return { site, pick: 'kerja' };
    return { site, pick };
  }
  return null;
}
