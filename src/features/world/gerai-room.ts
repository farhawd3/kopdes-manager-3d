// Kawasan gerai 3D: unit KDMP sebagai ruang bersekat kaca di kiri-kanan lorong, bergaya sama
// dengan kantor (dinding biru lembut, lantai kayu). Unit belum buka digambar transparan dengan
// gembok; kantor koperasi, logistik, dan cold storage memiliki pintu ke lokasi masing-masing.
import { Group, Mesh, MeshStandardMaterial, TorusGeometry, type BufferGeometry, type Object3D } from 'three';
import { bola, di, kotak, silinder } from './bentuk';
import { kursi, lemari, pintu, rakTerbuka, sofa, tanaman } from './perabot';
import { forklift, palet, paletKarung, pintuGulung, tumpukKardus } from './logistik';
import {
  ALAS_KAYU,
  DINDING,
  DINDING_ATAS,
  LANTAI_KAYU,
  gabung,
  gabungKaca,
  lantaiPapan,
  sekatKaca,
  type Slot,
} from './monitoring-room';
import { GERAI, type GeraiId, type GeraiInfo } from './gerai';
import { cat } from './tulisan';
import { jendelaSuasana } from './suasana';

type Area = Mesh<BufferGeometry, MeshStandardMaterial>;
const RX = 4;
const RZ = 3.5;
const LORONG = 1.5;
const W = 40;
const D = 2 * (2 * RZ + LORONG);
const H = Math.PI / 2;
const KAYU = 0xead2ad;

function meja(w: number) {
  const g = new Group();
  g.add(di(kotak(w, 0.95, 0.8, KAYU, 0.12), 0, 0, 0), di(kotak(w + 0.1, 0.08, 0.9, 0xf6f2ea, 0.04), 0, 0.95, 0));
  return g;
}
function kasir() {
  const g = new Group();
  g.add(di(kotak(0.5, 0.25, 0.4, 0x4a5168, 0.06), 0, 0, 0), di(kotak(0.4, 0.3, 0.05, 0x9fd3ff, 0.02, 0.4), 0, 0.25, -0.12));
  return g;
}
function salib(warna: number) {
  const g = new Group();
  g.add(di(kotak(0.5, 0.16, 0.06, warna, 0.03), 0, 0.17, 0), di(kotak(0.16, 0.5, 0.06, warna, 0.03), 0, 0, 0));
  return g;
}
function putar<T extends Object3D>(o: T, rot: number) {
  o.rotation.y = rot;
  return o;
}

/** Gembok melayang: tanda unit belum dibuka di web. */
function gembok() {
  const g = new Group();
  g.add(di(kotak(1.0, 0.82, 0.46, 0xf2c75c, 0.18), 0, 0, 0));
  g.add(di(kotak(0.14, 0.26, 0.06, 0x8a6a2a, 0.04), 0, 0.22, 0.22), di(bola(0.09, 0x8a6a2a), 0, 0.5, 0.23));
  const busur = new Mesh(new TorusGeometry(0.3, 0.09, 12, 24, Math.PI), new MeshStandardMaterial({ color: 0xb8c0d4 }));
  busur.position.y = 0.8;
  g.add(busur);
  return g;
}

