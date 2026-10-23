// Model logistik bergaya lembut: rak baja, palet, karung, kardus, forklift, truk, pintu gulung.
// Alas di y = 0, menghadap +z; ukuran mengikuti satuan perabot (1 ≈ 50 cm).
import { Group, type ColorRepresentation } from 'three';
import { COLOR, sphere, place, box, cylinder } from './shapes';

// Warna rak mengikuti palet hangat diorama (bukan baja industri): tiang lavender, balok kayu.
const BEAM = COLOR.wood;
const POST = COLOR.lavender;
const CARTON = 0xd9aa72;
const SACK = 0xefe3cb;

function group(...children: Parameters<Group['add']>) {
  const g = new Group();
  g.add(...children);
  return g;
}

/** Tumpukan kardus n buah di atas satu sama lain, sedikit bergeser agar terasa ditumpuk tangan. */
export function cartonStack(n = 3, color: ColorRepresentation = CARTON) {
  const g = new Group();
  for (let i = 0; i < n; i++) {
    const k = box(0.62, 0.42, 0.52, color, 0.05);
    k.position.set(((i * 37) % 7) * 0.012 - 0.03, i * 0.42, ((i * 53) % 5) * 0.012);
    k.rotation.y = ((i * 29) % 9) * 0.02 - 0.08;
    g.add(
      k,
      place(box(0.64, 0.05, 0.12, 0xc58d55, 0.02), k.position.x, i * 0.42 + 0.42, k.position.z),
    );
  }
  return g;
}

export function pallet() {
  const g = group(place(box(1.3, 0.08, 1.1, 0xc99b67, 0.02), 0, 0.14, 0));
  for (const x of [-0.5, 0, 0.5]) g.add(place(box(0.22, 0.14, 1.1, 0xb98757, 0.02), x, 0, 0));
  return g;
}

export function sackPallet(layers = 2) {
  const g = pallet();
  for (let l = 0; l < layers; l++)
    for (const [x, z] of [
      [-0.3, -0.25],
      [0.3, -0.25],
      [-0.3, 0.25],
      [0.3, 0.25],
    ]) {
      const k = box(0.58, 0.26, 0.48, SACK, 0.12);
      k.position.set(x, 0.22 + l * 0.26, z);
      k.rotation.y = l % 2 ? 0.08 : -0.05;
      g.add(k);
    }
  return g;
}

/**
 * Rak baja dua sisi tiang oranye-biru seperti gudang distribusi. `fill` 0–1 = bagian rak yang terisi
 * kardus; dipakai rak data A–F (kosong, sebagian, penuh).
 */
export function steelRack(fill = 1, w = 2.6) {
  const height = 3;
  const g = new Group();
  // Tiang dan papan dibuat tebal-membulat agar tidak tampak sebagai garis patah dari jauh.
  for (const x of [-w / 2, w / 2])
    for (const z of [-0.45, 0.45]) g.add(place(box(0.3, height, 0.3, POST, 0.14), x, 0, z));
  const levels = [0.12, 1.1, 2.08];
  for (const y of [...levels, 2.9]) {
    g.add(
      place(box(w + 0.3, 0.26, 0.24, BEAM, 0.11), 0, y, 0.45),
      place(box(w + 0.3, 0.26, 0.24, BEAM, 0.11), 0, y, -0.45),
    );
    g.add(place(box(w, 0.18, 0.92, COLOR.cream, 0.08), 0, y + 0.06, 0));
  }
  const capacity = levels.length * 3;
  const filled = Math.round(capacity * fill);
  for (let i = 0; i < filled; i++) {
    const t = Math.floor(i / 3),
      col = i % 3;
    const k = cartonStack(1 + ((i * 7) % 2), i % 4 === 3 ? 0xc9b48a : CARTON);
    k.position.set(-w / 2 + 0.45 + col * ((w - 0.9) / 2), levels[t] + 0.1, 0);
    k.scale.setScalar(0.9);
    g.add(k);
  }
  return g;
}

