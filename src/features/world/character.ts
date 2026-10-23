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
import { material, sphere, place, capsule, box, cylinder } from './shapes';
import { blobShadow, markMoving } from './moving';
import type { PersonRig } from './person';

export type HairStyle = 'jabrik' | 'pendek' | 'panjang' | 'ikal' | 'hijab' | 'topi' | 'peci';
/** Pakaian kerja menurut seksi staf: rompi gudang, celemek gerai/layanan, kartu nama administrasi. */
export type Uniform = 'rompi' | 'celemek' | 'kartu' | 'jas' | 'polos';
export type CharacterLook = {
  shirt: number;
  hairStyle: HairStyle;
  skin: number;
  glasses: boolean;
  uniform: Uniform;
};

const SHIRT: Record<string, number> = {
  biru: 0x7f9fe0,
  hijau: 0x86c3a3,
  oranye: 0xeea06d,
  lavender: 0xb39fe0,
  abu: 0xa4abbd,
  merah: 0xd9737a,
};
const SKIN: Record<string, number> = {
  terang: 0xf6d5b6,
  'sawo matang': 0xdcaa80,
  gelap: 0xa8714c,
};
const HAIR = 0x2f3448;
const JEANS = 0x5b78c4;
const SHOES = 0x8a5a44;

/** Rupa dari kolom staf; kolom kosong memakai bawaan netral (rambut jabrik, kulit sedang). */
export function lookFromStaff(data: Record<string, unknown>, isManager = false): CharacterLook {
  const head = String(data.look_head || '');
  const hair = String(data.look_hair || '');
  const legacy = String(data.hair || '');
  const hairStyle: HairStyle =
    head === 'hijab' || legacy === 'berkerudung'
      ? 'hijab'
      : head === 'peci'
        ? 'peci'
        : head === 'topi KDMP' || legacy === 'topi'
          ? 'topi'
          : hair === 'panjang' || legacy === 'panjang'
            ? 'panjang'
            : hair === 'ikal'
              ? 'ikal'
              : hair === 'pendek' || legacy === 'pendek'
                ? 'pendek'
                : 'jabrik';
  const section = String(data.section || '');
  const uniform: Uniform =
    isManager || data.position === 'pengurus'
      ? 'jas'
      : section === 'gudang & logistik' || data.workplace === 'gudang'
        ? 'rompi'
        : section === 'usaha & gerai' || section === 'layanan anggota'
          ? 'celemek'
          : section === 'administrasi & keuangan'
            ? 'kartu'
            : 'polos';
  return {
    shirt: SHIRT[String(data.outfit || '')] ?? (isManager ? SHIRT.merah : SHIRT.biru),
    hairStyle,
    skin: SKIN[String(data.look_skin || '')] ?? 0xf0c9a5,
    glasses: data.look_glasses === 'ya',
    uniform,
  };
}

const characterMaterial = new MeshStandardMaterial({ vertexColors: true, roughness: 0.62 });
const tint = new Color();
/** Gabungkan isi `g` (koordinat lokal) menjadi satu mesh ber-warna-verteks. */
function mergeParts(g: Group) {
  g.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  g.traverse((o) => {
    if (!(o instanceof Mesh) || !(o.material instanceof MeshStandardMaterial)) return;
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    geo.applyMatrix4(o.matrixWorld);
    geo.deleteAttribute('uv');
    tint.copy(o.material.color);
    const c = new Float32Array(geo.getAttribute('position').count * 3);
    for (let i = 0; i < c.length; i += 3) c.set([tint.r, tint.g, tint.b], i);
    geo.setAttribute('color', new Float32BufferAttribute(c, 3));
    parts.push(geo);
  });
  const mesh = new Mesh(mergeGeometries(parts, false)!, characterMaterial);
  parts.forEach((p) => p.dispose());
  mesh.castShadow = true;
  mesh.userData.figurePart = true;
  return mesh;
}

function ball(
  r: number,
  c: ColorRepresentation,
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = 1,
  sz = 1,
) {
  const m = sphere(r, c);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  return m;
}

/** Setengah bola atas untuk kubah topi (bola penuh menutupi mata). */
const capDome = new SphereGeometry(0.42, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);

