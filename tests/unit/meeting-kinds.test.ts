import { expect, it } from 'vitest';
import { recordOutcomeHref, meetingKindOf } from '@/features/agenda/meeting-kinds';
import { schemas } from '@/features/records/schemas';

const agenda = (data: Record<string, unknown>) => ({ id: 'm1', created_at: '', updated_at: '', data });

it('agenda lama tanpa jenis dianggap rapat; jenis yang dikenal dipakai apa adanya', () => {
  expect(meetingKindOf(agenda({ title: 'Rapat lama' }))).toBe('rapat');
  expect(meetingKindOf(agenda({ title: 'Ke pemasok', jenis: 'kunjungan' }))).toBe('kunjungan');
  expect(meetingKindOf(agenda({ title: 'Aneh', jenis: 'pesta' }))).toBe('rapat');
  expect(schemas.meetings.parse({ title: 'Rapat', date: '2026-10-20' }).jenis).toBe('rapat');
  expect(() => schemas.meetings.parse({ title: 'X', date: '2026-10-20', jenis: 'pesta' })).toThrow();
});

it('Catat hasil membuka form kegiatan yang tertaut ke agenda', () => {
  const url = new URL(recordOutcomeHref(agenda({ title: 'Kunjungan sales' }), '2026-10-20'), 'http://x');
  expect(url.pathname).toBe('/notes');
  expect(Object.fromEntries(url.searchParams)).toEqual({
    new: '1',
    'fill.meeting_id': 'm1',
    'fill.title': 'Hasil: Kunjungan sales',
    'fill.date': '2026-10-20',
  });
});
