import template from './legacy-plan.json';
import { addDays } from '@/lib/date';
import { schemas, type Entity } from '@/features/records/schemas';
export function buildPlan(start: string, uuid: () => string) {
  const result: { id: string; entity: Entity; data: Record<string, unknown> }[] = [];
  const add = (entity: Entity, data: unknown) => {
    const id = uuid();
    result.push({ id, entity, data: schemas[entity].parse(data) });
    return id;
  };
  const streams = Object.fromEntries(
    [
      ['LEG', 'Legalitas'],
      ['KEL', 'Kelembagaan'],
      ['FIS', 'Gerai & fisik'],
      ['SDM', 'SDM & pelatihan'],
      ['MIT', 'Kemitraan & pemasok'],
      ['SIS', 'Sistem & SOP'],
      ['KOM', 'Komunikasi & laporan'],
    ].map(([code, title]) => [code, add('workstreams', { code, title })]),
  );
  const milestones = template.milestones.map((item) => ({
    ...item,
    id: add('milestones', {
      title: item.title,
      due_date: addDays(start, item.day - 1),
      workstream_id: streams.KEL,
    }),
  }));
  for (const task of template.tasks) {
    add('work-items', {
      title: task.title,
      workstream_id: streams[task.code],
      milestone_id: milestones.find((item) => item.day >= task.day)?.id || '',
      start_date: start,
      due_date: addDays(start, task.day - 1),
    });
    add('checklist', {
      title: task.title,
      workstream_id: streams[task.code],
      required: task.required,
    });
  }
  for (const title of [
    'Kantor koperasi',
    'Kios sembako',
    'Simpan pinjam',
    'Klinik desa',
    'Apotek desa',
    'Pergudangan / cold storage',
    'Logistik',
  ]) {
    const id = add('units', { title, kind: title });
    for (const [dimension, label] of [
      ['legalitas', 'Legalitas dan izin ditinjau'],
      ['fisik', 'Kondisi fisik dan keselamatan diperiksa'],
      ['sdm', 'Petugas ditunjuk dan dilatih'],
      ['sop', 'SOP disetujui pengurus'],
      ['sistem', 'Sistem kerja diuji'],
    ])
      add('checklist', { title: label, unit_id: id, workstream_id: streams.FIS, dimension });
  }
  return result;
}
