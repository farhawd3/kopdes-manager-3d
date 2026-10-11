import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { WorkspaceSearch } from '@/features/workspace/WorkspaceSearch';
import { Projects } from '@/features/projects/Projects';
import { searchWorkspace } from '@/features/workspace/workspace-navigation';
import { pageEntities } from '@/features/workspace/workspace-scope';
import type { Item } from '@/features/records/schemas';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('id=00000000-0000-4000-8000-000000000001'),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
const item = (id: string, data: Record<string, unknown>): Item => ({
  id,
  data,
  created_at: '',
  updated_at: '',
});
afterEach(cleanup);

it('search finds a task by its project and filters before limiting results', () => {
  const workspace = {
    workstreams: [item('project', { title: 'Persiapan gerai' })],
    documents: Array.from({ length: 35 }, (_, index) =>
      item(`doc-${index}`, { title: 'Persiapan gerai' }),
    ),
    'work-items': [item('task', { title: 'Pasang rak', workstream_id: 'project' })],
  };
  const results = searchWorkspace(workspace, 'gerai rak', 'work-items');
  expect(results).toHaveLength(1);
  expect(results[0]).toMatchObject({
    title: 'Pasang rak',
    context: 'Persiapan gerai',
    href: '/tugas?task=task',
  });
  expect(searchWorkspace(workspace, 'gerai', 'work-items')).toHaveLength(1);
});

it('search scopes records and preserves navigation to their source', () => {
  const navigate = vi.fn();
  render(
    <WorkspaceSearch
      workspace={{
        documents: [item('doc', { title: 'Izin gerai' })],
        'work-items': [item('task', { title: 'Periksa izin' })],
      }}
      onNavigate={navigate}
    />,
  );
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'izin' } });
  fireEvent.click(screen.getByRole('button', { name: 'Dokumen' }));
  expect(screen.queryByText('Periksa izin')).toBeNull();
  const result = screen.getByRole('link', { name: /Izin gerai/ });
  expect(result.getAttribute('href')).toContain('record=doc');
  result.addEventListener('click', (event) => event.preventDefault());
  fireEvent.click(result);
  expect(navigate).toHaveBeenCalledOnce();
});

it('search explains when records have not loaded', () => {
  render(<WorkspaceSearch workspace={null} onNavigate={vi.fn()} />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'proyek' } });
  expect(screen.getByText(/Catatan belum dimuat/)).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Proyek' })).toBeTruthy();
});

it('project context follows task links and excludes records from other projects', () => {
  const task = {
    title: 'Periksa rak',
    workstream_id: '00000000-0000-4000-8000-000000000001',
    due_date: '2026-10-05',
    document_id: '00000000-0000-4000-8000-000000000005',
    issue_id: '00000000-0000-4000-8000-000000000007',
    meeting_id: '00000000-0000-4000-8000-000000000009',
  };
  render(
    <Projects
      data={{
        workstreams: [item('00000000-0000-4000-8000-000000000001', { title: 'Gerai', code: 'GR' })],
        'work-items': [
          item('00000000-0000-4000-8000-000000000003', task),
          item('00000000-0000-4000-8000-000000000004', {
            ...task,
            workstream_id: '00000000-0000-4000-8000-000000000002',
            document_id: '00000000-0000-4000-8000-000000000006',
            issue_id: '00000000-0000-4000-8000-000000000008',
            meeting_id: '00000000-0000-4000-8000-000000000010',
          }),
        ],
        documents: [
          item('00000000-0000-4000-8000-000000000005', { title: 'Izin proyek' }),
          item('00000000-0000-4000-8000-000000000006', { title: 'Dokumen lainnya' }),
        ],
        decisions: [
          item('00000000-0000-4000-8000-000000000011', {
            title: 'Keputusan rak',
            meeting_id: '00000000-0000-4000-8000-000000000009',
          }),
          item('00000000-0000-4000-8000-000000000012', {
            title: 'Keputusan lainnya',
            meeting_id: '00000000-0000-4000-8000-000000000010',
          }),
          item('00000000-0000-4000-8000-000000000013', { title: 'Keputusan tanpa rapat' }),
        ],
        issues: [
          item('00000000-0000-4000-8000-000000000007', {
            title: 'Rak belum tiba',
            status: 'terbuka',
          }),
          item('00000000-0000-4000-8000-000000000008', {
            title: 'Kendala lainnya',
            status: 'terbuka',
          }),
        ],
      }}
      refresh={vi.fn()}
    />,
  );
  const documents = document.getElementById('project-documents')!;
  const decisions = document.getElementById('project-decisions')!;
  const issues = document.getElementById('project-obstacles')!;
  expect(within(documents).getByText('Izin proyek')).toBeTruthy();
  expect(within(documents).queryByText('Dokumen lainnya')).toBeNull();
  expect(within(decisions).getByText('Keputusan rak')).toBeTruthy();
  expect(within(decisions).queryByText('Keputusan lainnya')).toBeNull();
  expect(within(decisions).queryByText('Keputusan tanpa rapat')).toBeNull();
  expect(
    within(issues)
      .getByRole('link', { name: /Rak belum tiba/ })
      .getAttribute('href'),
  ).toContain('record=00000000-0000-4000-8000-000000000007');
  expect(within(issues).queryByText('Kendala lainnya')).toBeNull();
  expect(pageEntities('proyek')).toContain('decisions');
});
