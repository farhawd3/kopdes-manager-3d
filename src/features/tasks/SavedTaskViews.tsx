'use client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { z } from 'zod';
import { usePreference } from '@/lib/usePreference';

const viewSchema = z.object({
  name: z.string().max(40),
  search: z.string(),
  status: z.string(),
  project: z.string(),
  priority: z.string(),
  sort: z.enum(['due', 'title', 'updated']),
  view: z.enum(['daftar', 'papan', 'kalender', 'harian', 'gantt']),
  sprint: z.string(),
});
export type TaskView = z.infer<typeof viewSchema>;
export function SavedTaskViews({
  value,
  onApply,
}: {
  value: Omit<TaskView, 'name'>;
  onApply: (value: TaskView) => void;
}) {
  const [stored, setStored] = usePreference('hub-task-views', '[]');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  let views: TaskView[] = [];
  try {
    views = z.array(viewSchema).parse(JSON.parse(stored));
  } catch {
    /* Ignore outdated or invalid browser preferences. */
  }
  return (
    <details className="saved-views">
      <summary>Tampilan tersimpan</summary>
      <div className="saved-view-list">
        {views.map((item) => (
          <span key={item.name}>
            <Button onClick={() => onApply(item)}>{item.name}</Button>
            <Button
              aria-label={`Hapus tampilan ${item.name}`}
              onClick={() =>
                setStored(JSON.stringify(views.filter((view) => view.name !== item.name)))
              }
            >
              ×
            </Button>
          </span>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const label = name.trim();
          if (!label) return;
          setStored(
            JSON.stringify(
              [...views.filter((item) => item.name !== label), { ...value, name: label }].slice(
                -10,
              ),
            ),
          );
          setName('');
          setMessage('Tampilan disimpan di browser ini.');
        }}
      >
        <Input
          aria-label="Nama tampilan"
          placeholder="Nama filter, misalnya Gerai minggu ini"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button disabled={!name.trim()}>Simpan tampilan</Button>
      </form>
      {message && <small role="status">{message}</small>}
    </details>
  );
}
