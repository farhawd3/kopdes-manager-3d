// Kawasan gerai 3D: unit KDMP sebagai ruang bersekat kaca di kiri-kanan lorong, bergaya sama
// dengan kantor (dinding biru lembut, lantai kayu). Unit belum buka digambar transparan dengan
// gembok; kantor koperasi, logistik, dan cold storage memiliki pintu ke lokasi masing-masing.
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  TorusGeometry,
  type BufferGeometry,
  type Object3D,
} from 'three';
import { sphere, place, box, cylinder } from './shapes';
import { chair, cabinet, door, openShelf, sofa, plant } from './furniture';
import { forklift, pallet, sackPallet, rollerDoor, cartonStack } from './logistics';
import {
  WOOD_BASE,
  WALL,
  WALL_TOP,
  WOOD_FLOOR,
  mergeMeshes,
  mergeGlass,
  plankFloor,
  glassPartition,
  type Slot,
} from './monitoring-room';
import { STORES, type StoreId, type StoreInfo } from './store';
import { paintLabels } from './floor-text';
import { ambienceWindow } from './ambience';

type Area = Mesh<BufferGeometry, MeshStandardMaterial>;
const RX = 4;
const RZ = 3.5;
const AISLE = 1.5;
const W = 40;
const D = 2 * (2 * RZ + AISLE);
const H = Math.PI / 2;
const WOOD = 0xead2ad;

function counterTable(w: number) {
  const g = new Group();
  g.add(
    place(box(w, 0.95, 0.8, WOOD, 0.12), 0, 0, 0),
    place(box(w + 0.1, 0.08, 0.9, 0xf6f2ea, 0.04), 0, 0.95, 0),
  );
  return g;
}
function cashRegister() {
  const g = new Group();
  g.add(
    place(box(0.5, 0.25, 0.4, 0x4a5168, 0.06), 0, 0, 0),
    place(box(0.4, 0.3, 0.05, 0x9fd3ff, 0.02, 0.4), 0, 0.25, -0.12),
  );
  return g;
}
function crossSign(color: number) {
  const g = new Group();
  g.add(
    place(box(0.5, 0.16, 0.06, color, 0.03), 0, 0.17, 0),
    place(box(0.16, 0.5, 0.06, color, 0.03), 0, 0, 0),
  );
  return g;
}
function rotated<T extends Object3D>(o: T, rot: number) {
  o.rotation.y = rot;
  return o;
}

/** Gembok melayang: tanda unit belum dibuka di web. */
function padlock() {
  const g = new Group();
  g.add(place(box(1.0, 0.82, 0.46, 0xf2c75c, 0.18), 0, 0, 0));
  g.add(
    place(box(0.14, 0.26, 0.06, 0x8a6a2a, 0.04), 0, 0.22, 0.22),
    place(sphere(0.09, 0x8a6a2a), 0, 0.5, 0.23),
  );
  const shackle = new Mesh(
    new TorusGeometry(0.3, 0.09, 12, 24, Math.PI),
    new MeshStandardMaterial({ color: 0xb8c0d4 }),
  );
  shackle.position.y = 0.8;
  g.add(shackle);
  return g;
}

