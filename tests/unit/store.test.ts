import { expect, it } from 'vitest';
import { Mesh } from 'three';
import { getWorldModel } from '@/features/world/model/world-model';
import { STORE_IDS, storeInfo } from '@/features/world/store';
import { buildStores } from '@/features/world/store-room';
import { monitoringPlans } from '@/features/world/character-plan';
import type { Item } from '@/features/records/schemas';

const row = (id: string, data: Item['data']): Item => ({
  id,
  data,
  created_at: '2026-10-01',
  updated_at: 'u',
});
const now = new Date('2026-10-09T03:00:00Z');
const model = getWorldModel(
  {
    organization: [row('o', { title: 'KDMP', manager: 'Sari' })],
    units: [
      row('u1', { title: 'Toko Sembako', kind: 'sembako', status: 'aktif' }),
      row('u2', { title: 'Klinik', kind: 'klinik', status: 'persiapan' }),
      row('u3', { title: 'Gudang', kind: 'logistik', status: 'aktif' }),
    ],
    staff: [
      row('s1', { title: 'Ani', status: 'aktif', unit_id: 'u1' }),
      row('s2', { title: 'Budi', status: 'aktif', unit_id: 'u2' }),
      row('s3', { title: 'Sari', status: 'aktif' }),
    ],
  },
  now,
);

it('status gerai hanya dari catatan Gerai: aktif buka, lainnya terkunci', () => {
  const info = Object.fromEntries(storeInfo(model).map((g) => [g.id, [g.open, g.status, g.name]]));
  expect(info.kantor).toEqual([true, 'aktif', 'Kantor koperasi']);
  expect(info.sembako).toEqual([true, 'aktif', 'Toko Sembako']);
  expect(info.klinik).toEqual([false, 'persiapan', 'Klinik']);
  expect(info.logistik).toEqual([true, 'aktif', 'Gudang']);
  expect(info.apotek).toEqual([false, 'belum tercatat', 'Apotek desa']);
});

it('staf unit yang buka melayani gerai; unit terkunci tidak memindahkan staf; manajer di ruangnya', () => {
  const plans = Object.fromEntries(monitoringPlans(model).map((p) => [p.name, [p.area, p.action]]));
  expect(plans.Ani).toEqual(['gerai:sembako', 'serve']);
  expect(plans.Budi).toEqual(['istirahat', 'rest']);
  expect(plans.Sari).toEqual(['manajer', 'manage']);
});

it('kawasan gerai: sepuluh ruang, pintu ke kantor/gudang/cold storage, ruang terkunci transparan bergembok', () => {
  const info = storeInfo(model);
  const { root, areas, slots } = buildStores(info);
  expect([...areas.keys()].filter((k) => k.startsWith('g:'))).toEqual(
    STORE_IDS.map((id) => `g:${id}`),
  );
  expect(['pintu-kantor', 'pintu-gudang', 'pintu-pendingin'].every((k) => areas.has(k))).toBe(true);
  expect(areas.get('g:klinik')!.material.transparent).toBe(true);
  expect(areas.get('g:sembako')!.material.transparent).toBe(false);
  const locked = info.filter((g) => !g.open).length;
  // Satu mesh ruang per gerai ditambah satu gembok per gerai yang belum buka.
  const storeMeshes = root.children.filter(
    (c) => c instanceof Mesh && String(c.userData.areaKey).startsWith('g:'),
  );
  expect(storeMeshes.length).toBe(STORE_IDS.length + locked);
  expect(slots.sembako).toHaveLength(3);
});
