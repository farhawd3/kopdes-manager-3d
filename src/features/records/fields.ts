import { z } from 'zod';
import { catalog } from './catalog';
import { schemas, type Entity } from './schemas';
import { today } from '@/lib/date';

export { fieldKind, choicesFor, type FieldKind } from './fields-meta';
import { fieldKind } from './fields-meta';

type Shape = Record<string, z.ZodTypeAny>;
const shapeOf = (entity: Entity) => (schemas[entity] as unknown as z.ZodObject<Shape>).shape;

/** Kolom wajib = kolom yang skemanya menolak nilai kosong. */
export function isRequired(entity: Entity, field: string): boolean {
  const schema = shapeOf(entity)[field];
  return Boolean(schema) && !schema.safeParse(undefined).success && !schema.safeParse('').success;
}

/** Nilai awal formulir baru: bawaan skema, tanggal hari ini untuk kolom tanggal wajib, lalu isian dari tautan. */
export function initialValues(entity: Entity, prefill: Record<string, unknown> = {}): Record<string, unknown> {
  const shape = shapeOf(entity);
  const values: Record<string, unknown> = {};
  for (const field of catalog[entity].fields) {
    const parsed = shape[field]?.safeParse(undefined);
    if (parsed?.success && parsed.data !== undefined) values[field] = parsed.data;
    else if (fieldKind(entity, field) === 'date' && isRequired(entity, field)) values[field] = today();
    else values[field] = fieldKind(entity, field) === 'boolean' ? false : '';
  }
  return { ...values, ...prefill };
}

/** Pesan galat Zod per kolom: { kolom: pesan }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '');
    if (!result[field]) result[field] = issue.message === 'Required' ? 'Wajib diisi' : issue.message;
  }
  return result;
}

// Pesan galat formulir dalam bahasa Indonesia; pesan khusus di skema tetap dipakai apa adanya.
z.setErrorMap((issue, context) => {
  switch (issue.code) {
    case 'invalid_type':
      return { message: ['undefined', 'null', 'nan'].includes(issue.received) ? 'Wajib diisi' : 'Isian tidak sah' };
    case 'too_small':
      return {
        message:
          issue.type === 'string'
            ? Number(issue.minimum) <= 1
              ? 'Wajib diisi'
              : `Minimal ${issue.minimum} karakter`
            : issue.type === 'array'
              ? `Minimal ${issue.minimum} butir`
              : `Minimal ${issue.minimum}`,
      };
    case 'too_big':
      return { message: issue.type === 'string' ? `Maksimal ${issue.maximum} karakter` : `Maksimal ${issue.maximum}` };
    case 'invalid_enum_value':
      return { message: 'Pilih salah satu pilihan' };
    case 'invalid_string':
      return { message: issue.validation === 'url' ? 'Tautan tidak sah' : issue.validation === 'uuid' ? 'Pilih catatan' : 'Format tidak sesuai' };
    case 'invalid_union':
      return { message: 'Isian tidak sah' };
    case 'unrecognized_keys':
      return { message: 'Ada kolom yang tidak dikenal' };
    default:
      return { message: context.defaultError };
  }
});
