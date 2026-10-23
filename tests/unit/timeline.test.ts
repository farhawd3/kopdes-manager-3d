import { afterEach, describe, expect, it, vi } from 'vitest';
import { timelineBar, shiftSchedule, scheduleConflicts } from '@/lib/timeline';
import { schemas } from '@/features/records/schemas';
import { today, addDays } from '@/lib/date';
const mocked = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/client', () => ({ api: mocked.api }));
afterEach(() => {
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
});
