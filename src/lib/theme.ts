'use client';
import { usePreference } from './use-preference';
import { useEffect } from 'react';

export const ACCENTS = [
  { id: 'lavender', label: 'Lavender', swatch: '#7a66e8' },
  { id: 'sky', label: 'Langit', swatch: '#4f8fe0' },
  { id: 'mint', label: 'Mint', swatch: '#36b37e' },
  { id: 'peach', label: 'Peach', swatch: '#ef8a3c' },
  { id: 'rose', label: 'Mawar', swatch: '#ec6a8a' },
] as const;
export type Accent = (typeof ACCENTS)[number]['id'];
export type Theme = 'light' | 'dark';

export const THEME_KEY = 'kopdes-theme';
export const ACCENT_KEY = 'kopdes-accent';
const DEFAULT_ACCENT: Accent = 'lavender';

export const validAccent = (value: string | null | undefined): Accent =>
  ACCENTS.some((accent) => accent.id === value) ? (value as Accent) : DEFAULT_ACCENT;
export const validTheme = (value: string | null | undefined): Theme =>
  value === 'dark' ? 'dark' : 'light';

/** Dijalankan sebelum render pertama agar tema tidak berkedip; nilai rusak jatuh ke bawaan. */
export const themeBootScript = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('${THEME_KEY}')==='dark'?'dark':'light';var a=localStorage.getItem('${ACCENT_KEY}');if(['lavender','sky','mint','peach','rose'].indexOf(a)<0)a='${DEFAULT_ACCENT}';d.dataset.theme=t;d.dataset.accent=a;d.style.colorScheme=t;}catch(e){}})();`;

export function useTheme() {
  const [storedTheme, setStoredTheme] = usePreference(THEME_KEY, 'light');
  const [storedAccent, setStoredAccent] = usePreference(ACCENT_KEY, DEFAULT_ACCENT);
  const theme = validTheme(storedTheme);
  const accent = validAccent(storedAccent);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.accent = accent;
    root.style.colorScheme = theme;
  }, [theme, accent]);
  return {
    theme,
    accent,
    setTheme: (value: Theme) => setStoredTheme(validTheme(value)),
    setAccent: (value: Accent) => setStoredAccent(validAccent(value)),
  };
}
