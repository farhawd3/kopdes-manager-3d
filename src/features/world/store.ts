// Kawasan gerai (murni, diuji): unit KDMP sebagai ruang bersekat kaca di kiri-kanan lorong,
// bergaya sama dengan kantor. Status buka hanya dari catatan Gerai di web; unit yang belum
// tercatat atau belum berstatus aktif digambar transparan bergembok.
import type { Item } from '../records/schemas';
import type { WorldModel } from './model/world-model';

export type StoreId =
  | 'kantor'
  | 'simpan-pinjam'
  | 'klinik'
  | 'apotek'
  | 'cold-storage'
  | 'logistik'
  | 'sembako'
  | 'gerai-1'
  | 'gerai-2'
  | 'gerai-3';

/** Ruang 8 × 7; kolom x −16…16, baris belakang z −5, depan z 5, lorong z −1,5…1,5. */
export const STORES: Record<
  StoreId,
  { x: number; z: number; name: string; color: string; code: string }
> = {
  kantor: { x: -16, z: -5, name: 'Kantor koperasi', color: '#d6d1ef', code: 'KANTOR' },
  'simpan-pinjam': { x: -8, z: -5, name: 'Simpan pinjam', color: '#cfe0f4', code: 'SIMPAN PINJAM' },
  klinik: { x: 0, z: -5, name: 'Klinik desa', color: '#d7ecdf', code: 'KLINIK' },
  apotek: { x: 8, z: -5, name: 'Apotek desa', color: '#dcefe9', code: 'APOTEK' },
  'cold-storage': { x: 16, z: -5, name: 'Cold storage', color: '#d6e9f4', code: 'COLD STORAGE' },
  logistik: { x: -16, z: 5, name: 'Pergudangan & logistik', color: '#efe0c7', code: 'LOGISTIK' },
  sembako: { x: -8, z: 5, name: 'Gerai sembako', color: '#f3e2c8', code: 'SEMBAKO' },
  'gerai-1': { x: 0, z: 5, name: 'Gerai potensi desa 1', color: '#f1dcc4', code: 'GERAI 1' },
  'gerai-2': { x: 8, z: 5, name: 'Gerai potensi desa 2', color: '#eedccf', code: 'GERAI 2' },
  'gerai-3': { x: 16, z: 5, name: 'Gerai potensi desa 3', color: '#e8dcea', code: 'GERAI 3' },
};
export const STORE_IDS = Object.keys(STORES) as StoreId[];

/** Tahap kesiapan unit pada kolom Status Gerai. */
export const UNIT_STEPS = ['rencana', 'persiapan', 'siap uji', 'siap buka', 'aktif'] as const;

export type StoreInfo = {
  id: StoreId;
  name: string;
  unit?: Item;
  /** Buka = unit tercatat berstatus aktif; kantor koperasi selalu buka. */
  open: boolean;
  status: string;
};

export function storeInfo(model: WorldModel): StoreInfo[] {
  return STORE_IDS.map((id): StoreInfo => {
    if (id === 'kantor') return { id, name: STORES.kantor.name, open: true, status: 'aktif' };
    const unit =
      id === 'logistik' ? model.warehouseUnit : model.plots.find((p) => p.id === id)?.unit;
    const status = unit ? String(unit.data.status || 'rencana') : 'belum tercatat';
    return {
      id,
      name: unit ? String(unit.data.title) : STORES[id].name,
      unit,
      open: status === 'aktif',
      status,
    };
  });
}

/** Unit tempat staf ditugaskan (kolom Unit pada Tim), bila unit itu sudah buka. */
export function staffStore(staff: Item, info: StoreInfo[]) {
  const unitId = String(staff.data.unit_id || '');
  return unitId ? info.find((g) => g.unit?.id === unitId && g.open) : undefined;
}
