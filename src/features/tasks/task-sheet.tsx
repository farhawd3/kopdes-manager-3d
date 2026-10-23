'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, ExternalLink, FileText, Globe2, Link2, Repeat, Send, Trash2, Video, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Item, Task } from '@/features/records/schemas';
import type { Workspace } from '@/features/workspace/use-workspace';
import { organizationInfo } from '@/features/workspace/use-loaded-workspace';
import { relatedGroups, entityTitle } from '@/features/records/related';
import { assigneeOptions } from '@/features/records/assignees';
import { RecordFormSheet } from '@/features/records/lazy';
import { meetingJoinUrl } from '@/features/agenda/meeting';
import { worldHref } from '@/features/world/world-link';
import { isProjectHistory } from '@/features/projects/lifecycle';
import { recordLink } from '@/components/layout/nav';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Check } from '@/components/ui/check';
import { Input, Select, Textarea } from '@/components/ui/field';
import { SegmentBar } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Wave } from '@/components/ui/wave';
import { useConfirm } from '@/components/ui/confirm';
import { projectTone } from '@/lib/tones';
import { taskProgress } from '@/lib/progress';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { cancelTask, saveTask, setTaskStatus, toggleTaskDone } from './task-actions';
import { dueText } from './task-card';
import type { TaskStatus } from '@/lib/task-status';

const STATUSES: [TaskStatus, string][] = [
  ['rencana', 'Rencana'],
  ['proses', 'Dikerjakan'],
  ['selesai', 'Selesai'],
];
const PRIORITIES = [
  ['rendah', 'Rendah'],
  ['normal', 'Normal'],
  ['tinggi', 'Tinggi'],
  ['mendesak', 'Mendesak'],
] as const;
const RECURRENCE = [
  ['tidak', 'Tidak berulang'],
  ['harian', 'Setiap hari'],
  ['mingguan', 'Setiap minggu'],
  ['bulanan', 'Setiap bulan'],
] as const;

const SEG =
  'h-9 flex-1 rounded-xl px-2 text-[13px] font-semibold text-ink-2 transition aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-card';

type Activity = { id: string; user: string; text: string; created_at: string; type: string };

/**
 * Laci detail tugas: semua perubahan langsung tersimpan dan tercatat di riwayat tugas.
 * Formulir lengkap tetap tersedia untuk kolom yang jarang dipakai.
 */
