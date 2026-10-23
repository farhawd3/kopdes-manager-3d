import {
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';
import { di, kotak } from './bentuk';

import type { Suasana } from './monitor-data';

/** Bingkai tebal membulat; panorama di kaca diperbarui hanya saat cuaca/fase berubah. */
export function jendelaSuasana(w = 2.8, h = 1.5) {
  const group = new Group();
  group.add(di(kotak(w + 0.24, h + 0.24, 0.3, 0xf1e2cc, 0.14), 0, -0.12, 0));
  const view = new Mesh(new PlaneGeometry(w - 0.16, h - 0.12), new MeshBasicMaterial());
  view.position.set(0, h / 2, 0.17);
  view.userData.panorama = true;
  group.add(view, di(kotak(0.16, h, 0.24, 0xf1e2cc, 0.08), 0, 0, 0.2));
  group.add(di(kotak(w + 0.4, 0.2, 0.55, 0xe2c59f, 0.1), 0, -0.18, 0.15));
  group.traverse((obj) => {
    if (obj instanceof Mesh && obj !== view) obj.userData.bersama = true;
  });
  return group;
}

export function panorama({ cuaca, fase }: Suasana) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;
  const malam = fase === 'malam';
  const gradient = ctx.createLinearGradient(0, 0, 0, 192);
  gradient.addColorStop(
    0,
    malam ? '#283459' : fase === 'senja' ? '#ba92c9' : cuaca === 'cerah' ? '#92bcea' : '#9baac6',
  );
  gradient.addColorStop(1, malam ? '#6d729b' : fase === 'senja' ? '#f3c4a5' : '#e6eaf4');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 384, 192);
  ctx.fillStyle = malam ? '#fff3cd' : '#ffe3a3';
  ctx.beginPath();
  ctx.arc(275, 48, malam ? 14 : 21, 0, Math.PI * 2);
  ctx.fill();
  if (malam) {
    ctx.fillStyle = '#eee9ff';
    for (let i = 0; i < 16; i++) ctx.fillRect(15 + ((i * 47) % 360), 12 + ((i * 23) % 70), 2, 2);
  }
  if (cuaca !== 'cerah') {
    ctx.fillStyle = cuaca === 'hujan' ? '#8694b2' : '#e6e9f3';
    for (const x of [50, 180, 315])
      for (const s of [-1, 0, 1]) {
        ctx.beginPath();
        ctx.ellipse(x + s * 19, 55 + s * 7, 33, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }
  }
  ctx.fillStyle = malam ? '#536b76' : '#97baaa';
  ctx.beginPath();
  ctx.moveTo(0, 160);
  ctx.quadraticCurveTo(95, 84, 210, 156);
  ctx.quadraticCurveTo(315, 105, 384, 139);
  ctx.lineTo(384, 192);
  ctx.lineTo(0, 192);
  ctx.fill();
  if (cuaca === 'hujan') {
    ctx.strokeStyle = '#d4dff3';
    ctx.lineWidth = 2;
    for (let i = 0; i < 35; i++) {
      const x = (i * 43) % 384,
        y = 70 + ((i * 31) % 110);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y + 13);
      ctx.stroke();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
