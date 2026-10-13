import { expect, it } from 'vitest';
import { parseCsv } from '@/lib/csv';
import { formatDateTime } from '@/lib/date';

it('CSV membaca koma, kutip ganda, apostrof, dan baris baru tanpa menggeser kolom', () => {
  expect(
    parseCsv(
      '\uFEFFtitle,due_date,description\r\n"Rapat, gudang",2026-10-13,"Baris 1\r\nBaris ""dua"""\r\nO\'Neil,2026-10-14,\r\n',
    ),
  ).toEqual([
    { title: 'Rapat, gudang', due_date: '2026-10-13', description: 'Baris 1\r\nBaris "dua"' },
    { title: "O'Neil", due_date: '2026-10-14', description: '' },
  ]);
});
it.each([
  'title,title\na,b',
  'title,\na,b',
  'title,date\na',
  'title\n"belum ditutup',
  'title\n"a"b',
  'title\n',
])('CSV rusak ditolak: %s', (input) => expect(() => parseCsv(input)).toThrow());
it('waktu riwayat berganti tanggal menurut WIB dan aman untuk timestamp rusak', () => {
  expect(formatDateTime('2026-10-12T18:30:00Z')).toContain('13 Okt 2026');
  expect(formatDateTime('2026-10-12T18:30:00Z')).toContain('01.30');
  expect(formatDateTime('rusak')).toBe('—');
  expect(formatDateTime('')).toBe('—');
});