function furnishStore(
  id: StoreId,
  g: Group,
  at: <T extends Object3D>(o: T, x: number, z: number, y?: number) => T,
) {
  const counter = (w = 3.2) =>
    g.add(at(counterTable(w), 0, -0.8), at(cashRegister(), -0.6, -0.8, 1.0));
  if (id === 'kantor') {
    counter();
    g.add(
      at(box(1.8, 1.2, 0.1, 0x7f9fe0, 0.06), -1.2, -3.35, 1.0),
      at(rotated(sofa(0xa9c3e8), H), -3.2, 1.6),
    );
    g.add(at(plant(1.2), 3.3, 2.8), at(plant(1.0), -3.3, -2.9));
  } else if (id === 'simpan-pinjam') {
    counter(3.4);
    g.add(at(box(3.4, 0.7, 0.06, 0xd8e7fb, 0.02), 0, -1.15, 1.03));
    g.add(
      at(box(0.9, 1.1, 0.8, 0x5b6380, 0.14), 3.0, -2.9),
      at(cylinder(0.14, 0.14, 0.06, 0xf2c75c), 3.0, -2.45, 0.62),
    );
    for (const x of [-0.7, 0.7]) g.add(at(rotated(chair(0x9fc4c9), Math.PI), x, 0.9));
    g.add(at(plant(1.1), -3.3, 2.8));
  } else if (id === 'klinik') {
    g.add(
      at(box(1.1, 0.5, 2.1, 0xf6f6f8, 0.14), -2.6, 1.0),
      at(box(0.9, 0.16, 0.5, 0xffffff, 0.08), -2.6, 0.18, 0.5),
    );
    g.add(at(box(1.12, 0.1, 1.2, 0x9fc4e8, 0.05), -2.6, 1.4, 0.5));
    g.add(at(box(0.08, 1.8, 2.4, 0xcfe8de, 0.04), -1.6, 1.0));
    g.add(at(cabinet(1.2, 1.8, 0xf6f6f8), 2.6, -2.9), at(crossSign(0xe46b62), 2.6, -2.55, 1.2));
    g.add(at(counterTable(2.0), 0.6, -0.8), at(plant(1.0), 3.3, 2.8));
  } else if (id === 'apotek') {
    counter(3.0);
    g.add(
      at(openShelf(2.2, 2.0, 1, 0xf6f6f8), -2.2, -3.0),
      at(openShelf(2.2, 2.0, 0.8, 0xf6f6f8), 2.2, -3.0),
    );
    g.add(at(crossSign(0x5fb36a), 0, -3.3, 2.1), at(plant(1.0), 3.3, 2.8));
  } else if (id === 'cold-storage') {
    for (const x of [-2.4, -0.4])
      g.add(
        at(box(1.7, 0.9, 1.0, 0xf7fbfd, 0.16), x, 1.2),
        at(box(1.7, 0.1, 1.0, 0x9ccbe6, 0.05), x, 1.2, 0.96),
      );
    for (const x of [1.7, 2.8])
      g.add(
        at(box(0.95, 2.0, 0.8, 0xf3f7fa, 0.14), x, -2.9),
        at(box(0.75, 1.6, 0.04, 0xcfe6f4, 0.02), x, -2.48, 0.25),
      );
    g.add(at(counterTable(1.6), -2.2, -0.8));
  } else if (id === 'logistik') {
    g.add(at(counterTable(2.2), 0, -0.8));
    const f = forklift();
    f.rotation.y = -0.6;
    for (const [x, z] of [
      [1.6, 1.8],
      [1.6, 0.2],
      [3.0, 1.0],
    ]) {
      const p = pallet();
      p.add(place(cartonStack(2), -0.3, 0.22, 0), place(cartonStack(1), 0.35, 0.22, 0.1));
      g.add(at(p, x, z));
    }
    g.add(at(f, -1.4, 2.0));
  } else if (id === 'sembako') {
    counter(2.6);
    g.add(at(sackPallet(2), -2.6, 1.6), at(sackPallet(1), -2.6, 0.2));
    g.add(at(openShelf(2.0, 2.0), 2.5, -3.0), at(box(0.9, 1.9, 0.8, 0xf3f7fa, 0.14), 3.3, 1.6));
    g.add(at(cartonStack(3), 1.8, 2.6));
  } else {
    // Gerai potensi desa: lapak berkanopi dengan keranjang hasil desa.
    g.add(at(box(3.0, 0.85, 1.1, WOOD, 0.12), 0, -0.8));
    const fruitColors = [0xe46b62, 0xf2c75c, 0x86c3a3, 0xb39fe0];
    [-1.0, 0, 1.0].forEach((x, i) => {
      g.add(at(cylinder(0.36, 0.3, 0.22, 0xc99b67), x, -0.8, 0.85));
      for (let k = 0; k < 3; k++)
        g.add(
          at(
            sphere(0.12, fruitColors[(i + k) % 4]),
            x + (k - 1) * 0.16,
            -0.8 + (k % 2) * 0.1,
            1.08,
          ),
        );
    });
    for (const x of [-1.6, 1.6]) g.add(at(box(0.1, 2.3, 0.1, 0xf3eee6, 0.03), x, -1.4));
    [0xe7a98f, 0xf6f2ea, 0xe7a98f, 0xf6f2ea, 0xe7a98f, 0xf6f2ea].forEach((w, i) =>
      g.add(at(box(0.56, 0.12, 1.5, w, 0.04), -1.4 + i * 0.56, -1.0, 2.3)),
    );
    g.add(
      at(box(0.9, 0.5, 0.7, WOOD, 0.08), 2.6, 1.4),
      at(box(0.9, 0.5, 0.7, WOOD, 0.08), 2.6, 2.3),
      at(plant(1.0), -3.3, 2.8),
    );
  }
}

/** Tempat staf gerai: di belakang meja layanan, menghadap kamera. */
function storeSlots(id: StoreId): Slot[] {
  const { x, z } = STORES[id];
  return [-0.8, 0.8, -2.2].map((dx) => ({
    x: x + dx,
    z: z - 1.95,
    rot: 0,
    pose: 'berdiri' as const,
    y: 0.06,
    via: [],
  }));
}

