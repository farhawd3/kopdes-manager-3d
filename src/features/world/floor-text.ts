// Tulisan cat lantai: kode rak/dok dan nama ruang dicat tipis di lantai, menggantikan papan nama
// melayang agar layar tidak ramai. Tekstur dari kanvas; tanpa kanvas (tes) tulisan dilewati.
import {
  CanvasTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

/** Plane datar di lantai berisi teks; tidak ikut raycast agar klik tetap mengenai ruang/rak. */
export function floorText(
  text: string,
  width: number,
  height: number,
  color: string,
  opacity = 0.5,
) {
  if (typeof document === 'undefined' || /jsdom/i.test(navigator.userAgent)) return null;
  const c = document.createElement('canvas');
  const scale = 96;
  c.width = Math.max(16, Math.round(width * scale));
  c.height = Math.max(16, Math.round(height * scale));
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  let fontSize = c.height * 0.78;
  ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
  const textWidth = ctx.measureText(text).width;
  if (textWidth > c.width * 0.94) fontSize *= (c.width * 0.94) / textWidth;
  ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, c.width / 2, c.height / 2 + fontSize * 0.04);
  const map = new CanvasTexture(c);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  const m = new Mesh(
    new PlaneGeometry(width, height),
    new MeshStandardMaterial({
      map,
      transparent: true,
      opacity,
      depthWrite: false,
      roughness: 0.9,
    }),
  );
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  m.receiveShadow = true;
  m.raycast = () => {};
  return m;
}

/** Kumpulan tulisan lantai satu lokasi: [teks, x, z, lebar, tinggi, warna, rotasiY?]. */
export function paintLabels(
  labels: [string, number, number, number, number, string, number?][],
  y = 0.1,
) {
  const g = new Group();
  g.userData.floorText = true;
  for (const [text, x, z, w, h, color, rot = 0] of labels) {
    const m = floorText(text, w, h, color);
    if (!m) continue;
    m.position.set(x, y, z);
    m.rotation.z = rot;
    g.add(m);
  }
  return g;
}