/** Forklift kecil membulat; `fork` = grup garpu yang naik-turun saat mengangkat. */
export function forklift() {
  const g = new Group();
  g.add(
    place(box(1.0, 0.5, 1.4, COLOR.yellow, 0.15), 0, 0.28, 0),
    place(box(0.9, 0.5, 0.5, COLOR.yellow, 0.15), 0, 0.78, -0.35),
    place(box(0.08, 1.2, 0.08, COLOR.dark, 0.03), -0.4, 0.78, 0.1),
    place(box(0.08, 1.2, 0.08, COLOR.dark, 0.03), 0.4, 0.78, 0.1),
    place(box(0.9, 0.08, 0.9, COLOR.dark, 0.03), 0, 1.98, -0.25),
    place(box(0.12, 1.6, 0.12, COLOR.gray, 0.03), -0.3, 0.2, 0.75),
    place(box(0.12, 1.6, 0.12, COLOR.gray, 0.03), 0.3, 0.2, 0.75),
  );
  for (const [x, z] of [
    [-0.52, 0.45],
    [0.52, 0.45],
    [-0.52, -0.45],
    [0.52, -0.45],
  ]) {
    const r = cylinder(0.24, 0.24, 0.2, COLOR.dark);
    r.rotation.z = Math.PI / 2;
    r.position.set(x + (x > 0 ? 0.1 : -0.1), 0.24, z);
    g.add(r);
  }
  const fork = group(
    place(box(0.12, 0.06, 0.9, COLOR.gray, 0.02), -0.25, 0, 0.5),
    place(box(0.12, 0.06, 0.9, COLOR.gray, 0.02), 0.25, 0, 0.5),
  );
  fork.position.set(0, 0.3, 0.6);
  g.add(fork);
  g.userData.fork = fork;
  return g;
}

export function scale() {
  return group(
    place(box(0.9, 0.12, 0.7, COLOR.gray, 0.04), 0, 0, 0),
    place(box(0.08, 1.0, 0.08, COLOR.gray, 0.03), 0, 0.1, -0.3),
    place(box(0.5, 0.36, 0.12, COLOR.white, 0.05), 0, 1.0, -0.3),
    place(box(0.36, 0.14, 0.02, 0x9fe0b8, 0.01, 0.6), 0, 1.12, -0.23),
  );
}

export function extinguisher() {
  return group(
    place(cylinder(0.13, 0.13, 0.6, COLOR.red), 0, 0, 0),
    place(sphere(0.11, COLOR.red), 0, 0.6, 0),
    place(box(0.18, 0.08, 0.08, COLOR.dark, 0.02), 0.06, 0.66, 0),
  );
}

/** Pintu gulung untuk dinding gudang; `color` daun bergaris. */
export function rollerDoor(w = 2.6, h = 2.8, color: ColorRepresentation = COLOR.cream) {
  const g = group(place(box(w + 0.4, h + 0.25, 0.3, COLOR.woodDark, 0.14), 0, 0, 0));
  for (let i = 0; i < 7; i++)
    g.add(place(box(w, h / 7 - 0.02, 0.16, color, 0.075), 0, 0.02 + (i * h) / 7, 0.16));
  g.add(place(box(w + 0.4, 0.3, 0.3, COLOR.wood, 0.12), 0, h, 0.08));
  return g;
}

/** Truk boks membulat; badan menghadap +x (melaju ke kanan), cocok untuk jalan sepanjang x. */
export function truck(
  cabColor: ColorRepresentation = COLOR.red,
  boxColor: ColorRepresentation = COLOR.white,
) {
  const g = new Group();
  g.add(
    place(box(4.2, 0.35, 1.6, COLOR.dark, 0.1), 0, 0.35, 0),
    place(box(2.9, 1.9, 1.7, boxColor, 0.18), -0.6, 0.6, 0),
    place(box(1.3, 1.5, 1.6, cabColor, 0.3), 1.45, 0.6, 0),
    place(box(0.06, 0.6, 1.3, COLOR.glassBlue, 0.03, 0.25), 2.1, 1.25, 0),
    place(box(1.8, 0.22, 0.04, COLOR.sage, 0.02), -0.6, 1.4, 0.86),
  );
  for (const x of [-1.4, 0.0, 1.45])
    for (const z of [-0.8, 0.8]) {
      const r = cylinder(0.36, 0.36, 0.3, COLOR.dark);
      r.rotation.x = Math.PI / 2;
      // silinder tumbuh ke +z setelah diputar: sisi kiri digeser selebar ban agar menempel badan
      r.position.set(x, 0.36, z > 0 ? 0.65 : -0.95);
      g.add(r, place(sphere(0.12, COLOR.gray), x, 0.36, z + (z > 0 ? 0.02 : -0.02)));
    }
  return g;
}
