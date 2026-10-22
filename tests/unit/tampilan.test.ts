import { beforeEach, expect, it } from 'vitest';
import {
  AKSEN_BAWAAN,
  KUNCI_AKSEN,
  KUNCI_TEMA,
  TEMA_BAWAAN,
  aksenValid,
  bacaAksen,
  bacaTema,
  simpanAksen,
  simpanTema,
  temaValid,
} from '@/lib/tampilan';

beforeEach(() => localStorage.clear());

it('nilai aksen tak dikenal jatuh ke bawaan, bukan menebak', () => {
  expect(aksenValid('lime')).toBe(AKSEN_BAWAAN);
  expect(aksenValid(null)).toBe(AKSEN_BAWAAN);
  expect(aksenValid('')).toBe(AKSEN_BAWAAN);
  expect(aksenValid('magenta')).toBe('magenta');
});

it('tema hanya terang atau gelap dan bawaan terang', () => {
  expect(TEMA_BAWAAN).toBe('light');
  expect(temaValid('system')).toBe('light');
  expect(temaValid('dark')).toBe('dark');
});

it('aksen tersimpan dan dibaca kembali', () => {
  expect(simpanAksen('hijau')).toBe('hijau');
  expect(localStorage.getItem(KUNCI_AKSEN)).toBe('hijau');
  expect(bacaAksen()).toBe('hijau');
  expect(simpanAksen('tidak-ada')).toBe(AKSEN_BAWAAN);
  expect(bacaAksen()).toBe(AKSEN_BAWAAN);
});

it('tema tersimpan dan dibaca kembali', () => {
  expect(simpanTema('dark')).toBe('dark');
  expect(localStorage.getItem(KUNCI_TEMA)).toBe('dark');
  expect(bacaTema()).toBe('dark');
  expect(simpanTema('system')).toBe('light');
  expect(bacaTema()).toBe('light');
});
