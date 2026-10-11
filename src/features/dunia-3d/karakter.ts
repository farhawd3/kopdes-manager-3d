// Karakter chibi bergaya mainan 3D lembut: kepala besar, rambut tebal, mata bulat, pipi merona,
// sweter, celana jins, sepatu. Rupa diambil dari kolom staf (pakaian, rambut, kulit, kacamata,
// seksi); tidak ditebak dari nama. Bagian statis tiap sendi digabung menjadi satu mesh agar
// satu figur hanya ±6 panggilan gambar, sementara sendi tetap bisa dianimasikan.
import {
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
  type ColorRepresentation,
  Color,
  SphereGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { bahan, bola, di, kapsul, kotak, silinder } from './bentuk';
import { bayanganBulat, bergerak } from './optimasi';
import type { Orang } from './orang';

export type GayaRambut = 'jabrik' | 'pendek' | 'panjang' | 'ikal' | 'hijab' | 'topi' | 'peci';
/** Pakaian kerja menurut seksi staf: rompi gudang, celemek gerai/layanan, kartu nama administrasi. */
export type Seragam = 'rompi' | 'celemek' | 'kartu' | 'jas' | 'polos';
export type RupaKarakter = {
  baju: number;
  rambut: GayaRambut;
  kulit: number;
  kacamata: boolean;
  seragam: Seragam;
};

const BAJU: Record<string, number> = {
  biru: 0x7f9fe0,
  hijau: 0x86c3a3,
  oranye: 0xeea06d,
  lavender: 0xb39fe0,
  abu: 0xa4abbd,
  merah: 0xd9737a,
};
const KULIT: Record<string, number> = {
  terang: 0xf6d5b6,
  'sawo matang': 0xdcaa80,
  gelap: 0xa8714c,
};
const RAMBUT = 0x2f3448;
const JINS = 0x5b78c4;
const SEPATU = 0x8a5a44;

/** Rupa dari kolom staf; kolom kosong memakai bawaan netral (rambut jabrik, kulit sedang). */
export function rupaDariStaf(data: Record<string, unknown>, manajer = false): RupaKarakter {
  const head = String(data.look_head || '');
  const hair = String(data.look_hair || '');
  const lama = String(data.hair || '');
  const rambut: GayaRambut =
    head === 'hijab' || lama === 'berkerudung'
      ? 'hijab'
      : head === 'peci'
        ? 'peci'
        : head === 'topi KDMP' || lama === 'topi'
          ? 'topi'
          : hair === 'panjang' || lama === 'panjang'
            ? 'panjang'
            : hair === 'ikal'
              ? 'ikal'
              : hair === 'pendek' || lama === 'pendek'
                ? 'pendek'
                : 'jabrik';
  const seksi = String(data.section || '');
  const seragam: Seragam = manajer || data.position === 'pengurus'
    ? 'jas'
    : seksi === 'gudang & logistik' || data.workplace === 'gudang'
      ? 'rompi'
      : seksi === 'usaha & gerai' || seksi === 'layanan anggota'
        ? 'celemek'
        : seksi === 'administrasi & keuangan'
          ? 'kartu'
          : 'polos';
  return {
    baju: BAJU[String(data.outfit || '')] ?? (manajer ? BAJU.merah : BAJU.biru),
    rambut,
    kulit: KULIT[String(data.look_skin || '')] ?? 0xf0c9a5,
    kacamata: data.look_glasses === 'ya',
    seragam,
  };
}

const bahanKarakter = new MeshStandardMaterial({ vertexColors: true, roughness: 0.62 });
const warna = new Color();
/** Gabungkan isi `g` (koordinat lokal) menjadi satu mesh ber-warna-verteks. */
function satukan(g: Group) {
  g.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  g.traverse((o) => {
    if (!(o instanceof Mesh) || !(o.material instanceof MeshStandardMaterial)) return;
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    geo.applyMatrix4(o.matrixWorld);
    geo.deleteAttribute('uv');
    warna.copy(o.material.color);
    const c = new Float32Array(geo.getAttribute('position').count * 3);
    for (let i = 0; i < c.length; i += 3) c.set([warna.r, warna.g, warna.b], i);
    geo.setAttribute('color', new Float32BufferAttribute(c, 3));
    parts.push(geo);
  });
  const mesh = new Mesh(mergeGeometries(parts, false)!, bahanKarakter);
  parts.forEach((p) => p.dispose());
  mesh.castShadow = true;
  mesh.userData.milikFigur = true;
  return mesh;
}

function bulat(r: number, c: ColorRepresentation, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) {
  const m = bola(r, c);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  return m;
}

/** Setengah bola atas untuk kubah topi (bola penuh menutupi mata). */
const kubahTopi = new SphereGeometry(0.42, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);

function rambut(g: Group, gaya: GayaRambut, kulit: number) {
  if (gaya === 'hijab') {
    const kerudung = bulat(0.45, 0xe9dccb, 0, 0.02, -0.07, 1, 1.02, 1);
    g.add(kerudung, di(kotak(0.82, 0.4, 0.62, 0xe9dccb, 0.2), 0, -0.52, -0.05));
    // Bingkai wajah agar kerudung terbaca menutup rambut, bukan helm.
    g.add(bulat(0.36, kulit, 0, -0.03, 0.08, 1, 1, 0.9));
    return;
  }
  if (gaya === 'topi') {
    // Rambut pendek di samping/belakang, kubah topi hanya di atas dahi agar wajah tetap terbuka.
    g.add(bulat(0.42, RAMBUT, 0, -0.02, -0.1, 1.03, 0.82, 0.92));
    const kubah = new Mesh(kubahTopi, bahan(0x7f9fe0));
    kubah.position.set(0, 0.13, -0.02);
    kubah.scale.set(1.05, 0.78, 1.05);
    g.add(kubah, di(kotak(0.86, 0.06, 0.88, 0x6a8bd0, 0.03), 0, 0.12, -0.02));
    const lidah = kotak(0.5, 0.05, 0.3, 0x6a8bd0, 0.025);
    lidah.position.set(0, 0.13, 0.48);
    lidah.rotation.x = 0.12;
    g.add(lidah, bulat(0.05, 0xf3eee6, 0, 0.47, -0.02));
    return;
  }
  // Tutup kepala dasar rambut.
  g.add(bulat(0.43, RAMBUT, 0, 0.08, -0.05, 1.02, 0.86, 1.02));
  if (gaya === 'jabrik') {
    // Jambul runcing membulat seperti karakter referensi.
    const arah: [number, number, number][] = [
      [0, 0.42, 0.1], [0.2, 0.38, 0.12], [-0.2, 0.38, 0.12], [0.33, 0.25, 0.05],
      [-0.33, 0.25, 0.05], [0.12, 0.42, -0.18], [-0.14, 0.4, -0.2], [0, 0.3, -0.36],
    ];
    for (const [x, y, z] of arah) {
      const k = kapsul(0.085, 0.16, RAMBUT);
      k.position.set(x * 0.95, y - 0.04, z);
      k.rotation.set(-z * 1.6 + 0.2, 0, -x * 2.2);
      g.add(k);
    }
    g.add(bulat(0.12, RAMBUT, 0.16, 0.24, 0.3, 1.2, 0.7, 0.8), bulat(0.12, RAMBUT, -0.14, 0.26, 0.3, 1.2, 0.7, 0.8));
  } else if (gaya === 'pendek') {
    g.add(bulat(0.2, RAMBUT, 0.08, 0.25, 0.25, 1.6, 0.55, 0.8));
  } else if (gaya === 'panjang') {
    g.add(bulat(0.2, RAMBUT, -0.06, 0.25, 0.25, 1.6, 0.55, 0.8));
    g.add(di(kotak(0.82, 0.62, 0.42, RAMBUT, 0.2), 0, -0.55, -0.16));
  } else if (gaya === 'ikal') {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      g.add(bulat(0.13, RAMBUT, Math.cos(a) * 0.3, 0.3 + Math.sin(a * 2) * 0.04, Math.sin(a) * 0.3 - 0.03));
    }
  } else if (gaya === 'peci') {
    g.add(di(silinder(0.33, 0.35, 0.22, 0x2b2d3a, 24), 0, 0.3, -0.02));
  }
}

