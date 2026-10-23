import { Group, type BufferGeometry, type Mesh, type MeshStandardMaterial } from 'three';
import { sphere, place, box, cylinder } from './shapes';
import { WOOD_BASE, WALL, WALL_TOP, mergeMeshes, plankFloor } from './monitoring-room';
import { plant } from './furniture';
import { ambienceWindow } from './ambience';
import { paintLabels } from './floor-text';
import {
  extinguisher,
  forklift,
  pallet,
  rollerDoor,
  steelRack,
  truck,
  cartonStack,
} from './logistics';
import { coldRackIds, isBelowMinimum, rackIds, type WorldModel } from './model/world-model';

type Area = Mesh<BufferGeometry, MeshStandardMaterial>;
export type LogisticsInput = { model: WorldModel; stock: boolean; deliveries: boolean };

/** Dok D1–D4 berurutan dari kiri; truk mundur ke dok, truk antre parkir di jalur depan. */
export const DOCK_X = [-12, -4, 4, 12];
const CREAM = 0xf3eee6;
const WAREHOUSE_FLOOR = 0xe4c197;

function lowStockMarker() {
  // Penanda bulat kuning di atas rak = ada barang di bawah minimum (dari data, bukan dekorasi).
  const g = new Group();
  g.add(
    place(sphere(0.3, 0xf2b25c), 0, 0.44, 0),
    place(cylinder(0.02, 0.17, 0.38, 0xf2b25c), 0, 0.04, 0),
  );
  return g;
}

/** Pintu gulung dengan kardus di kedua sisinya; `sideWall` = pintu di dinding kiri (menghadap +x). */
function doorWithCartons(color: number, x: number, z: number, sideWall: boolean) {
  const g = new Group();
  const d = rollerDoor(2.4, 2.8, color);
  if (sideWall) d.rotation.y = Math.PI / 2;
  g.add(place(d, x, 0, z));
  const [a, b] = sideWall
    ? [
        [x + 0.8, z - 1.9],
        [x + 0.8, z + 1.9],
      ]
    : [
        [x - 1.9, z + 0.8],
        [x + 1.9, z + 0.8],
      ];
  g.add(place(cartonStack(2), a[0], 0.05, a[1]), place(cartonStack(1), b[0], 0.05, b[1]));
  return g;
}

function addArea(root: Group, areas: Map<string, Area>, id: string, g: Group) {
  const mesh = mergeMeshes(g) as Area;
  mesh.userData.areaKey = id;
  root.add(mesh);
  areas.set(id, mesh);
}

function cartonPallet(n = 2) {
  const pl = pallet();
  pl.add(
    place(cartonStack(n), -0.3, 0.22, 0),
    place(cartonStack(Math.max(1, n - 1)), 0.35, 0.22, 0.1),
  );
  return pl;
}

/** Cangkang ruang: alas kayu, lantai, dinding belakang dan kiri biru lembut bertepi terang. */
function roomShell(
  g: Group,
  w: number,
  d: number,
  floor: number,
  wall: number,
  wallTop: number,
  height: number,
  depth = d,
) {
  const leftZ = -d / 2 + depth / 2;
  g.add(
    place(box(w + 1, 0.55, d + 1, WOOD_BASE, 0.3), 0, -0.6, 0),
    place(box(w + 0.8, 0.22, d + 0.8, floor, 0.1), 0, -0.17, 0),
    place(box(w + 0.8, height, 0.42, wall, 0.2), 0, 0, -d / 2 - 0.2),
    place(box(0.42, height, depth + 0.4, wall, 0.2), -w / 2 - 0.2, 0, leftZ - 0.2),
    place(box(w + 0.9, 0.18, 0.5, wallTop, 0.08), 0, height - 0.04, -d / 2 - 0.2),
    place(box(0.5, 0.18, depth + 0.5, wallTop, 0.08), -w / 2 - 0.2, height - 0.04, leftZ - 0.2),
  );
}

