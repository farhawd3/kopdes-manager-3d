import Link from 'next/link';
import { Ikon3D } from './Ikon3D';
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
export const punyaTempatDiDunia = (entity: Entity) => entity in PARAM;
export const tautanDunia = (entity: Entity, id: string) =>
  `/dunia-koperasi?${PARAM[entity] ?? 'lokasi'}=${encodeURIComponent(id)}`;

/** Tautan dari halaman operasional ke posisi catatan di Dunia Koperasi 3D. */
export function LihatDiDunia({ entity, id }: { entity: Entity; id: string }) {
  if (!punyaTempatDiDunia(entity)) return null;
  return (
    <Link className="ui-btn lihat-dunia" data-variant="secondary" href={tautanDunia(entity, id)} title="Buka posisi catatan ini di Dunia Koperasi">
      <Ikon3D kind="pulau" size={18} rapat />
      <span>Lihat di dunia</span>
    </Link>
  );
}