export function buildStores(info: StoreInfo[]) {
  const root = new Group();
  const shell = new Group(),
    glass = new Group();
  shell.add(
    place(box(W + 1, 0.55, D + 1, WOOD_BASE, 0.3), 0, -0.6, 0),
    place(box(W - 0.4, 0.03, 2 * AISLE - 0.4, 0xeadcc4, 0.015), 0, 0.04, 0),
    place(box(W + 0.8, 3.6, 0.42, WALL, 0.2), 0, 0, -D / 2 - 0.2),
    place(box(0.42, 3.6, D + 0.8, WALL, 0.2), -W / 2 - 0.2, 0, 0),
    place(box(W + 0.9, 0.18, 0.5, WALL_TOP, 0.08), 0, 3.56, -D / 2 - 0.2),
    place(box(0.5, 0.18, D + 0.9, WALL_TOP, 0.08), -W / 2 - 0.2, 3.56, 0),
  );
  plankFloor(shell, W + 0.8, D + 0.8, 0, WOOD_FLOOR, 0xd5a675);
  for (const x of [-8, 0, 8, 16]) root.add(place(ambienceWindow(2.6, 1.4), x, 1.55, -D / 2 + 0.02));
  // Ujung kanan lorong terbuka sebagai pintu masuk kawasan.
  shell.add(place(plant(1.4), W / 2 - 0.6, 0, -1.1), place(plant(1.4), W / 2 - 0.6, 0, 1.1));
  for (const x of [-12, -4, 4, 12])
    for (const z of [-5, 5]) glassPartition(shell, glass, 2 * RZ, x, z, true);
  for (const id of Object.keys(STORES) as StoreId[]) {
    const { x, z } = STORES[id];
    const gz = z < 0 ? -AISLE : AISLE;
    for (const s of [-1, 1]) glassPartition(shell, glass, 3, x + s * 2.5, gz, false);
  }
  root.add(mergeMeshes(shell), mergeGlass(glass));
  const areas = new Map<string, Area>();
  const slots = {} as Record<StoreId, Slot[]>;
  const labels: Parameters<typeof paintLabels>[0] = [];
  for (const g of info) {
    const { x, z, color, code } = STORES[g.id];
    const at = <T extends Object3D>(o: T, lx: number, lz: number, y = 0.06) =>
      place(o, x + lx, y, z + lz);
    const group = new Group();
    group.add(place(box(2 * RX - 0.5, 0.05, 2 * RZ - 0.5, color, 0.04), x, 0.01, z));
    // Papan warna di atas bukaan pintu ruang.
    group.add(place(box(1.6, 0.36, 0.12, darken(color), 0.08), x, 2.47, z < 0 ? -AISLE : AISLE));
    furnishStore(g.id, group, at);
    const mesh = mergeMeshes(group) as Area;
    mesh.userData.areaKey = `g:${g.id}`;
    if (!g.open) {
      // Belum dibuka di web: ruang transparan, tetap dapat dipilih untuk melihat statusnya.
      Object.assign(mesh.material, { transparent: true, opacity: 0.32, depthWrite: false });
      mesh.castShadow = false;
      const lock = mergeMeshes(at(padlock(), 0, 0.6, 1.4));
      lock.userData.areaKey = `g:${g.id}`;
      root.add(lock);
    }
    root.add(mesh);
    areas.set(`g:${g.id}`, mesh);
    slots[g.id] = storeSlots(g.id);
    labels.push([
      code,
      x,
      z + 2.4,
      3.2,
      0.55,
      `#${darken(color, 0.6).toString(16).padStart(6, '0')}`,
    ]);
  }
  // Pintu ke kantor, gudang, dan cold storage.
  const addDoor = (key: string, o: Group) => {
    const m = mergeMeshes(o);
    m.userData.areaKey = key;
    root.add(m);
    areas.set(key, m);
  };
  const k = STORES.kantor;
  const officeDoor = new Group();
  officeDoor.add(
    place(door(), k.x + 2.6, 0.06, -D / 2 + 0.1),
    place(box(1.4, 0.04, 0.8, 0x9fb3e3, 0.02), k.x + 2.6, 0.06, -D / 2 + 0.7),
  );
  addDoor('pintu-kantor', officeDoor);
  const logisticsStore = STORES.logistik;
  const warehouseDoor = new Group();
  const shutter = rollerDoor(2.2, 2.6, 0xf1ebe1);
  shutter.rotation.y = H;
  warehouseDoor.add(
    place(shutter, -W / 2 + 0.05, 0, logisticsStore.z + 0.5),
    place(cartonStack(2), -W / 2 + 0.8, 0.06, logisticsStore.z - 1.3),
  );
  addDoor('pintu-gudang', warehouseDoor);
  const coldStore = STORES['cold-storage'];
  const coldDoor = new Group();
  coldDoor.add(place(rollerDoor(2.0, 2.6, 0xd2e6f5), coldStore.x - 2.4, 0, -D / 2 + 0.05));
  addDoor('pintu-pendingin', coldDoor);
  labels.push(
    ['KANTOR', k.x + 2.6, -D / 2 + 1.5, 2.2, 0.45, '#8c7aa8'],
    ['GUDANG', -W / 2 + 1.5, logisticsStore.z + 0.5, 2.2, 0.45, '#b48d61', H],
    ['DINGIN', coldStore.x - 2.4, -D / 2 + 1.4, 2.0, 0.45, '#5f8fb3'],
  );
  root.add(paintLabels(labels));
  return { root, areas, slots };
}

function darken(hex: string, t = 0.82) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
