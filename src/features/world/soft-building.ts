// Bangunan bergaya mainan lembut: semua sudut membulat besar, atap "bantal" (lempeng membulat
// bertingkat) atau atap lengkung, tanpa atap runcing. Muka depan menghadap +z.
import { CylinderGeometry, Group, Mesh, type ColorRepresentation } from 'three';
import { COLOR, material, sphere, place, box, cylinder } from './shapes';

export type BuildingKind =
  | 'kantor'
  | 'balai'
  | 'loket'
  | 'gudang'
  | 'pendingin'
  | 'toko'
  | 'kios'
  | 'apotek'
  | 'klinik'
  | 'musala'
  | 'rumah';

type BuildingLook = {
  w: number;
  d: number;
  h: number;
  wall: number;
  roof: number;
  accent: number;
  floors?: 2;
};
// Palet mengikuti konsep kamar isometrik pertama: dinding krem/periwinkle muda, atap periwinkle,
// lavender, kayu hangat, terakota, sage. lantai 2 = bangunan bertingkat (badan kedua ditumpuk).
export const BUILDING_LOOKS: Record<BuildingKind, BuildingLook> = {
  kantor: { w: 5.2, d: 4.2, h: 2.4, wall: 0xf3eee6, roof: 0x8e9de6, accent: 0xe46b62, floors: 2 },
  balai: { w: 5.8, d: 4.4, h: 2.4, wall: 0xf3eee6, roof: 0xc9785f, accent: 0xe6c393 },
  loket: { w: 4.4, d: 3.8, h: 2.4, wall: 0xdfe5fb, roof: 0x86c3ab, accent: 0xe6c393 },
  gudang: { w: 6.2, d: 4.6, h: 2.6, wall: 0xe9e4f8, roof: 0x9d90d8, accent: 0xe6c393 },
  pendingin: {
    w: 4.2,
    d: 4.0,
    h: 2.2,
    wall: 0xf3f5fd,
    roof: 0x8e9de6,
    accent: 0xb3c4f5,
    floors: 2,
  },
  toko: { w: 4.6, d: 3.8, h: 2.3, wall: 0xf3eee6, roof: 0xd9a070, accent: 0x86c3ab },
  kios: { w: 3.0, d: 2.8, h: 2.0, wall: 0xdfe5fb, roof: 0x9d90d8, accent: 0xe6c393 },
  apotek: { w: 4.0, d: 3.6, h: 2.3, wall: 0xf3eee6, roof: 0x86c3ab, accent: 0x5fae8f },
  klinik: { w: 4.8, d: 4.0, h: 2.2, wall: 0xf3eee6, roof: 0xb3c4f5, accent: 0xe46b62, floors: 2 },
  musala: { w: 4.0, d: 4.0, h: 2.4, wall: 0xf3eee6, roof: 0x86c3ab, accent: 0x86c3ab },
  rumah: { w: 3.6, d: 3.4, h: 2.1, wall: 0xdfe5fb, roof: 0xc9785f, accent: 0x9d90d8 },
};

function windowFrame(frameColor: ColorRepresentation = COLOR.white) {
  const g = new Group();
  g.add(
    place(box(0.72, 0.72, 0.1, frameColor, 0.18), 0, 0, 0),
    place(box(0.54, 0.54, 0.06, 0x8fb8f0, 0.14, 0.25), 0, 0.09, 0.05),
  );
  return g;
}

