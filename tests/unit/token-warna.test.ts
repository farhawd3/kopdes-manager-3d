import { readdirSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const css = readFileSync('src/styles/token.css', 'utf8');
const blok = (pemilih: string) => css.split(pemilih + ' {')[1]?.split('\n}')[0] ?? '';
const nilai = (isi: string, nama: string) =>
  isi.match(new RegExp(`--${nama}:\\s*(#[0-9a-fA-F]{6})`))?.[1]?.toLowerCase();
const punya = (isi: string, nama: string) => new RegExp(`--${nama}:`).test(isi);

function luminans(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const kontras = (a: string, b: string) => {
  const [x, y] = [luminans(a), luminans(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const terang = blok(':root');
const gelap = blok(':root.dark');
const aksen = ['ungu', 'biru', 'hijau', 'oranye', 'magenta'] as const;
// Mode gelap mewarisi nilai yang tidak ditimpanya.
const token = (tema: string, nama: string) => nilai(tema, nama) ?? nilai(terang, nama)!;

it('memakai palet netral dan bentuk Ruang Kerja Berwarna', () => {
  expect(nilai(terang, 'bg')).toBe('#f5f6fa');
  expect(nilai(terang, 'panel')).toBe('#ffffff');
  expect(nilai(terang, 'line')).toBe('#e4e7f0');
  expect(nilai(terang, 't1')).toBe('#151829');
  expect(nilai(terang, 't3')).toBe('#646b85');
  expect(nilai(gelap, 'bg')).toBe('#0e1018');
  expect(nilai(gelap, 'panel')).toBe('#161925');
  expect(terang).toMatch(/--r-card:\s*14px/);
  expect(terang).toMatch(/--font-sans:[^;]*Figtree/);
  expect(terang).toMatch(/--shadow-sm:\s*none/);
});

it('teks utama dan redup terbaca di kanvas dan panel kedua tema', () => {
  for (const isi of [terang, gelap]) {
    const nilaiTema = (nama: string) => nilai(isi, nama) ?? nilai(terang, nama)!;
    for (const permukaan of ['panel', 'bg']) {
      const latar = nilaiTema(permukaan);
      for (const tinta of ['t1', 't2', 't3']) {
        expect(kontras(nilaiTema(tinta), latar)).toBeGreaterThanOrEqual(4.5);
      }
    }
  }
});

it('setiap aksen punya lima token dan kontras teks yang cukup di dua tema', () => {
  for (const id of aksen) {
    const terangAksen = blok(`:root[data-aksen='${id}']`);
    const gelapAksen = blok(`:root.dark[data-aksen='${id}']`);
    for (const isi of [terangAksen, gelapAksen]) {
      for (const nama of ['accent', 'accent-h', 'accent-soft', 'accent-ink', 'on-accent']) {
        expect(punya(isi, nama), `${id} · ${nama}`).toBe(true);
      }
    }
    for (const isi of [terangAksen, gelapAksen]) {
      const nilaiAksen = (nama: string) => nilai(isi, nama) ?? nilai(terangAksen, nama)!;
      const on = nilaiAksen('on-accent');
      expect(kontras(on, nilaiAksen('accent')), `${id} on-accent/accent`).toBeGreaterThanOrEqual(4.5);
      expect(kontras(on, nilaiAksen('accent-h')), `${id} on-accent/accent-h`).toBeGreaterThanOrEqual(4.5);
      expect(kontras(nilaiAksen('accent-ink'), nilaiAksen('accent-soft')), `${id} ink/soft`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

it('status, prioritas, dan ruang lengkap dengan teks yang terbaca', () => {
  for (const status of ['rencana', 'proses', 'tunggu', 'selesai']) {
    for (const tema of [terang, gelap]) {
      const latar = token(tema, `status-${status}-bg`);
      const teks = token(tema, `status-${status}-fg`);
      expect(latar).toMatch(/^#[0-9a-f]{6}$/);
      expect(teks).toMatch(/^#[0-9a-f]{6}$/);
      expect(kontras(teks, latar)).toBeGreaterThanOrEqual(4.5);
    }
  }
  for (const prioritas of ['tinggi', 'sedang', 'rendah']) {
    expect(nilai(terang, `prio-${prioritas}`)).toMatch(/^#[0-9a-f]{6}$/);
    expect(nilai(gelap, `prio-${prioritas}`) ?? nilai(terang, `prio-${prioritas}`)).toMatch(/^#[0-9a-f]{6}$/);
  }
  for (const ruang of ['kerja', 'catatan', 'usaha', 'koperasi', 'dunia']) {
    expect(nilai(terang, `ruang-${ruang}`)).toMatch(/^#[0-9a-f]{6}$/);
    expect(punya(gelap, `ruang-${ruang}`) || punya(terang, `ruang-${ruang}`)).toBe(true);
  }
});

it('grafik memakai enam seri berurutan di dua tema', () => {
  for (const isi of [terang, gelap]) {
    for (let i = 1; i <= 6; i++) expect(nilai(isi, `g${i}`)).toMatch(/^#[0-9a-f]{6}$/);
  }
  expect(nilai(gelap, 'g1')).not.toBe(nilai(terang, 'g1'));
});

it('teks putih (--on-accent) hanya dipasang pada isian aksen, bukan permukaan lembut', () => {
  const berkas = [
    'src/styles/dasar.css',
    'src/styles/komponen.css',
    'src/styles/kerangka.css',
    ...readdirSync('src/styles/halaman').map((nama) => `src/styles/halaman/${nama}`),
  ];
  const pelanggaran: string[] = [];
  for (const jalur of berkas) {
    const isiBerkas = readFileSync(jalur, 'utf8');
    for (const [, pemilih, isi] of isiBerkas.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const teksPutih = /(?:^|[;\s])(?:color|--btn-fg):\s*var\(--(?:on-accent|on-brand)\)/.test(isi);
      const isianLemah = /(?:background|--btn-bg)[^;]*var\(--(?:accent-soft|accent-ink|brand-soft|brand-soft-2)\)/.test(isi);
      if (teksPutih && isianLemah) pelanggaran.push(`${jalur}: ${pemilih.trim().split('\n').pop()}`);
    }
  }
  expect(pelanggaran).toEqual([]);
});
