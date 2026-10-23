// Bagian figur orang yang dianimasikan dan geraknya; figur sendiri dibangun di character.ts.
import type { Group } from 'three';

export type PersonRig = {
  root: Group;
  /** Bagian yang dianimasikan: badan untuk bernapas, lengan untuk mengetik/melambai. */
  body: Group;
  leftArm: Group;
  rightArm: Group;
  /** Sendi pinggul kiri/kanan; diputar pada sumbu x untuk melangkah. */
  legs: Group[];
};

/** Gerak idle: bernapas pelan; `typing` menggerakkan lengan bergantian di depan badan. */
export function animateIdle(o: PersonRig, t: number, phase: number, typing: boolean) {
  o.body.position.y = 0.5 + Math.sin(t * 2 + phase) * 0.015;
  if (typing) {
    o.leftArm.rotation.x = -1.1 + Math.sin(t * 9 + phase) * 0.12;
    o.rightArm.rotation.x = -1.1 + Math.sin(t * 9 + phase + Math.PI) * 0.12;
  } else {
    o.leftArm.rotation.x = Math.sin(t * 1.5 + phase) * 0.05;
    o.rightArm.rotation.x = -Math.sin(t * 1.5 + phase) * 0.05;
  }
}

/** Langkah berjalan: kaki dan lengan berayun berlawanan, badan memantul kecil. */
export function animateWalk(o: PersonRig, t: number, phase: number) {
  const a = Math.sin(t * 8 + phase);
  o.legs[0].rotation.x = a * 0.5;
  o.legs[1].rotation.x = -a * 0.5;
  o.leftArm.rotation.x = -a * 0.45;
  o.rightArm.rotation.x = a * 0.45;
  o.body.position.y = 0.5 + Math.abs(Math.cos(t * 8 + phase)) * 0.04;
}
