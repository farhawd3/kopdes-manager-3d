import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Settings } from '@/features/settings/Settings';
afterEach(cleanup);
it('pengaturan menampilkan identitas profil yang tersimpan', () => {
  render(<Settings refresh={vi.fn()} organization={{ id: 'profile-test', created_at: '', updated_at: '', data: { title: 'Koperasi uji', manager: 'Manajer uji', village: 'Desa uji' } }} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Profil koperasi' }));
  expect(screen.getByRole('heading', { name: 'Koperasi uji' })).toBeTruthy();
  expect(screen.getByText('Manajer: Manajer uji')).toBeTruthy();
  expect(screen.getByText('Desa uji')).toBeTruthy();
});
it('profil kosong tidak menampilkan identitas koperasi yang dikarang', () => {
  render(<Settings refresh={vi.fn()} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Profil koperasi' }));
  expect(screen.getByRole('heading', { name: 'Profil koperasi belum diisi' })).toBeTruthy();
  expect(screen.queryByText(/Badan Hukum Koperasi/)).toBeNull();
});
