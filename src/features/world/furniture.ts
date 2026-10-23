// Perabot diorama dari bentuk dasar. Satuan: 1 ≈ 50 cm; setiap fungsi mengembalikan Group yang
// alasnya di y = 0 dan menghadap +z (ke kamera), lalu diputar/ditempatkan oleh pemanggil.
import type { ColorRepresentation } from 'three';
import { COLOR, sphere, place, capsule, box, cylinder, group } from './shapes';

export function desk(w = 1.8, d = 0.9, color: ColorRepresentation = COLOR.wood) {
  const leg = (x: number, z: number) => place(box(0.18, 0.74, 0.18, COLOR.woodDark, 0.08), x, 0, z);
  const lx = w / 2 - 0.12,
    lz = d / 2 - 0.12;
  return group(
    place(box(w, 0.18, d, color, 0.09), 0, 0.68, 0),
    leg(-lx, -lz),
    leg(lx, -lz),
    leg(-lx, lz),
    leg(lx, lz),
    place(box(0.5, 0.36, d - 0.2, COLOR.cream, 0.05), lx - 0.3, 0.38, 0),
  );
}

export function chair(color: ColorRepresentation = COLOR.lavender) {
  return group(
    place(box(0.62, 0.14, 0.6, color, 0.07), 0, 0.42, 0),
    place(box(0.62, 0.7, 0.14, color, 0.07), 0, 0.5, -0.26),
    place(cylinder(0.09, 0.09, 0.42, COLOR.gray), 0, 0, 0),
    place(box(0.5, 0.1, 0.5, COLOR.gray, 0.05), 0, 0, 0),
  );
}

export function monitor() {
  return group(
    place(box(0.3, 0.04, 0.2, COLOR.dark, 0.02), 0, 0, 0),
    place(box(0.12, 0.28, 0.12, COLOR.dark, 0.05), 0, 0.03, -0.04),
    place(box(0.8, 0.5, 0.14, COLOR.dark, 0.07), 0, 0.28, -0.04),
    place(box(0.7, 0.4, 0.02, 0x9fd3ff, 0.02, 0.55), 0, 0.33, 0.01),
  );
}

export function cabinet(w = 1.3, h = 2.4, color: ColorRepresentation = COLOR.wood) {
  return group(
    place(box(w, h, 0.62, color, 0.1), 0, 0, 0),
    place(box(w / 2 - 0.06, h - 0.2, 0.04, COLOR.cream, 0.06), -w / 4, 0.1, 0.31),
    place(box(w / 2 - 0.06, h - 0.2, 0.04, COLOR.cream, 0.06), w / 4, 0.1, 0.31),
    place(sphere(0.05, COLOR.lavender), -0.08, h * 0.52, 0.35),
    place(sphere(0.05, COLOR.lavender), 0.08, h * 0.52, 0.35),
  );
}

/** Rak terbuka berisi map/kardus warna-warni; `fill` 0–1 = seberapa penuh (dipakai rak data). */
export function openShelf(w = 1.4, h = 2, fill = 1, frameColor: ColorRepresentation = COLOR.wood) {
  const g = group(
    place(box(0.22, h, 0.52, frameColor, 0.1), -w / 2, 0, 0),
    place(box(0.22, h, 0.52, frameColor, 0.1), w / 2, 0, 0),
  );
  const levels = 4;
  const palette = [COLOR.red, COLOR.sage, COLOR.lavender, COLOR.yellow, COLOR.glassBlue, COLOR.pot];
  for (let i = 0; i < levels; i++) {
    const y = 0.08 + (i * (h - 0.16)) / (levels - 1);
    g.add(place(box(w + 0.12, 0.18, 0.54, frameColor, 0.08), 0, y, 0));
    if (i === levels - 1) continue;
    const count = Math.round(5 * fill);
    for (let j = 0; j < count; j++)
      g.add(
        place(
          box(0.16, 0.4, 0.38, palette[(i * 2 + j) % palette.length], 0.03),
          -w / 2 + 0.22 + j * 0.22,
          y + 0.07,
          0,
        ),
      );
  }
  return g;
}

export function plant(scale = 1) {
  const g = group(
    place(cylinder(0.24, 0.18, 0.4, COLOR.pot), 0, 0, 0),
    place(cylinder(0.22, 0.22, 0.04, 0x6b4a3a), 0, 0.38, 0),
  );
  for (let i = 0; i < 6; i++) {
    const leaf = capsule(0.07, 0.42 + (i % 3) * 0.12, COLOR.leaf);
    leaf.position.set(0, 0.4, 0);
    leaf.rotation.set(Math.cos(i) * 0.45, (i / 6) * Math.PI * 2, Math.sin(i * 2) * 0.45);
    g.add(leaf);
  }
  g.scale.setScalar(scale);
  return g;
}

