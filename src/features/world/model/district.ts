// Unit KDMP yang punya bangunan di dunia: dipakai untuk mencocokkan catatan Gerai dengan
// bangunannya (world-model.ts). Letak di peta ada di kit/peta.ts.

export type BuildingStyle =
  'gudang' | 'pendingin' | 'kantor' | 'loket' | 'toko' | 'apotek' | 'klinik';
export type DistrictBuilding = {
  id: string;
  name: string;
  /** Kata kunci kolom Jenis pada Gerai yang mengisi bangunan ini; kosong = selalu ada (kantor) atau gerai tambahan. */
  kinds: string[];
  style: BuildingStyle;
};
export type Lot = {
  id: 'logistik' | 'administrasi' | 'kesehatan' | 'niaga';
  name: string;
  buildings: DistrictBuilding[];
};

export const lots: Lot[] = [
  {
    id: 'logistik',
    name: 'Logistik & cold storage',
    buildings: [
      {
        id: 'gudang',
        name: 'Gudang logistik',
        kinds: ['logistik', 'gudang', 'distribusi'],
        style: 'gudang',
      },
      {
        id: 'cold-storage',
        name: 'Cold storage',
        kinds: ['cold storage', 'pendingin', 'cold'],
        style: 'pendingin',
      },
    ],
  },
  {
    id: 'administrasi',
    name: 'Administrasi',
    buildings: [
      { id: 'kantor', name: 'Kantor koperasi', kinds: [], style: 'kantor' },
      {
        id: 'simpan-pinjam',
        name: 'Simpan pinjam',
        kinds: ['simpan pinjam', 'usp', 'keuangan'],
        style: 'loket',
      },
    ],
  },
  {
    id: 'kesehatan',
    name: 'Layanan kesehatan',
    buildings: [
      { id: 'klinik', name: 'Klinik desa', kinds: ['klinik', 'kesehatan'], style: 'klinik' },
      { id: 'apotek', name: 'Apotek desa', kinds: ['apotek', 'obat'], style: 'apotek' },
    ],
  },
  {
    id: 'niaga',
    name: 'Gerai niaga',
    buildings: [
      {
        id: 'sembako',
        name: 'Gerai sembako',
        kinds: ['sembako', 'toko', 'kelontong'],
        style: 'toko',
      },
      // Gerai tambahan (unit di luar jenis tetap) diisi berurutan dari data Gerai.
      ...[1, 2, 3].map((n): DistrictBuilding => ({
        id: `gerai-${n}`,
        name: `Gerai ${n}`,
        kinds: [],
        style: 'toko',
      })),
    ],
  },
];

export const allBuildings = () => lots.flatMap((lot) => lot.buildings);
