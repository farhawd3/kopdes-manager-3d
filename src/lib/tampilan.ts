export const AKSEN = [
  { id: 'ungu', label: 'Ungu' },
  { id: 'biru', label: 'Biru' },
  { id: 'hijau', label: 'Hijau' },
  { id: 'oranye', label: 'Oranye' },
  { id: 'magenta', label: 'Magenta' },
] as const;

export type Aksen = (typeof AKSEN)[number]['id'];
export type Tema = 'light' | 'dark';

export const AKSEN_BAWAAN: Aksen = 'ungu';
export const TEMA_BAWAAN: Tema = 'light';
export const KUNCI_AKSEN = 'hub-aksen';
export const KUNCI_TEMA = 'hub-theme';

const daftarAksen = new Set<string>(AKSEN.map((aksen) => aksen.id));

/** Nilai tak dikenal (localStorage lama atau rusak) jatuh ke bawaan, bukan menebak. */
export function aksenValid(nilai: string | null | undefined): Aksen {
  return nilai && daftarAksen.has(nilai) ? (nilai as Aksen) : AKSEN_BAWAAN;
}

export function temaValid(nilai: string | null | undefined): Tema {
  return nilai === 'dark' ? 'dark' : TEMA_BAWAAN;
}

function baca(kunci: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(kunci);
  } catch {
    return null;
  }
}

function simpan(kunci: string, nilai: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(kunci, nilai);
  } catch {
    // Mode privat dapat menolak penyimpanan; pilihan tetap berlaku di sesi ini.
  }
}

export function bacaAksen(): Aksen {
  return aksenValid(baca(KUNCI_AKSEN));
}

export function simpanAksen(nilai: string): Aksen {
  const aksen = aksenValid(nilai);
  simpan(KUNCI_AKSEN, aksen);
  return aksen;
}

export function bacaTema(): Tema {
  return temaValid(baca(KUNCI_TEMA));
}

export function simpanTema(nilai: string): Tema {
  const tema = temaValid(nilai);
  simpan(KUNCI_TEMA, tema);
  return tema;
}