function addHair(g: Group, style: HairStyle, skin: number) {
  if (style === 'hijab') {
    const veil = ball(0.45, 0xe9dccb, 0, 0.02, -0.07, 1, 1.02, 1);
    g.add(veil, place(box(0.82, 0.4, 0.62, 0xe9dccb, 0.2), 0, -0.52, -0.05));
    // Bingkai wajah agar kerudung terbaca menutup rambut, bukan helm.
    g.add(ball(0.36, skin, 0, -0.03, 0.08, 1, 1, 0.9));
    return;
  }
  if (style === 'topi') {
    // Rambut pendek di samping/belakang, kubah topi hanya di atas dahi agar wajah tetap terbuka.
    g.add(ball(0.42, HAIR, 0, -0.02, -0.1, 1.03, 0.82, 0.92));
    const dome = new Mesh(capDome, material(0x7f9fe0));
    dome.position.set(0, 0.13, -0.02);
    dome.scale.set(1.05, 0.78, 1.05);
    g.add(dome, place(box(0.86, 0.06, 0.88, 0x6a8bd0, 0.03), 0, 0.12, -0.02));
    const brim = box(0.5, 0.05, 0.3, 0x6a8bd0, 0.025);
    brim.position.set(0, 0.13, 0.48);
    brim.rotation.x = 0.12;
    g.add(brim, ball(0.05, 0xf3eee6, 0, 0.47, -0.02));
    return;
  }
  // Tutup kepala dasar rambut.
  g.add(ball(0.43, HAIR, 0, 0.08, -0.05, 1.02, 0.86, 1.02));
  if (style === 'jabrik') {
    // Jambul runcing membulat seperti karakter referensi.
    const tufts: [number, number, number][] = [
      [0, 0.42, 0.1],
      [0.2, 0.38, 0.12],
      [-0.2, 0.38, 0.12],
      [0.33, 0.25, 0.05],
      [-0.33, 0.25, 0.05],
      [0.12, 0.42, -0.18],
      [-0.14, 0.4, -0.2],
      [0, 0.3, -0.36],
    ];
    for (const [x, y, z] of tufts) {
      const k = capsule(0.085, 0.16, HAIR);
      k.position.set(x * 0.95, y - 0.04, z);
      k.rotation.set(-z * 1.6 + 0.2, 0, -x * 2.2);
      g.add(k);
    }
    g.add(
      ball(0.12, HAIR, 0.16, 0.24, 0.3, 1.2, 0.7, 0.8),
      ball(0.12, HAIR, -0.14, 0.26, 0.3, 1.2, 0.7, 0.8),
    );
  } else if (style === 'pendek') {
    g.add(ball(0.2, HAIR, 0.08, 0.25, 0.25, 1.6, 0.55, 0.8));
  } else if (style === 'panjang') {
    g.add(ball(0.2, HAIR, -0.06, 0.25, 0.25, 1.6, 0.55, 0.8));
    g.add(place(box(0.82, 0.62, 0.42, HAIR, 0.2), 0, -0.55, -0.16));
  } else if (style === 'ikal') {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      g.add(
        ball(0.13, HAIR, Math.cos(a) * 0.3, 0.3 + Math.sin(a * 2) * 0.04, Math.sin(a) * 0.3 - 0.03),
      );
    }
  } else if (style === 'peci') {
    g.add(place(cylinder(0.33, 0.35, 0.22, 0x2b2d3a, 24), 0, 0.3, -0.02));
  }
}

