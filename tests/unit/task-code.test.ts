import { describe, expect, it } from 'vitest';
import { makeTaskCode, makeActivityCode, formatDisplayCode } from '@/features/tasks/task-code';
import { schemas } from '@/features/records/schemas';

describe('Kode tugas dan kegiatan otomatis', () => {
  it('menghasilkan format standar ringkas TGS-xxxx dan KGT-xxxx', () => {
    expect(makeTaskCode('Mengunjungi koperasi', '12345678-0000-0000-0000-000000000000')).toBe(
      'TGS-1234',
    );
    expect(makeActivityCode('Rapat evaluasi', 'abcdef01-0000-0000-0000-000000000000')).toBe(
      'KGT-ABCD',
    );
  });

  it('memformat kode lama yang panjang menjadi format pendek yang rapi', () => {
    expect(formatDisplayCode('MENGU-123456780000', 'work-items')).toBe('TGS-1234');
    expect(formatDisplayCode('RAPAT-ABCDEF010000', 'journal')).toBe('KGT-ABCD');
    expect(formatDisplayCode('', 'journal', '98765432-1111')).toBe('KGT-9876');
  });

  it('menerima dokumen terkait sebagai pilihan tugas', () => {
    const task = schemas['work-items'].parse({
      title: 'Periksa kontrak',
      due_date: '2026-10-02',
      document_id: '12345678-1234-1234-1234-123456789abc',
    });
    expect(task.document_id).toBe('12345678-1234-1234-1234-123456789abc');
  });
});
