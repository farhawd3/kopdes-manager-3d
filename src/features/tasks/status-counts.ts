import type { Item } from '../records/schemas';
import { today } from '@/lib/date';
import { isOverdue } from '@/lib/task-status';

export type TaskTile = 'rencana' | 'proses' | 'terlambat' | 'selesai';

/** Jumlah tugas per keadaan; "terlambat" = belum selesai/batal dan tenggatnya sudah lewat. */
export function countTaskStates(rows: Item[], date = today()): Record<TaskTile, number> {
  return {
    rencana: rows.filter((row) => row.data.status === 'rencana').length,
    proses: rows.filter((row) => row.data.status === 'proses').length,
    terlambat: rows.filter((row) => isOverdue(row.data, date)).length,
    selesai: rows.filter((row) => row.data.status === 'selesai').length,
  };
}
