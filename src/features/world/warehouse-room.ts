import { Group, type BufferGeometry, type Mesh, type MeshStandardMaterial } from 'three';
import { bola, di, kotak, silinder } from './bentuk';
import { ALAS_KAYU, DINDING, DINDING_ATAS, gabung, lantaiPapan } from './monitoring-room';
import { tanaman } from './perabot';
import { jendelaSuasana } from './suasana';
import { cat } from './tulisan';
import { apar, forklift, palet, pintuGulung, rakBaja, truk, tumpukKardus } from './logistik';
import { coldRackIds, isBelowMinimum, rackIds, type WorldModel } from './model/world-model';

type Area = Mesh<BufferGeometry, MeshStandardMaterial>;
export type LogistikInput = { model: WorldModel; stock: boolean; deliveries: boolean };

/** Dok D1–D4 berurutan dari kiri; truk mundur ke dok, truk antre parkir di jalur depan. */
export const DOK_X = [-12, -4, 4, 12];
const KREM = 0xf3eee6;
const LANTAI_GUDANG = 0xe4c197;

function penandaStok() {
  // Penanda bulat kuning di atas rak = ada barang di bawah minimum (dari data, bukan dekorasi).
  const g = new Group();
  g.add(di(bola(0.3, 0xf2b25c), 0, 0.44, 0), di(silinder(0.02, 0.17, 0.38, 0xf2b25c), 0, 0.04, 0));
  return g;
}

/** Pintu gulung dengan kardus di kedua sisinya; `samping` = pintu di dinding kiri (menghadap +x). */
function pintuDenganKardus(warna: number, x: number, z: number, samping: boolean) {
  const g = new Group();
  const d = pintuGulung(2.4, 2.8, warna);
  if (samping) d.rotation.y = Math.PI / 2;
  g.add(di(d, x, 0, z));
  const [a, b] = samping
    ? [
        [x + 0.8, z - 1.9],
        [x + 0.8, z + 1.9],
      ]
    : [
        [x - 1.9, z + 0.8],
        [x + 1.9, z + 0.8],
      ];
  g.add(di(tumpukKardus(2), a[0], 0.05, a[1]), di(tumpukKardus(1), b[0], 0.05, b[1]));
  return g;
}

function tambah(root: Group, areas: Map<string, Area>, id: string, g: Group) {
  const mesh = gabung(g) as Area;
  mesh.userData.bidang = id;
  root.add(mesh);
  areas.set(id, mesh);
}

function paletKardus(n = 2) {
  const pl = palet();
  pl.add(di(tumpukKardus(n), -0.3, 0.22, 0), di(tumpukKardus(Math.max(1, n - 1)), 0.35, 0.22, 0.1));
  return pl;
}

/** Cangkang ruang: alas kayu, lantai, dinding belakang dan kiri biru lembut bertepi terang. */
function cangkang(
  g: Group,
  w: number,
  d: number,
  lantai: number,
  dinding: number,
  atas: number,
  tinggi: number,
  dalam = d,
) {
  const zKiri = -d / 2 + dalam / 2;
  g.add(
    di(kotak(w + 1, 0.55, d + 1, ALAS_KAYU, 0.3), 0, -0.6, 0),
    di(kotak(w + 0.8, 0.22, d + 0.8, lantai, 0.1), 0, -0.17, 0),
    di(kotak(w + 0.8, tinggi, 0.42, dinding, 0.2), 0, 0, -d / 2 - 0.2),
    di(kotak(0.42, tinggi, dalam + 0.4, dinding, 0.2), -w / 2 - 0.2, 0, zKiri - 0.2),
    di(kotak(w + 0.9, 0.18, 0.5, atas, 0.08), 0, tinggi - 0.04, -d / 2 - 0.2),
    di(kotak(0.5, 0.18, dalam + 0.5, atas, 0.08), -w / 2 - 0.2, tinggi - 0.04, zKiri - 0.2),
  );
}

/**
 * Gudang (dengan halaman dok) atau cold storage. Isi rak mengikuti jumlah jenis barang per rak,
 * penanda kuning mengikuti stok di bawah minimum, truk mengikuti pengiriman masuk tercatat.
 * Data belum aktif = rak kosong tanpa penanda dan tanpa truk.
 */
