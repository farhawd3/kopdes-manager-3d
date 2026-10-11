import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Operations } from '@/features/operations/Operations';
import { bookWorkspace } from '@/features/qa/popup-fixtures';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('buku kas mobile dimulai dengan kartu dan tetap dapat beralih ke tabel', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  render(<Operations slug="keuangan" data={bookWorkspace} ready refresh={async () => {}} draftScope="qa-popup" />);
  expect(screen.queryByRole('table')).toBeNull();
  expect(screen.getByRole('searchbox')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /^Tabel$/ }));
  expect(screen.getByRole('table')).toBeTruthy();
});
