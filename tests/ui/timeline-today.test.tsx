import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TaskTimeline } from '@/features/tasks/TaskTimeline';
import { today } from '@/lib/date';
vi.mock('@/lib/client', () => ({ api: vi.fn() }));
afterEach(cleanup);
it('Hari ini mengatur awal linimasa ke tanggal Jakarta hari ini', () => {
  render(<TaskTimeline items={[]} workspace={{}} refresh={async () => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /^Hari ini$/ }));
  expect((screen.getByLabelText('Mulai') as HTMLInputElement).value).toBe(today());
});
it('Gantt layar penuh berada di body dan tetap tersedia setelah diputar', () => {
  const { container } = render(<TaskTimeline items={[]} workspace={{}} refresh={async () => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Layar Penuh' }));
  const dialog = screen.getByRole('dialog', { name: 'Linimasa Layar Penuh' });
  expect(dialog.parentElement).toBe(document.body);
  expect(container.contains(dialog)).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Putar lanskap' }));
  expect(dialog.classList.contains('is-rotated-landscape')).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Tutup linimasa' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
