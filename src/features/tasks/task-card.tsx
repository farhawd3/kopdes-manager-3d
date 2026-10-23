'use client';
import { DropdownMenu } from 'radix-ui';
import * as motion from 'motion/react-m';
import { CalendarClock, CalendarPlus, Clock, EllipsisVertical, ListChecks, MessageCircle, Repeat, XCircle } from 'lucide-react';
import type { Item } from '@/features/records/schemas';
import type { Workspace } from '@/features/workspace/use-workspace';
import { Wave } from '@/components/ui/wave';
import { Check } from '@/components/ui/check';
import { SegmentBar } from '@/components/ui/progress';
import { AvatarStack } from '@/components/ui/avatar';
import { projectTone } from '@/lib/tones';
import { taskProgress } from '@/lib/progress';
import { daysBetween, formatDate, today } from '@/lib/date';
import { isClosedTask } from '@/lib/task-status';
import { cn } from '@/lib/utils';
import { cancelTask, postponeTask, toggleTaskDone } from './task-actions';
import type { Task } from '@/features/records/schemas';

/** Teks tenggat yang manusiawi: "Hari ini", "Besok", "3 hari lagi", "Terlambat 2 hari". */
export function dueText(task: Item, date = today()): { text: string; late: boolean } {
  const due = String(task.data.due_date || '');
  if (!due) return { text: 'Tanpa tenggat', late: false };
  if (task.data.status === 'selesai') return { text: `Selesai ${formatDate(String(task.data.completed_at || due))}`, late: false };
  const diff = daysBetween(date, due);
  if (diff < 0 && !isClosedTask(task.data.status)) return { text: `Terlambat ${-diff} hari`, late: true };
  if (diff === 0) return { text: 'Hari ini', late: false };
  if (diff === 1) return { text: 'Besok', late: false };
  if (diff <= 7) return { text: `${diff} hari lagi`, late: false };
  return { text: formatDate(due), late: false };
}

const ITEM =
  'flex h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-2 outline-none data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink [&_svg]:size-4';

