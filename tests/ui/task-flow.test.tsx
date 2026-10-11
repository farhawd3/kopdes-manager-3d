import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RecursiveScheduleModal } from '@/features/tasks/RecursiveScheduleModal';
import { Editor } from '@/features/records/Editor';
import { schemas } from '@/features/records/schemas';

vi.mock('@/lib/client', () => ({ api: vi.fn() }));
beforeEach(() => {
  sessionStorage.clear();
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});
afterEach(cleanup);

it('jadwal tidak berulang mengunci jam dan batas tanggal sampai pola dipilih', () => {
  const onSave = vi.fn();
  render(<RecursiveScheduleModal onClose={vi.fn()} onSave={onSave} />);
  expect((screen.getByLabelText('Jam catatan (WIB)') as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByLabelText('Batas pengulangan (opsional)') as HTMLInputElement).disabled).toBe(
    true,
  );
  fireEvent.click(screen.getByRole('button', { name: /^Tipe Perulangan:/ }));
  fireEvent.click(screen.getByRole('option', { name: 'Setiap minggu' }));
  expect((screen.getByLabelText('Jam catatan (WIB)') as HTMLInputElement).disabled).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Simpan pengulangan' }));
  expect(onSave).toHaveBeenCalledWith({
    recurrence: 'mingguan',
    recurrence_time: '09:00',
    recurrence_end_date: '',
  });
});

it('form tugas menawarkan mitra tanpa mewajibkan kode tugas', () => {
  const contactId = 'c0a80101-7a10-4fc2-8ad5-20406e11f110';
  const projectId = 'c0a80101-7a10-4fc2-8ad5-20406e11f111';
  const milestoneId = 'c0a80101-7a10-4fc2-8ad5-20406e11f112';
  const documentId = 'c0a80101-7a10-4fc2-8ad5-20406e11f113';
  render(
    <Editor
      entity="work-items"
      workspace={{
        stakeholders: [
          { id: contactId, created_at: '', updated_at: '', data: { title: 'Agrinas' } },
        ],
        documents: [
          { id: documentId, created_at: '', updated_at: '', data: { title: 'Kontrak Agrinas' } },
        ],
        workstreams: [
          { id: projectId, created_at: '', updated_at: '', data: { title: 'Onboarding' } },
        ],
        milestones: [
          {
            id: milestoneId,
            created_at: '',
            updated_at: '',
            data: { title: 'Sesi selesai', workstream_id: projectId },
          },
        ],
      }}
      onClose={vi.fn()}
      onSaved={vi.fn()}
    />,
  );
  expect(screen.queryByLabelText('Mitra atau kontak')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Detail lainnya' }));
  const contact = screen.getByLabelText('Mitra atau kontak') as HTMLSelectElement;
  expect(contact.querySelector(`option[value="${contactId}"]`)?.textContent).toBe('Agrinas');
  expect(
    screen
      .getByLabelText('Dokumen atau kontrak')
      .querySelector(`option[value="${documentId}"]`)?.textContent,
  ).toBe('Kontrak Agrinas');
  expect(screen.queryByRole('textbox', { name: /kode tugas/i })).toBeNull();
  const milestone = screen.getByLabelText('Milestone') as HTMLSelectElement;
  expect(milestone.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Proyek / bidang kerja'), {
    target: { value: projectId },
  });
  expect((screen.getByLabelText('Milestone') as HTMLSelectElement).disabled).toBe(
    false,
  );
  expect(
    screen
      .getByLabelText('Milestone')
      .querySelector(`option[value="${milestoneId}"]`),
  ).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox', { name: 'Nama / judul' }), {
    target: { value: 'Hubungi Agrinas' },
  });
  expect((screen.getByRole('textbox', { name: 'Nama / judul' }) as HTMLInputElement).value).toBe(
    'Hubungi Agrinas',
  );
  expect(
    (document.querySelector('input[name="recurrence_time"]') as HTMLInputElement).disabled,
  ).toBe(true);
  fireEvent.change(screen.getByLabelText('Pengulangan'), {
    target: { value: 'harian' },
  });
  expect(
    (document.querySelector('input[name="recurrence_time"]') as HTMLInputElement).disabled,
  ).toBe(false);
  expect(
    schemas['work-items'].parse({
      title: 'Hubungi Agrinas',
      due_date: '2026-10-09',
      stakeholder_id: contactId,
    }).stakeholder_id,
  ).toBe(contactId);
});

