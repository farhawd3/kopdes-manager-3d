import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Reports } from '@/features/reports/Reports';
import { reportSnapshot } from '@/features/reports/report-snapshot';
import { popupWorkspace } from '@/features/qa/popup-fixtures';
import { Records } from '@/features/records/Records';
const api = vi.hoisted(() => vi.fn());
vi.mock('@/lib/client', () => ({ api }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('konfirmasi laporan punya nama dialog dan Escape membatalkan tanpa API hapus', () => {
  render(<Reports previewReports={[{id:'qa-report',title:'Contoh',period_start:'2026-10-01',period_end:'2026-10-04',snapshot:{...reportSnapshot(popupWorkspace,'2026-10-01','2026-10-04'),notes:'',status:'draft'}}]} />);
  fireEvent.click(screen.getByRole('button',{name:'Hapus Draf'}));
  fireEvent(screen.getByRole('dialog',{name:'Hapus Draf Laporan Ini?'}),new Event('cancel',{bubbles:true,cancelable:true}));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(api).not.toHaveBeenCalled();
});
it('impor CSV memakai dialog bernama dan Escape mengembalikan daftar', () => {
  render(<Records entity="work-items" workspace={popupWorkspace} refresh={async()=>{}} scopeId="qa-popup" />);
  fireEvent.click(screen.getByRole('button',{name:'Impor CSV'}));
  fireEvent(screen.getByRole('dialog',{name:'Impor File CSV — Tugas'}),new Event('cancel',{bubbles:true,cancelable:true}));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(api).not.toHaveBeenCalled();
});
