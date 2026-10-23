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
import { Avatar } from '@/components/ui/avatar';
import { useJakartaClock } from '@/lib/clock';

const SCALES = { day: 56, week: 20, month: 7 } as const;
const ROW = 52;
const WEEKDAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
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
  const now = useJakartaClock();
  const date = today();
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
      <div className="hidden overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-card ring-1 ring-line/60 md:block">
        <div className="flex">
          <div className="w-56 shrink-0 border-r border-line">
            <div className="flex h-20 items-end px-5 pb-3 text-xs font-semibold text-ink-3">Tugas</div>
            {milestones.length > 0 && <div className="flex h-9 items-center px-5 text-xs font-semibold text-ink-3">Milestone</div>}
            {rows.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onOpen(task.id)}
                className="block w-full truncate border-t border-line/70 px-5 text-left text-sm font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink"
                style={{ height: ROW }}
              >
                {String(task.data.title)}
              </button>
            ))}
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto" data-board>
            <div className="relative" style={{ width: span * px }}>
              {/* Garis kolom hari dan bayangan kolom hari ini, di belakang batang. */}
              <div className="pointer-events-none absolute inset-0 flex" aria-hidden="true">
                {days.map((day) => (
                  <span key={day} className={cn('h-full shrink-0 border-l border-line/70', day === date && 'bg-accent/45')} style={{ width: px }} />
                ))}
              </div>
              <div className="relative flex h-20">
                {days.map((day) => {
                  const weekday = new Date(day + 'T12:00:00Z').getUTCDay();
                  const show = scale === 'day' || (scale === 'week' && weekday === 1) || (scale === 'month' && day.endsWith('-01'));
                  return (
                    <span key={day} className={cn('relative shrink-0 text-center', day === date ? 'text-accent-ink' : 'text-ink-3')} style={{ width: px }}>
                      {show &&
                        (scale === 'day' ? (
                          <span className="absolute inset-x-0 bottom-2.5 flex flex-col items-center leading-tight">
                            <span className="text-[11px] font-semibold">{WEEKDAY[weekday]}</span>
                            <span className={cn('tabular text-[15px] font-extrabold', day === date ? 'text-accent-ink' : 'text-ink')}>{Number(day.slice(8))}</span>
                          </span>
                        ) : (
                          <span className="absolute bottom-3 left-1.5 text-[11px] font-bold whitespace-nowrap">{scale === 'month' ? formatDate(day).replace(/^\d+ /, '') : formatDate(day)}</span>
                        ))}
                    </span>
                  );
                })}
              </div>
              {milestones.length > 0 && (
                <div className="relative h-9 border-t border-line/70">
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
                const assignee = String(task.data.assignee || '');
                return (
                  <div key={task.id} className="relative border-t border-line/70" style={{ height: ROW }}>
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
                        // Batang kapsul seperti acuan; saat dipilih berubah warna penuh dengan teks putih.
                        'group absolute top-1/2 flex h-9 -translate-y-1/2 cursor-grab items-center gap-2 overflow-hidden rounded-full bg-tone pr-4 pl-1.5 text-[13px] font-semibold whitespace-nowrap text-tone-ink shadow-[0_6px_14px_-10px_var(--tone-bar)] outline-none transition-colors hover:shadow-[0_8px_18px_-8px_var(--tone-bar)] focus-visible:bg-tone-bar focus-visible:text-white active:cursor-grabbing',
                        done && 'opacity-60',
                        pending[task.id] && 'bg-tone-bar text-white',
                      )}
                      style={{ left, width: Math.max(px, right - left) }}
                    >
                      {assignee ? <Avatar name={assignee} className="size-6 shrink-0 text-[9px] ring-2 ring-white/70" /> : <span className="w-1.5 shrink-0" />}
                      <span className="truncate">{String(task.data.title)}</span>
                      <span data-grip="end" className="absolute inset-y-0 right-0 w-3 cursor-ew-resize" aria-hidden="true" />
                    </div>
                  </div>
                );
              })}
              {date >= start && date <= end && (
                <span
                  className="pointer-events-none absolute top-[30px] bottom-0 w-0.5 -translate-x-1/2 bg-accent-strong"
                  style={{ left: (daysBetween(start, date) + (now ? (Number(now.slice(0, 2)) * 60 + Number(now.slice(3))) / 1440 : 0.5)) * px }}
                  aria-hidden="true"
                >
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full rounded-lg bg-surface px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-ink shadow-card ring-1 ring-line">
                    {now || 'Hari ini'}
                  </span>
                  <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-accent-strong" />
                </span>
              )}
            </div>
          </div>
        </div>
        {!rows.length && <p className="p-6 text-center text-sm text-ink-3">Tidak ada tugas pada rentang ini. Tekan &quot;Lihat semua&quot;.</p>}
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
