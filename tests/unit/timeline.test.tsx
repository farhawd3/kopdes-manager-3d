import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { timelineBar, shiftSchedule, scheduleConflicts } from '@/lib/timeline';
import { TaskTimeline } from '@/features/tasks/TaskTimeline';
import { NoteContent, ProjectNotes } from '@/features/projects/ProjectNotes';
import { schemas, type Item } from '@/features/records/schemas';
import { today, addDays } from '@/lib/date';
const mocked = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/client', () => ({ api: mocked.api }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const task = (values = {}) => ({
  ...schemas['work-items'].parse({
    title: 'Persiapan',
    start_date: today(),
    due_date: addDays(today(), 3),
    ...values,
  }),
  id: '1',
});
const item = (input: Record<string, unknown>): Item => {
  const data = { ...input };
  delete data.id;
  return { id: '1', data, created_at: '', updated_at: '' };
};
describe('Jadwal fleksibel', () => {
  it('menggeser melintasi tahun tanpa mengubah durasi', () => {
    expect(shiftSchedule({ start_date: '2026-12-30', due_date: '2027-01-03' }, 3)).toEqual({
      start_date: '2027-01-02',
      due_date: '2027-01-06',
    });
  });
  it('resize tidak membuat tenggat sebelum mulai', () => {
    expect(shiftSchedule({ start_date: '2026-10-01', due_date: '2026-10-04' }, -10, true)).toEqual({
      start_date: '2026-10-01',
      due_date: '2026-10-01',
    });
  });
  it('tugas di luar viewport tidak digambar pada ujung grafik', () => {
    expect(
      timelineBar({ start_date: '2027-03-01', due_date: '2027-03-10' }, '2026-10-01', '2026-10-31'),
    ).toBeNull();
  });
  it('tugas lintas rentang dipotong tepat dan ditandai', () => {
    expect(
      timelineBar({ start_date: '2026-09-29', due_date: '2026-10-05' }, '2026-10-01', '2026-10-10'),
    ).toEqual({ left: 0, width: 50, clipped: true });
  });
  it('durasi satu hari tetap mendapat lebar satu hari', () => {
    expect(
      timelineBar({ start_date: '', due_date: '2026-10-05' }, '2026-10-01', '2026-10-10'),
    ).toEqual({ left: 40, width: 10, clipped: false });
  });
  it('mendeteksi konflik finish-to-start dan tidak menggeser prasyarat otomatis', () => {
    expect(
      scheduleConflicts({ ...task({ start_date: '2026-10-03' }), dependencies: ['a'] }, [
        { ...task({ due_date: '2026-10-03' }), id: 'a' },
      ]),
    ).toEqual(['a']);
    expect(
      scheduleConflicts({ ...task({ start_date: '2026-10-04' }), dependencies: ['a'] }, [
        { ...task({ due_date: '2026-10-03' }), id: 'a' },
      ]),
    ).toEqual([]);
  });
  it('perubahan keyboard menunggu Simpan lalu mengirim jadwal, bukan tugas lain', async () => {
    mocked.api.mockResolvedValue({});
    const row = item(task()),
      refresh = vi.fn().mockResolvedValue(undefined);
    render(<TaskTimeline items={[row]} workspace={{ 'work-items': [row] }} refresh={refresh} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /Persiapan,.*Panah kiri/ }), {
      key: 'ArrowRight',
    });
    expect(mocked.api).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Simpan jadwal' }));
    await waitFor(() =>
      expect(mocked.api).toHaveBeenCalledWith('work-items', {
        id: row.id,
        data: expect.objectContaining({
          start_date: addDays(today(), 1),
          due_date: addDays(today(), 4),
        }),
      }),
    );
    expect(refresh).toHaveBeenCalledOnce();
  });
  it('gagal menyimpan tidak mengklaim jadwal tersimpan', async () => {
    mocked.api.mockRejectedValue(new Error('Database tidak terhubung'));
    const row = item(task());
    render(<TaskTimeline items={[row]} workspace={{ 'work-items': [row] }} refresh={vi.fn()} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /Persiapan,.*Panah kiri/ }), {
      key: 'ArrowRight',
      shiftKey: true,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan jadwal' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('Database tidak terhubung'),
    );
    expect(screen.queryByText('Jadwal tersimpan.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Simpan jadwal' })).toBeTruthy();
  });
});
describe('Halaman catatan proyek', () => {
  it('merender struktur catatan tanpa mengeksekusi HTML', () => {
    const { container } = render(
      <NoteContent
        text={
          '## Hasil rapat\n- [x] SOP disepakati\n> Perlu tindak lanjut\n<script>alert(1)</script>'
        }
      />,
    );
    expect(screen.getByRole('heading', { name: 'Hasil rapat' })).toBeTruthy();
    expect(screen.getByLabelText('Selesai')).toBeTruthy();
    expect(container.querySelector('script')).toBeNull();
  });
  it('menyimpan catatan ke proyek yang sama dengan metadata tetap utuh', async () => {
    mocked.api.mockResolvedValue({});
    const row = item(
      schemas.workstreams.parse({ title: 'Operasional', code: 'OPS', notes: 'Sebelum' }),
    );
    render(<ProjectNotes project={row} refresh={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tulis' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Isi catatan proyek' }), {
      target: { value: '## Keputusan\n- Tinjau SOP' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan catatan' }));
    await waitFor(() =>
      expect(mocked.api).toHaveBeenCalledWith('workstreams', {
        id: row.id,
        data: expect.objectContaining({
          title: 'Operasional',
          code: 'OPS',
          notes: '## Keputusan\n- Tinjau SOP',
        }),
      }),
    );
  });
  it('proyek lama mendapat status dan prioritas bawaan', () => {
    expect(schemas.workstreams.parse({ title: 'Proyek lama', code: 'PL' })).toMatchObject({
      status: 'rencana',
      priority: 'normal',
    });
  });
});
