'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateInput } from '@/components/ui/DateField';
import { useState } from 'react';
import type { Item } from '../records/schemas';
import { api } from '@/lib/client';
import { selectTaskStatus, type TaskStatus } from '@/lib/task-status';
import { Select } from '@/components/ui/Select';

export function TaskBatchActions({
  items,
  refresh,
}: {
  items: Item[];
  refresh: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const rows = items.filter((item) => selected.includes(item.id));
  return (
    <section className="task-batch">
      <Button aria-expanded={open} onClick={() => setOpen(!open)}>
        Ubah beberapa tugas
      </Button>
      {open && (
        <div className="batch-panel">
          <p>Pilih tugas, lalu ubah status atau tenggatnya.</p>
          <div className="batch-list">
            {items.map((item) => (
              <label key={item.id}>
                <Input
                  type="checkbox"
                  disabled={busy}
                  checked={selected.includes(item.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, item.id]
                        : selected.filter((id) => id !== item.id),
                    )
                  }
                />
                {String(item.data.title)}
              </label>
            ))}
          </div>
          <div className="batch-fields">
            <label>
              Status baru
              <Select
                value={status}
                onChange={setStatus}
                disabled={busy}
                options={[
                  { value: '', label: 'Tidak diubah' },
                  { value: 'rencana', label: 'Rencana' },
                  { value: 'proses', label: 'Dikerjakan' },
                  { value: 'selesai', label: 'Selesai' },
                  { value: 'dibatalkan', label: 'Dibatalkan' },
                ]}
                ariaLabel="Status baru"
              />
            </label>
            <label>
              Tenggat baru
              <DateInput value={date} disabled={busy} onValueChange={(value) => setDate(value)} />
            </label>
          </div>
          <Button
            disabled={busy || !rows.length || (!status && !date)}
            onClick={async () => {
              setBusy(true);
              setMessage('');
              let saved = 0;
              try {
                for (const item of rows) {
                  await api('work-items', {
                    id: item.id,
                    data: {
                      ...item.data,
                      ...(date ? { due_date: date } : {}),
                      ...(status ? selectTaskStatus(status as TaskStatus) : {}),
                    },
                  });
                  saved++;
                  setSelected((current) => current.filter((id) => id !== item.id));
                }
                setMessage(`${saved} tugas diperbarui.`);
              } catch (error) {
                setMessage(
                  `${saved} tugas diperbarui. ${(error as Error).message} Tugas lainnya belum diubah.`,
                );
              } finally {
                await refresh();
                setBusy(false);
              }
            }}
          >
            {busy ? 'Menyimpan…' : `Terapkan ke ${rows.length} tugas`}
          </Button>
          {message && <p role="status">{message}</p>}
        </div>
      )}
    </section>
  );
}
