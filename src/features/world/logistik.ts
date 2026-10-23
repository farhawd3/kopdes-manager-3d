// Model logistik bergaya lembut: rak baja, palet, karung, kardus, forklift, truk, pintu gulung.
// Alas di y = 0, menghadap +z; ukuran mengikuti satuan perabot (1 ≈ 50 cm).
import { Group, type ColorRepresentation } from 'three';
import { WARNA, bola, di, kotak, silinder } from './bentuk';

// Warna rak mengikuti palet hangat diorama (bukan baja industri): tiang lavender, balok kayu.
const BALOK = WARNA.kayu;
const TIANG = WARNA.lavender;
const KARDUS = 0xd9aa72;
const KARUNG = 0xefe3cb;

function grup(...anak: Parameters<Group['add']>) {
  const g = new Group();
  g.add(...anak);
  return g;
}

/** Tumpukan kardus n buah di atas satu sama lain, sedikit bergeser agar terasa ditumpuk tangan. */
export function tumpukKardus(n = 3, warna: ColorRepresentation = KARDUS) {
  const g = new Group();
  for (let i = 0; i < n; i++) {
    const k = kotak(0.62, 0.42, 0.52, warna, 0.05);
    k.position.set(((i * 37) % 7) * 0.012 - 0.03, i * 0.42, ((i * 53) % 5) * 0.012);
    k.rotation.y = ((i * 29) % 9) * 0.02 - 0.08;
    g.add(
      k,
      di(kotak(0.64, 0.05, 0.12, 0xc58d55, 0.02), k.position.x, i * 0.42 + 0.42, k.position.z),
    );
  }
  return g;
}

export function palet() {
  const g = grup(di(kotak(1.3, 0.08, 1.1, 0xc99b67, 0.02), 0, 0.14, 0));
  for (const x of [-0.5, 0, 0.5]) g.add(di(kotak(0.22, 0.14, 1.1, 0xb98757, 0.02), x, 0, 0));
  return g;
}

export function paletKarung(lapis = 2) {
  const g = palet();
  for (let l = 0; l < lapis; l++)
    for (const [x, z] of [
      [-0.3, -0.25],
      [0.3, -0.25],
      [-0.3, 0.25],
      [0.3, 0.25],
    ]) {
      const k = kotak(0.58, 0.26, 0.48, KARUNG, 0.12);
      k.position.set(x, 0.22 + l * 0.26, z);
      k.rotation.y = l % 2 ? 0.08 : -0.05;
      g.add(k);
    }
  return g;
}

/**
 * Rak baja dua sisi tiang oranye-biru seperti gudang distribusi. `isi` 0–1 = bagian rak yang terisi
 * kardus; dipakai rak data A–F (kosong, sebagian, penuh).
 */
export function rakBaja(isi = 1, w = 2.6) {
  const tinggi = 3;
  const g = new Group();
  // Tiang dan papan dibuat tebal-membulat agar tidak tampak sebagai garis patah dari jauh.
  for (const x of [-w / 2, w / 2])
    for (const z of [-0.45, 0.45]) g.add(di(kotak(0.3, tinggi, 0.3, TIANG, 0.14), x, 0, z));
  const tingkat = [0.12, 1.1, 2.08];
  for (const y of [...tingkat, 2.9]) {
    g.add(
      di(kotak(w + 0.3, 0.26, 0.24, BALOK, 0.11), 0, y, 0.45),
      di(kotak(w + 0.3, 0.26, 0.24, BALOK, 0.11), 0, y, -0.45),
    );
    g.add(di(kotak(w, 0.18, 0.92, WARNA.krem, 0.08), 0, y + 0.06, 0));
  }
  const slot = tingkat.length * 3;
  const terisi = Math.round(slot * isi);
  for (let i = 0; i < terisi; i++) {
    const t = Math.floor(i / 3),
      kol = i % 3;
    const k = tumpukKardus(1 + ((i * 7) % 2), i % 4 === 3 ? 0xc9b48a : KARDUS);
    k.position.set(-w / 2 + 0.45 + kol * ((w - 0.9) / 2), tingkat[t] + 0.1, 0);
    k.scale.setScalar(0.9);
    g.add(k);
  }
  return g;
}

