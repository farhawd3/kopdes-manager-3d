import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Projects } from '@/features/projects/Projects';
import { projectWorkspace } from '@/features/qa/popup-fixtures';
const mocks = vi.hoisted(() => ({ query: '' }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), useSearchParams: () => new URLSearchParams(mocks.query) }));
vi.mock('@/lib/client', () => ({ api: vi.fn() }));
afterEach(() => { cleanup(); mocks.query = ''; localStorage.clear(); });
it('proyek selesai berpindah dari galeri berjalan ke riwayat', () => {
  const first = render(<Projects data={projectWorkspace} refresh={async () => {}} />);
  expect(screen.getByText('Contoh proyek berjalan untuk pemeriksaan')).toBeTruthy();
  expect(screen.queryByText('Contoh proyek selesai dengan tugas historis')).toBeNull();
  first.unmount();
  render(<Projects history data={projectWorkspace} refresh={async () => {}} />);
  expect(screen.getByText('Contoh proyek selesai dengan tugas historis')).toBeTruthy();
  expect(screen.queryByText('Contoh proyek berjalan untuk pemeriksaan')).toBeNull();
});
it('detail proyek selesai tetap menampilkan tugas selesai yang lama', () => {
  mocks.query = 'id=00000000-0000-4000-8000-000000000101';
  render(<Projects history data={projectWorkspace} refresh={async () => {}} />);
  expect(screen.getAllByText('Contoh tugas historis tetap tersimpan').length).toBeGreaterThan(0);
});
