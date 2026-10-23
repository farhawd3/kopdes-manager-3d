'use client';
import Link from 'next/link';
import { useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { ChevronLeft, ChevronRight, Circle, CircleCheck, CircleDot, CircleSlash, Clock, Copy, Ellipsis, ExternalLink, FileText, Globe2, Link2, ListFilter, Send, SquarePen, Trash2, UserRound, Video, XCircle } from 'lucide-react';
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
import { Input, Select } from '@/components/ui/field';
import { Avatar } from '@/components/ui/avatar';
import { useConfirm } from '@/components/ui/confirm';
import { projectTone } from '@/lib/tones';
import { taskProgress } from '@/lib/progress';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { cancelTask, saveTask, setTaskStatus } from './task-actions';
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

const ICON_BUTTON = 'grid size-9 place-items-center rounded-xl text-ink-2 transition hover:bg-surface-2 hover:text-ink [&_svg]:size-[18px]';
const MENU_ITEM =
  'flex h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-2 outline-none data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink [&_svg]:size-4';
const VALUE_ICON = 'size-7 shrink-0 p-1 text-ink-3';
const VALUE_SELECT = 'h-9 border-transparent bg-transparent pl-1.5 font-medium text-ink hover:bg-surface-2';

/** Ikon status seperti lingkaran "Started" pada acuan: kosong untuk rencana, setengah untuk dikerjakan, centang untuk selesai. */
function StatusIcon({ status }: { status: string }) {
  if (status === 'selesai') return <CircleCheck className="size-7 shrink-0 p-1 text-done-ink" />;
  if (status === 'proses') return <CircleDot className="size-7 shrink-0 p-1 text-accent-strong" />;
  if (status === 'dibatalkan') return <CircleSlash className="size-7 shrink-0 p-1 text-ink-3" />;
  return <Circle className="size-7 shrink-0 p-1 text-accent-strong" />;
}

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
  const copyLink = () => {
    const url = `${window.location.origin}/tasks?task=${task.id}`;
    void navigator.clipboard.writeText(url).then(() => toast('Tautan tugas tersalin'), () => window.prompt('Salin tautan ini:', url));
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
      >
        <div className="flex flex-col gap-6">
          {/* Kepala detail seperti panel acuan: judul besar, lalu deretan ikon aksi kecil. */}
          <div className="flex flex-col gap-1.5">
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
              className={cn(
                'field-sizing-content -mx-2 w-[calc(100%+1rem)] resize-none rounded-xl bg-transparent px-2 py-1 text-[26px] leading-tight font-bold tracking-tight text-ink outline-none hover:bg-surface-2 focus:bg-surface-2',
                d.status === 'selesai' && 'text-ink-3 line-through',
              )}
            />
            <div className="-ml-2 flex items-center gap-0.5 text-ink">
              <button type="button" aria-label="Salin tautan tugas" title="Salin tautan tugas" onClick={copyLink} className={ICON_BUTTON}>
                <Link2 />
              </button>
              <Link href={worldHref('work-items', task.id)} aria-label="Lihat di Dunia Koperasi" title="Lihat di Dunia Koperasi" className={ICON_BUTTON}>
                <Globe2 />
              </Link>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger aria-label="Aksi lain" title="Aksi lain" className={ICON_BUTTON}>
                  <Ellipsis />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="start" sideOffset={6} className="pop z-[60] w-56 rounded-2xl bg-surface p-1.5 shadow-float ring-1 ring-line/60">
                    <DropdownMenu.Item className={MENU_ITEM} onSelect={() => setFullForm(true)}>
                      <SquarePen />
                      Formulir lengkap
                    </DropdownMenu.Item>
                    {d.status !== 'dibatalkan' && (
                      <DropdownMenu.Item
                        className={cn(MENU_ITEM, 'text-late-ink data-[highlighted]:bg-late data-[highlighted]:text-late-ink')}
                        onSelect={async () => {
                          if (await confirm({ title: `Batalkan tugas "${String(d.title)}"?`, description: 'Tugas pindah ke arsip dibatalkan dan bisa dibuka lagi kapan saja.', confirmLabel: 'Batalkan tugas', danger: true })) {
                            await cancelTask(task, refresh, manager);
                            onClose();
                          }
                        }}
                      >
                        <XCircle />
                        Batalkan tugas
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              {d.code ? <span className="ml-auto text-xs font-semibold text-ink-3">{String(d.code)}</span> : null}
            </div>
          </div>

          <section className="flex flex-col gap-1">
            <h3 className="text-[13px] font-medium text-ink-3">Uraian</h3>
            <textarea
              value={description}
              rows={2}
              placeholder="Tulis uraian singkat tugas ini"
              aria-label="Uraian"
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => description !== String(d.description || '') && void save({ description }, 'mengubah uraian')}
              className="field-sizing-content -mx-2 min-h-12 w-[calc(100%+1rem)] resize-none rounded-xl bg-transparent px-2 py-1 text-sm leading-relaxed text-ink outline-none placeholder:text-ink-3 hover:bg-surface-2 focus:bg-surface-2"
            />
          </section>

          {/* Sifat tugas: label di kiri, nilai berikon di kanan, seperti panel detail acuan. */}
          <dl className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 text-sm sm:grid-cols-[8rem_minmax(0,1fr)] [&>dd]:min-w-0 [&>dd]:flex-wrap [&>dd>span.block]:min-w-0 [&>dd>span.block]:flex-1">
            <dt className="text-ink-3">Penanggung jawab</dt>
            <dd className="flex items-center gap-1">
              {d.assignee ? <Avatar name={String(d.assignee)} className="size-7 text-[10px] ring-0" /> : <UserRound className={VALUE_ICON} />}
              <Select
                value={String(d.assignee || '')}
                aria-label="Penanggung jawab"
                onChange={(event) => void save({ assignee: event.target.value }, event.target.value ? `menugaskan ke ${event.target.value}` : 'mengosongkan penanggung jawab')}
                className={VALUE_SELECT}
              >
                <option value="">Belum ada</option>
                {people.map((person) => (
                  <option key={person.name} value={person.name}>{person.name}</option>
                ))}
              </Select>
            </dd>
            <dt className="text-ink-3">Status</dt>
            <dd className="flex items-center gap-1">
              <StatusIcon status={String(d.status)} />
              <Select value={String(d.status)} aria-label="Status" onChange={(event) => void setTaskStatus(task, event.target.value as TaskStatus, refresh, manager)} className={cn(VALUE_SELECT, 'w-auto')}>
                {STATUSES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
                {d.status === 'dibatalkan' && <option value="dibatalkan">Dibatalkan</option>}
              </Select>
              {subtasks.length > 0 && <span className="tabular shrink-0 rounded-md bg-accent px-1.5 py-0.5 text-xs font-semibold text-accent-ink">{taskProgress(d as unknown as Task)}%</span>}
            </dd>
            <dt className="text-ink-3">Prioritas</dt>
            <dd className="flex items-center gap-1">
              <ListFilter className={cn(VALUE_ICON, ['tinggi', 'mendesak'].includes(String(d.priority)) ? 'text-late-ink' : 'text-warn-ink')} />
              <Select value={String(d.priority || 'normal')} aria-label="Prioritas" onChange={(event) => void save({ priority: event.target.value }, `mengubah prioritas menjadi ${PRIORITIES.find(([v]) => v === event.target.value)?.[1]}`)} className={VALUE_SELECT}>
                {PRIORITIES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </dd>
            <dt className="text-ink-3">Tenggat</dt>
            <dd className="flex items-center gap-1">
              <Clock className={cn(VALUE_ICON, 'text-accent-strong')} />
              <Input
                type="date"
                aria-label="Tenggat"
                value={String(d.due_date || '')}
                onChange={(event) => event.target.value && void save({ due_date: event.target.value }, `memindah tenggat ke ${event.target.value}`)}
                className="h-9 w-auto border-transparent bg-transparent px-1.5 hover:bg-surface-2"
              />
              {due.late && <span className="shrink-0 rounded-md bg-late px-1.5 py-0.5 text-xs font-semibold text-late-ink">{due.text}</span>}
            </dd>
            <dt className="text-ink-3">Proyek</dt>
            <dd data-tone={projectTone(project)} className="flex items-center gap-1">
              <span className="grid size-7 shrink-0 place-items-center">
                <span className="size-3 rounded-[4px] bg-tone-bar" />
              </span>
              <Select value={String(d.workstream_id || '')} aria-label="Proyek" onChange={(event) => void save({ workstream_id: event.target.value, milestone_id: '' }, 'mengubah proyek')} className={VALUE_SELECT}>
                <option value="">Tugas mandiri (tanpa proyek)</option>
                {projects.map((row) => (
                  <option key={row.id} value={row.id}>{String(row.data.title)}</option>
                ))}
              </Select>
            </dd>
          </dl>

          <section className="flex flex-col gap-2">
            <h3 className="flex justify-between text-[13px] font-semibold text-ink-3">
              Subtugas <span className="tabular">{subtasks.filter((s) => s.done).length}/{subtasks.length}</span>
            </h3>
            {/* Subtugas berupa kapsul dengan centang di kanan, seperti acuan. */}
            <ul className="flex flex-col gap-2" style={{ ['--tone-bar' as string]: 'var(--accent-strong)' }}>
              {subtasks.map((item, i) => (
                <li
                  key={i}
                  className={cn('group flex min-h-11 items-center gap-2 rounded-full border py-1 pr-1.5 pl-4 transition', item.done ? 'border-transparent bg-accent' : 'border-line hover:bg-surface-2')}
                >
                  <span className={cn('flex-1 text-sm font-semibold', item.done ? 'text-accent-ink' : 'text-ink')}>{item.title}</span>
                  <button
                    type="button"
                    aria-label={`Hapus subtugas ${item.title}`}
                    onClick={() => void save({ subtasks: subtasks.filter((_, j) => j !== i) }, `menghapus subtugas "${item.title}"`)}
                    className="grid size-8 place-items-center rounded-full text-ink-3 opacity-0 transition group-hover:opacity-100 hover:bg-late hover:text-late-ink focus:opacity-100 max-md:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <Check
                    size="sm"
                    checked={item.done}
                    label={item.title}
                    onChange={() => void save({ subtasks: subtasks.map((s, j) => (j === i ? { ...s, done: !s.done } : s)) }, `${item.done ? 'membuka' : 'menyelesaikan'} subtugas "${item.title}"`)}
                    className="mr-1"
                  />
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
              <Input value={subtask} onChange={(event) => setSubtask(event.target.value)} placeholder="Tambah subtugas" className="rounded-full" />
              <Button type="submit" variant="secondary" disabled={!subtask.trim()} className="rounded-full">
                Tambah
              </Button>
            </form>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-[13px] font-semibold text-ink-3">Jadwal berulang</h3>
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
            <h3 className="text-[13px] font-semibold text-ink-3">Tautan hasil kerja</h3>
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
              <h3 className="text-[13px] font-semibold text-ink-3">Terkait</h3>
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
            <h3 className="text-[13px] font-semibold text-ink-3">Catatan & riwayat</h3>
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
