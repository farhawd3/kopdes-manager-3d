import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { TaskCalendar } from '@/features/tasks/TaskCalendar';
import { today } from '@/lib/date';
import type { Item } from '@/features/records/schemas';
afterEach(cleanup);
it('pindah tahun dan kembali ke hari ini tanpa kehilangan agenda', () => {
  const date = today();
  const item = {
    id: 'task-1',
    created_at: '',
    updated_at: '',
    data: { title: 'Periksa dokumen', due_date: date, status: 'proses' },
  } as Item;
  render(
    <TaskCalendar
      items={[item]}
      render={(row) => <p key={row.id}>Detail {String(row.data.title)}</p>}
    />,
  );
  fireEvent.change(screen.getByLabelText('Bulan kalender'), { target: { value: '2026-12' } });
  fireEvent.click(screen.getByRole('button', { name: 'Bulan berikutnya' }));
  expect((screen.getByLabelText('Bulan kalender') as HTMLInputElement).value).toBe('2027-01');
  fireEvent.click(screen.getByRole('button', { name: 'Bulan sebelumnya' }));
  expect((screen.getByLabelText('Bulan kalender') as HTMLInputElement).value).toBe('2026-12');
  fireEvent.click(screen.getByRole('button', { name: 'Hari ini' }));
  expect(screen.getByText('Detail Periksa dokumen')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Semua tanggal' })).toBeTruthy();
}, 15000);
it('menjelaskan bulan kosong', () => {
  render(<TaskCalendar items={[]} render={() => null} />);
  expect(screen.getByText('Belum ada tugas bulan ini.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Hari ini' }));
  expect(screen.getByText('Tidak ada tugas pada tanggal ini.')).toBeTruthy();
});

it('menampilkan indikator titik tugas mobile dan ringkasan info agenda', () => {
  const date = today();
  const task1 = {
    id: 't-1',
    created_at: '',
    updated_at: '',
    data: { title: 'Tugas Penting', due_date: date, status: 'proses', priority: 'tinggi' },
  } as Item;
  const task2 = {
    id: 't-2',
    created_at: '',
    updated_at: '',
    data: { title: 'Tugas Mendesak', due_date: date, status: 'rencana', priority: 'mendesak' },
  } as Item;

  const { container } = render(
    <TaskCalendar
      items={[task1, task2]}
      render={(row) => <div key={row.id}>{String(row.data.title)}</div>}
    />,
  );

  // Check mobile dots are rendered in the cell
  const dotsContainer = container.querySelector('.calendar-mobile-dots');
  expect(dotsContainer).toBeTruthy();
  expect(container.querySelector('.cal-mobile-dot.dot-high')).toBeTruthy();
  expect(container.querySelector('.cal-mobile-dot.dot-urgent')).toBeTruthy();

  // Select today
  fireEvent.click(screen.getByRole('button', { name: 'Hari ini' }));
  expect(screen.getAllByText('2 catatan').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Tugas Penting').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Tugas Mendesak').length).toBeGreaterThan(0);
});