function isi(id: GeraiId, g: Group, at: <T extends Object3D>(o: T, x: number, z: number, y?: number) => T) {
  const counter = (w = 3.2) => g.add(at(meja(w), 0, -0.8), at(kasir(), -0.6, -0.8, 1.0));
  if (id === 'kantor') {
    counter();
    g.add(at(kotak(1.8, 1.2, 0.1, 0x7f9fe0, 0.06), -1.2, -3.35, 1.0), at(putar(sofa(0xa9c3e8), H), -3.2, 1.6));
    g.add(at(tanaman(1.2), 3.3, 2.8), at(tanaman(1.0), -3.3, -2.9));
  } else if (id === 'simpan-pinjam') {
    counter(3.4);
    g.add(at(kotak(3.4, 0.7, 0.06, 0xd8e7fb, 0.02), 0, -1.15, 1.03));
    g.add(at(kotak(0.9, 1.1, 0.8, 0x5b6380, 0.14), 3.0, -2.9), at(silinder(0.14, 0.14, 0.06, 0xf2c75c), 3.0, -2.45, 0.62));
    for (const x of [-0.7, 0.7]) g.add(at(putar(kursi(0x9fc4c9), Math.PI), x, 0.9));
    g.add(at(tanaman(1.1), -3.3, 2.8));
  } else if (id === 'klinik') {
    g.add(at(kotak(1.1, 0.5, 2.1, 0xf6f6f8, 0.14), -2.6, 1.0), at(kotak(0.9, 0.16, 0.5, 0xffffff, 0.08), -2.6, 0.18, 0.5));
    g.add(at(kotak(1.12, 0.1, 1.2, 0x9fc4e8, 0.05), -2.6, 1.4, 0.5));
    g.add(at(kotak(0.08, 1.8, 2.4, 0xcfe8de, 0.04), -1.6, 1.0));
    g.add(at(lemari(1.2, 1.8, 0xf6f6f8), 2.6, -2.9), at(salib(0xe46b62), 2.6, -2.55, 1.2));
    g.add(at(meja(2.0), 0.6, -0.8), at(tanaman(1.0), 3.3, 2.8));
  } else if (id === 'apotek') {
    counter(3.0);
    g.add(at(rakTerbuka(2.2, 2.0, 1, 0xf6f6f8), -2.2, -3.0), at(rakTerbuka(2.2, 2.0, 0.8, 0xf6f6f8), 2.2, -3.0));
    g.add(at(salib(0x5fb36a), 0, -3.3, 2.1), at(tanaman(1.0), 3.3, 2.8));
  } else if (id === 'cold-storage') {
    for (const x of [-2.4, -0.4]) g.add(at(kotak(1.7, 0.9, 1.0, 0xf7fbfd, 0.16), x, 1.2), at(kotak(1.7, 0.1, 1.0, 0x9ccbe6, 0.05), x, 1.2, 0.96));
    for (const x of [1.7, 2.8]) g.add(at(kotak(0.95, 2.0, 0.8, 0xf3f7fa, 0.14), x, -2.9), at(kotak(0.75, 1.6, 0.04, 0xcfe6f4, 0.02), x, -2.48, 0.25));
    g.add(at(meja(1.6), -2.2, -0.8));
  } else if (id === 'logistik') {
    g.add(at(meja(2.2), 0, -0.8));
    const f = forklift();
    f.rotation.y = -0.6;
    for (const [x, z] of [[1.6, 1.8], [1.6, 0.2], [3.0, 1.0]]) {
      const p = palet();
      p.add(di(tumpukKardus(2), -0.3, 0.22, 0), di(tumpukKardus(1), 0.35, 0.22, 0.1));
      g.add(at(p, x, z));
    }
    g.add(at(f, -1.4, 2.0));
  } else if (id === 'sembako') {
    counter(2.6);
    g.add(at(paletKarung(2), -2.6, 1.6), at(paletKarung(1), -2.6, 0.2));
    g.add(at(rakTerbuka(2.0, 2.0), 2.5, -3.0), at(kotak(0.9, 1.9, 0.8, 0xf3f7fa, 0.14), 3.3, 1.6));
    g.add(at(tumpukKardus(3), 1.8, 2.6));
  } else {
    // Gerai potensi desa: lapak berkanopi dengan keranjang hasil desa.
    g.add(at(kotak(3.0, 0.85, 1.1, KAYU, 0.12), 0, -0.8));
    const warna = [0xe46b62, 0xf2c75c, 0x86c3a3, 0xb39fe0];
    [-1.0, 0, 1.0].forEach((x, i) => {
      g.add(at(silinder(0.36, 0.3, 0.22, 0xc99b67), x, -0.8, 0.85));
      for (let k = 0; k < 3; k++) g.add(at(bola(0.12, warna[(i + k) % 4]), x + (k - 1) * 0.16, -0.8 + (k % 2) * 0.1, 1.08));
    });
    for (const x of [-1.6, 1.6]) g.add(at(kotak(0.1, 2.3, 0.1, 0xf3eee6, 0.03), x, -1.4));
    [0xe7a98f, 0xf6f2ea, 0xe7a98f, 0xf6f2ea, 0xe7a98f, 0xf6f2ea].forEach((w, i) =>
      g.add(at(kotak(0.56, 0.12, 1.5, w, 0.04), -1.4 + i * 0.56, -1.0, 2.3)),
    );
    g.add(at(kotak(0.9, 0.5, 0.7, KAYU, 0.08), 2.6, 1.4), at(kotak(0.9, 0.5, 0.7, KAYU, 0.08), 2.6, 2.3), at(tanaman(1.0), -3.3, 2.8));
  }
}

/** Tempat staf gerai: di belakang meja layanan, menghadap kamera. */
function slotGerai(id: GeraiId): Slot[] {
  const { x, z } = GERAI[id];
  return [-0.8, 0.8, -2.2].map((dx) => ({ x: x + dx, z: z - 1.95, rot: 0, pose: 'berdiri' as const, y: 0.06, via: [] }));
}

