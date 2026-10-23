// Benda bergerak (orang, truk, forklift) ditandai `userData.moving` dan diberi bayangan bulat lembut
// karena peta bayangan hanya dipanggang sekali.
import { CircleGeometry, Mesh, MeshBasicMaterial, type Object3D } from 'three';

/** Tandai objek bergerak agar tidak ikut digabung. */
export function markMoving<T extends Object3D>(o: T): T {
  o.userData.moving = true;
  return o;
}

const shadowMaterial = new MeshBasicMaterial({
  color: 0x2b2440,
  transparent: true,
  opacity: 0.18,
  depthWrite: false,
});
const disc = new CircleGeometry(1, 24);
disc.rotateX(-Math.PI / 2);
/** Bayangan bulat di bawah benda bergerak (radius r, lonjong ke arah z bila `stretch` > 1). */
export function blobShadow(r: number, stretch = 1) {
  const m = new Mesh(disc, shadowMaterial);
  m.scale.set(r, 1, r * stretch);
  m.position.y = 0.02;
  m.renderOrder = -1;
  return m;
}