/** Forklift kecil membulat; `garpu` = grup garpu yang naik-turun saat mengangkat. */
export function forklift() {
  const g = new Group();
  g.add(
    di(kotak(1.0, 0.5, 1.4, WARNA.kuning, 0.15), 0, 0.28, 0),
    di(kotak(0.9, 0.5, 0.5, WARNA.kuning, 0.15), 0, 0.78, -0.35),
    di(kotak(0.08, 1.2, 0.08, WARNA.gelap, 0.03), -0.4, 0.78, 0.1),
    di(kotak(0.08, 1.2, 0.08, WARNA.gelap, 0.03), 0.4, 0.78, 0.1),
    di(kotak(0.9, 0.08, 0.9, WARNA.gelap, 0.03), 0, 1.98, -0.25),
    di(kotak(0.12, 1.6, 0.12, WARNA.abu, 0.03), -0.3, 0.2, 0.75),
    di(kotak(0.12, 1.6, 0.12, WARNA.abu, 0.03), 0.3, 0.2, 0.75),
  );
  for (const [x, z] of [
    [-0.52, 0.45],
    [0.52, 0.45],
    [-0.52, -0.45],
    [0.52, -0.45],
  ]) {
    const r = silinder(0.24, 0.24, 0.2, WARNA.gelap);
    r.rotation.z = Math.PI / 2;
    r.position.set(x + (x > 0 ? 0.1 : -0.1), 0.24, z);
    g.add(r);
  }
  const garpu = grup(
    di(kotak(0.12, 0.06, 0.9, WARNA.abu, 0.02), -0.25, 0, 0.5),
    di(kotak(0.12, 0.06, 0.9, WARNA.abu, 0.02), 0.25, 0, 0.5),
  );
  garpu.position.set(0, 0.3, 0.6);
  g.add(garpu);
  g.userData.garpu = garpu;
  return g;
}

export function timbangan() {
  return grup(
    di(kotak(0.9, 0.12, 0.7, WARNA.abu, 0.04), 0, 0, 0),
    di(kotak(0.08, 1.0, 0.08, WARNA.abu, 0.03), 0, 0.1, -0.3),
    di(kotak(0.5, 0.36, 0.12, WARNA.putih, 0.05), 0, 1.0, -0.3),
    di(kotak(0.36, 0.14, 0.02, 0x9fe0b8, 0.01, 0.6), 0, 1.12, -0.23),
  );
}

export function apar() {
  return grup(
    di(silinder(0.13, 0.13, 0.6, WARNA.merah), 0, 0, 0),
    di(bola(0.11, WARNA.merah), 0, 0.6, 0),
    di(kotak(0.18, 0.08, 0.08, WARNA.gelap, 0.02), 0.06, 0.66, 0),
  );
}

/** Pintu gulung untuk dinding gudang; `warna` daun bergaris. */
export function pintuGulung(w = 2.6, h = 2.8, warna: ColorRepresentation = WARNA.krem) {
  const g = grup(di(kotak(w + 0.4, h + 0.25, 0.3, WARNA.kayuGelap, 0.14), 0, 0, 0));
  for (let i = 0; i < 7; i++)
    g.add(di(kotak(w, h / 7 - 0.02, 0.16, warna, 0.075), 0, 0.02 + (i * h) / 7, 0.16));
  g.add(di(kotak(w + 0.4, 0.3, 0.3, WARNA.kayu, 0.12), 0, h, 0.08));
  return g;
}

/** Truk boks membulat; badan menghadap +x (melaju ke kanan), cocok untuk jalan sepanjang x. */
export function truk(
  warnaKabin: ColorRepresentation = WARNA.merah,
  warnaBoks: ColorRepresentation = WARNA.putih,
) {
  const g = new Group();
  g.add(
    di(kotak(4.2, 0.35, 1.6, WARNA.gelap, 0.1), 0, 0.35, 0),
    di(kotak(2.9, 1.9, 1.7, warnaBoks, 0.18), -0.6, 0.6, 0),
    di(kotak(1.3, 1.5, 1.6, warnaKabin, 0.3), 1.45, 0.6, 0),
    di(kotak(0.06, 0.6, 1.3, WARNA.biruKaca, 0.03, 0.25), 2.1, 1.25, 0),
    di(kotak(1.8, 0.22, 0.04, WARNA.sage, 0.02), -0.6, 1.4, 0.86),
  );
  for (const x of [-1.4, 0.0, 1.45])
    for (const z of [-0.8, 0.8]) {
      const r = silinder(0.36, 0.36, 0.3, WARNA.gelap);
      r.rotation.x = Math.PI / 2;
      // silinder tumbuh ke +z setelah diputar: sisi kiri digeser selebar ban agar menempel badan
      r.position.set(x, 0.36, z > 0 ? 0.65 : -0.95);
      g.add(r, di(bola(0.12, WARNA.abu), x, 0.36, z + (z > 0 ? 0.02 : -0.02)));
    }
  return g;
}
