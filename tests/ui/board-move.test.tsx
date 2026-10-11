import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ScrumBoardView } from '@/features/tasks/ScrumBoardView';
import { api } from '@/lib/client';
import { today } from '@/lib/date';
vi.mock('@/lib/client', () => ({ api: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const task = {
  id: 'task',
  created_at: '',
  updated_at: '',
  data: { title: 'Periksa rak', status: 'rencana', due_date: today() },
};
it('alternatif tanpa drag menyelesaikan tugas dengan tanggal selesai domain', async () => {
  vi.mocked(api).mockResolvedValue({});
  const refresh = vi.fn().mockResolvedValue(undefined),
    open = vi.fn();
  render(
    <ScrumBoardView
      tasks={[{ ...task, data: { ...task.data, status: 'proses' } }]}
      workspace={{}}
      onOpenTask={open}
      onCreateTask={vi.fn()}
      onRefresh={refresh}
    />,
  );
  expect(screen.queryByRole('listbox')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Tandai tugas selesai' }));
  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(api).toHaveBeenCalledWith('work-items', {
    id: 'task',
    data: { ...task.data, status: 'selesai', completed_at: today() },
  });
  expect(open).not.toHaveBeenCalled();
});
it('gagal memindahkan tetap menampilkan kartu dan pesan galat', async () => {
  vi.mocked(api).mockRejectedValue(new Error('Koneksi terputus'));
  const refresh = vi.fn();
  render(
    <ScrumBoardView
      tasks={[task]}
      workspace={{}}
      onOpenTask={vi.fn()}
      onCreateTask={vi.fn()}
      onRefresh={refresh}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Mulai kerjakan tugas ini' }));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Koneksi terputus'));
  expect(screen.getByText('Periksa rak')).toBeTruthy();
  expect(refresh).not.toHaveBeenCalled();
});