/** Kartu tugas pastel per proyek (gaya TaskTrack): label proyek, judul, progres bersegmen, orang, tenggat. */
export function TaskCard({
  task,
  ws,
  onOpen,
  refresh,
  className,
  draggable,
  style,
}: {
  task: Item;
  ws: Workspace;
  onOpen: () => void;
  refresh: () => Promise<void> | void;
  className?: string;
  draggable?: boolean;
  style?: React.CSSProperties;
}) {
  const project = ws.workstreams?.find((row) => row.id === task.data.workstream_id);
  const subtasks = (task.data.subtasks as { done: boolean }[]) || [];
  const done = task.data.status === 'selesai';
  const due = dueText(task);
  const progress = taskProgress(task.data as unknown as Task);
  const priority = String(task.data.priority || 'normal');
  const people = [String(task.data.assignee || ''), ...((task.data.followers as string[]) || [])].filter((name, index, all) => name && all.indexOf(name) === index);
  const note = String(task.data.description || '').split(/\r?\n/)[0].trim();
  const comments = ((task.data.activities as { type?: string }[]) || []).filter((entry) => entry.type === 'comment').length;
  return (
    <article
      data-tone={projectTone(project)}
      data-task={task.id}
      tabIndex={0}
      style={style}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target === event.currentTarget) onOpen();
      }}
      className={cn(
        'group relative flex flex-col gap-3 overflow-hidden rounded-[var(--radius-card)] bg-tone p-4 text-tone-ink ring-1 ring-white/50 ring-inset dark:ring-white/5 outline-none transition-shadow hover:shadow-card focus-visible:ring-2 focus-visible:ring-tone-bar',
        draggable && 'cursor-grab touch-pan-y select-none active:cursor-grabbing',
        done && 'opacity-80',
        className,
      )}
    >
      <Wave />
      <div className="relative flex items-center gap-1.5">
        <span className="max-w-[58%] truncate rounded-full border border-[color-mix(in_srgb,var(--tone-bar)_45%,transparent)] bg-surface/40 text-[color-mix(in_srgb,var(--tone-bar)_70%,var(--tone-ink))] px-2.5 py-0.5 text-[11px] font-semibold">
          #{project ? String(project.data.title) : 'tanpa proyek'}
        </span>
        {['tinggi', 'mendesak'].includes(priority) && (
          <span className="rounded-full border border-[color-mix(in_srgb,var(--tone-bar)_45%,transparent)] bg-surface/40 text-[color-mix(in_srgb,var(--tone-bar)_70%,var(--tone-ink))] px-2.5 py-0.5 text-[11px] font-semibold">#{priority === 'mendesak' ? 'mendesak' : 'tinggi'}</span>
        )}
        {Boolean(task.data.recurrence) && task.data.recurrence !== 'tidak' && <Repeat className="size-3.5 opacity-70" aria-label="Berulang" />}
        <span className="ml-auto flex items-center gap-0.5">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              className="grid size-8 place-items-center rounded-lg text-ink transition hover:bg-surface/60"
              aria-label={`Aksi untuk ${String(task.data.title)}`}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <EllipsisVertical className="size-4" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" sideOffset={6} className="pop z-50 w-52 rounded-2xl bg-surface p-1.5 shadow-float" onClick={(event) => event.stopPropagation()}>
                <DropdownMenu.Item className={ITEM} onSelect={() => void postponeTask(task, 1, refresh)}>
                  <CalendarClock />
                  Tunda 1 hari
                </DropdownMenu.Item>
                <DropdownMenu.Item className={ITEM} onSelect={() => void postponeTask(task, 7, refresh)}>
                  <CalendarPlus />
                  Tunda 1 minggu
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-line" />
                <DropdownMenu.Item className={cn(ITEM, 'data-[highlighted]:bg-late data-[highlighted]:text-late-ink')} onSelect={() => void cancelTask(task, refresh)}>
                  <XCircle />
                  Batalkan tugas
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Check checked={done} onChange={() => void toggleTaskDone(task, refresh)} label={`${done ? 'Buka lagi' : 'Tandai selesai'}: ${String(task.data.title)}`} className="ml-1.5" />
        </span>
      </div>
      <button
        type="button"
        onClick={onOpen}
        onPointerDown={(event) => draggable && event.stopPropagation()}
        className={cn('relative line-clamp-2 text-left text-[15.5px] leading-snug font-bold text-ink outline-none', done && 'text-ink-3 line-through')}
      >
        {String(task.data.title)}
      </button>
      {note && (
        <p className="relative line-clamp-1 text-[12px] font-semibold text-ink-2">
          <span className="text-ink">Catatan:</span> {note}
        </p>
      )}
      {subtasks.length > 0 && (
        <div className="relative flex flex-col gap-1.5">
          <span className="flex justify-between text-[12px] font-semibold text-ink-3">
            Progres <span className="tabular font-bold text-ink">{progress}%</span>
          </span>
          <SegmentBar value={progress} segments={7} label="Progres subtugas" onTone />
        </div>
      )}
      <div className="relative flex items-center gap-3 text-[12px] font-semibold text-ink-3">
        <AvatarStack names={people} max={3} />
        {comments > 0 && (
          <span className="flex items-center gap-1" title={`${comments} komentar`}>
            <MessageCircle className="size-3.5" />
            <span className="tabular">{comments}</span>
          </span>
        )}
        {subtasks.length > 0 && (
          <span className="flex items-center gap-1" title="Subtugas selesai">
            <ListChecks className="size-3.5" />
            <span className="tabular">{subtasks.filter((s) => s.done).length}/{subtasks.length}</span>
          </span>
        )}
        <span className={cn('ml-auto flex items-center gap-1', due.late && 'font-bold text-late-ink')}>
          <Clock className="size-3.5" />
          {due.text}
        </span>
      </div>
    </article>
  );
}

/** Versi baris untuk daftar padat (Daftar, Beranda di HP). */
export function TaskRow({ task, ws, onOpen, refresh }: { task: Item; ws: Workspace; onOpen: () => void; refresh: () => Promise<void> | void }) {
  const project = ws.workstreams?.find((row) => row.id === task.data.workstream_id);
  const done = task.data.status === 'selesai';
  const due = dueText(task);
  const subtasks = (task.data.subtasks as { done: boolean }[]) || [];
  return (
    <motion.div
      layout
      data-tone={projectTone(project)}
      data-task={task.id}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target === event.currentTarget) onOpen();
      }}
      className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 outline-none transition hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent-strong"
    >
      <Check checked={done} onChange={() => void toggleTaskDone(task, refresh)} label={`${done ? 'Buka lagi' : 'Tandai selesai'}: ${String(task.data.title)}`} />
      <span className="h-8 w-1 shrink-0 rounded-full bg-tone-bar" aria-hidden="true" />
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className={cn('block truncate text-[14.5px] font-bold text-ink', done && 'text-ink-3 line-through')}>{String(task.data.title)}</span>
        <span className="flex items-center gap-2 text-xs text-ink-3">
          <span className="truncate">{project ? String(project.data.title) : 'Tanpa proyek'}</span>
          {subtasks.length > 0 && <span className="tabular">· {subtasks.filter((s) => s.done).length}/{subtasks.length} subtugas</span>}
        </span>
      </button>
      <span className={cn('hidden shrink-0 text-xs font-bold sm:block', due.late ? 'text-late-ink' : 'text-ink-3')}>{due.text}</span>
      <AvatarStack names={[String(task.data.assignee || '')]} className="hidden shrink-0 sm:flex" />
    </motion.div>
  );
}
