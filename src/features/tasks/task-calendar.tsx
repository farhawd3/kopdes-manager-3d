'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Item } from '@/features/records/schemas';
import type { Workspace } from '@/features/workspace/use-workspace';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { addDays, formatDate, today, weekDays } from '@/lib/date';
import { projectTone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { TaskRow } from './task-card';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const monthLabel = (month: string) =>
  new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(month + '-15T12:00:00Z'));
function shiftMonth(month: string, delta: number) {
  const date = new Date(month + '-15T12:00:00Z');
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
}

/** Kalender tugas per tenggat: tampilan bulan atau pekan; pilih tanggal untuk melihat dan menambah tugas. */
export function TaskCalendar({
  tasks,
  ws,
  refresh,
  onOpen,
  onAdd,
}: {
  tasks: Item[];
  ws: Workspace;
  refresh: () => Promise<void> | void;
  onOpen: (id: string) => void;
  onAdd: (date: string) => void;
}) {
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [month, setMonth] = useState(today().slice(0, 7));
  const [selected, setSelected] = useState(today());
  const first = weekDays(month + '-01')[0];
  const daysInMonth = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();
  const offset = weekDays(month + '-01').indexOf(month + '-01');
  const cells = mode === 'month' ? Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => addDays(first, i)) : weekDays(selected);
  const onDay = (date: string) => tasks.filter((task) => task.data.due_date === date && task.data.status !== 'dibatalkan');
  const dayTasks = onDay(selected);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-xl font-extrabold capitalize">{mode === 'month' ? monthLabel(month) : `Pekan ${formatDate(cells[0])} – ${formatDate(cells[6])}`}</h2>
        <Tabs label="Rentang kalender" items={[{ id: 'month', label: 'Bulan' }, { id: 'week', label: 'Pekan' }]} value={mode} onChange={(id) => setMode(id as 'month' | 'week')} />
        <Button size="icon" variant="secondary" aria-label="Sebelumnya" onClick={() => (mode === 'month' ? setMonth(shiftMonth(month, -1)) : setSelected(addDays(selected, -7)))}>
          <ChevronLeft />
        </Button>
        <Button variant="secondary" onClick={() => { setMonth(today().slice(0, 7)); setSelected(today()); }}>Hari ini</Button>
        <Button size="icon" variant="secondary" aria-label="Berikutnya" onClick={() => (mode === 'month' ? setMonth(shiftMonth(month, 1)) : setSelected(addDays(selected, 7)))}>
          <ChevronRight />
        </Button>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-card">
        <div className="grid grid-cols-7 border-b border-line text-center text-xs font-bold text-ink-3">
          {DAYS.map((day) => (
            <span key={day} className="py-2.5">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((date) => {
            const items = onDay(date);
            const outside = mode === 'month' && date.slice(0, 7) !== month;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(date)}
                aria-pressed={date === selected}
                aria-label={`${formatDate(date)}, ${items.length} tugas`}
                className={cn(
                  'group flex flex-col gap-1 border-r border-b border-line/70 p-1.5 text-left transition hover:bg-surface-2 aria-pressed:bg-accent/50 [&:nth-child(7n)]:border-r-0',
                  mode === 'month' ? 'min-h-20 md:min-h-28' : 'min-h-60',
                  outside && 'bg-surface-2/60 text-ink-3',
                )}
              >
                <span className={cn('tabular grid size-7 place-items-center rounded-full text-sm font-bold', date === today() && 'bg-action text-on-action')}>{Number(date.slice(8))}</span>
                <span className="hidden flex-col gap-1 md:flex">
                  {items.slice(0, mode === 'month' ? 3 : 8).map((task) => (
                    <span
                      key={task.id}
                      data-tone={projectTone(ws.workstreams?.find((p) => p.id === task.data.workstream_id))}
                      className={cn('truncate rounded-lg bg-tone px-1.5 py-0.5 text-[11px] font-semibold text-tone-ink', task.data.status === 'selesai' && 'line-through opacity-60')}
                    >
                      {String(task.data.title)}
                    </span>
                  ))}
                  {items.length > (mode === 'month' ? 3 : 8) && <span className="px-1 text-[11px] font-bold text-ink-3">+{items.length - (mode === 'month' ? 3 : 8)} lainnya</span>}
                </span>
                <span className="flex gap-0.5 md:hidden">
                  {items.slice(0, 4).map((task) => (
                    <span key={task.id} data-tone={projectTone(ws.workstreams?.find((p) => p.id === task.data.workstream_id))} className="size-1.5 rounded-full bg-tone-bar" />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <section className="flex flex-col gap-2 rounded-[var(--radius-card)] bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold">{formatDate(selected)}</h3>
          <Button size="sm" variant="soft" onClick={() => onAdd(selected)}>
            <Plus />
            Tambah di tanggal ini
          </Button>
        </div>
        {dayTasks.length ? (
          dayTasks.map((task) => <TaskRow key={task.id} task={task} ws={ws} refresh={refresh} onOpen={() => onOpen(task.id)} />)
        ) : (
          <p className="text-sm text-ink-3">Tidak ada tugas bertenggat di tanggal ini.</p>
        )}
      </section>
    </div>
  );
}