/**
 * Gudang (dengan halaman dok) atau cold storage. Isi rak mengikuti jumlah jenis barang per rak,
 * penanda kuning mengikuti stok di bawah minimum, truk mengikuti pengiriman masuk tercatat.
 * Data belum aktif = rak kosong tanpa penanda dan tanpa truk.
 */
export function buildWarehouse({ model, stock, deliveries }: LogisticsInput, cold: boolean) {
  const root = new Group();
  const shell = new Group();
  const areas = new Map<string, Area>();
  if (cold) {
    roomShell(shell, 26, 18, 0xeef3f7, 0xa9cbe6, 0xd2e6f5, 3.8);
    plankFloor(shell, 26.6, 18.6, 0, 0xeef3f7, 0xe6edf3, 2);
    // Panel pendingin dinding dan peti beku.
    for (const x of [-7, 0, 7]) shell.add(place(box(2.4, 0.7, 0.32, 0xffffff, 0.1), x, 2.7, -8.7));
    for (const x of [-9, -5.5])
      shell.add(
        place(box(2.4, 0.95, 1.2, 0xf7fbfd, 0.16), x, 0, 5.2),
        place(box(2.4, 0.1, 1.2, 0x9ccbe6, 0.05), x, 0.95, 5.2),
      );
    shell.add(place(extinguisher(), -12.6, 0, 6.5), place(plant(1.3), 12, 0, 7.6));
    root.add(mergeMeshes(shell));
    coldRackIds.forEach((id, i) => {
      const items = model.inventory.coldRacks[id];
      const g = new Group();
      const x = -7 + i * 7;
      g.add(place(steelRack(stock ? Math.min(1, items.length / 6) : 0, 4), x, 0, -5.6));
      if (stock && items.some(isBelowMinimum)) g.add(place(lowStockMarker(), x, 3.2, -5.6));
      addArea(root, areas, `rak-${id}`, g);
    });
    addArea(root, areas, 'pintu-gudang', doorWithCartons(0x9fb6e0, -12.95, 1, true));
    const p = new Group();
    p.add(place(cartonPallet(2), 6, 0, 4.5), place(cartonPallet(1), 8.2, 0, 4.5));
    root.add(mergeMeshes(p));
    // Kode rak dicat halus di lantai depan rak.
    root.add(
      paintLabels(
        [
          ...coldRackIds.map((id, i): [string, number, number, number, number, string] => [
            id,
            -7 + i * 7,
            -4.3,
            1.8,
            1.0,
            '#5f8fb3',
          ]),
          ['GUDANG', -11.2, 1, 2.6, 0.55, '#5f8fb3', Math.PI / 2],
        ],
        0.1,
      ),
    );
    return { root, areas };
  }
  // Gudang 38 × 28: bangunan z −14…0 berlantai kayu, halaman dok z 0…14.
  roomShell(shell, 38, 28, 0xdcdfea, WALL, WALL_TOP, 4.4, 14);
  const floor = new Group();
  plankFloor(floor, 38.6, 14.2, -7, WAREHOUSE_FLOOR, 0xdcb78b, 1.6);
  floor.position.y = 0.015;
  shell.add(floor);
  // Dinding depan rendah dan rangka dok: isi gudang tetap terlihat dari kamera.
  shell.add(place(box(38.6, 0.9, 0.34, CREAM, 0.14), 0, 0, 0));
  for (const x of DOCK_X) {
    shell.add(
      place(box(0.3, 3.4, 0.4, CREAM, 0.1), x - 1.7, 0, 0),
      place(box(0.3, 3.4, 0.4, CREAM, 0.1), x + 1.7, 0, 0),
    );
    shell.add(place(box(3.7, 0.5, 0.46, WALL_TOP, 0.14), x, 3.2, 0));
  }
  for (const x of [-12, -4, 4]) root.add(place(ambienceWindow(3.4, 1.4), x, 2.6, -13.98));
  // Halaman: garis jalur, pagar, dan pepohonan tepi.
  for (let x = -16; x <= 16; x += 3)
    shell.add(place(box(1.4, 0.04, 0.3, 0xf7f7fa, 0.02), x, 0.03, 9.6));
  for (let x = -19; x <= 19; x += 2)
    shell.add(place(box(0.28, 0.9, 0.28, CREAM, 0.13), x, 0, 14.2));
  shell.add(
    place(box(38.2, 0.24, 0.28, CREAM, 0.12), 0, 0.7, 14.2),
    place(box(38.2, 0.24, 0.28, 0xb7d9c4, 0.12), 0, 0.36, 14.2),
  );
  for (const x of [-17.5, -8, 8, 17.5]) shell.add(place(plant(2.1), x, 0, 12.8));
  shell.add(place(extinguisher(), -18.4, 0, -1.2));
  root.add(mergeMeshes(shell));
  rackIds.forEach((id, i) => {
    const items = model.inventory.racks[id];
    const x = -12 + (i % 3) * 8,
      z = i < 3 ? -10.6 : -5.6;
    const g = new Group();
    g.add(place(steelRack(stock ? Math.min(1, items.length / 6) : 0, 4), x, 0, z));
    if (stock && items.some(isBelowMinimum)) g.add(place(lowStockMarker(), x, 3.2, z));
    addArea(root, areas, `rak-${id}`, g);
  });
  DOCK_X.forEach((x, i) => {
    const g = new Group();
    g.add(place(box(3.2, 0.04, 6.8, 0xe6e9f2, 0.02), x, 0.04, 4.0));
    for (const s of [-1, 1])
      g.add(place(box(0.22, 0.06, 6.8, 0xf2c75c, 0.03), x + s * 1.6, 0.04, 4.0));
    g.add(place(box(3.4, 0.06, 0.22, 0xf2c75c, 0.03), x, 0.04, 7.4));
    addArea(root, areas, `dok-D${i + 1}`, g);
  });
  addArea(root, areas, 'pintu-kantor', doorWithCartons(0xf1ebe1, -18.95, -7, true));
  addArea(root, areas, 'pintu-pendingin', doorWithCartons(0xd2e6f5, 14, -13.95, false));
  // Peralatan bongkar: forklift dan palet berkardus (tidak mewakili jumlah stok).
  const equipment = new Group();
  const f = forklift();
  f.rotation.y = 0.5;
  equipment.add(place(f, 13, 0, -7.5));
  for (const [x, z] of [
    [-8, 1.6],
    [0, 1.6],
    [8, 1.6],
    [16.5, -10.5],
    [10, -3],
  ])
    equipment.add(place(cartonPallet(2), x, 0, z));
  root.add(mergeMeshes(equipment));
  // Kode rak, dok, dan arah pintu dicat halus di lantai (tanpa papan nama).
  root.add(
    paintLabels(
      [
        ...rackIds.map((id, i): [string, number, number, number, number, string] => [
          id,
          -12 + (i % 3) * 8,
          (i < 3 ? -10.6 : -5.6) + 1.35,
          1.4,
          1.1,
          '#9a7146',
        ]),
        ...DOCK_X.map((x, i): [string, number, number, number, number, string] => [
          `D${i + 1}`,
          x,
          6.5,
          1.8,
          1.0,
          '#8590ad',
        ]),
        ['KANTOR', -17.1, -7, 2.6, 0.55, '#9a7146', Math.PI / 2],
        ['COLD STORAGE', 14, -12.2, 3.4, 0.5, '#9a7146'],
      ],
      0.12,
    ),
  );
  if (deliveries)
    for (const spot of model.trucks) {
      const g = new Group();
      const car = truck(0x7f9fe0, 0xf6f5f2);
      if (spot.place === 'dok') {
        car.rotation.y = -Math.PI / 2;
        g.add(place(car, DOCK_X[spot.index], 0, 4.1));
      } else {
        car.rotation.y = Math.PI;
        g.add(place(car, 10 - spot.index * 7, 0, 11.3));
      }
      addArea(root, areas, `kirim-${spot.delivery.id}`, g);
    }
  return { root, areas };
}
