// Figur orang bergaya mainan lembut: badan kapsul, kepala bulat, rambut, mata, pipi merona.
// Bukan maskot dan bukan orang nyata; warna baju dari peran, rupa tidak ditebak dari nama.
import { Group, type ColorRepresentation } from 'three';
import { WARNA, bola, di, kapsul, kotak } from './bentuk';
import { bayanganBulat, bergerak } from './optimasi';

export type RupaOrang = {
  baju: ColorRepresentation;
  celana?: ColorRepresentation;
  rambut?: ColorRepresentation;
  hijab?: ColorRepresentation;
  kulit?: ColorRepresentation;
};

export type Orang = {
  akar: Group;
  /** Bagian yang dianimasikan: badan untuk bernapas, lengan untuk mengetik/melambai. */
  badan: Group;
  lenganKiri: Group;
  lenganKanan: Group;
  /** Sendi pinggul kiri/kanan; diputar pada sumbu x untuk melangkah. */
  kaki: Group[];
};

function lengan(warna: ColorRepresentation, sisi: 1 | -1) {
  const g = new Group();
  const l = kapsul(0.085, 0.36, warna);
  l.rotation.z = Math.PI;
  l.position.y = 0;
  g.add(l, di(bola(0.09, WARNA.kulit), 0, -0.6, 0));
  // bahu di sisi atas badan (relatif terhadap pinggul)
  g.position.set(sisi * 0.34, 0.86, 0);
  return g;
}

/** `duduk` = kaki ditekuk ke depan, alas pinggul di y = 0.5 (setinggi dudukan kursi). */
export function buatOrang(rupa: RupaOrang, duduk = false): Orang {
  // orang selalu dianimasikan: tidak ikut digabung, bayangannya piringan lembut
  const akar = bergerak(new Group());
  akar.add(bayanganBulat(0.36));
  const badan = new Group();
  const kulit = rupa.kulit ?? WARNA.kulit;
  const celana = rupa.celana ?? WARNA.gelap;
  // kaki menggantung dari sendi pinggul (y = 0.5) agar bisa diayun saat berjalan
  const kaki: Group[] = [];
  for (const s of [-1, 1]) {
    const sendi = new Group();
    sendi.position.set(s * 0.13, 0.5, 0);
    const k = kapsul(0.1, 0.3, celana);
    k.rotation.z = Math.PI;
    sendi.add(k);
    // duduk: paha mendatar ke depan
    if (duduk) sendi.rotation.x = -Math.PI / 2;
    akar.add(sendi);
    kaki.push(sendi);
  }
  // badan dan kepala
  badan.position.y = 0.5;
  badan.add(di(kapsul(0.3, 0.42, rupa.baju), 0, 0, 0));
  const kepala = new Group();
  kepala.position.y = 1.18;
  kepala.add(bola(0.32, kulit));
  if (rupa.hijab) {
    const kerudung = bola(0.345, rupa.hijab);
    kerudung.scale.set(1, 1.02, 1);
    // kerudung bergeser ke belakang sehingga wajah (mata, pipi) tetap terbuka
    kerudung.position.set(0, 0.03, -0.09);
    kepala.add(kerudung);
    const jatuh = kotak(0.5, 0.3, 0.35, rupa.hijab, 0.14);
    jatuh.position.set(0, -0.32, -0.02);
    kepala.add(jatuh);
  } else {
    const rambut = bola(0.335, rupa.rambut ?? WARNA.rambut);
    rambut.scale.set(1.02, 0.78, 1.02);
    rambut.position.set(0, 0.1, -0.04);
    kepala.add(rambut);
  }
  for (const s of [-1, 1]) {
    kepala.add(di(bola(0.04, WARNA.gelap), s * 0.11, 0.0, 0.29));
    const pipi = bola(0.055, 0xf3a1a1);
    pipi.scale.set(1, 0.6, 0.4);
    pipi.position.set(s * 0.19, -0.08, 0.26);
    kepala.add(pipi);
  }
  badan.add(kepala);
  const lenganKiri = lengan(rupa.baju, -1);
  const lenganKanan = lengan(rupa.baju, 1);
  badan.add(lenganKiri, lenganKanan);
  akar.add(badan);
  return { akar, badan, lenganKiri, lenganKanan, kaki };
}

/** Gerak idle: bernapas pelan; `mengetik` menggerakkan lengan bergantian di depan badan. */
export function gerakOrang(o: Orang, t: number, fase: number, mengetik: boolean) {
  o.badan.position.y = 0.5 + Math.sin(t * 2 + fase) * 0.015;
  if (mengetik) {
    o.lenganKiri.rotation.x = -1.1 + Math.sin(t * 9 + fase) * 0.12;
    o.lenganKanan.rotation.x = -1.1 + Math.sin(t * 9 + fase + Math.PI) * 0.12;
  } else {
    o.lenganKiri.rotation.x = Math.sin(t * 1.5 + fase) * 0.05;
    o.lenganKanan.rotation.x = -Math.sin(t * 1.5 + fase) * 0.05;
  }
}

/** Langkah berjalan: kaki dan lengan berayun berlawanan, badan memantul kecil. */
export function langkahOrang(o: Orang, t: number, fase: number) {
  const a = Math.sin(t * 8 + fase);
  o.kaki[0].rotation.x = a * 0.5;
  o.kaki[1].rotation.x = -a * 0.5;
  o.lenganKiri.rotation.x = -a * 0.45;
  o.lenganKanan.rotation.x = a * 0.45;
  o.badan.position.y = 0.5 + Math.abs(Math.cos(t * 8 + fase)) * 0.04;
}