/** Figur chibi berdiri; `Orang` yang sama dengan figur lama agar animasi jalan/ketik tetap dipakai. */
export function buatKarakter(r: RupaKarakter): Orang {
  const akar = bergerak(new Group());
  akar.add(bayanganBulat(0.42));
  // Kaki: celana jins dan sepatu, menggantung dari sendi pinggul setinggi 0,5.
  const kaki: Group[] = [];
  for (const s of [-1, 1]) {
    const isi = new Group();
    const k = kapsul(0.12, 0.2, JINS);
    k.rotation.z = Math.PI;
    isi.add(k, di(kotak(0.24, 0.14, 0.32, SEPATU, 0.07), 0, -0.52, 0.05));
    const sendi = new Group();
    sendi.position.set(s * 0.13, 0.5, 0);
    sendi.add(satukan(isi));
    akar.add(sendi);
    kaki.push(sendi);
  }
  const badan = new Group();
  badan.position.y = 0.5;
  const tubuh = new Group();
  // Sweter membulat dan pinggul jins.
  tubuh.add(di(kotak(0.52, 0.2, 0.38, JINS, 0.1), 0, -0.04, 0));
  tubuh.add(di(kotak(0.6, 0.52, 0.42, r.baju, 0.2), 0, 0.08, 0));
  tubuh.add(di(kotak(0.36, 0.06, 0.06, r.baju, 0.03), 0, 0.57, 0.12));
  if (r.seragam === 'rompi') {
    tubuh.add(di(kotak(0.64, 0.42, 0.44, 0xf2a35e, 0.18), 0, 0.14, 0));
    tubuh.add(di(kotak(0.66, 0.06, 0.46, 0xf6e27a, 0.03), 0, 0.3, 0));
  } else if (r.seragam === 'celemek') {
    tubuh.add(di(kotak(0.4, 0.5, 0.04, 0xf3eee6, 0.03), 0, -0.05, 0.21));
    tubuh.add(di(kotak(0.18, 0.1, 0.03, 0xe2d6c2, 0.02), 0, 0.12, 0.23));
  } else if (r.seragam === 'kartu') {
    tubuh.add(di(kotak(0.14, 0.18, 0.03, 0xffffff, 0.02), 0.12, 0.22, 0.22), di(kotak(0.1, 0.03, 0.03, 0x7f9fe0, 0.01), 0.12, 0.36, 0.23));
  } else if (r.seragam === 'jas') {
    for (const s of [-1, 1]) tubuh.add(di(kotak(0.2, 0.46, 0.04, 0x4e5a7a, 0.04), s * 0.17, 0.12, 0.2));
    tubuh.add(di(kotak(0.08, 0.3, 0.03, 0xd9737a, 0.02), 0, 0.26, 0.22));
  }
  // Kepala besar ala chibi.
  const kepala = new Group();
  kepala.position.y = 1.0;
  kepala.add(bulat(0.42, r.kulit, 0, 0, 0, 1.04, 0.96, 1));
  for (const s of [-1, 1]) {
    kepala.add(bulat(0.08, r.kulit, s * 0.42, -0.02, 0, 0.6, 1, 1));
    kepala.add(bulat(0.062, 0x1f2333, s * 0.15, -0.02, 0.37, 0.9, 1.15, 0.5));
    kepala.add(bulat(0.02, 0xffffff, s * 0.15 + 0.02, 0.02, 0.405));
    kepala.add(di(kotak(0.14, 0.035, 0.04, RAMBUT, 0.015), s * 0.15, 0.12, 0.37));
    kepala.add(bulat(0.075, 0xf2a3a3, s * 0.26, -0.13, 0.31, 1, 0.6, 0.45));
  }
  kepala.add(bulat(0.03, 0xe8b28e, 0, -0.08, 0.41));
  kepala.add(bulat(0.04, 0xb4566a, 0, -0.18, 0.385, 1.3, 0.45, 0.5));
  if (r.kacamata) {
    for (const s of [-1, 1]) {
      kepala.add(di(kotak(0.18, 0.025, 0.02, 0x3c3f4a, 0.01), s * 0.15, 0.06, 0.41));
      kepala.add(di(kotak(0.18, 0.025, 0.02, 0x3c3f4a, 0.01), s * 0.15, -0.1, 0.4));
      kepala.add(di(kotak(0.025, 0.16, 0.02, 0x3c3f4a, 0.01), s * 0.24, -0.1, 0.4));
    }
    kepala.add(di(kotak(0.08, 0.02, 0.02, 0x3c3f4a, 0.01), 0, 0.02, 0.41));
  }
  rambut(kepala, r.rambut, r.kulit);
  tubuh.add(kepala);
  badan.add(satukan(tubuh));
  const lengan = (s: 1 | -1) => {
    const isi = new Group();
    const l = kapsul(0.095, 0.2, r.baju);
    l.rotation.z = Math.PI;
    isi.add(l, bulat(0.1, r.kulit, 0, -0.44, 0.02));
    const g = new Group();
    g.position.set(s * 0.37, 0.5, 0);
    g.rotation.z = s * 0.12;
    g.add(satukan(isi));
    return g;
  };
  const lenganKiri = lengan(-1);
  const lenganKanan = lengan(1);
  badan.add(lenganKiri, lenganKanan);
  akar.add(badan);
  return { akar, badan, lenganKiri, lenganKanan, kaki };
}

/** Bebaskan geometri gabungan milik figur (material dan bayangan dipakai bersama). */
export function buangKarakter(o: Orang) {
  o.akar.traverse((c) => {
    if (c instanceof Mesh && c.userData.milikFigur) c.geometry.dispose();
  });
}
