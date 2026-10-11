import { describe, it, expect } from 'vitest';
import { planProgress, taskProgress, readiness, isOverdue } from '@/lib/progress';
import { today, addDays, daysBetween, nextOccurrence } from '@/lib/date';
import { schemas, date } from '@/features/records/schemas';
import { buildPlan } from '../fixtures/legacy-plan';
import { reportSnapshot } from '@/features/reports/report-snapshot';
import { randomUUID } from 'node:crypto';
describe('Rumus yang dipakai semua halaman', () => {
  it('mengeluarkan tugas dibatalkan dari penyebut', () =>
    expect(
      planProgress([{ status: 'selesai' }, { status: 'rencana' }, { status: 'dibatalkan' }]),
    ).toBe(50));
  it('mengembalikan nol untuk rencana kosong', () => expect(planProgress([])).toBe(0));
  it('menghitung subtugas', () =>
    expect(
      taskProgress({
        status: 'proses',
        subtasks: [
          { title: 'A', done: true },
          { title: 'B', done: false },
        ],
      }),
    ).toBe(50));
  it('status selesai berarti 100 persen', () =>
    expect(taskProgress({ status: 'selesai', subtasks: [] })).toBe(100));
  it('kesiapan hanya menghitung item wajib', () =>
    expect(
      readiness([
        { required: true, status: 'selesai' },
        { required: false, status: 'rencana' },
      ]),
    ).toBe(100));
  it('tanpa checklist wajib berarti belum dinilai, bukan siap', () =>
    expect(readiness([])).toBeNull());
  it('tugas selesai tidak terlambat', () =>
    expect(isOverdue({ status: 'selesai', due_date: '2026-09-01' }, '2026-09-30')).toBe(false));
  it('tugas tanpa tenggat tidak masuk daftar terlambat', () =>
    expect(isOverdue({ status: 'rencana', due_date: '' }, '2026-09-30')).toBe(false));
  it('tenggat hari ini bukan terlambat', () =>
    expect(isOverdue({ status: 'rencana', due_date: '2026-09-30' }, '2026-09-30')).toBe(false));
});
describe('Tanggal WIB', () => {
  it('pengulangan bulanan menjepit tanggal akhir bulan', () =>
    expect(nextOccurrence('2026-01-31', 'bulanan')).toBe('2026-02-28'));
  it('pengulangan mingguan melewati tahun', () =>
    expect(nextOccurrence('2026-12-28', 'mingguan')).toBe('2027-01-04'));
  it('memakai hari Jakarta saat UTC masih hari sebelumnya', () =>
    expect(today(new Date('2026-09-30T18:00:00Z'))).toBe('2026-10-01'));
  it('melewati pergantian tahun', () => expect(addDays('2026-12-31', 1)).toBe('2027-01-01'));
  it('menghitung 90 hari inklusif', () =>
    expect(daysBetween('2026-10-01', addDays('2026-10-01', 89)) + 1).toBe(90));
  it('menolak tanggal kalender yang tidak nyata', () =>
    expect(date.safeParse('2026-02-30').success).toBe(false));
});
describe('Validasi domain', () => {
  it('menolak tautan javascript', () =>
    expect(
      schemas.documents.safeParse({ title: 'Izin', link: 'javascript:alert(1)' }).success,
    ).toBe(false));
  it('menolak peluang di atas lima', () =>
    expect(schemas.risks.safeParse({ title: 'Risiko', probability: 6 }).success).toBe(false));
  it('menolak kolom tidak dikenal', () =>
    expect(schemas.units.safeParse({ title: 'Gerai', unknown: true }).success).toBe(false));
  it('mewajibkan tenggat tugas', () =>
    expect(schemas['work-items'].safeParse({ title: 'Tugas' }).success).toBe(false));
});
describe('Template rencana, bukan data operasional palsu', () => {
  const records = buildPlan('2026-10-01', randomUUID);
  it('memuat seluruh 43 tugas dan enam milestone dokumen', () => {
    expect(records.filter((row) => row.entity === 'work-items')).toHaveLength(43);
    expect(records.filter((row) => row.entity === 'milestones')).toHaveLength(6);
  });
  it('memiliki tujuh gerai rencana dan tujuh bidang kerja', () => {
    expect(records.filter((row) => row.entity === 'units')).toHaveLength(7);
    expect(records.filter((row) => row.entity === 'workstreams')).toHaveLength(7);
  });
  it('semua pekerjaan belum selesai', () =>
    expect(
      records
        .filter((row) => row.entity === 'work-items')
        .every((row) => row.data.status === 'rencana'),
    ).toBe(true));
  it('relasi rencana menunjuk ID nyata dalam paket template', () => {
    const ids = new Set(records.map((row) => row.id));
    for (const record of records)
      for (const [key, value] of Object.entries(record.data))
        if (key.endsWith('_id') && value) expect(ids.has(String(value))).toBe(true);
  });
  it('H90 berada pada tanggal mulai ditambah 89 hari', () =>
    expect(records.filter((row) => row.entity === 'milestones').at(-1)?.data.due_date).toBe(
      '2026-12-29',
    ));
});
describe('Laporan', () => {
  it('capaian mengikuti tanggal selesai, bukan tenggat', () => {
    const task = schemas['work-items'].parse({
      title: 'A',
      due_date: '2026-10-15',
      status: 'selesai',
      completed_at: '2026-10-02',
    });
    const result = reportSnapshot(
      { 'work-items': [{ id: randomUUID(), data: task, created_at: '', updated_at: '' }] },
      '2026-10-01',
      '2026-10-07',
    );
    expect(result.completed).toEqual(['A']);
  });
});
