// Kawasan gerai (murni, diuji): unit KDMP sebagai ruang bersekat kaca di kiri-kanan lorong,
// bergaya sama dengan kantor. Status buka hanya dari catatan Gerai di web; unit yang belum
// tercatat atau belum berstatus aktif digambar transparan bergembok.
import type { Item } from '../records/schemas';
import type { WorldModel } from './model/world-model';

export type GeraiId =
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
export const GERAI: Record<
  GeraiId,
  { x: number; z: number; nama: string; warna: string; kode: string }
> = {
  kantor: { x: -16, z: -5, nama: 'Kantor koperasi', warna: '#d6d1ef', kode: 'KANTOR' },
  'simpan-pinjam': { x: -8, z: -5, nama: 'Simpan pinjam', warna: '#cfe0f4', kode: 'SIMPAN PINJAM' },
  klinik: { x: 0, z: -5, nama: 'Klinik desa', warna: '#d7ecdf', kode: 'KLINIK' },
  apotek: { x: 8, z: -5, nama: 'Apotek desa', warna: '#dcefe9', kode: 'APOTEK' },
  'cold-storage': { x: 16, z: -5, nama: 'Cold storage', warna: '#d6e9f4', kode: 'COLD STORAGE' },
  logistik: { x: -16, z: 5, nama: 'Pergudangan & logistik', warna: '#efe0c7', kode: 'LOGISTIK' },
  sembako: { x: -8, z: 5, nama: 'Gerai sembako', warna: '#f3e2c8', kode: 'SEMBAKO' },
  'gerai-1': { x: 0, z: 5, nama: 'Gerai potensi desa 1', warna: '#f1dcc4', kode: 'GERAI 1' },
  'gerai-2': { x: 8, z: 5, nama: 'Gerai potensi desa 2', warna: '#eedccf', kode: 'GERAI 2' },
  'gerai-3': { x: 16, z: 5, nama: 'Gerai potensi desa 3', warna: '#e8dcea', kode: 'GERAI 3' },
};
export const GERAI_IDS = Object.keys(GERAI) as GeraiId[];

/** Tahap kesiapan unit pada kolom Status Gerai. */
export const UNIT_STEPS = ['rencana', 'persiapan', 'siap uji', 'siap buka', 'aktif'] as const;

export type GeraiInfo = {
  id: GeraiId;
  nama: string;
  unit?: Item;
  /** Buka = unit tercatat berstatus aktif; kantor koperasi selalu buka. */
  buka: boolean;
  status: string;
};

export function infoGerai(model: WorldModel): GeraiInfo[] {
  return GERAI_IDS.map((id): GeraiInfo => {
    if (id === 'kantor') return { id, nama: GERAI.kantor.nama, buka: true, status: 'aktif' };
    const unit =
      id === 'logistik' ? model.warehouseUnit : model.plots.find((p) => p.id === id)?.unit;
    const status = unit ? String(unit.data.status || 'rencana') : 'belum tercatat';
    return {
      id,
      nama: unit ? String(unit.data.title) : GERAI[id].nama,
      unit,
      buka: status === 'aktif',
      status,
    };
  });
}

/** Unit tempat staf ditugaskan (kolom Unit pada Tim), bila unit itu sudah buka. */
export function geraiStaf(staff: Item, info: GeraiInfo[]) {
  const unitId = String(staff.data.unit_id || '');
  return unitId ? info.find((g) => g.unit?.id === unitId && g.buka) : undefined;
}
