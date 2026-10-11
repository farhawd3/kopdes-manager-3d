import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/server/auth';
import { sameOrigin, failure, readJson } from '@/lib/server/http';
import { db } from '@/lib/server/db';
import { entityName, schemas } from '@/features/records/schemas';
import { references } from '@/features/records/catalog';
const reportSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200),
    period_start: z.string().date(),
    period_end: z.string().date(),
    created_at: z.string().datetime({ offset: true }),
    snapshot: z
      .object({
        organization: z.string(),
        completed: z.array(z.string()),
        overdue: z.array(z.string()),
        next: z.array(z.string()),
        decisions: z.array(z.string()),
        risks: z.array(z.string()),
        milestones: z.array(z.string()),
        notes: z.string(),
      })
      .strict(),
  })
  .strict();
export async function GET() {
  try {
    await requireSession();
    const { data, error } = await db().from('hub_records').select('*').limit(5001);
    if (error || data.length > 5000)
      throw new Error('Cadangan gagal atau melebihi batas 5.000 catatan.');
    const { data: reports, error: reportError } = await db()
      .from('manager_reports')
      .select('*')
      .limit(5001);
    if (reportError || reports.length > 5000) throw new Error('Cadangan laporan gagal.');
    return NextResponse.json(
      {
        format: 'kopdes-management-web',
        version: 1,
        exported_at: new Date().toISOString(),
        records: data,
        reports,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Disposition': 'attachment; filename="kopdes-backup.json"',
        },
      },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireSession();
    const backup = z
      .object({
        format: z.literal('kopdes-management-web'),
        version: z.literal(1),
        exported_at: z.string().datetime(),
        records: z
          .array(
            z
              .object({
                id: z.string().uuid(),
                entity: z.string(),
                data: z.unknown(),
                recurrence_key: z.string().nullable().optional(),
                created_at: z.string().datetime({ offset: true }),
                updated_at: z.string().datetime({ offset: true }),
              })
              .strict(),
          )
          .max(5000),
        reports: z.array(reportSchema).max(5000),
      })
      .strict()
      .parse(await readJson(request));
    const ids = new Set<string>();
    for (const record of backup.records) {
      const entity = entityName(record.entity);
      if (!entity || ids.has(record.id)) throw new Error('Jenis data atau ID cadangan tidak sah.');
      ids.add(record.id);
      record.data = schemas[entity].parse(record.data);
    }
    if (backup.records.filter((row) => row.entity === 'organization').length !== 1)
      throw new Error('Cadangan harus memiliki tepat satu profil koperasi.');
    for (const record of backup.records) {
      const values = record.data as Record<string, unknown>;
      for (const [field, entity] of Object.entries(references)) {
        if (
          values[field] &&
          !backup.records.some((row) => row.id === values[field] && row.entity === entity)
        )
          throw new Error('Referensi dalam cadangan tidak lengkap.');
      }
      if (record.entity === 'work-items') {
        for (const id of schemas['work-items'].parse(record.data).dependencies)
          if (!backup.records.some((row) => row.id === id && row.entity === 'work-items'))
            throw new Error('Prasyarat dalam cadangan tidak lengkap.');
      }
    }
    const { error } = await db().rpc('restore_manager_data', {
      records: backup.records,
      reports: backup.reports,
    });
    if (error) throw new Error('Pemulihan dibatalkan. Data sebelumnya tetap tersimpan.');
    return NextResponse.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
