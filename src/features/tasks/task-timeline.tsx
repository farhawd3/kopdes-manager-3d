'use client';
import { useRef, useState } from 'react';
import { CalendarRange, ChevronLeft, ChevronRight, Diamond, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { Item, Task } from '@/features/records/schemas';
import type { Workspace } from '@/features/workspace/use-workspace';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { addDays, daysBetween, formatDate, today } from '@/lib/date';
import { scheduleConflicts, shiftSchedule } from '@/lib/timeline';
import { projectTone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { saveTask } from './task-actions';
import { TaskRow } from './task-card';

const SCALES = { day: 44, week: 18, month: 7 } as const;
type Schedule = { start_date: string; due_date: string };

/**
 * Linimasa (Gantt): batang dari tanggal mulai sampai tenggat. Seret untuk menggeser, seret ujung
 * kanan untuk mengubah tenggat, atau pakai panah/Shift+panah. Perubahan ditinjau dulu sebelum
 * disimpan; jadwal tugas lain tidak digeser otomatis.
 */
export function TaskTimeline({
  tasks,
  ws,
  refresh,
  onOpen,
  user,
}: {
  tasks: Item[];
  ws: Workspace;
  refresh: () => Promise<void> | void;
  onOpen: (id: string) => void;
  user?: string;
}) {
  const [scale, setScale] = useState<keyof typeof SCALES>('day');
  const [start, setStart] = useState(addDays(today(), -7));
  const [span, setSpan] = useState(42);
  const [pending, setPending] = useState<Record<string, Schedule>>({});
  const [saving, setSaving] = useState(false);
  const drag = useRef<{ id: string; x: number; resize: boolean; base: Schedule } | null>(null);
  const px = SCALES[scale];
  const end = addDays(start, span - 1);
  const active = tasks.filter((task) => task.data.status !== 'dibatalkan' && task.data.due_date);
  const schedule = (task: Item): Schedule =>
    pending[task.id] ?? { start_date: String(task.data.start_date || task.data.due_date), due_date: String(task.data.due_date) };
  const rows = active
    .filter((task) => {
      const s = schedule(task);
      return s.due_date >= start && s.start_date <= end;
    })
    .sort((a, b) => schedule(a).start_date.localeCompare(schedule(b).start_date));
  const days = Array.from({ length: span }, (_, i) => addDays(start, i));
  const milestones = (ws.milestones || []).filter((m) => String(m.data.due_date) >= start && String(m.data.due_date) <= end);
  const asTasks = active.map((task) => ({ ...(task.data as unknown as Task), id: task.id, ...schedule(task) }));
  const conflicts = asTasks.filter((task) => scheduleConflicts(task, asTasks).length).length;
  const changed = Object.keys(pending).length;

  const shift = (task: Item, delta: number, resize: boolean, base = schedule(task)) => {
    if (!delta) return;
    setPending((current) => ({ ...current, [task.id]: shiftSchedule({ start_date: base.start_date, due_date: base.due_date }, delta, resize) }));
  };
  const savePending = async () => {
    setSaving(true);
    let saved = 0;
    try {
      for (const [id, value] of Object.entries(pending)) {
        const task = tasks.find((row) => row.id === id);
        if (!task) continue;
        await saveTask(task, value, `mengubah jadwal menjadi ${value.start_date} – ${value.due_date}`, user);
        saved++;
      }
      setPending({});
      toast.success('Jadwal tersimpan');
    } catch (error) {
      toast.error(`${saved} dari ${changed} jadwal tersimpan. ${(error as Error).message}`);
    } finally {
      setSaving(false);
      await refresh();
    }
  };
  const fit = () => {
    const dates = active.flatMap((task) => [String(task.data.start_date || task.data.due_date), String(task.data.due_date)]).sort();
    if (!dates.length) return;
    const first = addDays(dates[0], -2);
    setStart(first);
    setSpan(Math.min(366, Math.max(14, daysBetween(first, dates[dates.length - 1]) + 5)));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="min-w-0 flex-1 text-lg font-extrabold lg:mr-auto lg:flex-none lg:text-xl">
          {formatDate(start)} – {formatDate(end)}
        </h2>
        <Button onClick={fit} aria-label="Lihat semua jadwal" className="lg:order-last">
          <CalendarRange />
          <span className="max-sm:hidden">Lihat semua</span>
        </Button>
        <div className="max-lg:basis-full max-lg:h-0" aria-hidden="true" />
        <Tabs label="Skala" className="max-sm:[&_button]:px-3" items={[{ id: 'day', label: 'Hari' }, { id: 'week', label: 'Minggu' }, { id: 'month', label: 'Bulan' }]} value={scale} onChange={(id) => setScale(id as keyof typeof SCALES)} />
        <div className="flex items-center rounded-2xl bg-surface p-1 shadow-card" role="group" aria-label="Geser jadwal">
          <Button size="icon-sm" variant="ghost" aria-label="Mundur" onClick={() => setStart(addDays(start, -Math.round(span / 2)))}>
            <ChevronLeft />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setStart(addDays(today(), -7))}>Hari ini</Button>
          <Button size="icon-sm" variant="ghost" aria-label="Maju" onClick={() => setStart(addDays(start, Math.round(span / 2)))}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      {conflicts > 0 && (
        <p className="flex items-center gap-2 rounded-2xl bg-warn px-4 py-3 text-sm font-semibold text-warn-ink">
          <TriangleAlert className="size-4" />
          {conflicts} tugas bertabrakan dengan prasyaratnya (prasyarat belum selesai sebelum tugas dimulai).
        </p>
      )}
      {changed > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center gap-3 rounded-2xl bg-action px-4 py-3 text-on-action shadow-float">
          <span className="flex-1 text-sm font-bold">{changed} perubahan jadwal belum disimpan. Jadwal tugas lain tidak digeser otomatis.</span>
          <Button size="sm" variant="ghost" className="text-on-action hover:bg-white/10" onClick={() => setPending({})}>Batal</Button>
          <Button size="sm" className="bg-surface text-ink" busy={saving} onClick={() => void savePending()}>Simpan jadwal</Button>
        </div>
      )}
      <div className="hidden overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-card md:block">
        <div className="flex">
          <div className="w-56 shrink-0 border-r border-line">
            <div className="flex h-12 items-end border-b border-line px-4 pb-2 text-xs font-bold text-ink-3">Tugas</div>
            {milestones.length > 0 && <div className="flex h-9 items-center border-b border-line px-4 text-xs font-bold text-ink-3">Milestone</div>}
            {rows.map((task) => (
              <button key={task.id} type="button" onClick={() => onOpen(task.id)} className="block h-12 w-full truncate border-b border-line/60 px-4 text-left text-sm font-semibold hover:bg-surface-2">
                {String(task.data.title)}
              </button>
            ))}
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto" data-board>
            <div className="relative" style={{ width: span * px }}>
              <div className="flex h-12 border-b border-line">
                {days.map((date) => {
                  const show = scale === 'day' || (scale === 'week' && new Date(date + 'T12:00:00Z').getUTCDay() === 1) || (scale === 'month' && date.endsWith('-01'));
                  return (
                    <span key={date} className={cn('relative shrink-0 border-l border-line/40 text-[10px] font-bold text-ink-3', date === today() && 'text-late-ink')} style={{ width: px }}>
                      {show && <span className="absolute bottom-1.5 left-1 whitespace-nowrap">{scale === 'month' ? formatDate(date).replace(/^\d+ /, '') : Number(date.slice(8))}</span>}
                    </span>
                  );
                })}
              </div>
              {milestones.length > 0 && (
                <div className="relative h-9 border-b border-line">
                  {milestones.map((m) => (
                    <span key={m.id} title={`${String(m.data.title)} · ${formatDate(String(m.data.due_date))}`} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-strong" style={{ left: (daysBetween(start, String(m.data.due_date)) + 0.5) * px }}>
                      <Diamond className={cn('size-4', m.data.actual_date ? 'fill-done-ink text-done-ink' : 'fill-current')} />
                    </span>
                  ))}
                </div>
              )}
              {rows.map((task) => {
                const s = schedule(task);
                const left = Math.max(0, daysBetween(start, s.start_date)) * px;
                const right = Math.min(span, daysBetween(start, s.due_date) + 1) * px;
                const project = ws.workstreams?.find((p) => p.id === task.data.workstream_id);
                const done = task.data.status === 'selesai';
                return (
                  <div key={task.id} className="relative h-12 border-b border-line/60">
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label={`${String(task.data.title)}: ${formatDate(s.start_date)} sampai ${formatDate(s.due_date)}`}
                      aria-valuetext={`${s.start_date} – ${s.due_date}`}
                      aria-valuenow={daysBetween(start, s.start_date)}
                      data-tone={projectTone(project)}
                      onKeyDown={(event) => {
                        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
                        event.preventDefault();
                        shift(task, event.key === 'ArrowRight' ? 1 : -1, event.shiftKey);
                      }}
                      onPointerDown={(event) => {
                        if (event.pointerType !== 'mouse') return;
                        event.currentTarget.setPointerCapture(event.pointerId);
                        drag.current = { id: task.id, x: event.clientX, resize: (event.target as HTMLElement).dataset.grip === 'end', base: s };
                      }}
                      onPointerMove={(event) => {
                        const current = drag.current;
                        if (!current || current.id !== task.id) return;
                        const delta = Math.round((event.clientX - current.x) / px);
                        setPending((all) => ({ ...all, [task.id]: shiftSchedule(current.base, delta, current.resize) }));
                      }}
                      onPointerUp={() => (drag.current = null)}
                      onDoubleClick={() => onOpen(task.id)}
                      className={cn(
                        'absolute top-2 flex h-8 cursor-grab items-center overflow-hidden rounded-xl bg-tone pr-3 pl-3 text-xs font-bold whitespace-nowrap text-tone-ink outline-none focus-visible:ring-2 focus-visible:ring-tone-bar active:cursor-grabbing',
                        done && 'opacity-60',
                        pending[task.id] && 'ring-2 ring-action',
                      )}
                      style={{ left, width: Math.max(px, right - left) }}
                    >
                      <span className="absolute inset-y-0 left-0 w-1 bg-tone-bar" />
                      <span className="truncate">{String(task.data.title)}</span>
                      <span data-grip="end" className="absolute inset-y-0 right-0 w-2.5 cursor-ew-resize bg-tone-bar/40" aria-hidden="true" />
                    </div>
                  </div>
                );
              })}
              {today() >= start && today() <= end && (
                <span className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-late-ink" style={{ left: (daysBetween(start, today()) + 0.5) * px }} aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
        {!rows.length && <p className="p-6 text-center text-sm text-ink-3">Tidak ada tugas pada rentang ini. Tekan &quot;Lihat semua jadwal&quot;.</p>}
      </div>
      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((task) => (
          <div key={task.id} className="flex flex-col gap-1">
            <span className="px-1 text-xs font-bold text-ink-3">
              {formatDate(schedule(task).start_date)} – {formatDate(schedule(task).due_date)}
            </span>
            <TaskRow task={task} ws={ws} refresh={refresh} onOpen={() => onOpen(task.id)} />
          </div>
        ))}
        {!rows.length && <p className="rounded-2xl bg-surface p-6 text-center text-sm text-ink-3">Tidak ada tugas pada rentang ini.</p>}
      </div>
    </div>
  );
}