export function door() {
  return group(
    place(box(1.1, 2.3, 0.12, COLOR.woodDark, 0.05), 0, 0, 0),
    place(box(0.95, 2.15, 0.06, COLOR.wood, 0.05), 0, 0.05, 0.05),
    place(sphere(0.06, COLOR.yellow), 0.36, 1.1, 0.12),
  );
}

export function dispenser() {
  return group(
    place(box(0.5, 0.95, 0.5, COLOR.white, 0.08), 0, 0, 0),
    place(box(0.16, 0.08, 0.05, COLOR.glassBlue, 0.02), 0, 0.6, 0.26),
    place(cylinder(0.2, 0.22, 0.55, 0x9fd0f2), 0, 0.95, 0),
  );
}

export function meetingTable() {
  const g = desk(2.6, 1.3, COLOR.wood);
  for (const x of [-0.8, 0, 0.8]) {
    const front = chair(COLOR.sage);
    front.position.set(x, 0, 0.95);
    front.rotation.y = Math.PI;
    const back = chair(COLOR.sage);
    back.position.set(x, 0, -0.95);
    g.add(front, back);
  }
  g.add(place(plant(0.55), 0, 0.86, 0));
  return g;
}

export function sofa(color: ColorRepresentation = COLOR.sage) {
  return group(
    place(box(2.2, 0.5, 0.95, color, 0.18), 0, 0, 0),
    place(box(2.2, 0.8, 0.3, color, 0.15), 0, 0.2, -0.33),
    place(box(0.3, 0.7, 0.95, color, 0.14), -1.0, 0, 0),
    place(box(0.3, 0.7, 0.95, color, 0.14), 1.0, 0, 0),
    place(box(0.6, 0.18, 0.5, COLOR.white, 0.09), -0.45, 0.5, -0.05),
  );
}

export function rug(w: number, d: number, color: ColorRepresentation = COLOR.lavender) {
  const k = box(w, 0.03, d, color, 0.015);
  k.castShadow = false;
  return k;
}

/** Treadmill: alas bersabuk gelap, pegangan dan konsol; pengguna berjalan di tempat di atas sabuk. */
export function treadmill() {
  return group(
    place(box(0.9, 0.22, 2.0, COLOR.gray, 0.08), 0, 0, 0),
    place(box(0.72, 0.04, 1.7, COLOR.dark, 0.02), 0, 0.22, 0.05),
    place(box(0.08, 1.2, 0.08, COLOR.gray, 0.03), -0.4, 0.2, -0.85),
    place(box(0.08, 1.2, 0.08, COLOR.gray, 0.03), 0.4, 0.2, -0.85),
    place(box(0.9, 0.3, 0.25, COLOR.lavender, 0.08), 0, 1.3, -0.85),
    place(box(0.5, 0.14, 0.02, 0x9fe0b8, 0.01, 0.6), 0, 1.38, -0.72),
  );
}

/** Sepeda statis: pengguna duduk, kaki mengayuh. */
export function exerciseBike() {
  const g = group(
    place(box(0.4, 0.12, 1.3, COLOR.gray, 0.05), 0, 0, 0),
    place(box(0.12, 0.7, 0.12, COLOR.dark, 0.04), 0, 0.1, 0.2),
    place(box(0.36, 0.1, 0.4, COLOR.dark, 0.05), 0, 0.8, 0.2),
    place(box(0.1, 0.9, 0.1, COLOR.dark, 0.04), 0, 0.1, -0.45),
    place(box(0.6, 0.08, 0.1, COLOR.gray, 0.04), 0, 1.0, -0.45),
  );
  // roda gila tegak di sisi rangka
  const flywheel = cylinder(0.3, 0.3, 0.12, COLOR.sage);
  flywheel.rotation.z = Math.PI / 2;
  flywheel.position.set(0.06, 0.4, -0.2);
  g.add(flywheel);
  return g;
}

/** Rak dumbel kecil berisi beban warna-warni. */
export function dumbbellRack() {
  const g = group(place(box(1.4, 0.7, 0.5, COLOR.gray, 0.06), 0, 0, 0));
  [COLOR.red, COLOR.yellow, COLOR.sage, COLOR.lavender].forEach((w, i) => {
    g.add(
      place(box(0.24, 0.16, 0.16, w, 0.07), -0.48 + i * 0.32, 0.7, -0.08),
      place(box(0.24, 0.16, 0.16, w, 0.07), -0.48 + i * 0.32, 0.7, 0.12),
    );
  });
  return g;
}
