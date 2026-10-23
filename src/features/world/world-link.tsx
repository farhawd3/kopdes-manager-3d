import type { Entity } from '@/features/records/schemas';

/** Parameter tautan dunia per jenis catatan; dunia membaca parameter ini lalu memilih objeknya. */
const PARAM: Partial<Record<Entity, string>> = {
  units: 'unit',
  staff: 'orang',
  'inventory-items': 'barang',
  deliveries: 'kirim',
  'work-items': 'tugas',
  meetings: 'rapat',
};
export const hasWorldPlace = (entity: Entity) => entity in PARAM;
export const worldHref = (entity: Entity, id: string) => `/world?${PARAM[entity] ?? 'lokasi'}=${encodeURIComponent(id)}`;
