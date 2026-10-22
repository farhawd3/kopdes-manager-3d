import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PemilihTampilan } from '@/components/ui/PemilihTampilan';
import { ThemeProvider } from '@/lib/ThemeContext';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('lima aksen tampil sebagai radiogroup dan panah berpindah pilihan', () => {
  render(
    <ThemeProvider>
      <PemilihTampilan />
    </ThemeProvider>,
  );
  const ungu = screen.getByRole('radio', { name: 'Ungu' });
  expect(ungu.getAttribute('aria-checked')).toBe('true');
  expect(screen.getAllByRole('radio')).toHaveLength(5);

  fireEvent.keyDown(ungu, { key: 'ArrowRight' });
  expect(screen.getByRole('radio', { name: 'Biru' }).getAttribute('aria-checked')).toBe('true');
  expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Biru' }));
  expect(localStorage.getItem('hub-aksen')).toBe('biru');

  fireEvent.keyDown(screen.getByRole('radio', { name: 'Biru' }), { key: 'ArrowLeft' });
  expect(screen.getByRole('radio', { name: 'Ungu' }).getAttribute('aria-checked')).toBe('true');
});

it('segmen tema berganti terang dan gelap tanpa ikut mengubah aksen', () => {
  render(
    <ThemeProvider>
      <PemilihTampilan />
    </ThemeProvider>,
  );
  fireEvent.click(screen.getByRole('radio', { name: 'Magenta' }));
  fireEvent.click(screen.getByRole('button', { name: 'Gelap' }));
  expect(localStorage.getItem('hub-theme')).toBe('dark');
  expect(localStorage.getItem('hub-aksen')).toBe('magenta');
  expect(screen.getByRole('button', { name: 'Gelap' }).getAttribute('aria-pressed')).toBe('true');
  expect(document.documentElement.dataset.aksen).toBe('magenta');

  fireEvent.click(screen.getByRole('button', { name: 'Terang' }));
  expect(localStorage.getItem('hub-theme')).toBe('light');
  expect(screen.getByRole('button', { name: 'Terang' }).getAttribute('aria-pressed')).toBe('true');
});
