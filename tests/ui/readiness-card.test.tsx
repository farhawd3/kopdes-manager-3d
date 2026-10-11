import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ReadinessRadar } from '@/components/charts/ReadinessRadar';
import { cardWorkspace } from '@/features/qa/popup-fixtures';
import { schemas } from '@/features/records/schemas';
afterEach(cleanup);
it('kesiapan tanpa penilaian mempertahankan teks tanpa radar kosong', () => {
  render(<ReadinessRadar items={[]} />);
  expect(screen.queryByRole('img', { hidden: true })).toBeNull();
  expect(screen.getAllByText('Belum dinilai')).toHaveLength(5);
});
it('fixture penilaian sebagian menampilkan angka yang berasal dari checklist', () => {
  const items = cardWorkspace.checklist!.filter(item => item.data.unit_id === cardWorkspace.units![1].id).map(item => schemas.checklist.parse(item.data));
  render(<ReadinessRadar items={items} />);
  expect(screen.getByRole('img', { hidden: true })).toBeTruthy();
  expect(screen.getAllByText('100%')).toHaveLength(2);
  expect(screen.getAllByText('0%')).toHaveLength(3);
});
