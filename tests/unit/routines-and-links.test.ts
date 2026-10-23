import { describe, expect, it } from 'vitest';
import { routineStates, isoWeekday } from '@/features/home/routines';
import { entityHome, recordLink } from '@/components/layout/nav';
import { today } from '@/lib/date';
import type { Item } from '@/features/records/schemas';

const item = (id: string, data: Record<string, unknown>): Item => ({ id, created_at: '', updated_at: '', data });

describe('rutin harian', () => {
  it('hanya rutin aktif pada harinya; urut jam; selesai, terlewat, berikutnya', () => {
    const date = today();
    const day = isoWeekday(date);
    const other = (day % 7) + 1;
    const routines = [
      item('b', { title: 'Siang', time: '13:00', days: [day], active: true }),
      item('a', { title: 'Pagi', time: '07:00', days: [day], active: true }),
      item('c', { title: 'Malam', time: '20:00', days: [day], active: true }),
      item('d', { title: 'Hari lain', time: '09:00', days: [other], active: true }),
      item('e', { title: 'Nonaktif', time: '09:00', days: [day], active: false }),
    ];
    const checks = [item('k', { routine_id: 'a', date })];
    const states = routineStates(routines, checks, date, '15:00');
    expect(states.map((s) => [s.routine.id, s.state])).toEqual([
      ['a', 'done'],
      ['b', 'missed'],
      ['c', 'next'],
    ]);
  });
  it('Senin = 1, Minggu = 7', () => {
    expect(isoWeekday('2026-10-19')).toBe(1);
    expect(isoWeekday('2026-10-25')).toBe(7);
  });
});

describe('tautan catatan', () => {
  it('menunjuk halaman dan tab baru', () => {
    expect(recordLink('work-items', 'x')).toBe('/tasks?task=x');
    expect(recordLink('workstreams', 'x')).toBe('/projects/x');
    expect(recordLink('stock-counts', 'x')).toBe('/goods?tab=counts&record=x');
    expect(entityHome('savings')).toEqual({ page: 'members', tab: 'savings' });
  });
});
