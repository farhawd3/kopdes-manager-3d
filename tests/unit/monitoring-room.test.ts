import { expect, it } from 'vitest';
import { Box3, Mesh, OrthographicCamera, Vector3 } from 'three';
import { SLOT, roomInside, roomDoor, buildOffice } from '@/features/world/monitoring-room';
import { buildWarehouse } from '@/features/world/warehouse-room';
import { followCharacter, walkPath, advance, screenRect } from '@/features/world/monitoring-scene';
import { buildIsland } from '@/features/world/island';
import { ambienceAt } from '@/features/world/monitor-data';
import { OFFICE_ROOMS, type OfficeRoom } from '@/features/world/office-rooms';
import { getWorldModel } from '@/features/world/model/world-model';
import type { Item } from '@/features/records/schemas';

const row = (id: string, data: Item['data']): Item => ({
  id,
  data,
  created_at: '2026-10-01',
  updated_at: '',
});
const valid = (mesh: Mesh) =>
  Array.from(mesh.geometry.getAttribute('position').array).every(Number.isFinite);

it('kantor: pintu gudang di ruang Stok, lorong ke pulau, delapan ruang dan geometri valid', () => {
  const { root, areas } = buildOffice();
  expect([...areas.keys()]).toEqual([
    ...Object.keys(OFFICE_ROOMS),
    'pintu-pulau',
    'pintu-gudang',
    'pintu-gerai',
  ]);
  const center = (key: string) => {
    const g = areas.get(key)!.geometry;
    g.computeBoundingBox();
    return g.boundingBox!.getCenter(new Vector3());
  };
  expect(Math.abs(center('pintu-pulau').z)).toBeLessThan(0.1);
  expect(center('pintu-gudang').z).toBeGreaterThan(3);
  // cangkang + kaca + delapan ruang + pintu gudang + tangga gerai, ditambah grup tulisan lantai
  const meshes = root.children.filter((c): c is Mesh => c instanceof Mesh);
  expect(meshes).toHaveLength(13);
  expect(root.children.filter((c) => c.userData.floorText)).toHaveLength(1);
  const glass = meshes.filter((c) => !Array.isArray(c.material) && c.material.transparent);
  expect(glass).toHaveLength(1);
  for (const child of meshes) expect(valid(child)).toBe(true);
});

it('pulau memiliki empat bangunan masuk dan permukaan yang kembali ke kantor', () => {
  const { root, areas } = buildIsland();
  expect([...areas.keys()]).toEqual([
    'pintu-kantor',
    'pintu-gerai',
    'pintu-gudang',
    'pintu-pendingin',
  ]);
  expect(root.children[0].userData.areaKey).toBe('pintu-kantor');
  for (const mesh of areas.values()) expect(valid(mesh)).toBe(true);
});

it('kamera mengikuti figur secara halus, independen dari framerate dan langsung pada reduced-motion', () => {
  const p = new Vector3(10, 0, -6);
  const a = new Vector3(),
    b = new Vector3();
  expect(followCharacter(a, p, 0.05)).toBe(true);
  expect(a.x).toBeGreaterThan(0);
  expect(a.x).toBeLessThan(p.x);
  followCharacter(b, p, 0.025);
  followCharacter(b, p, 0.025);
  expect(a.distanceTo(b)).toBeLessThan(0.00001);
  for (let i = 0; i < 100; i++) followCharacter(a, p, 0.05);
  expect(followCharacter(a, p, 0.05)).toBe(false);
  expect(a.toArray()).toEqual([10, 0.8, -6]);
  expect(followCharacter(b, p, 0.016, true)).toBe(false);
  expect(b.toArray()).toEqual(a.toArray());
});

it('bingkai pilihan mengikuti ukuran objek di layar, suasana memakai jam Jakarta', () => {
  const cam = new OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  cam.position.set(0, 20, 0);
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
  const kecil = screenRect(new Box3(new Vector3(-1, 0, -1), new Vector3(1, 1, 1)), cam, 200, 200);
  const besar = screenRect(new Box3(new Vector3(-4, 0, -2), new Vector3(4, 1, 2)), cam, 200, 200);
  expect(kecil.x1 - kecil.x0).toBeCloseTo(20, 0);
  expect(besar.x1 - besar.x0).toBeCloseTo(80, 0);
  expect(besar.y1 - besar.y0).toBeCloseTo(40, 0);
  expect(ambienceAt(new Date('2026-10-08T23:00:00Z'), 'hujan')).toEqual({
    weather: 'hujan',
    phase: 'pagi',
  });
  expect(ambienceAt(new Date('2026-10-09T05:00:00Z'), 'cerah').phase).toBe('siang');
  expect(ambienceAt(new Date('2026-10-09T10:00:00Z'), 'berawan').phase).toBe('senja');
  expect(ambienceAt(new Date('2026-10-09T13:00:00Z'), 'cerah').phase).toBe('malam');
});

