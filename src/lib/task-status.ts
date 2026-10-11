/**
 * Satu sumber aturan status tugas (`work-items`).
 *
 * Tampilan daftar, papan, kalender, Harian, Hari Ini, dan laci detail memakai
 * fungsi ini agar `status` dan `completed_at` selalu berubah bersama, bukan
 * ditulis ulang dengan aturan berbeda di tiap tampilan.
 */
import { today } from '@/lib/date';

export type TaskStatus = 'rencana' | 'proses' | 'selesai' | 'dibatalkan';

/** Status akhir: tugas tidak lagi dianggap pekerjaan aktif. */
const CLOSED: TaskStatus[] = ['selesai', 'dibatalkan'];

/** Tugas selesai atau dibatalkan tidak dihitung sebagai pekerjaan aktif. */
export function isClosedTask(status: unknown): boolean {
  return CLOSED.includes(status as TaskStatus);
}

/** Tugas aktif: masih rencana atau sedang proses. */
export function isActiveTask(status: unknown): boolean {
  return !isClosedTask(status);
}

export type TaskAction = 'plan' | 'start' | 'complete' | 'reopen' | 'cancel';

export type TaskStatusChange = {
  status: TaskStatus;
  completed_at: string;
};

/**
 * Perubahan status tugas yang diizinkan:
 *
 * | Aksi       | Hasil                                                           |
 * |------------|-----------------------------------------------------------------|
 * | `plan`     | aktif → `rencana`; tanggal selesai dikosongkan                  |
 * | `start`    | aktif → `proses`; tanggal selesai dikosongkan                   |
 * | `complete` | aktif → `selesai`; tanggal selesai diisi                        |
 * | `reopen`   | `selesai`/`dibatalkan` → `rencana` (atau `proses` bila diminta) |
 * | `cancel`   | aktif → `dibatalkan`; tanggal selesai dikosongkan               |
 */
export function taskStatusChange(
  action: TaskAction,
  options: { completedAt?: string; reopenStatus?: 'rencana' | 'proses' } = {},
): TaskStatusChange {
  const completedAt = options.completedAt || today();
  switch (action) {
    case 'complete':
      return { status: 'selesai', completed_at: completedAt };
    case 'reopen':
      return { status: options.reopenStatus || 'rencana', completed_at: '' };
    case 'cancel':
      return { status: 'dibatalkan', completed_at: '' };
    case 'start':
      return { status: 'proses', completed_at: '' };
    case 'plan':
      return { status: 'rencana', completed_at: '' };
  }
}

/**
 * Aksi centang: tugas aktif ditandai selesai, tugas selesai **atau dibatalkan**
 * dibuka kembali menjadi rencana. Tugas yang dibatalkan tidak boleh tampil
 * sebagai selesai hanya karena kotak centangnya diklik.
 */
export function toggleTaskStatus(
  current: unknown,
  options: { completedAt?: string } = {},
): TaskStatusChange {
  return isClosedTask(current)
    ? taskStatusChange('reopen', options)
    : taskStatusChange('complete', options);
}

/**
 * Pemilihan status eksplisit dari kontrol daftar/detail atau ubah massal.
 * Tanggal selesai yang sudah ada dipertahankan supaya memilih ulang "Selesai"
 * tidak menggeser riwayat penyelesaian.
 */
export function selectTaskStatus(
  next: TaskStatus,
  options: { completedAt?: string } = {},
): TaskStatusChange {
  if (next === 'selesai') return taskStatusChange('complete', options);
  if (next === 'proses') return taskStatusChange('start');
  if (next === 'dibatalkan') return taskStatusChange('cancel');
  return taskStatusChange('plan');
}
