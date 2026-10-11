import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ maybeSingle: vi.fn(), rpc: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ db: () => ({ from: () => { const chain = { select: () => chain, eq: () => chain, maybeSingle: mocks.maybeSingle }; return chain; }, rpc: mocks.rpc }) }));
import { save } from '@/features/records/service';
const projectId = '00000000-0000-4000-8000-000000000101';
beforeEach(() => { vi.resetAllMocks(); });
it('server menolak hubungan proyek yang tidak ditemukan', async () => {
  mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
  await expect(save('work-items', { title: 'Tugas', due_date: '2026-10-04', workstream_id: projectId })).rejects.toThrow('Catatan terkait tidak ditemukan');
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('server menolak tugas baru pada proyek selesai', async () => {
  mocks.maybeSingle.mockResolvedValue({ data: { id: projectId, data: { status: 'selesai' } }, error: null });
  await expect(save('work-items', { title: 'Tugas', due_date: '2026-10-04', workstream_id: projectId })).rejects.toThrow('Buka kembali proyek');
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('server tetap mengizinkan pembaruan tugas historis tanpa membuat salinan', async () => {
  mocks.maybeSingle.mockResolvedValue({ data: { id: projectId, data: { status: 'selesai' } }, error: null });
  mocks.rpc.mockResolvedValue({ data: { id: 'task' }, error: null });
  await save('work-items', { title: 'Tugas', due_date: '2026-10-04', status: 'selesai', recurrence: 'mingguan', workstream_id: projectId }, 'task');
  expect(mocks.rpc).toHaveBeenCalledWith('save_work_item', expect.objectContaining({ record_id: 'task', next_payload: null }));
});
