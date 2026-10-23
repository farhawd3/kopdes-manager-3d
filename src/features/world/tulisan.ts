// Tulisan cat lantai: kode rak/dok dan nama ruang dicat tipis di lantai, menggantikan papan nama
// melayang agar layar tidak ramai. Tekstur dari kanvas; tanpa kanvas (tes) tulisan dilewati.
import { CanvasTexture, Group, Mesh, MeshStandardMaterial, PlaneGeometry, SRGBColorSpace } from 'three';

/** Plane datar di lantai berisi teks; tidak ikut raycast agar klik tetap mengenai ruang/rak. */
export function tulisanLantai(teks: string, lebar: number, tinggi: number, warna: string, opacity = 0.5) {
  if (typeof document === 'undefined' || /jsdom/i.test(navigator.userAgent)) return null;
  const c = document.createElement('canvas');
  const skala = 96;
  c.width = Math.max(16, Math.round(lebar * skala));
  c.height = Math.max(16, Math.round(tinggi * skala));
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  let ukuran = c.height * 0.78;
  ctx.font = `800 ${ukuran}px Inter, system-ui, sans-serif`;
  const lebarTeks = ctx.measureText(teks).width;
  if (lebarTeks > c.width * 0.94) ukuran *= (c.width * 0.94) / lebarTeks;
  ctx.font = `800 ${ukuran}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = warna;
  ctx.fillText(teks, c.width / 2, c.height / 2 + ukuran * 0.04);
  const map = new CanvasTexture(c);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  const m = new Mesh(
    new PlaneGeometry(lebar, tinggi),
    new MeshStandardMaterial({ map, transparent: true, opacity, depthWrite: false, roughness: 0.9 }),
  );
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  m.receiveShadow = true;
  m.raycast = () => {};
  return m;
}

/** Kumpulan tulisan lantai satu lokasi: [teks, x, z, lebar, tinggi, warna, rotasiY?]. */
export function cat(daftar: [string, number, number, number, number, string, number?][], y = 0.1) {
  const g = new Group();
  g.userData.tulisan = true;
  for (const [teks, x, z, w, h, warna, rot = 0] of daftar) {
    const m = tulisanLantai(teks, w, h, warna);
    if (!m) continue;
    m.position.set(x, y, z);
    m.rotation.z = rot;
    g.add(m);
  }
  return g;
}