/** Figur chibi berdiri; `PersonRig` yang sama dengan figur lama agar animasi jalan/ketik tetap dipakai. */
export function createCharacter(r: CharacterLook): PersonRig {
  const root = markMoving(new Group());
  root.add(blobShadow(0.42));
  // Kaki: celana jins dan sepatu, menggantung dari sendi pinggul setinggi 0,5.
  const legs: Group[] = [];
  for (const s of [-1, 1]) {
    const inner = new Group();
    const k = capsule(0.12, 0.2, JEANS);
    k.rotation.z = Math.PI;
    inner.add(k, place(box(0.24, 0.14, 0.32, SHOES, 0.07), 0, -0.52, 0.05));
    const joint = new Group();
    joint.position.set(s * 0.13, 0.5, 0);
    joint.add(mergeParts(inner));
    root.add(joint);
    legs.push(joint);
  }
  const body = new Group();
  body.position.y = 0.5;
  const torso = new Group();
  // Sweter membulat dan pinggul jins.
  torso.add(place(box(0.52, 0.2, 0.38, JEANS, 0.1), 0, -0.04, 0));
  torso.add(place(box(0.6, 0.52, 0.42, r.shirt, 0.2), 0, 0.08, 0));
  torso.add(place(box(0.36, 0.06, 0.06, r.shirt, 0.03), 0, 0.57, 0.12));
  if (r.uniform === 'rompi') {
    torso.add(place(box(0.64, 0.42, 0.44, 0xf2a35e, 0.18), 0, 0.14, 0));
    torso.add(place(box(0.66, 0.06, 0.46, 0xf6e27a, 0.03), 0, 0.3, 0));
  } else if (r.uniform === 'celemek') {
    torso.add(place(box(0.4, 0.5, 0.04, 0xf3eee6, 0.03), 0, -0.05, 0.21));
    torso.add(place(box(0.18, 0.1, 0.03, 0xe2d6c2, 0.02), 0, 0.12, 0.23));
  } else if (r.uniform === 'kartu') {
    torso.add(
      place(box(0.14, 0.18, 0.03, 0xffffff, 0.02), 0.12, 0.22, 0.22),
      place(box(0.1, 0.03, 0.03, 0x7f9fe0, 0.01), 0.12, 0.36, 0.23),
    );
  } else if (r.uniform === 'jas') {
    for (const s of [-1, 1])
      torso.add(place(box(0.2, 0.46, 0.04, 0x4e5a7a, 0.04), s * 0.17, 0.12, 0.2));
    torso.add(place(box(0.08, 0.3, 0.03, 0xd9737a, 0.02), 0, 0.26, 0.22));
  }
  // Kepala besar ala chibi.
  const head = new Group();
  head.position.y = 1.0;
  head.add(ball(0.42, r.skin, 0, 0, 0, 1.04, 0.96, 1));
  for (const s of [-1, 1]) {
    head.add(ball(0.08, r.skin, s * 0.42, -0.02, 0, 0.6, 1, 1));
    head.add(ball(0.062, 0x1f2333, s * 0.15, -0.02, 0.37, 0.9, 1.15, 0.5));
    head.add(ball(0.02, 0xffffff, s * 0.15 + 0.02, 0.02, 0.405));
    head.add(place(box(0.14, 0.035, 0.04, HAIR, 0.015), s * 0.15, 0.12, 0.37));
    head.add(ball(0.075, 0xf2a3a3, s * 0.26, -0.13, 0.31, 1, 0.6, 0.45));
  }
  head.add(ball(0.03, 0xe8b28e, 0, -0.08, 0.41));
  head.add(ball(0.04, 0xb4566a, 0, -0.18, 0.385, 1.3, 0.45, 0.5));
  if (r.glasses) {
    for (const s of [-1, 1]) {
      head.add(place(box(0.18, 0.025, 0.02, 0x3c3f4a, 0.01), s * 0.15, 0.06, 0.41));
      head.add(place(box(0.18, 0.025, 0.02, 0x3c3f4a, 0.01), s * 0.15, -0.1, 0.4));
      head.add(place(box(0.025, 0.16, 0.02, 0x3c3f4a, 0.01), s * 0.24, -0.1, 0.4));
    }
    head.add(place(box(0.08, 0.02, 0.02, 0x3c3f4a, 0.01), 0, 0.02, 0.41));
  }
  addHair(head, r.hairStyle, r.skin);
  torso.add(head);
  body.add(mergeParts(torso));
  const arm = (s: 1 | -1) => {
    const inner = new Group();
    const l = capsule(0.095, 0.2, r.shirt);
    l.rotation.z = Math.PI;
    inner.add(l, ball(0.1, r.skin, 0, -0.44, 0.02));
    const g = new Group();
    g.position.set(s * 0.37, 0.5, 0);
    g.rotation.z = s * 0.12;
    g.add(mergeParts(inner));
    return g;
  };
  const leftArm = arm(-1);
  const rightArm = arm(1);
  body.add(leftArm, rightArm);
  root.add(body);
  return { root, body, leftArm, rightArm, legs };
}

/** Bebaskan geometri gabungan milik figur (material dan bayangan dipakai bersama). */
export function disposeCharacter(o: PersonRig) {
  o.root.traverse((c) => {
    if (c instanceof Mesh && c.userData.figurePart) c.geometry.dispose();
  });
}