export function TaskSheet({
  task,
  ws,
  open,
  onClose,
  refresh,
  siblings = [],
  onNavigate,
}: {
  task?: Item;
  ws: Workspace;
  open: boolean;
  onClose: () => void;
  refresh: () => Promise<void> | void;
  siblings?: Item[];
  onNavigate?: (id: string) => void;
}) {
  const confirm = useConfirm();
  const manager = organizationInfo(ws).manager || 'Manajer';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [subtask, setSubtask] = useState('');
  const [comment, setComment] = useState('');
  const [fullForm, setFullForm] = useState(false);
  // Isian mengikuti data terbaru setiap kali tugas tersimpan atau berganti (pola penyesuaian saat render).
  const [synced, setSynced] = useState<unknown>(null);
  if (task && synced !== task.data) {
    setSynced(task.data);
    setTitle(String(task.data.title || ''));
    setDescription(String(task.data.description || ''));
    setLink(String(task.data.link || ''));
  }
  if (!task) return null;
  const d = task.data;
  const project = ws.workstreams?.find((row) => row.id === d.workstream_id);
  const subtasks = (d.subtasks as { title: string; done: boolean }[]) || [];
  const activities = [...((d.activities as Activity[]) || [])].reverse();
  const index = siblings.findIndex((row) => row.id === task.id);
  const due = dueText(task);
  const meeting = ws.meetings?.find((row) => row.id === d.meeting_id);
  const join = meetingJoinUrl(meeting);
  const document = ws.documents?.find((row) => row.id === d.document_id);
  const groups = relatedGroups('work-items', task, ws).filter((group) => group.entity !== 'workstreams');

  const save = async (changes: Record<string, unknown>, note: string) => {
    try {
      await saveTask(task, changes, note, manager);
      await refresh();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  const people = assigneeOptions(ws.staff || [], organizationInfo(ws).manager, String(d.assignee || ''));
  const projects = (ws.workstreams || []).filter((row) => !isProjectHistory(row) || row.id === d.workstream_id);

  return (
    <>
      <Sheet
        open={open && !fullForm}
        onOpenChange={(next) => !next && onClose()}
        wide
        title={<span className="sr-only">{String(d.title)}</span>}
        description={project ? String(project.data.title) : 'Tugas mandiri'}
        headerExtra={
          siblings.length > 1 && onNavigate ? (
            <span className="flex gap-1">
              <Button size="icon" variant="ghost" aria-label="Tugas sebelumnya" disabled={index <= 0} onClick={() => onNavigate(siblings[index - 1].id)}>
                <ChevronLeft />
              </Button>
              <Button size="icon" variant="ghost" aria-label="Tugas berikutnya" disabled={index < 0 || index >= siblings.length - 1} onClick={() => onNavigate(siblings[index + 1].id)}>
                <ChevronRight />
              </Button>
            </span>
          ) : undefined
        }
        footer={
          <>
            {d.status !== 'dibatalkan' && (
              <Button
                variant="danger"
                onClick={async () => {
                  if (await confirm({ title: `Batalkan tugas "${String(d.title)}"?`, description: 'Tugas pindah ke arsip dibatalkan dan bisa dibuka lagi kapan saja.', confirmLabel: 'Batalkan tugas', danger: true })) {
                    await cancelTask(task, refresh, manager);
                    onClose();
                  }
                }}
              >
                <XCircle />
                Batalkan tugas
              </Button>
            )}
            <Button className="ml-auto" onClick={() => setFullForm(true)}>
              Formulir lengkap
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <section data-tone={projectTone(project)} className="relative overflow-hidden rounded-[var(--radius-card)] bg-tone p-5 text-tone-ink">
            <Wave />
            <div className="relative flex items-start gap-3">
              <Check checked={d.status === 'selesai'} onChange={() => void toggleTaskDone(task, refresh, manager)} label={d.status === 'selesai' ? 'Buka lagi' : 'Tandai selesai'} className="mt-1.5" />
              <textarea
                value={title}
                rows={1}
                aria-label="Judul tugas"
                maxLength={200}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                  if (event.key === 'Escape') setTitle(String(d.title));
                }}
                onBlur={() => title.trim() && title.trim() !== d.title && void save({ title: title.trim() }, 'mengubah judul')}
                className="field-sizing-content w-full resize-none rounded-lg bg-transparent text-xl leading-snug font-extrabold text-ink outline-none focus:bg-surface/50"
              />
            </div>
            <div className="relative mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className={cn('rounded-full bg-surface/75 px-2.5 py-1', due.late && 'text-late-ink')}>{due.text}</span>
              {d.code ? <span className="rounded-full border border-tone-line px-2.5 py-0.5">{String(d.code)}</span> : null}
              {d.recurrence && d.recurrence !== 'tidak' ? (
                <span className="flex items-center gap-1 rounded-full border border-tone-line px-2.5 py-0.5">
                  <Repeat className="size-3" />
                  {RECURRENCE.find(([value]) => value === d.recurrence)?.[1]} · {String(d.recurrence_time)}
                </span>
              ) : null}
            </div>
            {subtasks.length > 0 && (
              <div className="relative mt-4 flex flex-col gap-1.5">
                <span className="flex justify-between text-xs font-bold">
                  Progres <span className="tabular">{taskProgress(d as unknown as Task)}%</span>
                </span>
                <SegmentBar value={taskProgress(d as unknown as Task)} segments={10} label="Progres tugas" />
              </div>
            )}
          </section>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <dt className="text-xs font-bold text-ink-3">Status</dt>
              <dd className="flex gap-1 rounded-2xl bg-surface-2 p-1" role="group" aria-label="Status">
                {STATUSES.map(([value, label]) => (
                  <button key={value} type="button" aria-pressed={d.status === value} onClick={() => void setTaskStatus(task, value, refresh, manager)} className={SEG}>
                    {label}
                  </button>
                ))}
              </dd>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <dt className="text-xs font-bold text-ink-3">Prioritas</dt>
              <dd className="flex gap-1 rounded-2xl bg-surface-2 p-1" role="group" aria-label="Prioritas">
                {PRIORITIES.map(([value, label]) => (
                  <button key={value} type="button" aria-pressed={d.priority === value} onClick={() => void save({ priority: value }, `mengubah prioritas menjadi ${label}`)} className={SEG}>
                    {label}
                  </button>
                ))}
              </dd>
            </div>
            <label className="flex flex-col gap-1.5">
              <dt className="text-xs font-bold text-ink-3">Tenggat</dt>
              <dd>
                <Input type="date" value={String(d.due_date || '')} onChange={(event) => event.target.value && void save({ due_date: event.target.value }, `memindah tenggat ke ${event.target.value}`)} />
              </dd>
            </label>
            <label className="flex flex-col gap-1.5">
              <dt className="text-xs font-bold text-ink-3">Proyek</dt>
              <dd>
                <Select value={String(d.workstream_id || '')} onChange={(event) => void save({ workstream_id: event.target.value, milestone_id: '' }, 'mengubah proyek')}>
                  <option value="">Tugas mandiri (tanpa proyek)</option>
                  {projects.map((row) => (
                    <option key={row.id} value={row.id}>{String(row.data.title)}</option>
                  ))}
                </Select>
              </dd>
            </label>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <dt className="text-xs font-bold text-ink-3">Penanggung jawab</dt>
              <dd className="flex flex-wrap gap-2">
                {[{ name: '', role: '' }, ...people].map((person) => (
                  <button
                    key={person.name || 'none'}
                    type="button"
                    aria-pressed={String(d.assignee || '').toLowerCase() === person.name.toLowerCase()}
                    onClick={() => void save({ assignee: person.name }, person.name ? `menugaskan ke ${person.name}` : 'mengosongkan penanggung jawab')}
                    className={cn('flex h-10 items-center gap-2 rounded-full border border-line bg-surface pr-3 text-[13px] font-semibold text-ink-2 transition aria-pressed:border-transparent aria-pressed:bg-accent aria-pressed:text-accent-ink', person.name ? 'pl-1' : 'pl-3')}
                  >
                    {person.name && <Avatar name={person.name} className="size-8 ring-0" />}
                    {person.name || 'Belum ada'}
                  </button>
                ))}
              </dd>
            </div>
          </dl>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-ink-3">Uraian</h3>
            <Textarea
              value={description}
              placeholder="Tulis uraian singkat tugas ini"
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => description !== String(d.description || '') && void save({ description }, 'mengubah uraian')}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="flex justify-between text-xs font-bold text-ink-3">
              Subtugas <span className="tabular">{subtasks.filter((s) => s.done).length}/{subtasks.length}</span>
            </h3>
            <ul className="flex flex-col gap-1">
              {subtasks.map((item, i) => (
                <li key={i} className="group flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-surface-2">
                  <Check
                    size="sm"
                    checked={item.done}
                    label={item.title}
                    onChange={() => void save({ subtasks: subtasks.map((s, j) => (j === i ? { ...s, done: !s.done } : s)) }, `${item.done ? 'membuka' : 'menyelesaikan'} subtugas "${item.title}"`)}
                  />
                  <span className={cn('flex-1 text-sm', item.done && 'text-ink-3 line-through')}>{item.title}</span>
                  <button
                    type="button"
                    aria-label={`Hapus subtugas ${item.title}`}
                    onClick={() => void save({ subtasks: subtasks.filter((_, j) => j !== i) }, `menghapus subtugas "${item.title}"`)}
                    className="grid size-8 place-items-center rounded-lg text-ink-3 opacity-0 transition group-hover:opacity-100 hover:bg-late hover:text-late-ink focus:opacity-100 max-md:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!subtask.trim()) return;
                void save({ subtasks: [...subtasks, { title: subtask.trim().slice(0, 200), done: false }] }, `menambah subtugas "${subtask.trim()}"`);
                setSubtask('');
              }}
            >
              <Input value={subtask} onChange={(event) => setSubtask(event.target.value)} placeholder="Tambah subtugas" />
              <Button type="submit" variant="secondary" disabled={!subtask.trim()}>Tambah</Button>
            </form>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-ink-3">Jadwal berulang</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <Select value={String(d.recurrence || 'tidak')} onChange={(event) => void save({ recurrence: event.target.value, ...(event.target.value === 'tidak' ? { recurrence_time: '09:00', recurrence_end_date: '' } : {}) }, 'mengubah jadwal berulang')} aria-label="Pengulangan">
                {RECURRENCE.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              <Input type="time" aria-label="Jam" disabled={d.recurrence === 'tidak'} value={String(d.recurrence_time || '09:00')} onChange={(event) => event.target.value && void save({ recurrence_time: event.target.value }, 'mengubah jam pengulangan')} />
              <Input type="date" aria-label="Berulang sampai" disabled={d.recurrence === 'tidak'} value={String(d.recurrence_end_date || '')} onChange={(event) => void save({ recurrence_end_date: event.target.value }, 'mengubah batas pengulangan')} />
            </div>
            <p className="text-xs text-ink-3">Saat tugas berulang ditandai selesai, tugas berikutnya dibuat otomatis. Jam bukan pengingat.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-ink-3">Tautan hasil kerja</h3>
            <div className="flex gap-2">
              <Input type="url" placeholder="https://" value={link} onChange={(event) => setLink(event.target.value)} onBlur={() => link !== String(d.link || '') && void save({ link }, link ? 'memperbarui tautan hasil' : 'menghapus tautan hasil')} />
              {d.link ? (
                <>
                  <Button size="icon" className="size-11" aria-label="Salin tautan" onClick={() => void navigator.clipboard.writeText(String(d.link)).then(() => toast('Tautan tersalin'))}>
                    <Copy />
                  </Button>
                  <Button size="icon" className="size-11" asChild>
                    <a href={String(d.link)} target="_blank" rel="noreferrer" aria-label="Buka tautan">
                      <ExternalLink />
                    </a>
                  </Button>
                </>
              ) : (
                <Link2 className="m-3 size-5 shrink-0 text-ink-3" aria-hidden="true" />
              )}
            </div>
          </section>

          {(meeting || document || groups.length > 0) && (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-ink-3">Terkait</h3>
              <div className="flex flex-wrap gap-2">
                {join && (
                  <Button asChild size="sm" variant="primary">
                    <a href={join} target="_blank" rel="noreferrer"><Video />Gabung rapat</a>
                  </Button>
                )}
                {document && (
                  <Button asChild size="sm">
                    <Link href={recordLink('documents', document.id)}><FileText />{String(document.data.title)}</Link>
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link href={worldHref('work-items', task.id)}><Globe2 />Lihat di dunia</Link>
                </Button>
              </div>
              <ul className="flex flex-col gap-1">
                {groups.flatMap((group) =>
                  group.rows.slice(0, 6).map((row) => (
                    <li key={group.entity + row.id}>
                      <Link href={recordLink(group.entity, row.id)} className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold hover:bg-surface-3">
                        <span className="truncate">{String(row.data.title || entityTitle(group.entity))}</span>
                        <span className="shrink-0 text-xs text-ink-3">{group.title}</span>
                      </Link>
                    </li>
                  )),
                )}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-ink-3">Catatan & riwayat</h3>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!comment.trim()) return;
                void save({}, `menambahkan catatan: "${comment.trim()}"`);
                setComment('');
              }}
            >
              <Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tulis catatan untuk tugas ini" />
              <Button type="submit" size="icon" variant="primary" className="size-11" aria-label="Kirim catatan" disabled={!comment.trim()}>
                <Send />
              </Button>
            </form>
            <ol className="flex flex-col gap-3 border-l-2 border-line pl-4">
              {activities.slice(0, 30).map((entry) => (
                <li key={entry.id} className="text-sm">
                  <span className={cn('font-semibold', entry.type === 'comment' ? 'text-ink' : 'text-ink-2')}>
                    {entry.user} {entry.text}
                  </span>
                  <span className="block text-xs text-ink-3">{formatDateTime(entry.created_at)}</span>
                </li>
              ))}
              <li className="text-xs text-ink-3">Dibuat {formatDateTime(task.created_at)}</li>
            </ol>
          </section>
        </div>
      </Sheet>
      <RecordFormSheet
        open={fullForm}
        entity="work-items"
        item={task}
        workspace={ws}
        refresh={refresh}
        onClose={() => setFullForm(false)}
      />
    </>
  );
}
