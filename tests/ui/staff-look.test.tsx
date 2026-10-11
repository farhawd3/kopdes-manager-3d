import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Editor } from '@/features/records/Editor';

vi.mock('@/lib/client', () => ({ api: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(cleanup);

it('form Tim mengelompokkan rupa dan kedudukan di bagian Tampilan di Dunia Koperasi', () => {
  render(<Editor entity="staff" workspace={{}} onClose={vi.fn()} onSaved={vi.fn()} />);
  const group = screen.getByText('Tampilan di Dunia Koperasi').closest('details')!;
  for (const label of [
    'Kedudukan',
    'Warna seragam',
    'Penutup kepala',
    'Rambut',
    'Warna kulit',
    'Kacamata',
  ])
    expect(group.textContent).toContain(label);
  const head = screen.getByLabelText('Penutup kepala') as HTMLSelectElement;
  expect(head.value).toBe('belum diisi');
  expect([...head.options].map((o) => o.text)).toContain('Topi KDMP');
  // Kolom lama dunia 3D tidak lagi ditampilkan di form.
  expect(screen.queryByLabelText('Rambut (lama)')).toBeNull();
});
