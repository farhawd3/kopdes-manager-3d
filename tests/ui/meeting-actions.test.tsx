import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Records } from '@/features/records/Records';
import { popupWorkspace } from '@/features/qa/popup-fixtures';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock('@/lib/client', () => ({ api: vi.fn() }));
afterEach(cleanup);
it('kartu rapat menyediakan satu aksi tindak lanjut termasuk saat opsi dibuka', () => {
  render(<Records entity="meetings" workspace={popupWorkspace} refresh={async () => {}} draftScope="qa-popup" />);
  expect(screen.getAllByRole('button', { name: /Tindak lanjut/i, hidden: true })).toHaveLength(1);
});
