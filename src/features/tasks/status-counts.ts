import type { Item } from '../records/schemas';
import { today } from '@/lib/date';

export type TaskTile = 'rencana' | 'proses' | 'terlambat' | 'selesai';

/** Jumlah tugas per keadaan; "terlambat" = belum selesai/batal dan tenggatnya sudah lewat. */
export function countTaskStates(rows: Item[], date = today()): Record<TaskTile, number> {
  const open = (status: unknown) => status !== 'selesai' && status !== 'dibatalkan';
  return {
    rencana: rows.filter((row) => row.data.status === 'rencana').length,
    proses: rows.filter((row) => row.data.status === 'proses').length,
    terlambat: rows.filter(
      (row) => open(row.data.status) && Boolean(row.data.due_date) && String(row.data.due_date) < date,
    ).length,
    selesai: rows.filter((row) => row.data.status === 'selesai').length,
  };
}
