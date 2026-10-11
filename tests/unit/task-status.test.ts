import { describe, expect, it } from 'vitest';
import {
  isActiveTask,
  isClosedTask,
  selectTaskStatus,
  taskStatusChange,
  toggleTaskStatus,
} from '@/lib/task-status';

describe('aturan status tugas', () => {
  it('mulai mengerjakan mengubah rencana menjadi proses tanpa tanggal selesai', () => {
    expect(taskStatusChange('start', { completedAt: '2026-10-02' })).toEqual({
      status: 'proses',
      completed_at: '',
    });
  });

  it('menandai selesai mengisi tanggal selesai', () => {
    expect(taskStatusChange('complete', { completedAt: '2026-10-02' })).toEqual({
      status: 'selesai',
      completed_at: '2026-10-02',
    });
  });

  it('membuka kembali mengosongkan tanggal selesai', () => {
    expect(taskStatusChange('reopen')).toEqual({ status: 'rencana', completed_at: '' });
    expect(taskStatusChange('reopen', { reopenStatus: 'proses' })).toEqual({
      status: 'proses',
      completed_at: '',
    });
  });

  it('membatalkan tidak tampil sebagai selesai', () => {
    expect(taskStatusChange('cancel')).toEqual({ status: 'dibatalkan', completed_at: '' });
  });

  it('centang pada tugas dibatalkan membuka kembali, bukan menandai selesai', () => {
    expect(toggleTaskStatus('dibatalkan')).toEqual({ status: 'rencana', completed_at: '' });
    expect(toggleTaskStatus('selesai')).toEqual({ status: 'rencana', completed_at: '' });
  });

  it('centang pada tugas aktif menandai selesai dengan tanggal yang diberikan', () => {
    expect(toggleTaskStatus('proses', { completedAt: '2026-10-02' })).toEqual({
      status: 'selesai',
      completed_at: '2026-10-02',
    });
  });

  it('pemilihan status eksplisit mengikuti aturan domain', () => {
    expect(selectTaskStatus('proses')).toEqual({ status: 'proses', completed_at: '' });
    expect(selectTaskStatus('dibatalkan')).toEqual({ status: 'dibatalkan', completed_at: '' });
    expect(selectTaskStatus('rencana')).toEqual({ status: 'rencana', completed_at: '' });
    expect(selectTaskStatus('selesai', { completedAt: '2026-10-02' })).toEqual({
      status: 'selesai',
      completed_at: '2026-10-02',
    });
  });

  it('status selesai dan dibatalkan dianggap tertutup', () => {
    expect(isClosedTask('selesai')).toBe(true);
    expect(isClosedTask('dibatalkan')).toBe(true);
    expect(isClosedTask('proses')).toBe(false);
    expect(isActiveTask('rencana')).toBe(true);
    expect(isActiveTask('dibatalkan')).toBe(false);
  });
});
