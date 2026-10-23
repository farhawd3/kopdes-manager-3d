import type { Tone } from './tones';

const normal = (text: unknown) =>
  String(text || '')
    .trim()
    .toLocaleLowerCase('id');
/** Penanggung jawab cocok bila namanya persis sama (huruf besar/kecil dan spasi tepi diabaikan). */
export const sameName = (text: unknown, name: string) =>
  normal(text) !== '' && normal(text) === normal(name);
/** Nama tercantum di daftar peserta (dipisah koma, titik koma, baris baru atau "dan"). */
export const listedIn = (text: unknown, name: string) =>
  String(text || '')
    .split(/[,;\n]|\s+dan\s+/i)
    .some((part) => sameName(part, name));

const PERSON_TONES: Tone[] = ['lavender', 'sky', 'mint', 'peach', 'rose', 'lemon'];

/** Nada avatar tetap per nama: orang yang sama selalu berwarna sama di semua halaman. */
export function personTone(name: string): Tone {
  let hash = 0;
  for (const letter of name.trim().toLowerCase()) hash = (hash * 31 + letter.charCodeAt(0)) >>> 0;
  return PERSON_TONES[hash % PERSON_TONES.length];
}

/** Dua huruf awal nama untuk avatar; "?" bila nama kosong. */
export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('') || '?'
  );
}