export function ruangGerai(info: GeraiInfo[]) {
  const root = new Group();
  const shell = new Group(),
    kaca = new Group();
  shell.add(
    di(kotak(W + 1, 0.55, D + 1, ALAS_KAYU, 0.3), 0, -0.6, 0),
    di(kotak(W - 0.4, 0.03, 2 * LORONG - 0.4, 0xeadcc4, 0.015), 0, 0.04, 0),
    di(kotak(W + 0.8, 3.6, 0.42, DINDING, 0.2), 0, 0, -D / 2 - 0.2),
    di(kotak(0.42, 3.6, D + 0.8, DINDING, 0.2), -W / 2 - 0.2, 0, 0),
    di(kotak(W + 0.9, 0.18, 0.5, DINDING_ATAS, 0.08), 0, 3.56, -D / 2 - 0.2),
    di(kotak(0.5, 0.18, D + 0.9, DINDING_ATAS, 0.08), -W / 2 - 0.2, 3.56, 0),
  );
  lantaiPapan(shell, W + 0.8, D + 0.8, 0, LANTAI_KAYU, 0xd5a675);
  for (const x of [-8, 0, 8, 16]) root.add(di(jendelaSuasana(2.6, 1.4), x, 1.55, -D / 2 + 0.02));
  // Ujung kanan lorong terbuka sebagai pintu masuk kawasan.
  shell.add(di(tanaman(1.4), W / 2 - 0.6, 0, -1.1), di(tanaman(1.4), W / 2 - 0.6, 0, 1.1));
  for (const x of [-12, -4, 4, 12]) for (const z of [-5, 5]) sekatKaca(shell, kaca, 2 * RZ, x, z, true);
  for (const id of Object.keys(GERAI) as GeraiId[]) {
    const { x, z } = GERAI[id];
    const gz = z < 0 ? -LORONG : LORONG;
    for (const s of [-1, 1]) sekatKaca(shell, kaca, 3, x + s * 2.5, gz, false);
  }
  root.add(gabung(shell), gabungKaca(kaca));
  const areas = new Map<string, Area>();
  const slots = {} as Record<GeraiId, Slot[]>;
  const tulisan: Parameters<typeof cat>[0] = [];
  for (const g of info) {
    const { x, z, warna, kode } = GERAI[g.id];
    const at = <T extends Object3D>(o: T, lx: number, lz: number, y = 0.06) => di(o, x + lx, y, z + lz);
    const grup = new Group();
    grup.add(di(kotak(2 * RX - 0.5, 0.05, 2 * RZ - 0.5, warna, 0.04), x, 0.01, z));
    // Papan warna di atas bukaan pintu ruang.
    grup.add(di(kotak(1.6, 0.36, 0.12, gelap(warna), 0.08), x, 2.47, z < 0 ? -LORONG : LORONG));
    isi(g.id, grup, at);
    const mesh = gabung(grup) as Area;
    mesh.userData.bidang = `g:${g.id}`;
    if (!g.buka) {
      // Belum dibuka di web: ruang transparan, tetap dapat dipilih untuk melihat statusnya.
      Object.assign(mesh.material, { transparent: true, opacity: 0.32, depthWrite: false });
      mesh.castShadow = false;
      const kunci = gabung(at(gembok(), 0, 0.6, 1.4));
      kunci.userData.bidang = `g:${g.id}`;
      root.add(kunci);
    }
    root.add(mesh);
    areas.set(`g:${g.id}`, mesh);
    slots[g.id] = slotGerai(g.id);
    tulisan.push([kode, x, z + 2.4, 3.2, 0.55, `#${gelap(warna, 0.6).toString(16).padStart(6, '0')}`]);
  }
  // Pintu ke kantor, gudang, dan cold storage.
  const pintuKe = (key: string, o: Group) => {
    const m = gabung(o);
    m.userData.bidang = key;
    root.add(m);
    areas.set(key, m);
  };
  const k = GERAI.kantor;
  const pk = new Group();
  pk.add(di(pintu(), k.x + 2.6, 0.06, -D / 2 + 0.1), di(kotak(1.4, 0.04, 0.8, 0x9fb3e3, 0.02), k.x + 2.6, 0.06, -D / 2 + 0.7));
  pintuKe('pintu-kantor', pk);
  const lg = GERAI.logistik;
  const pg = new Group();
  const gulung = pintuGulung(2.2, 2.6, 0xf1ebe1);
  gulung.rotation.y = H;
  pg.add(di(gulung, -W / 2 + 0.05, 0, lg.z + 0.5), di(tumpukKardus(2), -W / 2 + 0.8, 0.06, lg.z - 1.3));
  pintuKe('pintu-gudang', pg);
  const cs = GERAI['cold-storage'];
  const pc = new Group();
  pc.add(di(pintuGulung(2.0, 2.6, 0xd2e6f5), cs.x - 2.4, 0, -D / 2 + 0.05));
  pintuKe('pintu-pendingin', pc);
  tulisan.push(['KANTOR', k.x + 2.6, -D / 2 + 1.5, 2.2, 0.45, '#8c7aa8'], ['GUDANG', -W / 2 + 1.5, lg.z + 0.5, 2.2, 0.45, '#b48d61', H], ['DINGIN', cs.x - 2.4, -D / 2 + 1.4, 2.0, 0.45, '#5f8fb3']);
  root.add(cat(tulisan));
  return { root, areas, slots };
}

function gelap(hex: string, t = 0.82) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
