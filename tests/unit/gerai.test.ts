import { expect, it } from 'vitest';
import { Mesh } from 'three';
import { getWorldModel } from '@/features/world/model/world-model';
import { GERAI_IDS, infoGerai } from '@/features/world/gerai';
import { ruangGerai } from '@/features/world/gerai-room';
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
  const info = Object.fromEntries(infoGerai(model).map((g) => [g.id, [g.buka, g.status, g.nama]]));
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
  const info = infoGerai(model);
  const { root, areas, slots } = ruangGerai(info);
  expect([...areas.keys()].filter((k) => k.startsWith('g:'))).toEqual(
    GERAI_IDS.map((id) => `g:${id}`),
  );
  expect(['pintu-kantor', 'pintu-gudang', 'pintu-pendingin'].every((k) => areas.has(k))).toBe(true);
  expect(areas.get('g:klinik')!.material.transparent).toBe(true);
  expect(areas.get('g:sembako')!.material.transparent).toBe(false);
  const locked = info.filter((g) => !g.buka).length;
  // Satu mesh ruang per gerai ditambah satu gembok per gerai yang belum buka.
  const geraiMesh = root.children.filter(
    (c) => c instanceof Mesh && String(c.userData.bidang).startsWith('g:'),
  );
  expect(geraiMesh.length).toBe(GERAI_IDS.length + locked);
  expect(slots.sembako).toHaveLength(3);
});
