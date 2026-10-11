// Optimasi render: benda statis digabung per material menjadi satu mesh (puluhan draw call, bukan
// ribuan); benda bergerak (orang, truk, forklift) ditandai `userData.gerak` dan dibiarkan terpisah
// dengan bayangan bulat lembut karena peta bayangan hanya dipanggang sekali.
import {
  CircleGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  type BufferGeometry,
  type Material,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Tandai objek bergerak agar tidak ikut digabung. */
export function bergerak<T extends Object3D>(o: T): T {
  o.userData.gerak = true;
  return o;
}

const bahanBayang = new MeshBasicMaterial({ color: 0x2b2440, transparent: true, opacity: 0.18, depthWrite: false });
const piringan = new CircleGeometry(1, 24);
piringan.rotateX(-Math.PI / 2);
/** Bayangan bulat di bawah benda bergerak (radius r, lonjong ke arah z bila `panjang` > 1). */
export function bayanganBulat(r: number, panjang = 1) {
  const m = new Mesh(piringan, bahanBayang);
  m.scale.set(r, 1, r * panjang);
  m.position.y = 0.02;
  m.renderOrder = -1;
  return m;
}

/**
 * Gabungkan semua mesh statis di `akar` per material. Objek bertanda gerak (beserta anaknya)
 * dipindah utuh ke grup hasil. Matriks dunia dihitung relatif terhadap `akar`.
 */
export function satukanStatis(akar: Group): Group {
  akar.updateMatrixWorld(true);
  const kebalikan = new Matrix4().copy(akar.matrixWorld).invert();
  const perBahan = new Map<Material, BufferGeometry[]>();
  const gerak: Object3D[] = [];
  const jelajah = (o: Object3D) => {
    if (o !== akar && o.userData.gerak) {
      gerak.push(o);
      return;
    }
    const m = o as Mesh;
    if (m.isMesh && !Array.isArray(m.material)) {
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(new Matrix4().multiplyMatrices(kebalikan, m.matrixWorld));
      // atribut disamakan agar semua geometri dapat digabung
      for (const nama of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(nama)) g.deleteAttribute(nama);
      g.clearGroups();
      const daftar = perBahan.get(m.material) ?? [];
      daftar.push(g);
      perBahan.set(m.material, daftar);
    }
    for (const anak of o.children) jelajah(anak);
  };
  jelajah(akar);
  const hasil = new Group();
  for (const [bahan, daftar] of perBahan) {
    const gabung = mergeGeometries(daftar, false);
    for (const g of daftar) g.dispose();
    if (!gabung) continue;
    const mesh = new Mesh(gabung, bahan);
    mesh.castShadow = !(bahan as MeshBasicMaterial).transparent;
    mesh.receiveShadow = true;
    hasil.add(mesh);
  }
  for (const o of gerak) {
    // posisi benda bergerak tetap relatif terhadap akar
    o.updateMatrixWorld(true);
    const m = new Matrix4().multiplyMatrices(kebalikan, o.matrixWorld);
    o.removeFromParent();
    m.decompose(o.position, o.quaternion, o.scale);
    o.traverse((x) => {
      if ((x as Mesh).isMesh) x.castShadow = false;
    });
    hasil.add(o);
  }
  return hasil;
}
