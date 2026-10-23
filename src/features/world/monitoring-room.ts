import {
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { WARNA, bola, di, kotak, silinder } from './bentuk';
import {
  dispenser,
  karpet,
  kursi,
  lemari,
  meja,
  mejaRapat,
  monitor,
  rakDumbel,
  pintu,
  rakTerbuka,
  sepedaStatis,
  sofa,
  tanaman,
  treadmill,
} from './perabot';
import { palet, paletKarung, pintuGulung, rakBaja, tumpukKardus } from './logistik';
import { BIDANG, type Bidang } from './bidang';
import { cat } from './tulisan';
import { jendelaSuasana } from './suasana';

/**
 * Lantai papan lebar dua nada tanpa celah: corak kayu terbaca tanpa garis tipis yang tampak
 * patah-patah (aliasing) dari kamera isometrik.
 */
export function lantaiPapan(
  g: Group,
  w: number,
  d: number,
  cz: number,
  a: number,
  b: number,
  lebar = 1.5,
) {
  const n = Math.round(w / lebar);
  for (let i = 0; i < n; i++)
    g.add(
      di(kotak(w / n + 0.002, 0.12, d, i % 2 ? a : b, 0), -w / 2 + (i + 0.5) * (w / n), -0.07, cz),
    );
}

/** Satu mesh per bidang tetap bisa dipilih, tanpa ratusan panggilan gambar per perabot. */
export function gabung(grup: Group) {
  grup.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  grup.traverse((obj) => {
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
export function gabungKaca(grup: Group) {
  const mesh = gabung(grup);
  Object.assign(mesh.material, { transparent: true, opacity: 0.3, depthWrite: false });
  mesh.material.roughness = 0.15;
  mesh.castShadow = false;
  mesh.renderOrder = 2;
  mesh.userData.kaca = true;
  return mesh;
}

// Palet kantor mengikuti diorama kamar: dinding biru lembut, lantai kayu hangat.
export const DINDING = 0x9db4df;
export const DINDING_ATAS = 0xc3d3f0;
export const LANTAI_KAYU = 0xdcae7d;
export const ALAS_KAYU = 0xb9875c;

export type Pose = 'duduk' | 'berdiri' | 'ketik';
type Titik = { x: number; z: number };
/**
 * Tempat figur (koordinat dunia). `via` = titik lewat dari dalam pintu ruang ke tempat ini,
 * dipilih di lorong bebas perabot agar figur tidak menembus meja/rak.
 */
export type Slot = Titik & { rot: number; pose: Pose; y?: number; via: Titik[]; manajer?: boolean };

/** Batas kantor: x −25…25, z −9…9; lorong z −1,5…1,5; sayap istirahat x 15…25. */
export const LORONG_Z = 0;
const LORONG = 1.5;
const HX = 5;
const HZ = 3.75;
export const PINTU_GUDANG = { x: -24, z: 0 };
const KACA_TINGGI = 2.35;
const KAYU_MEJA = 0xead2ad;
const PINTU_LEBAR = 2.2;

const belakang = (id: Bidang) => BIDANG[id].z < 0;
/** Sayap istirahat terbuka di ujung kanan lorong (x = 15), tersisih dari ruang kerja. */
const UJUNG_X = 15;
/** Titik pintu ruang di garis sekat lorong. */
export function pintuRuang(id: Bidang): Titik {
  if (id === 'istirahat') return { x: UJUNG_X, z: LORONG_Z };
  return { x: BIDANG[id].x, z: belakang(id) ? -LORONG : LORONG };
}
/** Titik tepat di dalam pintu; semua `via` dimulai dari sini. */
export function dalamRuang(id: Bidang): Titik {
  if (id === 'istirahat') return { x: UJUNG_X + 1.2, z: LORONG_Z };
  return { x: BIDANG[id].x, z: BIDANG[id].z + (belakang(id) ? 3.0 : -3.0) };
}

const S = Math.PI;
const H = Math.PI / 2;
function slot(
  id: Bidang,
  x: number,
  z: number,
  rot: number,
  pose: Pose,
  y: number,
  via: [number, number][] = [],
): Slot {
  const { x: cx, z: cz } = BIDANG[id];
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
export const SLOT: Record<Bidang, Slot[]> = {
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
      manajer: true,
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
export function slotLebih(id: Bidang, n: number): Slot {
  const d = dalamRuang(id);
  const arah = belakang(id) ? -1 : 1;
  return {
    x: d.x + ((n % 5) - 2) * 0.9,
    z: d.z + arah * (0.4 + Math.floor(n / 5) * 0.8),
    rot: arah > 0 ? 0 : S,
    pose: 'berdiri',
    y: LT,
    via: [],
  };
}

/** Posisi label/penanda di atas ruang. */
export function jangkarRuang(id: Bidang) {
  return { x: BIDANG[id].x, y: 3.1, z: BIDANG[id].z };
}

export function sekatKaca(
  rangka: Group,
  kaca: Group,
  panjang: number,
  x: number,
  z: number,
  sumbuZ: boolean,
) {
  const r = new Group(),
    k = new Group();
  r.add(
    di(kotak(panjang, 0.32, 0.3, 0xf6f4f0, 0.14), 0, 0, 0),
    di(kotak(panjang, 0.24, 0.3, 0xf6f4f0, 0.12), 0, KACA_TINGGI, 0),
    di(kotak(0.28, KACA_TINGGI, 0.3, 0xf6f4f0, 0.13), -panjang / 2 + 0.14, 0, 0),
    di(kotak(0.28, KACA_TINGGI, 0.3, 0xf6f4f0, 0.13), panjang / 2 - 0.14, 0, 0),
  );
  k.add(di(kotak(panjang - 0.14, KACA_TINGGI - 0.24, 0.05, 0xd8e7fb, 0.01), 0, 0.24, 0));
  for (const g of [r, k]) {
    if (sumbuZ) g.rotation.y = Math.PI / 2;
    g.position.set(x, 0, z);
  }
  rangka.add(r);
  kaca.add(k);
}

function lampuMeja() {
  const g = new Group();
  g.add(
    di(silinder(0.14, 0.16, 0.05, 0x4a5168), 0, 0, 0),
    di(kotak(0.04, 0.55, 0.04, 0x4a5168, 0.02), 0, 0.04, 0),
  );
  const kap = silinder(0.08, 0.17, 0.22, 0xf2c75c);
  kap.position.set(0.12, 0.5, 0);
  kap.rotation.z = -0.5;
  g.add(kap);
  return g;
}

/** Rak dinding dengan buku dan vas, seperti rak di kamar referensi. */
function rakDinding(lebar = 2.2) {
  const g = new Group();
  g.add(di(kotak(lebar, 0.1, 0.42, WARNA.kayu, 0.03), 0, 0, 0));
  const warna = [0xf3f1ec, 0x4fb3b3, 0x4a5168, 0x6f7fa8];
  warna.forEach((w, i) =>
    g.add(di(kotak(0.24, 0.5 + (i % 2) * 0.1, 0.32, w, 0.03), -lebar / 2 + 0.3 + i * 0.3, 0.1, 0)),
  );
  g.add(di(kotak(0.3, 0.42, 0.3, 0xf2c75c, 0.06), lebar / 2 - 0.35, 0.1, 0));
  return g;
}

function tirai(w: number) {
  const g = new Group();
  for (let i = 0; i < 4; i++)
    g.add(di(kotak(w + 0.2, 0.12, 0.1, i % 2 ? 0xefe6d6 : 0xe4d7c2, 0.03), 0, i * 0.13, 0));
  return g;
}

function tempatSampah() {
  return silinder(0.2, 0.17, 0.42, 0x9aa6c4);
}

/** Meja kerja menghadap +z (kamera); kursi di sisi −z, 1,28 di belakang pusat meja. */
function mejaKerja(g: Group, x: number, z: number, warnaKursi = 0x7f9fe0) {
  const set = new Group();
  const seat = kursi(warnaKursi);
  seat.rotation.y = Math.PI;
  set.add(meja(2.05, 1.1, 0xead2ad), di(monitor(), -0.25, 0.86, -0.19), di(seat, 0, 0, 1.05));
  set.add(di(kotak(0.66, 0.045, 0.25, 0x6d758c, 0.02), -0.25, 0.87, 0.24));
  set.add(di(kotak(0.38, 0.055, 0.43, 0xf7eddb, 0.025), 0.63, 0.87, 0.2));
  set.add(di(lampuMeja(), 0.72, 0.86, -0.28));
  set.scale.setScalar(1.22);
  set.rotation.y = Math.PI;
  g.add(di(set, x, 0.06, z));
}

function putar<T extends Object3D>(o: T, rot: number) {
  o.rotation.y = rot;
  return o;
}

function isiRuang(id: Bidang, g: Group) {
  const { x: cx, z: cz } = BIDANG[id];
  const at = <T extends Object3D>(o: T, x: number, z: number, y = 0.06) => di(o, cx + x, y, cz + z);
  const dindingBelakang = cz - HZ + 0.12;
  if (id === 'kerja') {
    // Ciri: ruang kerja terluas — enam meja, papan kanban berdiri, rak buku, dispenser.
    for (const x of [-4.6, -2.0, 2.0, 4.6]) mejaKerja(g, cx + x, cz - 0.6);
    for (const x of [-3.3, 3.3]) mejaKerja(g, cx + x, cz + 2.6);
    const papan = new Group();
    papan.add(
      di(kanban(), 0, 0.5, 0),
      di(kotak(0.08, 0.6, 0.08, 0x8b93ad, 0.03), -1.3, 0, 0),
      di(kotak(0.08, 0.6, 0.08, 0x8b93ad, 0.03), 1.3, 0, 0),
    );
    g.add(at(putar(papan, -H), 6.1, 0.6), at(putar(rakTerbuka(2.0, 1.9), H), -6.1, 1.2));
    g.add(
      at(dispenser(), 6.1, -3.0),
      at(tanaman(1.2), -6.0, -3.0),
      at(tanaman(1.1), 0, 3.2),
      at(tempatSampah(), -6.1, 3.1),
    );
  } else if (id === 'manajer') {
    // Ciri: meja manajer berkursi gelap, lemari arsip, bingkai piagam, sofa tamu.
    mejaKerja(g, cx, cz - 1.6, 0x4e5a7a);
    g.add(di(kotak(0.6, 0.16, 0.1, 0x4e5a7a, 0.03), cx + 0.4, 1.0, cz - 1.05));
    g.add(at(lemari(1.3, 2.4), -3.6, -3.0), at(lemari(1.3, 2.4), 3.6, -3.0));
    for (const x of [-1.3, 1.3])
      g.add(
        di(kotak(0.9, 0.7, 0.06, 0xead2ad, 0.04), cx + x, 2.0, dindingBelakang + 0.05),
        di(kotak(0.7, 0.5, 0.04, 0xf8f6f2, 0.02), cx + x, 2.1, dindingBelakang + 0.1),
      );
    for (const x of [-0.6, 0.6]) g.add(at(putar(kursi(0x9fb3e3), S), x, -0.1));
    g.add(
      at(putar(sofa(0xa9c3e8), H), -3.7, 1.2),
      at(kotak(0.8, 0.45, 0.8, 0xead2ad, 0.12), -2.4, 1.2),
      at(tanaman(0.6), -2.4, 1.2, 0.5),
    );
    g.add(at(tanaman(1.2), 4.4, 3.2), at(tanaman(1.0), -4.4, 3.2));
  } else if (id === 'rapat') {
    // Ciri: meja rapat panjang, papan tulis beroda, karpet lavender, dispenser.
    const m = mejaRapat();
    m.scale.setScalar(1.4);
    g.add(at(karpet(6.2, 4.4, 0xe4def4), 0, 0.6, 0.08), at(m, 0, 0.6));
    const papan = new Group();
    papan.add(
      di(kotak(2.4, 1.5, 0.1, 0xf8f6f2, 0.06), 0, 0.8, 0),
      di(kotak(0.08, 0.8, 0.08, 0x8b93ad, 0.03), -1.0, 0, 0),
      di(kotak(0.08, 0.8, 0.08, 0x8b93ad, 0.03), 1.0, 0, 0),
    );
    papan.add(
      di(kotak(0.9, 0.36, 0.04, 0xb8cdf2, 0.02), -0.5, 1.6, 0.06),
      di(kotak(0.8, 0.3, 0.04, 0xf2c75c, 0.02), 0.5, 1.2, 0.06),
    );
    g.add(
      at(putar(papan, -H), 4.2, 0.6),
      at(dispenser(), -4.3, -2.9),
      at(tanaman(1.2), -4.4, 3.2),
      at(tanaman(1.0), 4.4, 3.2),
    );
  } else if (id === 'gym') {
    g.add(
      at(putar(treadmill(), S), -3.6, -2.3),
      at(putar(treadmill(), S), -1.6, -2.3),
      at(putar(sepedaStatis(), S), 0.6, -2.3),
    );
    g.add(at(rakDumbel(), 3.4, -3.1), at(tanaman(1.1), 4.4, 3.2), at(tanaman(1.0), -4.4, 3.2));
    g.add(
      at(karpet(1.2, 2.2, WARNA.sage), 2.0, 1.2, 0.08),
      at(karpet(1.2, 2.2, 0xc7b8ea), 3.8, 1.2, 0.08),
    );
    g.add(di(kotak(3.2, 1.9, 0.08, 0xe0ecfb, 0.04), cx - 2.6, 0.6, dindingBelakang + 0.05));
  } else if (id === 'karyawan') {
    // Ciri: loker warna-warni, bangku, gantungan celemek; pintu ke gerai di dinding belakang.
    mejaKerja(g, cx + 2.0, cz - 1.0, 0xe7a98f);
    [0xe7a98f, 0x9fc4e8, 0x9fd6bf, 0xf2c75c].forEach((w, i) => {
      g.add(at(putar(kotak(0.62, 2.0, 0.6, w, 0.08), H), -4.5, -1.5 + i * 0.66));
      g.add(at(kotak(0.04, 0.3, 0.06, 0xffffff, 0.02), -4.18, -1.5 + i * 0.66, 1.2));
    });
    g.add(at(kotak(2.2, 0.42, 0.5, KAYU_MEJA, 0.12), -1.1, 1.4));
    g.add(di(kotak(1.4, 0.06, 0.06, 0xf3eee6, 0.02), cx + 0.2, 1.9, dindingBelakang + 0.1));
    [0xe7a98f, 0x86c3a3, 0xb39fe0].forEach((w, i) =>
      g.add(di(kotak(0.36, 0.7, 0.06, w, 0.03), cx - 0.25 + i * 0.45, 1.2, dindingBelakang + 0.14)),
    );
    g.add(at(tanaman(1.0), 4.4, 3.2));
  } else if (id === 'stok') {
    // Ciri (dibuat ringkas): dua rak baja, satu palet karung, satu palet kardus.
    g.add(at(rakBaja(0.8, 2.6), -2.6, -2.6), at(rakBaja(0.6, 2.6), 2.6, -2.6));
    g.add(at(paletKarung(2), -3.2, 2.0));
    const p = palet();
    p.add(di(tumpukKardus(2), -0.3, 0.22, 0), di(tumpukKardus(1), 0.35, 0.22, 0.1));
    g.add(at(p, 3.2, 2.0));
    mejaKerja(g, cx, cz + 0.7, 0xc99b67);
  } else if (id === 'kas') {
    // Ciri: loket kas dengan brankas, mesin kasir, layar antrean, dan kursi tunggu.
    mejaKerja(g, cx - 2.6, cz - 1.0, 0x98bdae);
    g.add(at(kotak(0.5, 0.22, 0.4, 0x4a5168, 0.06), -1.9, -0.8, 0.93));
    g.add(at(lemari(1.3, 2.2), 3.3, -2.9), at(lemari(1.3, 2.2), 4.6, -2.9));
    g.add(
      at(kotak(0.9, 1.0, 0.8, 0x5b6380, 0.14), 4.45, -0.6),
      at(silinder(0.12, 0.12, 0.06, 0xf2c75c), 4.45, -0.18, 0.62),
    );
    for (const x of [1.4, 2.4, 3.4]) g.add(at(putar(kursi(0x9fd6bf), S), x, 1.6));
    g.add(di(rakDinding(1.8), cx - 0.4, 2.45, dindingBelakang + 0.15));
    g.add(
      at(kotak(0.08, 1.6, 0.08, 0x8b93ad, 0.03), -2.6, 2.9),
      at(kotak(0.9, 0.5, 0.1, 0x2f3448, 0.06), -2.6, 2.9, 1.6),
    );
    g.add(at(kotak(0.7, 0.3, 0.04, 0x86c3a3, 0.02, 0.6), -2.6, 2.95, 1.7));
    g.add(at(tanaman(1.1), -4.4, 3.2), at(tanaman(0.9), 4.4, 3.2));
  } else if (id === 'istirahat') {
    // Meja kopi di dinding belakang, sofa menghadap kamera, meja bundar di depan.
    g.add(
      at(kotak(6.4, 0.95, 1.0, 0xead2ad, 0.12), 0, -8.2),
      at(kotak(6.6, 0.1, 1.1, 0xf6f2ea, 0.05), 0, -8.2, 1.01),
    );
    g.add(
      at(kotak(0.7, 0.75, 0.55, 0x4a5168, 0.12), -2.2, -8.2, 1.1),
      at(kotak(0.4, 0.1, 0.3, 0x9fd3ff, 0.03, 0.5), -2.2, -7.92, 1.5),
    );
    const gelas = [0xffffff, 0xf2c75c, 0x9fd6bf, 0xb8cdf2];
    [-0.8, -0.3, 0.6, 1.1].forEach((x, i) =>
      g.add(at(silinder(0.11, 0.09, 0.2, gelas[i]), x, -8.1, 1.11)),
    );
    g.add(
      at(kotak(0.9, 1.9, 0.8, 0xf3f5fa, 0.16), 2.7, -8.2),
      at(kotak(0.06, 0.6, 0.04, 0xa4abbd, 0.02), 2.4, -7.78, 1.0),
    );
    g.add(at(dispenser(), 3.9, -8.3));
    // Ciri ruang santai: TV dinding di atas meja kopi.
    g.add(
      at(kotak(2.8, 1.5, 0.12, 0x2f3448, 0.08), 0.4, -8.82, 1.95),
      at(kotak(2.56, 1.28, 0.04, 0x9fd3ff, 0.03, 0.35), 0.4, -8.74, 2.06),
    );
    for (const x of [-2.5, 2.5])
      g.add(
        at(sofa(0xe7a98f), x, -3.5),
        at(kotak(0.7, 0.55, 0.7, 0xead2ad, 0.14), x + Math.sign(x) * 1.65, -3.5),
      );
    g.add(at(karpet(8.4, 3.6, 0xf6e8d6), 0, -3.0, 0.08));
    for (const x of [-2.5, 2.5]) {
      g.add(
        at(silinder(0.55, 0.55, 0.08, 0xf6f2ea, 24), x, 3.0, 0.78),
        at(silinder(0.08, 0.1, 0.78, 0x8b93ad), x, 3.0),
      );
      g.add(
        at(silinder(0.32, 0.32, 0.5, 0xe7a98f, 16), x - 0.85, 3.0),
        at(silinder(0.32, 0.32, 0.5, 0xe7a98f, 16), x + 0.85, 3.0),
      );
      g.add(at(silinder(0.12, 0.1, 0.16, 0xffffff), x + 0.1, 3.0, 0.86));
    }
    g.add(
      at(tanaman(1.4), -4.4, -7.9),
      at(tanaman(1.2), 4.4, 7.9),
      at(tanaman(1.2), -4.4, 7.9),
      at(tanaman(1.0), 4.5, -5.6),
    );
    g.add(at(putar(rakTerbuka(2.0, 1.6), -H), 4.6, 4.6));
  }
}

/** Papan kanban: kartu warna = kolom rencana/proses/selesai. */
function kanban() {
  const papan = new Group();
  papan.add(di(kotak(3.2, 1.6, 0.08, 0xf8f6f2, 0.05), 0, 0, 0));
  [0xb8cdf2, 0xf2c75c, 0x9fd6bf].forEach((w, kol) => {
    for (let i = 0; i < 3 - (kol === 2 ? 1 : 0); i++)
      papan.add(di(kotak(0.7, 0.32, 0.04, w, 0.02), -1.0 + kol * 1.0, 1.1 - i * 0.42, 0.05));
  });
  return papan;
}

/** Pintu ke kawasan gerai di dinding belakang ruang karyawan, berbingkai dan berpapan warna. */
function pintuGerai(cx: number, cz: number) {
  const g = new Group();
  const x = cx - 2.4,
    z = cz - HZ + 0.12;
  const daun = pintu();
  daun.scale.set(1.3, 1.1, 1);
  g.add(di(daun, x, 0.06, z), di(kotak(1.8, 0.14, 0.2, 0xf6f4f0, 0.05), x, 2.6, z + 0.02));
  g.add(
    di(kotak(0.14, 2.6, 0.2, 0xf6f4f0, 0.05), x - 0.85, 0.06, z + 0.02),
    di(kotak(0.14, 2.6, 0.2, 0xf6f4f0, 0.05), x + 0.85, 0.06, z + 0.02),
  );
  g.add(
    di(kotak(1.6, 0.4, 0.1, 0xe7a98f, 0.06), x, 2.85, z + 0.06),
    di(kotak(1.4, 0.04, 0.8, 0xe7a98f, 0.02), x, 0.06, z + 0.6),
  );
  return g;
}

/**
 * Kantor enam ruang bersekat kaca di sekitar lorong. Mesh: cangkang, kaca, enam ruang
 * (sasaran klik) dan pintu gudang bertumpuk kardus.
 */
export function ruangMonitoring() {
  const root = new Group();
  const shell = new Group(),
    kaca = new Group();
  // Bangunan x −25…25: ruang kerja x −25…15, sayap istirahat 15…25; z −9…9.
  const kiri = -5 * HX,
    kanan = UJUNG_X + 2 * HX,
    W = kanan - kiri,
    cx = (kiri + kanan) / 2,
    D = 2 * (2 * HZ + LORONG);
  shell.add(
    di(kotak(W + 1, 0.55, D + 1, ALAS_KAYU, 0.3), cx, -0.6, 0),
    di(
      kotak(UJUNG_X - kiri - 0.6, 0.03, 2 * LORONG - 0.4, 0xeadcc4, 0.015),
      (kiri + UJUNG_X) / 2 + 0.3,
      0.04,
      LORONG_Z,
    ),
    di(kotak(W + 0.8, 3.6, 0.42, DINDING, 0.2), cx, 0, -D / 2 - 0.2),
    di(kotak(0.42, 3.6, D + 0.8, DINDING, 0.2), kiri - 0.2, 0, 0),
    di(kotak(W + 0.9, 0.18, 0.5, DINDING_ATAS, 0.08), cx, 3.56, -D / 2 - 0.2),
    di(kotak(0.5, 0.18, D + 0.9, DINDING_ATAS, 0.08), kiri - 0.2, 3.56, 0),
  );
  const lantai = new Group();
  lantaiPapan(lantai, W + 0.8, D + 0.8, 0, LANTAI_KAYU, 0xd5a675);
  lantai.position.x = cx;
  shell.add(lantai);
  // Jendela bertirai di dinding belakang dan kiri.
  for (const x of [-10, 0, 13, 23]) {
    root.add(di(jendelaSuasana(3.6, 1.6), x, 1.3, -D / 2 + 0.02));
    shell.add(di(tirai(3.6), x, 2.85, -D / 2 + 0.06));
  }
  const jKiri = jendelaSuasana(2.8, 1.5);
  jKiri.rotation.y = H;
  const kiriTirai = tirai(2.8);
  kiriTirai.rotation.y = H;
  root.add(di(jKiri, kiri + 0.02, 1.4, -7.55));
  shell.add(di(kiriTirai, kiri + 0.06, 2.62, -7.55));
  for (const x of [-15, -5, 5]) shell.add(di(bola(0.2, 0xffe2a0, 0.6), x, 2.9, -D / 2 + 0.12));
  // Sekat kaca antar-ruang (baris atas tiap 10, baris bawah tiap ±13,3), batas sayap istirahat,
  // dan sisi lorong dengan bukaan pintu di tengah tiap ruang.
  for (const x of [-15, -5, 5, UJUNG_X]) sekatKaca(shell, kaca, 2 * HZ, x, -5.25, true);
  for (const x of [-25 + 40 / 3, -25 + 80 / 3, UJUNG_X])
    sekatKaca(shell, kaca, 2 * HZ, x, 5.25, true);
  for (const id of Object.keys(BIDANG) as Bidang[]) {
    if (id === 'istirahat') continue;
    const { x, z } = pintuRuang(id);
    const seg = BIDANG[id].hx - PINTU_LEBAR / 2;
    for (const s of [-1, 1])
      sekatKaca(shell, kaca, seg, x + s * (PINTU_LEBAR / 2 + seg / 2), z, false);
  }
  root.add(gabung(shell), gabungKaca(kaca));
  const areas = new Map<string, Mesh<BufferGeometry, MeshStandardMaterial>>();
  for (const id of Object.keys(BIDANG) as Bidang[]) {
    const g = new Group();
    const zone = BIDANG[id];
    const dalam = id === 'istirahat' ? D - 0.5 : 2 * HZ - 0.5;
    g.add(di(kotak(2 * zone.hx - 0.5, 0.05, dalam, zone.warna, 0.04), zone.x, 0.01, zone.z));
    // Papan penanda pintu sewarna ruang di atas bukaan; nama ruang ditulis label kanvas.
    const p = pintuRuang(id);
    const papan = kotak(1.6, 0.36, 0.12, gelapkan(zone.warna), 0.08);
    if (id === 'istirahat') papan.rotation.y = H;
    g.add(di(papan, p.x, KACA_TINGGI + 0.12, p.z));
    isiRuang(id, g);
    const mesh = gabung(g);
    mesh.userData.bidang = id;
    root.add(mesh);
    areas.set(id, mesh);
  }
  // Pintu lorong menuju pulau; akses gudang berada di dalam ruang Stok.
  const door = new Group();
  const gulung = pintu();
  gulung.scale.set(1.6, 1.1, 2);
  gulung.rotation.y = H;
  door.add(di(gulung, kiri + 0.05, 0, 0));
  door.add(di(kotak(0.12, 0.42, 1.4, 0x7f9fe0, 0.06), kiri + 0.08, 2.95, 0));
  door.add(di(tanaman(1.2), kiri + 0.75, 0.06, -1.3), di(tanaman(1.2), kiri + 0.75, 0.06, 1.3));
  const doorMesh = gabung(door);
  doorMesh.userData.bidang = 'pintu-pulau';
  root.add(doorMesh);
  areas.set('pintu-pulau', doorMesh);
  const stockDoor = new Group();
  const stockX = kiri + 0.05,
    stockZ = 5.6;
  const shutter = pintuGulung(2.4, 2.8, 0xd2ddf0);
  shutter.rotation.y = H;
  stockDoor.add(di(shutter, stockX, 0.06, stockZ));
  stockDoor.add(
    di(tumpukKardus(2), stockX + 0.8, 0.06, stockZ - 1.8),
    di(tumpukKardus(1), stockX + 0.8, 0.06, stockZ + 1.8),
  );
  const stockMesh = gabung(stockDoor);
  stockMesh.userData.bidang = 'pintu-gudang';
  root.add(stockMesh);
  areas.set('pintu-gudang', stockMesh);
  const keGerai = gabung(pintuGerai(BIDANG.karyawan.x, BIDANG.karyawan.z));
  keGerai.userData.bidang = 'pintu-gerai';
  root.add(keGerai);
  areas.set('pintu-gerai', keGerai);
  // Nama ruang dicat tipis di lantai dekat pintunya (pengganti papan nama melayang).
  const tulisan: Parameters<typeof cat>[0] = (Object.keys(BIDANG) as Bidang[]).map((id) => {
    const d = dalamRuang(id);
    const warna = `#${gelapkan(BIDANG[id].warna, 0.62).toString(16).padStart(6, '0')}`;
    if (id === 'istirahat') return [BIDANG[id].nama.toUpperCase(), d.x + 3.2, 1.1, 4.2, 0.6, warna];
    return [
      BIDANG[id].nama.toUpperCase(),
      d.x,
      d.z + (belakang(id) ? -0.75 : 0.75),
      3.8,
      0.6,
      warna,
    ];
  });
  tulisan.push(
    ['KELUAR', kiri + 2.3, 0, 2.4, 0.5, '#617da8'],
    ['GUDANG', kiri + 2.3, 5.6, 2.4, 0.5, '#b9925f'],
    ['GERAI', BIDANG.karyawan.x - 2.4, BIDANG.karyawan.z - 1.9, 1.6, 0.42, '#b9775f'],
  );
  root.add(cat(tulisan));
  return { root, areas };
}

/** Warna papan penanda/tulisan: warna ruang dipekatkan agar terbaca di atas kaca dan karpet. */
function gelapkan(hex: string, t = 0.82) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
