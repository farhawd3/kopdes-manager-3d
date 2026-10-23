import { options, references } from './catalog';
import type { Entity } from './schemas';
import { MONEY_FIELDS } from './related';

// Jenis isian tanpa Zod, agar daftar dan kartu tidak ikut memuat skema validasi.
export type FieldKind =
  | 'text'
  | 'longtext'
  | 'date'
  | 'time'
  | 'money'
  | 'integer'
  | 'score'
  | 'choice'
  | 'ref'
  | 'boolean'
  | 'link'
  | 'color'
  | 'assignee'
  | 'subtasks'
  | 'dependencies';

const LONG = ['description', 'notes', 'agenda', 'minutes', 'mitigation', 'items', 'reason', 'evidence', 'follow_up', 'physical', 'equipment', 'sop', 'goal', 'participants'];
const TIMES = ['time', 'recurrence_time', 'arrival_time', 'check_in_time', 'check_out_time'];
const INTEGERS = ['quantity', 'book_quantity', 'minimum_quantity', 'counted_quantity', 'transactions', 'duration'];
const SCORES = ['probability', 'impact', 'influence', 'interest'];

/** Jenis isian ditentukan dari nama kolom dan katalog, agar formulir semua catatan seragam. */
export function fieldKind(entity: Entity, field: string): FieldKind {
  if (field === 'subtasks') return 'subtasks';
  if (field === 'dependencies') return 'dependencies';
  if (references[field]) return 'ref';
  if (field === 'assignee' && entity !== 'stock-counts') return 'assignee';
  if (field === 'required') return 'boolean';
  if (field === 'color') return 'color';
  if (field === 'link' || field === 'meeting_url') return 'link';
  if (MONEY_FIELDS.includes(field)) return 'money';
  if (SCORES.includes(field)) return 'score';
  if (INTEGERS.includes(field)) return 'integer';
  if (TIMES.includes(field)) return 'time';
  if (field === 'date' || field.endsWith('_date') || field === 'last_contact') return 'date';
  if (options[`${entity}.${field}`] || options[field]) return 'choice';
  if (LONG.includes(field)) return 'longtext';
  return 'text';
}

export const choicesFor = (entity: Entity, field: string) => options[`${entity}.${field}`] ?? options[field] ?? [];
