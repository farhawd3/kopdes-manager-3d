import { Group, type BufferGeometry, type Mesh, type MeshStandardMaterial } from 'three';
import { sphere, place, box, cylinder } from './shapes';
import { softBuilding } from './soft-building';
import { mergeMeshes } from './monitoring-room';
import { plant } from './furniture';
import { paintLabels } from './floor-text';

/** Pulau sebagai peta masuk; bangunan memakai model lembut yang sudah tersedia. */
export function buildIsland() {
  const root = new Group();
  const shell = new Group();
  // Pulau melayang berlapis: rumput segar, tanah hangat, batu lavender yang meruncing ke bawah.
  shell.add(place(box(33, 0.7, 24, 0xa9dcb4, 0.35), 0, -0.5, 0));
  shell.add(place(box(33.6, 0.5, 24.6, 0x8fcf9e, 0.25), 0, -0.85, 0));
  shell.add(place(box(32.4, 1.6, 23.4, 0xead2ab, 0.7), 0, -2.4, 0));
  shell.add(place(box(29, 1.6, 20, 0xd8c8ec, 0.8), 0, -3.9, 0));
  shell.add(place(box(23, 1.6, 15, 0xcbbbe4, 0.8), 0, -5.4, 0));
  shell.add(place(box(15, 1.6, 9, 0xbfaedd, 0.8), 0, -6.9, 0));
  // Jalan krem bertepi dan alun-alun dengan kolam air mancur di tengah.
  shell.add(place(box(28.6, 0.16, 3.4, 0xe2d3ba, 0.08), 0, 0.2, 1.8));
  shell.add(place(box(28, 0.2, 2.8, 0xf7ecda, 0.08), 0, 0.2, 1.8));
  shell.add(place(box(3.4, 0.16, 18.6, 0xe2d3ba, 0.08), 0, 0.2, 0));
  shell.add(place(box(2.8, 0.2, 18, 0xf7ecda, 0.08), 0, 0.2, 0));
  shell.add(place(cylinder(3.1, 3.1, 0.24, 0xf3e6cf, 32), 0, 0.2, 1.8));
  shell.add(place(cylinder(1.9, 1.9, 0.5, 0xe2d4f2, 32), 0, 0.2, 1.8));
  shell.add(place(cylinder(1.55, 1.55, 0.52, 0x9fd3f2, 32), 0, 0.2, 1.8));
  shell.add(place(cylinder(0.35, 0.45, 1.2, 0xe2d4f2), 0, 0.2, 1.8));
  shell.add(place(sphere(0.38, 0xc7e8fb), 0, 1.55, 1.8));
  // Pohon bulat, tanaman pot, dan bunga kecil agar pulau terasa hidup tanpa animasi.
  for (const [x, z, r] of [
    [-14.2, -9.2, 1.5],
    [14.2, -9.2, 1.3],
    [-14.4, 9.6, 1.4],
    [14.6, 9.4, 1.6],
    [-2.6, -9.6, 1.1],
    [2.8, 10, 1.2],
  ]) {
    shell.add(place(cylinder(0.22, 0.28, 1.3, 0xb98a63), x, 0.2, z));
    shell.add(place(sphere(r, 0x7cc79a), x, 1.4 + r * 0.7, z));
    shell.add(place(sphere(r * 0.6, 0x9ad8b0), x - r * 0.3, 1.6 + r * 1.2, z - r * 0.25));
  }
  for (const [x, z] of [
    [-3.4, -3.6],
    [3.4, 6.2],
  ])
    shell.add(place(plant(2.2), x, 0.2, z));
  const flowerColors = [0xf6a6b8, 0xffd36e, 0xf7f3ff, 0xc9b2f2];
  for (let i = 0; i < 22; i++) {
    const x = ((i * 37) % 29) - 14.5,
      z = ((i * 53) % 21) - 10.5;
    if (Math.abs(x) < 2.4 || Math.abs(z - 1.8) < 2.4) continue;
    shell.add(place(sphere(0.2, flowerColors[i % flowerColors.length]), x, 0.38, z));
  }
  // Awan diam menjaga render tetap berhenti saat tidak ada interaksi.
  for (const [x, y, z] of [
    [-19, -2, 6],
    [17, -3, -10],
    [9, -5, 15],
  ]) {
    for (const s of [-1, 0, 1]) {
      const cloud = sphere(1.8, 0xfbf9ff);
      cloud.scale.set(1.3, 0.6, 1);
      shell.add(place(cloud, x + s * 1.8, y + (s === 0 ? 0.4 : 0), z));
    }
  }
  const terrain = mergeMeshes(shell);
  terrain.userData.areaKey = 'pintu-kantor';
  root.add(terrain);
  const areas = new Map<string, Mesh<BufferGeometry, MeshStandardMaterial>>();
  for (const [id, kind, x, z] of [
    ['kantor', 'kantor', -8, -5],
    ['gerai', 'toko', 7, -5],
    ['gudang', 'gudang', -8, 7],
    ['pendingin', 'pendingin', 7, 7],
  ] as const) {
    const group = new Group();
    group.add(place(softBuilding(kind), x, 0.2, z));
    group.add(place(cylinder(1, 1, 0.14, 0xdfe8fb), x, 0.22, z + 3));
    const mesh = mergeMeshes(group);
    mesh.userData.areaKey = `pintu-${id}`;
    root.add(mesh);
    areas.set(`pintu-${id}`, mesh);
  }
  root.add(
    paintLabels(
      [
        ['KANTOR', -8, -1.4, 3, 0.7, '#5a6f96'],
        ['GERAI', 7, -1.4, 3, 0.7, '#5a6f96'],
        ['GUDANG', -8, 10.7, 3, 0.7, '#5a6f96'],
        ['COLD STORAGE', 7, 10.7, 4, 0.7, '#5a6f96'],
      ],
      0.38,
    ),
  );
  return { root, areas };
}
