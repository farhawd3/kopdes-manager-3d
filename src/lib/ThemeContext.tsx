'use client';
import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { usePreference } from './usePreference';
export type ThemePreference = 'light' | 'dark' | 'system';
export type ColorStyle = 'lime' | 'peach' | 'lavender' | 'sage' | 'sky' | 'sand';
type Theme = 'light' | 'dark';

export const COLOR_STYLES: {
  id: ColorStyle;
  name: string;
  primary: string;
  companion: string;
  soft: string;
  canvas: string;
  desc: string;
}[] = [
  {
    id: 'sage',
    name: 'Sage',
    primary: '#5E8B7E',
    companion: '#A7C4BC',
    soft: '#E8F1ED',
    canvas: '#F5F8F6',
    desc: 'Hijau lembut seperti taman koperasi',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    primary: '#8D7BB8',
    companion: '#C2B0E2',
    soft: '#EFEBFA',
    canvas: '#F8F7FB',
    desc: 'Lavender lembut seperti ruang rapat',
  },
  {
    id: 'peach',
    name: 'Kayu hangat',
    primary: '#C47D5E',
    companion: '#E6D3BF',
    soft: '#FAF0EB',
    canvas: '#FAF6F2',
    desc: 'Warna kayu dan krem hangat',
  },
  {
    id: 'sky',
    name: 'Biru dunia 3D',
    primary: '#cbd6f4',
    companion: '#d9cdea',
    soft: '#eef1fc',
    canvas: '#eef0f8',
    desc: 'Biru-lavender senada dengan kantor 3D',
  },
  {
    id: 'lime',
    name: 'Hijau daun',
    primary: '#7B9B4B',
    companion: '#C9DC87',
    soft: '#EFF5E4',
    canvas: '#F6F9F2',
    desc: 'Hijau daun dengan permukaan pastel',
  },
  {
    id: 'sand',
    name: 'Batu',
    primary: '#5C6B73',
    companion: '#9DB4C0',
    soft: '#EEF2F4',
    canvas: '#F7F9FA',
    desc: 'Abu-abu lembut dengan aksen biru',
  },
];

const ThemeContext = createContext<{
  theme: Theme;
  preference: ThemePreference;
  setTheme: (value: ThemePreference) => void;
  toggleTheme: () => void;
  colorStyle: ColorStyle;
  setColorStyle: (style: ColorStyle) => void;
}>({
  theme: 'light',
  preference: 'system',
  setTheme: () => {},
  toggleTheme: () => {},
  colorStyle: 'sky',
  setColorStyle: () => {},
});

function subscribe(callback: () => void) {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [density] = usePreference('hub-density', 'comfortable');
  const [motion] = usePreference('hub-motion', 'system');
  const [navStyle] = usePreference('hub-nav-style', 'soft');
  useEffect(() => {
    document.documentElement.dataset.density = density === 'compact' ? 'compact' : 'comfortable';
    document.documentElement.dataset.motion = motion === 'minimal' ? 'minimal' : 'system';
    document.documentElement.dataset.navStyle = navStyle === 'ink' ? 'ink' : 'soft';
  }, [density, motion, navStyle]);
  const [stored, setStored] = usePreference('hub-theme', 'system');
  const [storedColor, setStoredColor] = usePreference('hub-color-style', 'sky');
  const preference: ThemePreference = stored === 'light' || stored === 'dark' ? stored : 'system';
  const colorStyle: ColorStyle = ['lime', 'peach', 'lavender', 'sage', 'sky', 'sand'].includes(
    storedColor,
  )
    ? (storedColor as ColorStyle)
    : 'sky';

  const systemDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
    () => false,
  );
  const theme: Theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme-color', colorStyle);
  }, [colorStyle]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        preference,
        setTheme: setStored,
        toggleTheme: () => setStored(theme === 'dark' ? 'light' : 'dark'),
        colorStyle,
        setColorStyle: (style: ColorStyle) => setStoredColor(style),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
