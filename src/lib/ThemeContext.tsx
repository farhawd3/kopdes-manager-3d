'use client';
import { createContext, useContext, useEffect } from 'react';
import { usePreference } from './usePreference';
import { AKSEN_BAWAAN, KUNCI_AKSEN, KUNCI_TEMA, TEMA_BAWAAN, aksenValid, temaValid } from './tampilan';
import type { Aksen, Tema } from './tampilan';

export type { Aksen, Tema } from './tampilan';

const ThemeContext = createContext<{
  theme: Tema;
  preference: Tema;
  setTheme: (value: Tema) => void;
  toggleTheme: () => void;
  accent: Aksen;
  setAccent: (value: Aksen) => void;
}>({
  theme: TEMA_BAWAAN,
  preference: TEMA_BAWAAN,
  setTheme: () => {},
  toggleTheme: () => {},
  accent: AKSEN_BAWAAN,
  setAccent: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [density] = usePreference('hub-density', 'comfortable');
  const [motion] = usePreference('hub-motion', 'system');
  const [navStyle] = usePreference('hub-nav-style', 'soft');
  useEffect(() => {
    document.documentElement.dataset.density = density === 'compact' ? 'compact' : 'comfortable';
    document.documentElement.dataset.motion = motion === 'minimal' ? 'minimal' : 'system';
    document.documentElement.dataset.navStyle = navStyle === 'ink' ? 'ink' : 'soft';
  }, [density, motion, navStyle]);

  const [stored, setStored] = usePreference(KUNCI_TEMA, TEMA_BAWAAN);
  const [storedAccent, setStoredAccent] = usePreference(KUNCI_AKSEN, AKSEN_BAWAAN);
  const preference = temaValid(stored);
  const accent = aksenValid(storedAccent);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', preference === 'dark');
    document.documentElement.setAttribute('data-theme', preference);
    document.documentElement.style.colorScheme = preference;
  }, [preference]);

  useEffect(() => {
    document.documentElement.setAttribute('data-aksen', accent);
  }, [accent]);

  return (
    <ThemeContext.Provider
      value={{
        theme: preference,
        preference,
        setTheme: (value: Tema) => setStored(temaValid(value)),
        toggleTheme: () => setStored(preference === 'dark' ? 'light' : 'dark'),
        accent,
        setAccent: (value: Aksen) => setStoredAccent(aksenValid(value)),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