it('tempat figur dan titik lewatnya berada di dalam ruangnya', () => {
  for (const id of Object.keys(OFFICE_ROOMS) as OfficeRoom[])
    for (const s of SLOT[id])
      for (const p of [s, ...s.via]) {
        expect(Math.abs(p.x - OFFICE_ROOMS[id].x)).toBeLessThanOrEqual(OFFICE_ROOMS[id].hx - 0.4);
        expect(Math.abs(p.z - OFFICE_ROOMS[id].z)).toBeLessThanOrEqual(
          id === 'istirahat' ? 8.6 : 3.4,
        );
      }
});

it('figur keluar lewat titik lewat, menyusuri lorong, lalu masuk ke tempat baru', () => {
  const lama = SLOT.kerja[0];
  const pos = new Vector3(lama.x, 0.06, lama.z);
  const tujuan = SLOT.gym[0];
  const path = walkPath(pos, { area: 'kerja', slot: lama }, 'gym', tujuan);
  const xz = (p: { x: number; z: number }) => [+p.x.toFixed(2), +p.z.toFixed(2)];
  const keluar = [...lama.via].reverse().map(xz);
  const [dk, pk, dg, pg] = [
    roomInside('kerja'),
    roomDoor('kerja'),
    roomInside('gym'),
    roomDoor('gym'),
  ];
  expect(path.map(xz)).toEqual([
    ...keluar.filter((p) => p.join() !== xz(lama).join()),
    xz(dk), // dalam pintu ruang kerja
    xz(pk),
    [xz(pk)[0], 0], // lorong
    [xz(pg)[0], 0],
    xz(pg),
    xz(dg), // dalam pintu gym
    ...tujuan.via.map(xz),
    xz(tujuan),
  ]);
  expect(advance(pos, path, 1)).not.toBeNull();
  expect(advance(pos, path, 200)).toBeNull();
  expect(path).toHaveLength(0);
  expect([pos.x, pos.z]).toEqual([tujuan.x, tujuan.z]);
  // Pindah tempat di ruang yang sama tetap lewat titik dalam pintu, tidak memotong meja.
  const sama = walkPath(pos, { area: 'gym', slot: tujuan }, 'gym', SLOT.gym[3]);
  expect(sama.some((p) => p.x === 10 && p.z === -2.25)).toBe(true);
  expect(sama.some((p) => p.z === 0)).toBe(false);
});

it('gudang dan cold storage mengikuti data rak dan truk', () => {
  const model = getWorldModel(
    {
      'inventory-items': [
        row('i1', { title: 'Beras', rack: 'A' }),
        row('i2', { title: 'Ikan', rack: 'C1' }),
      ],
      deliveries: [
        row('d1', { title: 'Kiriman', status: 'tiba', dock: 'D2' }),
        row('d2', { title: 'Antre', status: 'dikirim', dock: 'D1' }),
      ],
    },
    new Date('2026-10-09T03:00:00Z'),
  );
  const gudang = buildWarehouse({ model, stock: true, deliveries: true }, false);
  expect([...gudang.areas.keys()]).toEqual([
    'rak-A',
    'rak-B',
    'rak-C',
    'rak-D',
    'rak-E',
    'rak-F',
    'dok-D1',
    'dok-D2',
    'dok-D3',
    'dok-D4',
    'pintu-kantor',
    'pintu-pendingin',
    'kirim-d1',
    'kirim-d2',
  ]);
  const tanpaData = buildWarehouse({ model, stock: false, deliveries: false }, false);
  expect([...tanpaData.areas.keys()].some((k) => k.startsWith('kirim-'))).toBe(false);
  const cold = buildWarehouse({ model, stock: true, deliveries: true }, true);
  expect([...cold.areas.keys()]).toEqual(['rak-C1', 'rak-C2', 'rak-C3', 'pintu-gudang']);
  for (const r of [gudang.root, cold.root])
    for (const c of r.children) if (c instanceof Mesh) expect(valid(c)).toBe(true);
});
