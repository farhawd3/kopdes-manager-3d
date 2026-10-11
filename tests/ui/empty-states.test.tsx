import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { TodayView } from '@/features/dashboard/TodayView';
import { schemas } from '@/features/records/schemas';
import { addDays, today } from '@/lib/date';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  HTMLDialogElement.prototype.close = function () { this.open = false; };
});
afterEach(cleanup);

it('keadaan kosong mempertahankan aksi tombol dan tautan dengan gaya bersama', () => {
  const action = vi.fn();
  render(<EmptyState title="Belum ada catatan" action={{ label: 'Tambah', onClick: action }} secondaryAction={{ label: 'Lihat semua', href: '/tugas' }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));
  expect(action).toHaveBeenCalledOnce();
  expect(screen.getByRole('link', { name: 'Lihat semua' }).getAttribute('href')).toBe('/tugas');
});

it('dashboard menjelaskan daftar proyek kosong ketika seluruh proyek diarsipkan', () => {
  render(<Dashboard data={{ workstreams: [{ id: 'archived', created_at: '', updated_at: '', data: { title: 'Fixture arsip', status: 'diarsipkan' } }] }} />);
  expect(screen.getByRole('heading', { name: 'Belum ada proyek' })).toBeTruthy();
  expect(screen.getByText('Buat proyek atau periksa proyek yang diarsipkan.')).toBeTruthy();
});

it('aksi keadaan kosong Hari Ini membuka formulir tanpa menyimpan data', () => {
  render(<TodayView workspace={{}} refresh={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Tambah tugas baru' }));
  expect(screen.getByRole('heading', { name: 'Tambah tugas' })).toBeTruthy();
});

it('Enter pada aksi di dalam kartu tidak ikut membuka dialog rincian', () => {
  render(<TodayView workspace={{ 'work-items': [{ id: 'fixture', created_at: '', updated_at: '', data: schemas['work-items'].parse({ title: 'Fixture tugas terlambat', due_date: addDays(today(), -1) }) }] }} refresh={vi.fn()} />);
  fireEvent.keyDown(screen.getByRole('button', { name: 'Ke Hari Ini' }), { key: 'Enter' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('textbox', { name: 'Judul tugas baru hari ini' })).toBeTruthy();
});
