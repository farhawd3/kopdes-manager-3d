import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TodayView } from '@/features/dashboard/TodayView';
import { api } from '@/lib/client';
import { today } from '@/lib/date';
vi.mock('@/lib/client', () => ({ api: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('undo mengembalikan status sambil mempertahankan perubahan judul terbaru', async () => {
  vi.mocked(api).mockResolvedValue({});
  const task = { id: 'task', created_at: '', updated_at: '', data: { title: 'Periksa rak', status: 'proses', due_date: today(), completed_at: '' } };
  const refresh = vi.fn().mockResolvedValue(undefined);
  const view = render(<TodayView workspace={{ 'work-items': [task] }} refresh={refresh} />);
  fireEvent.click(screen.getByRole('button', { name: 'Tandai selesai: Periksa rak' }));
  await waitFor(() => expect(screen.getByText('Status tugas tersimpan.')).toBeTruthy());
  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  view.rerender(<TodayView workspace={{ 'work-items': [{ ...task, data: { ...task.data, title: 'Periksa rak baru', status: 'selesai', completed_at: today() } }] }} refresh={refresh} />);
  fireEvent.click(screen.getByRole('button', { name: 'Batalkan' }));
  await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
  expect(api).toHaveBeenLastCalledWith('work-items', { id: 'task', data: { ...task.data, title: 'Periksa rak baru' } });
  await waitFor(() => expect(screen.queryByText('Status tugas tersimpan.')).toBeNull());
});
it('gagal menyimpan status tidak menyediakan undo yang mengklaim sukses', async () => {
  vi.mocked(api).mockRejectedValue(new Error('Gagal jaringan'));
  const task = { id: 'task', created_at: '', updated_at: '', data: { title: 'Periksa rak', status: 'rencana', due_date: today() } };
  render(<TodayView workspace={{ 'work-items': [task] }} refresh={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Tandai selesai: Periksa rak' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Gagal jaringan'));
  expect(screen.queryByText('Status tugas tersimpan.')).toBeNull();
});