/** Atap lengkung (setengah tabung) memanjang sumbu x, untuk gudang. */
function archRoof(w: number, d: number, color: number) {
  const geo = new CylinderGeometry(d / 2, d / 2, w, 24, 1, false, 0, Math.PI);
  // sumbu tabung ke x; setengah lingkaran sisi +x berputar menjadi sisi atas
  geo.rotateZ(Math.PI / 2);
  const m = new Mesh(geo, material(color));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Tanda plus membulat (klinik/apotek) dari dua kotak. */
function plusSign(color: number) {
  const g = new Group();
  g.add(
    place(box(0.6, 0.18, 0.08, color, 0.08), 0, 0.21, 0),
    place(box(0.18, 0.6, 0.08, color, 0.08), 0, 0, 0),
  );
  return g;
}

export function softBuilding(kind: BuildingKind) {
  const r = BUILDING_LOOKS[kind];
  const g = new Group();
  const front = r.d / 2 + 0.04;
  g.add(place(box(r.w + 0.3, 0.22, r.d + 0.3, 0xefe4d2, 0.11), 0, 0, 0));
  g.add(place(box(r.w, r.h, r.d, r.wall, 0.42), 0, 0.2, 0));
  let top = 0.2 + r.h;
  if (r.floors === 2) {
    // lantai dua sedikit lebih kecil dan bergeser ke belakang: siluet bertumpuk seperti balok
    g.add(place(box(r.w + 0.2, 0.22, r.d + 0.2, r.roof, 0.11), 0, top - 0.05, 0));
    g.add(place(box(r.w - 0.9, r.h * 0.85, r.d - 0.9, r.wall, 0.38), -0.2, top + 0.15, -0.3));
    for (const s of [-1, 1])
      g.add(
        place(
          windowFrame(),
          -0.2 + s * (r.w / 2 - 1.2),
          top + 0.15 + r.h * 0.4,
          -0.3 + (r.d - 0.9) / 2 + 0.04,
        ),
      );
    top += 0.15 + r.h * 0.85;
  }
  if (kind === 'gudang') {
    g.add(place(archRoof(r.w + 0.3, r.d + 0.3, r.roof), 0, top - 0.15, 0));
  } else if (kind === 'musala') {
    g.add(place(box(r.w + 0.4, 0.4, r.d + 0.4, r.roof, 0.2), 0, top - 0.1, 0));
    const dome = sphere(1.3, r.accent);
    dome.scale.set(1, 0.9, 1);
    g.add(place(dome, 0, top + 0.35, 0), place(sphere(0.16, COLOR.yellow), 0, top + 1.6, 0));
  } else {
    // atap bantal: lempeng membulat bertingkat dua
    g.add(place(box(r.w + 0.5, 0.5, r.d + 0.5, r.roof, 0.25), 0, top - 0.12, 0));
    g.add(place(box(r.w - 0.6, 0.4, r.d - 0.6, r.roof, 0.2), 0, top + 0.32, 0));
  }
  // pintu membulat
  const doorWidth = kind === 'gudang' ? 2.0 : 0.95;
  g.add(
    place(
      box(
        doorWidth,
        kind === 'gudang' ? 1.9 : 1.55,
        0.12,
        kind === 'gudang' ? r.accent : 0xc99a68,
        0.2,
      ),
      0,
      0.2,
      front,
    ),
  );
  // jendela depan dan sisi kanan (terlihat kamera)
  if (r.w > 3.2 && kind !== 'gudang')
    for (const s of [-1, 1])
      g.add(place(windowFrame(), s * (r.w / 2 - 0.85), 0.2 + r.h * 0.48, front));
  if (kind === 'kantor')
    for (const s of [-1, 0, 1]) g.add(place(windowFrame(), s * 1.5, 0.2 + r.h * 0.8, front));
  for (let z = -r.d / 2 + 1; z < r.d / 2 - 0.6; z += 1.5) {
    const j = windowFrame();
    j.rotation.y = Math.PI / 2;
    j.position.set(r.w / 2 + 0.04, 0.2 + r.h * 0.48, z);
    g.add(j);
  }
  // aksesori pembeda
  if (kind === 'toko' || kind === 'kios' || kind === 'loket' || kind === 'apotek') {
    const awning = box(r.w * 0.82, 0.16, 0.9, r.accent, 0.08);
    awning.position.set(0, 0.2 + r.h * 0.74, front + 0.36);
    awning.rotation.x = 0.28;
    g.add(awning);
  }
  if (kind === 'klinik' || kind === 'apotek')
    g.add(
      place(
        plusSign(kind === 'klinik' ? r.accent : 0xffffff),
        r.w / 2 - 0.8,
        0.2 + r.h * 0.78,
        front + 0.02,
      ),
    );
  if (kind === 'kantor') {
    g.add(place(cylinder(0.06, 0.06, 3.2, COLOR.gray), -r.w / 2 - 0.6, 0, front + 0.4));
    g.add(
      place(box(0.9, 0.3, 0.04, r.accent, 0.04), -r.w / 2 - 0.15, 2.8, front + 0.4),
      place(box(0.9, 0.3, 0.04, COLOR.white, 0.04), -r.w / 2 - 0.15, 2.5, front + 0.4),
    );
  }
  if (kind === 'pendingin')
    for (const x of [-0.8, 0.8]) g.add(place(box(0.9, 0.5, 0.7, 0xdfe7f3, 0.2), x, top + 0.3, 0.6));
  if (kind === 'balai')
    for (const x of [-1.8, 1.8])
      g.add(place(cylinder(0.18, 0.18, 1.6, COLOR.cream), x, 0.2, front + 0.5));
  return g;
}
