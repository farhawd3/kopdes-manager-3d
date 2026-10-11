import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DateField, DateInput } from '@/components/ui/DateField';
import { Select } from '@/components/ui/Select';
import { SubtaskToggle } from '@/features/tasks/SubtaskToggle';
import { formatDate } from '@/lib/date';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('kalender membuka ke bawah dan Escape hanya menutup kalender', () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    return {
      top: 600,
      bottom: 650,
      left: 40,
      right: 320,
      width: 280,
      height: 50,
      x: 40,
      y: 600,
      toJSON: () => ({}),
    };
  });
  render(<DateField name="date" label="Tanggal kegiatan" defaultValue="2026-10-03" />);
  const trigger = screen.getByRole('button', { name: 'Pilih tanggal kegiatan' });
  fireEvent.click(trigger);
  const menu = screen.getByRole('group', { name: 'Kalender Tanggal kegiatan' });
  expect(menu.parentElement?.dataset.popoverSide).toBe('below');
  fireEvent.keyDown(menu, { key: 'Escape' });
  expect(screen.queryByRole('group')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect((screen.getByLabelText('Tanggal kegiatan') as HTMLInputElement).value).toBe('2026-10-03');
});

it('dropdown terlihat dapat dipilih dan mengembalikan fokus', () => {
  const onChange = vi.fn();
  render(<Select ariaLabel="Prioritas" options={['Normal', 'Tinggi']} onChange={onChange} />);
  expect(screen.queryByRole('combobox')).toBeNull();
  const trigger = screen.getByRole('button', { name: 'Prioritas: Pilih...' });
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('option', { name: 'Tinggi' }));
  expect(onChange).toHaveBeenCalledWith('Tinggi');
  expect(screen.queryByRole('listbox')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('tanggal bersama menjaga batas pilihan dan nama kolom form', () => {
  const onValueChange = vi.fn();
  render(
    <form>
      <DateInput
        name="start"
        label="Mulai"
        value="2026-10-03"
        min="2026-10-02"
        max="2026-10-05"
        onValueChange={onValueChange}
        required
      />
    </form>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Pilih mulai' }));
  const invalidDay = screen.getByRole('button', { name: formatDate('2026-10-01') });
  expect((invalidDay as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(invalidDay);
  expect(onValueChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: formatDate('2026-10-04') }));
  expect(onValueChange).toHaveBeenCalledWith('2026-10-04');
  expect(new FormData(document.querySelector('form')!).get('start')).toBe('2026-10-03');
  expect(screen.queryByRole('group')).toBeNull();
});

it('subtugas yang sedang disimpan tidak dapat dikirim ulang', () => {
  const onClick = vi.fn();
  render(<SubtaskToggle done={false} title="Periksa berkas" busy onClick={onClick} />);
  const control = screen.getByRole('button', { name: 'Menyimpan: Periksa berkas' });
  expect(control.getAttribute('aria-busy')).toBe('true');
  fireEvent.click(control);
  expect(onClick).not.toHaveBeenCalled();
});
