import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getFollowUps, searchWorkspace } from '@/features/workspace/workspace-navigation';
import { SavedTaskViews } from '@/features/tasks/SavedTaskViews';
import { Editor } from '@/features/records/Editor';
import { Operations } from '@/features/operations/Operations';
import { Records } from '@/features/records/Records';
import { TaskBatchActions } from '@/features/tasks/TaskBatchActions';
import { schemas, type Item } from '@/features/records/schemas';
const mocks = vi.hoisted(() => ({ api: vi.fn(), query: '', replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mocks.query),
  useRouter: () => ({ replace: mocks.replace }),
}));
vi.mock('@/lib/client', () => ({ api: mocks.api }));
const item = (id: string, data: Record<string, unknown>): Item => ({
  id,
  data,
  created_at: '',
  updated_at: '',
});
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  vi.clearAllMocks();
  mocks.query = '';
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('warna proyek baru memakai nilai hex sah dari skema, bukan variabel presentasi CSS', () => {
  const { container } = render(<Editor entity="workstreams" workspace={{}} onClose={vi.fn()} onSaved={vi.fn()} />);
  const color = container.querySelector<HTMLInputElement>('input[type="color"]');
  expect(color?.value.toLowerCase()).toBe(schemas.workstreams.shape.color.parse(undefined).toLowerCase());
});

it('pencarian mencocokkan semua kata dan membuka bagian catatan yang tepat', () => {
  const results = searchWorkspace(
    { decisions: [item('decision', { title: 'Pengadaan gerai', reason: 'Perlu rak baru' })] },
    'RAK gerai',
  );
  expect(results).toHaveLength(1);
  expect(results[0].href).toBe('/rapat?bagian=decisions&record=decision');
  expect(searchWorkspace({}, '')).toEqual([]);
});
it('kontak dari pencarian membuka halaman Mitra & kontak', () => {
  const result = searchWorkspace(
    { stakeholders: [item('kontak', { title: 'Agrinas' })] },
    'agrinas',
  );
  expect(result[0].href).toBe('/mitra?bagian=stakeholders&record=kontak');
});
it('tindak lanjut tidak memasukkan tugas selesai atau selisih opname lama', () => {
  const results = getFollowUps(
    {
      'work-items': [
        item('closed', { title: 'Selesai', status: 'selesai', due_date: '2020-01-01' }),
        item('open', { title: 'Terbuka', status: 'proses', due_date: '2020-01-01' }),
      ],
      'stock-counts': [
        item('old', {
          title: 'Lama',
          item_id: 'item',
          date: '2026-09-01',
          book_quantity: 10,
          counted_quantity: 9,
        }),
        item('new', {
          title: 'Baru',
          item_id: 'item',
          date: '2026-10-01',
          book_quantity: 10,
          counted_quantity: 10,
        }),
      ],
      documents: [item('doc', { title: 'Izin', expires_date: '2026-10-15' })],
    },
    '2026-10-01',
  );
  expect(results.map((row) => row.id)).toEqual(['work-items:open', 'documents:doc']);
});
it('tampilan tersimpan memulihkan seluruh pilihan termasuk status kosong', () => {
  const apply = vi.fn();
  const value = {
    search: 'Rak',
    status: '',
    project: 'p',
    priority: 'tinggi',
    sort: 'due' as const,
    view: 'papan' as const,
    sprint: '',
  };
  render(<SavedTaskViews value={value} onApply={apply} />);
  fireEvent.click(screen.getByText('Tampilan tersimpan'));
  fireEvent.change(screen.getByLabelText('Nama tampilan'), { target: { value: 'Gerai' } });
  fireEvent.click(screen.getByRole('button', { name: 'Simpan tampilan' }));
  fireEvent.click(screen.getByRole('button', { name: 'Gerai' }));
  expect(apply).toHaveBeenCalledWith({ ...value, name: 'Gerai' });
});
it('editor menyimpan draf lokal dan mencegah penutupan ketika pengguna memilih tetap mengedit', () => {
  const close = vi.fn();
  vi.spyOn(window, 'confirm').mockReturnValue(false);
  render(<Editor entity="work-items" workspace={{}} onClose={close} onSaved={vi.fn()} quick />);
  fireEvent.change(screen.getByRole('textbox', { name: /judul/ }), {
    target: { value: 'Periksa rak' },
  });
  expect(sessionStorage.getItem('hub-draft:work-items:new')).toContain('Periksa rak');
  fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
  expect(close).not.toHaveBeenCalled();
});
it('editor mempertahankan prasyarat tugas yang berada di halaman data lain', () => {
  const dependency = 'c0a80101-7a10-4fc2-8ad5-20406e11f101';
  render(
    <Editor
      entity="work-items"
      item={item('c0a80101-7a10-4fc2-8ad5-20406e11f102', {
        title: 'Laporan akhir',
        due_date: '2026-10-09',
        status: 'rencana',
        dependencies: [dependency],
      })}
      workspace={{ 'work-items': [] }}
      onClose={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  const linked = screen.getByLabelText(/Tugas terkait di halaman lain/i) as HTMLInputElement;
  expect(linked.checked).toBe(true);
  expect(linked.value).toBe(dependency);
});
it('aksi beberapa tugas melaporkan hasil sebagian dan tidak mengubah tugas yang gagal', async () => {
  mocks.api.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Koneksi terputus'));
  render(
    <TaskBatchActions
      items={[item('a', { title: 'Satu' }), item('b', { title: 'Dua' })]}
      refresh={vi.fn().mockResolvedValue(undefined)}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Ubah beberapa tugas' }));
  fireEvent.click(screen.getByLabelText('Satu'));
  fireEvent.click(screen.getByLabelText('Dua'));
  fireEvent.change(screen.getByLabelText('Status baru'), { target: { value: 'proses' } });
  fireEvent.click(screen.getByRole('button', { name: 'Terapkan ke 2 tugas' }));
  await waitFor(() =>
    expect(screen.getByRole('status').textContent).toContain(
      '1 tugas diperbarui. Koneksi terputus',
    ),
  );
  expect((screen.getByLabelText('Dua') as HTMLInputElement).checked).toBe(true);
});

it('pintasan buku kas dapat membuka formulir kosong tanpa memvalidasi sebelum diisi', () => {
  mocks.query = 'baru=1&arah=keluar';
  render(<Operations slug="keuangan" data={{ 'cash-entries': [] }} ready refresh={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Simpan' })).toBeTruthy();
  expect(screen.getByRole('dialog')).toBeTruthy();
});
it('menghapus filter URL tetap menampilkan seluruh tugas dan mempertahankan mode tampilan', () => {
  mocks.query = 'status=selesai&view=daftar';
  render(
    <Records
      entity="work-items"
      workspace={{
        'work-items': [
          item('done', {
            title: 'Sudah selesai',
            status: 'selesai',
            due_date: '2026-10-01',
            subtasks: [],
          }),
          item('open', {
            title: 'Masih bekerja',
            status: 'proses',
            due_date: '2026-10-01',
            subtasks: [],
          }),
        ],
      }}
      refresh={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /^Status:/ }));
  fireEvent.click(screen.getByRole('option', { name: /tugas aktif/i }));
  expect(screen.getByText('Masih bekerja')).toBeTruthy();
  expect(mocks.replace).toHaveBeenCalledWith('/tugas?view=daftar');
});
