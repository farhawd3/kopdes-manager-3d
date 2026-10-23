'use client';
import { toast } from 'sonner';
import type { Item } from '@/features/records/schemas';
import { api } from '@/lib/client';
import { addDays, today } from '@/lib/date';
import { selectTaskStatus, toggleTaskStatus, type TaskStatus } from '@/lib/task-status';
import { formatChoiceLabel } from '@/features/records/catalog';

type Activity = { id: string; user: string; role: string; text: string; created_at: string; type: 'log' | 'comment' | 'status_change' | 'creation' };

/**
 * Simpan perubahan tugas sebagai data utuh (bukan tambalan) dan catat jejaknya di riwayat tugas.
 * Satu jalur simpan untuk Beranda, Daftar, Papan, Kalender, dan laci detail.
 */
export async function saveTask(task: Item, changes: Record<string, unknown>, note?: string, user = 'Manajer') {
  const activities = [...((task.data.activities as Activity[]) || [])];
  if (note)
    activities.push({
      id: crypto.randomUUID(),
      user,
      role: 'Pelaksana utama',
      text: note,
      created_at: new Date().toISOString(),
      type: note.startsWith('menambahkan catatan:') ? 'comment' : 'status_change',
    });
  // Server memvalidasi dengan skema yang sama; di browser cukup gabungkan data utuh.
  const data = { ...task.data, ...changes, activities };
  return api<Item>('work-items', { id: task.id, data });
}

/** Centang selesai / buka lagi dengan tombol Urungkan selama 6 detik. */
export async function toggleTaskDone(task: Item, refresh: () => Promise<void> | void, user?: string) {
  const before = { status: task.data.status, completed_at: task.data.completed_at };
  const change = toggleTaskStatus(task.data.status);
  try {
    await saveTask(task, change, change.status === 'selesai' ? 'menandai selesai' : 'membuka kembali tugas', user);
    await refresh();
    toast(change.status === 'selesai' ? `Selesai: ${String(task.data.title)}` : `Dibuka lagi: ${String(task.data.title)}`, {
      duration: 6000,
      action: {
        label: 'Urungkan',
        onClick: async () => {
          try {
            await saveTask({ ...task, data: { ...task.data, ...change } }, before, 'mengurungkan perubahan status', user);
            await refresh();
          } catch (error) {
            toast.error((error as Error).message);
          }
        },
      },
    });
  } catch (error) {
    toast.error((error as Error).message);
  }
}

export async function setTaskStatus(task: Item, status: TaskStatus, refresh: () => Promise<void> | void, user?: string) {
  if (task.data.status === status) return;
  const before = { status: task.data.status, completed_at: task.data.completed_at };
  const change = selectTaskStatus(status, { completedAt: String(task.data.completed_at || '') || undefined });
  try {
    await saveTask(task, change, `mengubah status menjadi ${formatChoiceLabel(status)}`, user);
    await refresh();
    toast(`Dipindah ke ${formatChoiceLabel(status)}`, {
      action: {
        label: 'Urungkan',
        onClick: async () => {
          await saveTask({ ...task, data: { ...task.data, ...change } }, before, 'mengurungkan perubahan status', user);
          await refresh();
        },
      },
    });
  } catch (error) {
    toast.error((error as Error).message);
  }
}

/** Geser tenggat; tugas terlambat digeser dari hari ini, bukan dari tenggat lamanya. */
export async function postponeTask(task: Item, days: number, refresh: () => Promise<void> | void, user?: string) {
  const current = String(task.data.due_date || today());
  const base = current < today() ? today() : current;
  const due = addDays(base, days);
  const start = String(task.data.start_date || '');
  try {
    await saveTask(task, { due_date: due, start_date: start && start > due ? due : start }, `memindah tenggat ke ${due}`, user);
    await refresh();
    toast(`Tenggat dipindah ke ${new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(due + 'T12:00:00Z'))}`, {
      action: {
        label: 'Urungkan',
        onClick: async () => {
          await saveTask({ ...task, data: { ...task.data, due_date: due } }, { due_date: current, start_date: start }, 'mengurungkan pemindahan tenggat', user);
          await refresh();
        },
      },
    });
  } catch (error) {
    toast.error((error as Error).message);
  }
}

/** Hapus tugas = dibatalkan; riwayatnya tetap tersimpan dan bisa dibuka lagi dari arsip. */
export async function cancelTask(task: Item, refresh: () => Promise<void> | void, user?: string) {
  try {
    await saveTask(task, { status: 'dibatalkan', completed_at: '' }, 'membatalkan tugas', user);
    await refresh();
    toast(`Dibatalkan: ${String(task.data.title)}`, {
      action: {
        label: 'Urungkan',
        onClick: async () => {
          await saveTask({ ...task, data: { ...task.data, status: 'dibatalkan' } }, { status: task.data.status, completed_at: task.data.completed_at }, 'mengurungkan pembatalan', user);
          await refresh();
        },
      },
    });
  } catch (error) {
    toast.error((error as Error).message);
  }
}