export function ruangLogistik({ model, stock, deliveries }: LogistikInput, cold: boolean) {
  const root = new Group();
  const shell = new Group();
  const areas = new Map<string, Area>();
  if (cold) {
    cangkang(shell, 26, 18, 0xeef3f7, 0xa9cbe6, 0xd2e6f5, 3.8);
    lantaiPapan(shell, 26.6, 18.6, 0, 0xeef3f7, 0xe6edf3, 2);
    // Panel pendingin dinding dan peti beku.
    for (const x of [-7, 0, 7]) shell.add(di(kotak(2.4, 0.7, 0.32, 0xffffff, 0.1), x, 2.7, -8.7));
    for (const x of [-9, -5.5])
      shell.add(
        di(kotak(2.4, 0.95, 1.2, 0xf7fbfd, 0.16), x, 0, 5.2),
        di(kotak(2.4, 0.1, 1.2, 0x9ccbe6, 0.05), x, 0.95, 5.2),
      );
    shell.add(di(apar(), -12.6, 0, 6.5), di(tanaman(1.3), 12, 0, 7.6));
    root.add(gabung(shell));
    coldRackIds.forEach((id, i) => {
      const items = model.inventory.coldRacks[id];
      const g = new Group();
      const x = -7 + i * 7;
      g.add(di(rakBaja(stock ? Math.min(1, items.length / 6) : 0, 4), x, 0, -5.6));
      if (stock && items.some(isBelowMinimum)) g.add(di(penandaStok(), x, 3.2, -5.6));
      tambah(root, areas, `rak-${id}`, g);
    });
    tambah(root, areas, 'pintu-gudang', pintuDenganKardus(0x9fb6e0, -12.95, 1, true));
    const p = new Group();
    p.add(di(paletKardus(2), 6, 0, 4.5), di(paletKardus(1), 8.2, 0, 4.5));
    root.add(gabung(p));
    // Kode rak dicat halus di lantai depan rak.
    root.add(
      cat(
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
  cangkang(shell, 38, 28, 0xdcdfea, DINDING, DINDING_ATAS, 4.4, 14);
  const lantai = new Group();
  lantaiPapan(lantai, 38.6, 14.2, -7, LANTAI_GUDANG, 0xdcb78b, 1.6);
  lantai.position.y = 0.015;
  shell.add(lantai);
  // Dinding depan rendah dan rangka dok: isi gudang tetap terlihat dari kamera.
  shell.add(di(kotak(38.6, 0.9, 0.34, KREM, 0.14), 0, 0, 0));
  for (const x of DOK_X) {
    shell.add(
      di(kotak(0.3, 3.4, 0.4, KREM, 0.1), x - 1.7, 0, 0),
      di(kotak(0.3, 3.4, 0.4, KREM, 0.1), x + 1.7, 0, 0),
    );
    shell.add(di(kotak(3.7, 0.5, 0.46, DINDING_ATAS, 0.14), x, 3.2, 0));
  }
  for (const x of [-12, -4, 4]) root.add(di(jendelaSuasana(3.4, 1.4), x, 2.6, -13.98));
  // Halaman: garis jalur, pagar, dan pepohonan tepi.
  for (let x = -16; x <= 16; x += 3)
    shell.add(di(kotak(1.4, 0.04, 0.3, 0xf7f7fa, 0.02), x, 0.03, 9.6));
  for (let x = -19; x <= 19; x += 2) shell.add(di(kotak(0.28, 0.9, 0.28, KREM, 0.13), x, 0, 14.2));
  shell.add(
    di(kotak(38.2, 0.24, 0.28, KREM, 0.12), 0, 0.7, 14.2),
    di(kotak(38.2, 0.24, 0.28, 0xb7d9c4, 0.12), 0, 0.36, 14.2),
  );
  for (const x of [-17.5, -8, 8, 17.5]) shell.add(di(tanaman(2.1), x, 0, 12.8));
  shell.add(di(apar(), -18.4, 0, -1.2));
  root.add(gabung(shell));
  rackIds.forEach((id, i) => {
    const items = model.inventory.racks[id];
    const x = -12 + (i % 3) * 8,
      z = i < 3 ? -10.6 : -5.6;
    const g = new Group();
    g.add(di(rakBaja(stock ? Math.min(1, items.length / 6) : 0, 4), x, 0, z));
    if (stock && items.some(isBelowMinimum)) g.add(di(penandaStok(), x, 3.2, z));
    tambah(root, areas, `rak-${id}`, g);
  });
  DOK_X.forEach((x, i) => {
    const g = new Group();
    g.add(di(kotak(3.2, 0.04, 6.8, 0xe6e9f2, 0.02), x, 0.04, 4.0));
    for (const s of [-1, 1])
      g.add(di(kotak(0.22, 0.06, 6.8, 0xf2c75c, 0.03), x + s * 1.6, 0.04, 4.0));
    g.add(di(kotak(3.4, 0.06, 0.22, 0xf2c75c, 0.03), x, 0.04, 7.4));
    tambah(root, areas, `dok-D${i + 1}`, g);
  });
  tambah(root, areas, 'pintu-kantor', pintuDenganKardus(0xf1ebe1, -18.95, -7, true));
  tambah(root, areas, 'pintu-pendingin', pintuDenganKardus(0xd2e6f5, 14, -13.95, false));
  // Peralatan bongkar: forklift dan palet berkardus (tidak mewakili jumlah stok).
  const alat = new Group();
  const f = forklift();
  f.rotation.y = 0.5;
  alat.add(di(f, 13, 0, -7.5));
  for (const [x, z] of [
    [-8, 1.6],
    [0, 1.6],
    [8, 1.6],
    [16.5, -10.5],
    [10, -3],
  ])
    alat.add(di(paletKardus(2), x, 0, z));
  root.add(gabung(alat));
  // Kode rak, dok, dan arah pintu dicat halus di lantai (tanpa papan nama).
  root.add(
    cat(
      [
        ...rackIds.map((id, i): [string, number, number, number, number, string] => [
          id,
          -12 + (i % 3) * 8,
          (i < 3 ? -10.6 : -5.6) + 1.35,
          1.4,
          1.1,
          '#9a7146',
        ]),
        ...DOK_X.map((x, i): [string, number, number, number, number, string] => [
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
      const car = truk(0x7f9fe0, 0xf6f5f2);
      if (spot.place === 'dok') {
        car.rotation.y = -Math.PI / 2;
        g.add(di(car, DOK_X[spot.index], 0, 4.1));
      } else {
        car.rotation.y = Math.PI;
        g.add(di(car, 10 - spot.index * 7, 0, 11.3));
      }
      tambah(root, areas, `kirim-${spot.delivery.id}`, g);
    }
  return { root, areas };
}
