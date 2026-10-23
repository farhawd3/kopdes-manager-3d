// Bentuk dasar gaya diorama lembut: semua sudut membulat, material doff pastel, geometri dan
// material dipakai bersama (cache) agar adegan berisi banyak benda tetap ringan.
import {
  BoxGeometry,
  Group,
  CapsuleGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
  type Object3D,
  type ColorRepresentation,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/** Palet pastel bersama; ubah di sini, bukan per benda. */
export const COLOR = {
  wall: 0x8e9de6,
  wallTop: 0xb3c4f5,
  wallInner: 0x9aa8ec,
  floor: 0xc98e5f,
  base: 0xa8664f,
  wood: 0xe6c393,
  woodDark: 0xc79a68,
  white: 0xf3eee6,
  cream: 0xe9dcc6,
  sage: 0x86c3ab,
  lavender: 0x9d90d8,
  glassBlue: 0x4f7fd6,
  leaf: 0x5fb36a,
  pot: 0xe2876f,
  gray: 0x9aa0ad,
  dark: 0x3c3f4a,
  skin: 0xf0c7a0,
  hair: 0x4a3a33,
  red: 0xe46b62,
  yellow: 0xf2c75c,
} as const;

const materialCache = new Map<string, MeshStandardMaterial>();
/** Material doff sedikit mengilap; `emissive` > 0 untuk lampu dan layar yang berpendar. */
export function material(color: ColorRepresentation, emissive = 0, roughness = 0.75) {
  const key = `${String(color)}|${emissive}|${roughness}`;
  let m = materialCache.get(key);
  if (!m) {
    m = new MeshStandardMaterial({ color, roughness, metalness: 0 });
    if (emissive) {
      m.emissive.set(color);
      m.emissiveIntensity = emissive;
    }
    materialCache.set(key, m);
  }
  return m;
}

const geometryCache = new Map<string, BufferGeometry>();
function cached(key: string, create: () => BufferGeometry) {
  let g = geometryCache.get(key);
  if (!g) {
    g = create();
    geometryCache.set(key, g);
  }
  return g;
}

function toMesh(g: BufferGeometry, color: ColorRepresentation, emissive = 0) {
  const m = new Mesh(g, material(color, emissive));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Kotak membulat; (x, y, z) = pusat alas, bukan pusat kotak, agar penempatan mudah dibaca. */
export function box(
  w: number,
  h: number,
  d: number,
  color: ColorRepresentation,
  r = 0.08,
  emissive = 0,
) {
  const radius = Math.min(r, w / 2, h / 2, d / 2);
  const g = cached(`k${w}|${h}|${d}|${radius}`, () => {
    const geo =
      radius > 0.001 ? new RoundedBoxGeometry(w, h, d, 2, radius) : new BoxGeometry(w, h, d);
    geo.translate(0, h / 2, 0);
    return geo;
  });
  return toMesh(g, color, emissive);
}

export function cylinder(
  rTop: number,
  rBottom: number,
  h: number,
  color: ColorRepresentation,
  segments = 16,
) {
  const g = cached(`s${rTop}|${rBottom}|${h}|${segments}`, () => {
    const geo = new CylinderGeometry(rTop, rBottom, h, segments);
    geo.translate(0, h / 2, 0);
    return geo;
  });
  return toMesh(g, color);
}

export function sphere(r: number, color: ColorRepresentation, emissive = 0) {
  return toMesh(
    cached(`b${r}`, () => new SphereGeometry(r, 16, 10)),
    color,
    emissive,
  );
}

/** Kapsul berdiri; alas di y = 0. */
export function capsule(r: number, length: number, color: ColorRepresentation) {
  const g = cached(`c${r}|${length}`, () => {
    const geo = new CapsuleGeometry(r, length, 4, 12);
    geo.translate(0, length / 2 + r, 0);
    return geo;
  });
  return toMesh(g, color);
}

/** Pasang posisi lalu kembalikan objek yang sama (penempatan satu baris). */
export function place<
  T extends { position: { set: (x: number, y: number, z: number) => unknown } },
>(o: T, x: number, y: number, z: number) {
  o.position.set(x, y, z);
  return o;
}

/** Group berisi benda-benda yang diberikan. */
export function group(...children: Parameters<Group['add']>) {
  const g = new Group();
  g.add(...children);
  return g;
}

/** Putar objek pada sumbu y lalu kembalikan objek yang sama. */
export function rotated<T extends Object3D>(o: T, rot: number) {
  o.rotation.y = rot;
  return o;
}

/** Warna papan penanda/tulisan: warna ruang (#rrggbb) dipekatkan agar terbaca di atas kaca dan karpet. */
export function darken(hex: string, t = 0.82) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
