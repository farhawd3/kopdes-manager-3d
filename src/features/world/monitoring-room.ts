import {
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { COLOR, sphere, place, box, cylinder, rotated, darken } from './shapes';
import {
  dispenser,
  rug,
  chair,
  cabinet,
  desk,
  meetingTable,
  monitor,
  dumbbellRack,
  door,
  openShelf,
  exerciseBike,
  sofa,
  plant,
  treadmill,
} from './furniture';
import { pallet, sackPallet, rollerDoor, steelRack, cartonStack } from './logistics';
import { OFFICE_ROOMS, type OfficeRoom } from './office-rooms';
import { paintLabels } from './floor-text';
import { ambienceWindow } from './ambience';

/**
 * Lantai papan lebar dua nada tanpa celah: corak kayu terbaca tanpa garis tipis yang tampak
 * patah-patah (aliasing) dari kamera isometrik.
 */
export function plankFloor(
  g: Group,
  w: number,
  d: number,
  cz: number,
  a: number,
  b: number,
  plankWidth = 1.5,
) {
  const n = Math.round(w / plankWidth);
  for (let i = 0; i < n; i++)
    g.add(
      place(box(w / n + 0.002, 0.12, d, i % 2 ? a : b, 0), -w / 2 + (i + 0.5) * (w / n), -0.07, cz),
    );
}

/** Satu mesh per bidang tetap bisa dipilih, tanpa ratusan panggilan gambar per perabot. */
export function mergeMeshes(group: Group) {
  group.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  group.traverse((obj) => {
    if (!(obj instanceof Mesh) || !(obj.material instanceof MeshStandardMaterial)) return;
    const geo = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
    geo.applyMatrix4(obj.matrixWorld);
    geo.deleteAttribute('uv');
    const color = obj.material.color;
    const colors = new Float32Array(geo.getAttribute('position').count * 3);
    for (let i = 0; i < colors.length; i += 3) colors.set([color.r, color.g, color.b], i);
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    parts.push(geo);
  });
  const geometry = mergeGeometries(parts, false)!;
  parts.forEach((part) => part.dispose());
  const mesh = new Mesh(
    geometry,
    new MeshStandardMaterial({ vertexColors: true, roughness: 0.72 }),
  );
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** Kaca sekat: satu mesh transparan, tidak ikut bayangan dan tidak menghalangi klik. */
export function mergeGlass(group: Group) {
  const mesh = mergeMeshes(group);
  Object.assign(mesh.material, { transparent: true, opacity: 0.3, depthWrite: false });
  mesh.material.roughness = 0.15;
  mesh.castShadow = false;
  mesh.renderOrder = 2;
  mesh.userData.glass = true;
  return mesh;
}

// Palet kantor mengikuti diorama kamar: dinding biru lembut, lantai kayu hangat.
export const WALL = 0x9db4df;
export const WALL_TOP = 0xc3d3f0;
export const WOOD_FLOOR = 0xdcae7d;
export const WOOD_BASE = 0xb9875c;

export type Pose = 'duduk' | 'berdiri' | 'ketik';
type Point = { x: number; z: number };
/**
 * Tempat figur (koordinat dunia). `via` = titik lewat dari dalam pintu ruang ke tempat ini,
 * dipilih di lorong bebas perabot agar figur tidak menembus meja/rak.
 */
export type Slot = Point & {
  rot: number;
  pose: Pose;
  y?: number;
  via: Point[];
  isManager?: boolean;
};

/** Batas kantor: x −25…25, z −9…9; lorong z −1,5…1,5; sayap istirahat x 15…25. */
export const AISLE_Z = 0;
const AISLE = 1.5;
const HX = 5;
const HZ = 3.75;
export const WAREHOUSE_DOOR = { x: -24, z: 0 };
const GLASS_HEIGHT = 2.35;
const DESK_WOOD = 0xead2ad;
const DOOR_WIDTH = 2.2;

const isBackRow = (id: OfficeRoom) => OFFICE_ROOMS[id].z < 0;
/** Sayap istirahat terbuka di ujung kanan lorong (x = 15), tersisih dari ruang kerja. */
const END_X = 15;
/** Titik pintu ruang di garis sekat lorong. */
export function roomDoor(id: OfficeRoom): Point {
  if (id === 'istirahat') return { x: END_X, z: AISLE_Z };
  return { x: OFFICE_ROOMS[id].x, z: isBackRow(id) ? -AISLE : AISLE };
}
/** Titik tepat di dalam pintu; semua `via` dimulai dari sini. */
export function roomInside(id: OfficeRoom): Point {
  if (id === 'istirahat') return { x: END_X + 1.2, z: AISLE_Z };
  return { x: OFFICE_ROOMS[id].x, z: OFFICE_ROOMS[id].z + (isBackRow(id) ? 3.0 : -3.0) };
}

const S = Math.PI;
const H = Math.PI / 2;
function slot(
  id: OfficeRoom,
  x: number,
  z: number,
  rot: number,
  pose: Pose,
  y: number,
  via: [number, number][] = [],
): Slot {
  const { x: cx, z: cz } = OFFICE_ROOMS[id];
  return {
    x: cx + x,
    z: cz + z,
    rot,
    pose,
    y,
    via: via.map(([a, b]) => ({ x: cx + a, z: cz + b })),
  };
}
// Dudukan kursi kerja ±0,68 → alas figur 0,2; kursi rapat ±0,78 → 0,3.
const KT = 0.2;
const RP = 0.3;
const LT = 0.06;
export const SLOT: Record<OfficeRoom, Slot[]> = {
  // Meja menghadap kamera: figur duduk di sisi dinding sehingga wajahnya terlihat.
  // Baris bawah (pintu di sisi −z): meja menghadap kamera, kursi di sisi lorong.
  kerja: [
    slot('kerja', -4.6, -1.88, 0, 'ketik', KT, [
      [0, -2.6],
      [-4.6, -2.6],
    ]),
    slot('kerja', -2.0, -1.88, 0, 'ketik', KT, [
      [0, -2.6],
      [-2.0, -2.6],
    ]),
    slot('kerja', 2.0, -1.88, 0, 'ketik', KT, [
      [0, -2.6],
      [2.0, -2.6],
    ]),
    slot('kerja', 4.6, -1.88, 0, 'ketik', KT, [
      [0, -2.6],
      [4.6, -2.6],
    ]),
    slot('kerja', -3.3, 1.32, 0, 'ketik', KT, [
      [0, 0.5],
      [-3.3, 0.5],
    ]),
    slot('kerja', 3.3, 1.32, 0, 'ketik', KT, [
      [0, 0.5],
      [3.3, 0.5],
    ]),
    slot('kerja', 5.3, 0.6, H, 'berdiri', LT, [
      [0, 0.5],
      [5.3, 0.5],
    ]),
    slot('kerja', 0, 1.0, 0, 'berdiri', LT, [[0, 0.5]]),
  ],
  // Meja manajer menghadap kamera; tempat pertama khusus manajer, sisanya kursi tamu.
  manajer: [
    {
      ...slot('manajer', 0, -2.88, 0, 'ketik', KT, [
        [1.8, 1.0],
        [1.8, -2.88],
      ]),
      isManager: true,
    },
    slot('manajer', -0.6, -0.1, S, 'duduk', LT, [[-0.6, 0.9]]),
    slot('manajer', 0.6, -0.1, S, 'duduk', LT, [[0.6, 0.9]]),
    slot('manajer', 3.0, -1.9, S, 'berdiri', LT, [[2.6, 0.5]]),
  ],
  // Kursi sisi dalam menghadap kamera lebih dulu; kursi sisi depan lewat lorong kiri meja.
  rapat: [
    slot('rapat', -1.12, -0.73, 0, 'duduk', RP, [[-1.12, -2.0]]),
    slot('rapat', 0, -0.73, 0, 'duduk', RP, [[0, -2.0]]),
    slot('rapat', 1.12, -0.73, 0, 'duduk', RP, [[1.12, -2.0]]),
    slot('rapat', -1.12, 1.93, S, 'duduk', RP, [
      [-2.9, -2.0],
      [-2.9, 3.0],
      [-1.12, 3.0],
    ]),
    slot('rapat', 0, 1.93, S, 'duduk', RP, [
      [-2.9, -2.0],
      [-2.9, 3.0],
      [0, 3.0],
    ]),
    slot('rapat', 1.12, 1.93, S, 'duduk', RP, [
      [-2.9, -2.0],
      [-2.9, 3.0],
      [1.12, 3.0],
    ]),
    slot('rapat', 3.2, 0.6, -H, 'berdiri', LT, [[3.2, -2.0]]),
  ],
  gym: [
    slot('gym', -3.6, -2.3, 0, 'berdiri', 0.3, [
      [-2.6, -0.4],
      [-2.6, -2.3],
    ]),
    slot('gym', -1.6, -2.3, 0, 'berdiri', 0.3, [
      [-2.6, -0.4],
      [-2.6, -2.3],
    ]),
    slot('gym', 0.6, -2.5, 0, 'duduk', 0.42, [
      [1.3, -0.4],
      [1.3, -2.5],
    ]),
    slot('gym', 2.0, 1.2, 0.6, 'berdiri', LT, [[2.0, 2.8]]),
    slot('gym', 3.8, 1.2, -0.6, 'berdiri', LT, [[3.8, 2.8]]),
    slot('gym', 3.4, -2.25, 0, 'berdiri', LT, [[3.4, -0.4]]),
    slot('gym', -3.0, 1.2, 0.8, 'berdiri', LT),
  ],
  // Baris atas: pintu gerai di dinding belakang (x −2,4); loker di dinding kiri.
  karyawan: [
    slot('karyawan', 2.0, -2.28, 0, 'ketik', KT, [
      [0.4, 0.4],
      [0.4, -2.28],
    ]),
    slot('karyawan', -1.6, 1.4, 0, 'duduk', 0.0, [[-1.6, 2.4]]),
    slot('karyawan', -0.6, 1.4, 0, 'duduk', 0.0, [[-0.6, 2.4]]),
    slot('karyawan', -3.7, -0.5, -H, 'berdiri', LT, [[-2.6, -0.5]]),
    slot('karyawan', -2.4, -2.5, S, 'berdiri', LT, [
      [-1.4, 0.2],
      [-2.4, -1.4],
    ]),
  ],
  stok: [
    slot('stok', 0, -0.58, 0, 'ketik', KT),
    slot('stok', -2.6, -1.5, S, 'berdiri', LT),
    slot('stok', 2.6, -1.5, S, 'berdiri', LT),
    slot('stok', -2.0, 1.4, -H, 'berdiri', LT, [[-2.0, -0.6]]),
    slot('stok', 2.1, 1.0, H, 'berdiri', LT, [[2.0, -0.6]]),
  ],
  // Baris atas (pintu di sisi +z): loket di kiri, kursi tunggu di kanan.
  kas: [
    slot('kas', -2.6, -2.28, 0, 'ketik', KT, [
      [-0.8, 0.2],
      [-0.8, -2.28],
    ]),
    slot('kas', 2.6, -2.0, S, 'berdiri', LT, [
      [0.2, 0.5],
      [2.6, 0.5],
    ]),
    slot('kas', 1.4, 1.6, S, 'duduk', 0.06, [
      [0.2, 0.5],
      [1.4, 0.5],
    ]),
    slot('kas', 2.4, 1.6, S, 'duduk', 0.06, [
      [0.2, 0.5],
      [2.4, 0.5],
    ]),
    slot('kas', 3.4, 1.6, S, 'duduk', 0.06, [
      [0.2, 0.5],
      [3.4, 0.5],
    ]),
  ],
  // Lorong tengah x = 0 di antara dua sofa menuju meja kopi; sofa menghadap kamera.
  istirahat: [
    slot('istirahat', -3.0, -3.3, 0, 'duduk', 0, [
      [0, 0],
      [0, -1.6],
      [-3.0, -1.6],
    ]),
    slot('istirahat', 3.0, -3.3, 0, 'duduk', 0, [
      [0, 0],
      [0, -1.6],
      [3.0, -1.6],
    ]),
    slot('istirahat', -1.95, -3.3, 0, 'duduk', 0, [
      [0, 0],
      [0, -1.6],
      [-1.95, -1.6],
    ]),
    slot('istirahat', 1.95, -3.3, 0, 'duduk', 0, [
      [0, 0],
      [0, -1.6],
      [1.95, -1.6],
    ]),
    slot('istirahat', -1.0, -6.5, 0, 'berdiri', LT, [
      [0, 0],
      [0, -5.4],
      [-1.0, -5.4],
    ]),
    slot('istirahat', 1.0, -6.5, 0, 'berdiri', LT, [
      [0, 0],
      [0, -5.4],
      [1.0, -5.4],
    ]),
    slot('istirahat', -3.3, 3.0, H, 'duduk', 0.08, [[-3.3, 1.8]]),
    slot('istirahat', -1.7, 3.0, -H, 'duduk', 0.08, [[-1.7, 1.8]]),
    slot('istirahat', 1.7, 3.0, H, 'duduk', 0.08, [[1.7, 1.8]]),
    slot('istirahat', 3.3, 3.0, -H, 'duduk', 0.08, [[3.3, 1.8]]),
  ],
};

/** Tempat tambahan bila figur lebih banyak dari tempat ruang: berdiri berjajar dekat pintu. */
export function extraSlot(id: OfficeRoom, n: number): Slot {
  const d = roomInside(id);
  const dir = isBackRow(id) ? -1 : 1;
  return {
    x: d.x + ((n % 5) - 2) * 0.9,
    z: d.z + dir * (0.4 + Math.floor(n / 5) * 0.8),
    rot: dir > 0 ? 0 : S,
    pose: 'berdiri',
    y: LT,
    via: [],
  };
}

/** Posisi label/penanda di atas ruang. */
export function roomAnchor(id: OfficeRoom) {
  return { x: OFFICE_ROOMS[id].x, y: 3.1, z: OFFICE_ROOMS[id].z };
}

export function glassPartition(
  frame: Group,
  glass: Group,
  length: number,
  x: number,
  z: number,
  alongZ: boolean,
) {
  const r = new Group(),
    k = new Group();
  r.add(
    place(box(length, 0.32, 0.3, 0xf6f4f0, 0.14), 0, 0, 0),
    place(box(length, 0.24, 0.3, 0xf6f4f0, 0.12), 0, GLASS_HEIGHT, 0),
    place(box(0.28, GLASS_HEIGHT, 0.3, 0xf6f4f0, 0.13), -length / 2 + 0.14, 0, 0),
    place(box(0.28, GLASS_HEIGHT, 0.3, 0xf6f4f0, 0.13), length / 2 - 0.14, 0, 0),
  );
  k.add(place(box(length - 0.14, GLASS_HEIGHT - 0.24, 0.05, 0xd8e7fb, 0.01), 0, 0.24, 0));
  for (const g of [r, k]) {
    if (alongZ) g.rotation.y = Math.PI / 2;
    g.position.set(x, 0, z);
  }
  frame.add(r);
  glass.add(k);
}

function deskLamp() {
  const g = new Group();
  g.add(
    place(cylinder(0.14, 0.16, 0.05, 0x4a5168), 0, 0, 0),
    place(box(0.04, 0.55, 0.04, 0x4a5168, 0.02), 0, 0.04, 0),
  );
  const shade = cylinder(0.08, 0.17, 0.22, 0xf2c75c);
  shade.position.set(0.12, 0.5, 0);
  shade.rotation.z = -0.5;
  g.add(shade);
  return g;
}

/** Rak dinding dengan buku dan vas, seperti rak di kamar referensi. */
function wallShelf(width = 2.2) {
  const g = new Group();
  g.add(place(box(width, 0.1, 0.42, COLOR.wood, 0.03), 0, 0, 0));
  const colors = [0xf3f1ec, 0x4fb3b3, 0x4a5168, 0x6f7fa8];
  colors.forEach((w, i) =>
    g.add(place(box(0.24, 0.5 + (i % 2) * 0.1, 0.32, w, 0.03), -width / 2 + 0.3 + i * 0.3, 0.1, 0)),
  );
  g.add(place(box(0.3, 0.42, 0.3, 0xf2c75c, 0.06), width / 2 - 0.35, 0.1, 0));
  return g;
}

function curtain(w: number) {
  const g = new Group();
  for (let i = 0; i < 4; i++)
    g.add(place(box(w + 0.2, 0.12, 0.1, i % 2 ? 0xefe6d6 : 0xe4d7c2, 0.03), 0, i * 0.13, 0));
  return g;
}

function trashBin() {
  return cylinder(0.2, 0.17, 0.42, 0x9aa6c4);
}

/** Meja kerja menghadap +z (kamera); kursi di sisi −z, 1,28 di belakang pusat meja. */
function workDesk(g: Group, x: number, z: number, chairColor = 0x7f9fe0) {
  const set = new Group();
  const seat = chair(chairColor);
  seat.rotation.y = Math.PI;
  set.add(desk(2.05, 1.1, 0xead2ad), place(monitor(), -0.25, 0.86, -0.19), place(seat, 0, 0, 1.05));
  set.add(place(box(0.66, 0.045, 0.25, 0x6d758c, 0.02), -0.25, 0.87, 0.24));
  set.add(place(box(0.38, 0.055, 0.43, 0xf7eddb, 0.025), 0.63, 0.87, 0.2));
  set.add(place(deskLamp(), 0.72, 0.86, -0.28));
  set.scale.setScalar(1.22);
  set.rotation.y = Math.PI;
  g.add(place(set, x, 0.06, z));
}

function furnishRoom(id: OfficeRoom, g: Group) {
  const { x: cx, z: cz } = OFFICE_ROOMS[id];
  const at = <T extends Object3D>(o: T, x: number, z: number, y = 0.06) =>
    place(o, cx + x, y, cz + z);
  const backWall = cz - HZ + 0.12;
  if (id === 'kerja') {
    // Ciri: ruang kerja terluas — enam meja, papan kanban berdiri, rak buku, dispenser.
    for (const x of [-4.6, -2.0, 2.0, 4.6]) workDesk(g, cx + x, cz - 0.6);
    for (const x of [-3.3, 3.3]) workDesk(g, cx + x, cz + 2.6);
    const board = new Group();
    board.add(
      place(kanban(), 0, 0.5, 0),
      place(box(0.08, 0.6, 0.08, 0x8b93ad, 0.03), -1.3, 0, 0),
      place(box(0.08, 0.6, 0.08, 0x8b93ad, 0.03), 1.3, 0, 0),
    );
    g.add(at(rotated(board, -H), 6.1, 0.6), at(rotated(openShelf(2.0, 1.9), H), -6.1, 1.2));
    g.add(
      at(dispenser(), 6.1, -3.0),
      at(plant(1.2), -6.0, -3.0),
      at(plant(1.1), 0, 3.2),
      at(trashBin(), -6.1, 3.1),
    );
  } else if (id === 'manajer') {
    // Ciri: meja manajer berkursi gelap, lemari arsip, bingkai piagam, sofa tamu.
    workDesk(g, cx, cz - 1.6, 0x4e5a7a);
    g.add(place(box(0.6, 0.16, 0.1, 0x4e5a7a, 0.03), cx + 0.4, 1.0, cz - 1.05));
    g.add(at(cabinet(1.3, 2.4), -3.6, -3.0), at(cabinet(1.3, 2.4), 3.6, -3.0));
    for (const x of [-1.3, 1.3])
      g.add(
        place(box(0.9, 0.7, 0.06, 0xead2ad, 0.04), cx + x, 2.0, backWall + 0.05),
        place(box(0.7, 0.5, 0.04, 0xf8f6f2, 0.02), cx + x, 2.1, backWall + 0.1),
      );
    for (const x of [-0.6, 0.6]) g.add(at(rotated(chair(0x9fb3e3), S), x, -0.1));
    g.add(
      at(rotated(sofa(0xa9c3e8), H), -3.7, 1.2),
      at(box(0.8, 0.45, 0.8, 0xead2ad, 0.12), -2.4, 1.2),
      at(plant(0.6), -2.4, 1.2, 0.5),
    );
    g.add(at(plant(1.2), 4.4, 3.2), at(plant(1.0), -4.4, 3.2));
  } else if (id === 'rapat') {
    // Ciri: meja rapat panjang, papan tulis beroda, karpet lavender, dispenser.
    const m = meetingTable();
    m.scale.setScalar(1.4);
    g.add(at(rug(6.2, 4.4, 0xe4def4), 0, 0.6, 0.08), at(m, 0, 0.6));
    const board = new Group();
    board.add(
      place(box(2.4, 1.5, 0.1, 0xf8f6f2, 0.06), 0, 0.8, 0),
      place(box(0.08, 0.8, 0.08, 0x8b93ad, 0.03), -1.0, 0, 0),
      place(box(0.08, 0.8, 0.08, 0x8b93ad, 0.03), 1.0, 0, 0),
    );
    board.add(
      place(box(0.9, 0.36, 0.04, 0xb8cdf2, 0.02), -0.5, 1.6, 0.06),
      place(box(0.8, 0.3, 0.04, 0xf2c75c, 0.02), 0.5, 1.2, 0.06),
    );
    g.add(
      at(rotated(board, -H), 4.2, 0.6),
      at(dispenser(), -4.3, -2.9),
      at(plant(1.2), -4.4, 3.2),
      at(plant(1.0), 4.4, 3.2),
    );
  } else if (id === 'gym') {
    g.add(
      at(rotated(treadmill(), S), -3.6, -2.3),
      at(rotated(treadmill(), S), -1.6, -2.3),
      at(rotated(exerciseBike(), S), 0.6, -2.3),
    );
    g.add(at(dumbbellRack(), 3.4, -3.1), at(plant(1.1), 4.4, 3.2), at(plant(1.0), -4.4, 3.2));
    g.add(
      at(rug(1.2, 2.2, COLOR.sage), 2.0, 1.2, 0.08),
      at(rug(1.2, 2.2, 0xc7b8ea), 3.8, 1.2, 0.08),
    );
    g.add(place(box(3.2, 1.9, 0.08, 0xe0ecfb, 0.04), cx - 2.6, 0.6, backWall + 0.05));
  } else if (id === 'karyawan') {
    // Ciri: loker warna-warni, bangku, gantungan celemek; pintu ke gerai di dinding belakang.
    workDesk(g, cx + 2.0, cz - 1.0, 0xe7a98f);
    [0xe7a98f, 0x9fc4e8, 0x9fd6bf, 0xf2c75c].forEach((w, i) => {
      g.add(at(rotated(box(0.62, 2.0, 0.6, w, 0.08), H), -4.5, -1.5 + i * 0.66));
      g.add(at(box(0.04, 0.3, 0.06, 0xffffff, 0.02), -4.18, -1.5 + i * 0.66, 1.2));
    });
    g.add(at(box(2.2, 0.42, 0.5, DESK_WOOD, 0.12), -1.1, 1.4));
    g.add(place(box(1.4, 0.06, 0.06, 0xf3eee6, 0.02), cx + 0.2, 1.9, backWall + 0.1));
    [0xe7a98f, 0x86c3a3, 0xb39fe0].forEach((w, i) =>
      g.add(place(box(0.36, 0.7, 0.06, w, 0.03), cx - 0.25 + i * 0.45, 1.2, backWall + 0.14)),
    );
    g.add(at(plant(1.0), 4.4, 3.2));
  } else if (id === 'stok') {
    // Ciri (dibuat ringkas): dua rak baja, satu palet karung, satu palet kardus.
    g.add(at(steelRack(0.8, 2.6), -2.6, -2.6), at(steelRack(0.6, 2.6), 2.6, -2.6));
    g.add(at(sackPallet(2), -3.2, 2.0));
    const p = pallet();
    p.add(place(cartonStack(2), -0.3, 0.22, 0), place(cartonStack(1), 0.35, 0.22, 0.1));
    g.add(at(p, 3.2, 2.0));
    workDesk(g, cx, cz + 0.7, 0xc99b67);
  } else if (id === 'kas') {
    // Ciri: loket kas dengan brankas, mesin kasir, layar antrean, dan kursi tunggu.
    workDesk(g, cx - 2.6, cz - 1.0, 0x98bdae);
    g.add(at(box(0.5, 0.22, 0.4, 0x4a5168, 0.06), -1.9, -0.8, 0.93));
    g.add(at(cabinet(1.3, 2.2), 3.3, -2.9), at(cabinet(1.3, 2.2), 4.6, -2.9));
    g.add(
      at(box(0.9, 1.0, 0.8, 0x5b6380, 0.14), 4.45, -0.6),
      at(cylinder(0.12, 0.12, 0.06, 0xf2c75c), 4.45, -0.18, 0.62),
    );
    for (const x of [1.4, 2.4, 3.4]) g.add(at(rotated(chair(0x9fd6bf), S), x, 1.6));
    g.add(place(wallShelf(1.8), cx - 0.4, 2.45, backWall + 0.15));
    g.add(
      at(box(0.08, 1.6, 0.08, 0x8b93ad, 0.03), -2.6, 2.9),
      at(box(0.9, 0.5, 0.1, 0x2f3448, 0.06), -2.6, 2.9, 1.6),
    );
    g.add(at(box(0.7, 0.3, 0.04, 0x86c3a3, 0.02, 0.6), -2.6, 2.95, 1.7));
    g.add(at(plant(1.1), -4.4, 3.2), at(plant(0.9), 4.4, 3.2));
  } else if (id === 'istirahat') {
    // Meja kopi di dinding belakang, sofa menghadap kamera, meja bundar di depan.
    g.add(
      at(box(6.4, 0.95, 1.0, 0xead2ad, 0.12), 0, -8.2),
      at(box(6.6, 0.1, 1.1, 0xf6f2ea, 0.05), 0, -8.2, 1.01),
    );
    g.add(
      at(box(0.7, 0.75, 0.55, 0x4a5168, 0.12), -2.2, -8.2, 1.1),
      at(box(0.4, 0.1, 0.3, 0x9fd3ff, 0.03, 0.5), -2.2, -7.92, 1.5),
    );
    const cups = [0xffffff, 0xf2c75c, 0x9fd6bf, 0xb8cdf2];
    [-0.8, -0.3, 0.6, 1.1].forEach((x, i) =>
      g.add(at(cylinder(0.11, 0.09, 0.2, cups[i]), x, -8.1, 1.11)),
    );
    g.add(
      at(box(0.9, 1.9, 0.8, 0xf3f5fa, 0.16), 2.7, -8.2),
      at(box(0.06, 0.6, 0.04, 0xa4abbd, 0.02), 2.4, -7.78, 1.0),
    );
    g.add(at(dispenser(), 3.9, -8.3));
    // Ciri ruang santai: TV dinding di atas meja kopi.
    g.add(
      at(box(2.8, 1.5, 0.12, 0x2f3448, 0.08), 0.4, -8.82, 1.95),
      at(box(2.56, 1.28, 0.04, 0x9fd3ff, 0.03, 0.35), 0.4, -8.74, 2.06),
    );
    for (const x of [-2.5, 2.5])
      g.add(
        at(sofa(0xe7a98f), x, -3.5),
        at(box(0.7, 0.55, 0.7, 0xead2ad, 0.14), x + Math.sign(x) * 1.65, -3.5),
      );
    g.add(at(rug(8.4, 3.6, 0xf6e8d6), 0, -3.0, 0.08));
    for (const x of [-2.5, 2.5]) {
      g.add(
        at(cylinder(0.55, 0.55, 0.08, 0xf6f2ea, 24), x, 3.0, 0.78),
        at(cylinder(0.08, 0.1, 0.78, 0x8b93ad), x, 3.0),
      );
      g.add(
        at(cylinder(0.32, 0.32, 0.5, 0xe7a98f, 16), x - 0.85, 3.0),
        at(cylinder(0.32, 0.32, 0.5, 0xe7a98f, 16), x + 0.85, 3.0),
      );
      g.add(at(cylinder(0.12, 0.1, 0.16, 0xffffff), x + 0.1, 3.0, 0.86));
    }
    g.add(
      at(plant(1.4), -4.4, -7.9),
      at(plant(1.2), 4.4, 7.9),
      at(plant(1.2), -4.4, 7.9),
      at(plant(1.0), 4.5, -5.6),
    );
    g.add(at(rotated(openShelf(2.0, 1.6), -H), 4.6, 4.6));
  }
}

/** Papan kanban: kartu warna = kolom rencana/proses/selesai. */
function kanban() {
  const board = new Group();
  board.add(place(box(3.2, 1.6, 0.08, 0xf8f6f2, 0.05), 0, 0, 0));
  [0xb8cdf2, 0xf2c75c, 0x9fd6bf].forEach((w, col) => {
    for (let i = 0; i < 3 - (col === 2 ? 1 : 0); i++)
      board.add(place(box(0.7, 0.32, 0.04, w, 0.02), -1.0 + col * 1.0, 1.1 - i * 0.42, 0.05));
  });
  return board;
}

/** Pintu ke kawasan gerai di dinding belakang ruang karyawan, berbingkai dan berpapan warna. */
function storeDoor(cx: number, cz: number) {
  const g = new Group();
  const x = cx - 2.4,
    z = cz - HZ + 0.12;
  const leaf = door();
  leaf.scale.set(1.3, 1.1, 1);
  g.add(place(leaf, x, 0.06, z), place(box(1.8, 0.14, 0.2, 0xf6f4f0, 0.05), x, 2.6, z + 0.02));
  g.add(
    place(box(0.14, 2.6, 0.2, 0xf6f4f0, 0.05), x - 0.85, 0.06, z + 0.02),
    place(box(0.14, 2.6, 0.2, 0xf6f4f0, 0.05), x + 0.85, 0.06, z + 0.02),
  );
  g.add(
    place(box(1.6, 0.4, 0.1, 0xe7a98f, 0.06), x, 2.85, z + 0.06),
    place(box(1.4, 0.04, 0.8, 0xe7a98f, 0.02), x, 0.06, z + 0.6),
  );
  return g;
}

/**
 * Kantor enam ruang bersekat kaca di sekitar lorong. Mesh: cangkang, kaca, enam ruang
 * (sasaran klik) dan pintu gudang bertumpuk kardus.
 */
export function buildOffice() {
  const root = new Group();
  const shell = new Group(),
    glass = new Group();
  // Bangunan x −25…25: ruang kerja x −25…15, sayap istirahat 15…25; z −9…9.
  const left = -5 * HX,
    right = END_X + 2 * HX,
    W = right - left,
    cx = (left + right) / 2,
    D = 2 * (2 * HZ + AISLE);
  shell.add(
    place(box(W + 1, 0.55, D + 1, WOOD_BASE, 0.3), cx, -0.6, 0),
    place(
      box(END_X - left - 0.6, 0.03, 2 * AISLE - 0.4, 0xeadcc4, 0.015),
      (left + END_X) / 2 + 0.3,
      0.04,
      AISLE_Z,
    ),
    place(box(W + 0.8, 3.6, 0.42, WALL, 0.2), cx, 0, -D / 2 - 0.2),
    place(box(0.42, 3.6, D + 0.8, WALL, 0.2), left - 0.2, 0, 0),
    place(box(W + 0.9, 0.18, 0.5, WALL_TOP, 0.08), cx, 3.56, -D / 2 - 0.2),
    place(box(0.5, 0.18, D + 0.9, WALL_TOP, 0.08), left - 0.2, 3.56, 0),
  );
  const floor = new Group();
  plankFloor(floor, W + 0.8, D + 0.8, 0, WOOD_FLOOR, 0xd5a675);
  floor.position.x = cx;
  shell.add(floor);
  // Jendela bertirai di dinding belakang dan kiri.
  for (const x of [-10, 0, 13, 23]) {
    root.add(place(ambienceWindow(3.6, 1.6), x, 1.3, -D / 2 + 0.02));
    shell.add(place(curtain(3.6), x, 2.85, -D / 2 + 0.06));
  }
  const leftWindow = ambienceWindow(2.8, 1.5);
  leftWindow.rotation.y = H;
  const leftCurtain = curtain(2.8);
  leftCurtain.rotation.y = H;
  root.add(place(leftWindow, left + 0.02, 1.4, -7.55));
  shell.add(place(leftCurtain, left + 0.06, 2.62, -7.55));
  for (const x of [-15, -5, 5]) shell.add(place(sphere(0.2, 0xffe2a0, 0.6), x, 2.9, -D / 2 + 0.12));
  // Sekat kaca antar-ruang (baris atas tiap 10, baris bawah tiap ±13,3), batas sayap istirahat,
  // dan sisi lorong dengan bukaan pintu di tengah tiap ruang.
  for (const x of [-15, -5, 5, END_X]) glassPartition(shell, glass, 2 * HZ, x, -5.25, true);
  for (const x of [-25 + 40 / 3, -25 + 80 / 3, END_X])
    glassPartition(shell, glass, 2 * HZ, x, 5.25, true);
  for (const id of Object.keys(OFFICE_ROOMS) as OfficeRoom[]) {
    if (id === 'istirahat') continue;
    const { x, z } = roomDoor(id);
    const seg = OFFICE_ROOMS[id].hx - DOOR_WIDTH / 2;
    for (const s of [-1, 1])
      glassPartition(shell, glass, seg, x + s * (DOOR_WIDTH / 2 + seg / 2), z, false);
  }
  root.add(mergeMeshes(shell), mergeGlass(glass));
  const areas = new Map<string, Mesh<BufferGeometry, MeshStandardMaterial>>();
  for (const id of Object.keys(OFFICE_ROOMS) as OfficeRoom[]) {
    const g = new Group();
    const zone = OFFICE_ROOMS[id];
    const depth = id === 'istirahat' ? D - 0.5 : 2 * HZ - 0.5;
    g.add(place(box(2 * zone.hx - 0.5, 0.05, depth, zone.color, 0.04), zone.x, 0.01, zone.z));
    // Papan penanda pintu sewarna ruang di atas bukaan; nama ruang ditulis label kanvas.
    const p = roomDoor(id);
    const board = box(1.6, 0.36, 0.12, darken(zone.color), 0.08);
    if (id === 'istirahat') board.rotation.y = H;
    g.add(place(board, p.x, GLASS_HEIGHT + 0.12, p.z));
    furnishRoom(id, g);
    const mesh = mergeMeshes(g);
    mesh.userData.areaKey = id;
    root.add(mesh);
    areas.set(id, mesh);
  }
  // Pintu lorong menuju pulau; akses gudang berada di dalam ruang Stok.
  const islandDoor = new Group();
  const exitDoor = door();
  exitDoor.scale.set(1.6, 1.1, 2);
  exitDoor.rotation.y = H;
  islandDoor.add(place(exitDoor, left + 0.05, 0, 0));
  islandDoor.add(place(box(0.12, 0.42, 1.4, 0x7f9fe0, 0.06), left + 0.08, 2.95, 0));
  islandDoor.add(
    place(plant(1.2), left + 0.75, 0.06, -1.3),
    place(plant(1.2), left + 0.75, 0.06, 1.3),
  );
  const doorMesh = mergeMeshes(islandDoor);
  doorMesh.userData.areaKey = 'pintu-pulau';
  root.add(doorMesh);
  areas.set('pintu-pulau', doorMesh);
  const stockDoor = new Group();
  const stockX = left + 0.05,
    stockZ = 5.6;
  const shutter = rollerDoor(2.4, 2.8, 0xd2ddf0);
  shutter.rotation.y = H;
  stockDoor.add(place(shutter, stockX, 0.06, stockZ));
  stockDoor.add(
    place(cartonStack(2), stockX + 0.8, 0.06, stockZ - 1.8),
    place(cartonStack(1), stockX + 0.8, 0.06, stockZ + 1.8),
  );
  const stockMesh = mergeMeshes(stockDoor);
  stockMesh.userData.areaKey = 'pintu-gudang';
  root.add(stockMesh);
  areas.set('pintu-gudang', stockMesh);
  const storeDoorMesh = mergeMeshes(storeDoor(OFFICE_ROOMS.karyawan.x, OFFICE_ROOMS.karyawan.z));
  storeDoorMesh.userData.areaKey = 'pintu-gerai';
  root.add(storeDoorMesh);
  areas.set('pintu-gerai', storeDoorMesh);
  // Nama ruang dicat tipis di lantai dekat pintunya (pengganti papan nama melayang).
  const labels: Parameters<typeof paintLabels>[0] = (Object.keys(OFFICE_ROOMS) as OfficeRoom[]).map(
    (id) => {
      const d = roomInside(id);
      const color = `#${darken(OFFICE_ROOMS[id].color, 0.62).toString(16).padStart(6, '0')}`;
      if (id === 'istirahat')
        return [OFFICE_ROOMS[id].name.toUpperCase(), d.x + 3.2, 1.1, 4.2, 0.6, color];
      return [
        OFFICE_ROOMS[id].name.toUpperCase(),
        d.x,
        d.z + (isBackRow(id) ? -0.75 : 0.75),
        3.8,
        0.6,
        color,
      ];
    },
  );
  labels.push(
    ['KELUAR', left + 2.3, 0, 2.4, 0.5, '#617da8'],
    ['GUDANG', left + 2.3, 5.6, 2.4, 0.5, '#b9925f'],
    ['GERAI', OFFICE_ROOMS.karyawan.x - 2.4, OFFICE_ROOMS.karyawan.z - 1.9, 1.6, 0.42, '#b9775f'],
  );
  root.add(paintLabels(labels));
  return { root, areas };
}
