import type { Item } from '@/features/records/schemas';

export const TONES = ['rose', 'peach', 'sky', 'lavender', 'mint', 'lemon'] as const;
export type Tone = (typeof TONES)[number] | 'slate';

/** Warna batang tiap nada; disimpan di kolom `color` proyek agar pilihan pengguna bertahan. */
export const TONE_SWATCH: Record<(typeof TONES)[number], string> = {
  rose: '#e8577a',
  peach: '#e8822f',
  sky: '#4a86dc',
  lavender: '#7c67e3',
  mint: '#2fa874',
  lemon: '#d9a514',
};

/**
 * Nada pastel proyek. Proyek yang warnanya dipilih dari palet memakai nada itu; warna lama
 * (bebas) dipetakan stabil dari id agar kartu proyek tetap berbeda satu sama lain.
 */
export function projectTone(project?: Item | null): Tone {
  if (!project) return 'slate';
  const color = String(project.data.color || '').toLowerCase();
  const chosen = (Object.keys(TONE_SWATCH) as (typeof TONES)[number][]).find(
    (tone) => TONE_SWATCH[tone] === color,
  );
  if (chosen) return chosen;
  let hash = 0;
  for (const letter of project.id) hash = (hash * 33 + letter.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}
