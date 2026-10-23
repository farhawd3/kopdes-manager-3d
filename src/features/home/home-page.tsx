'use client';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlarmClock, ArrowRight, ChevronLeft, ChevronRight, CircleCheck, CircleDashed, ClipboardCopy, Globe2, LoaderCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkspace } from '@/features/workspace/use-workspace';
import { organizationInfo } from '@/features/workspace/use-loaded-workspace';
import { getFollowUps } from '@/features/notifications/follow-ups';
import { RecordDetailSheet } from '@/features/records/record-card';
import { RecordFormSheet } from '@/features/records/lazy';
import { TaskCard } from '@/features/tasks/task-card';
import { TaskSheet } from '@/features/tasks/task-sheet';
import { countTaskStates } from '@/features/tasks/status-counts';
import { MEETING_KINDS, meetingKindOf } from '@/features/agenda/meeting-kinds';
import { isProjectHistory } from '@/features/projects/lifecycle';
import { PageLoading } from '@/features/records/records-page';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { StatTile } from '@/components/ui/stat';
import { ErrorState, EmptyState } from '@/components/ui/states';
import { SegmentBar } from '@/components/ui/progress';
import { Wave } from '@/components/ui/wave';
import { addDays, formatDate, today, weekDays } from '@/lib/date';
import { isActiveTask } from '@/lib/task-status';
import { scopeProgress } from '@/lib/progress';
import { projectTone } from '@/lib/tones';
import { cn } from '@/lib/utils';
import type { Task } from '@/features/records/schemas';
import { RoutinesCard, routineStates, useJakartaClock, useRoutineChecks } from './routines';
import { DayTimeline } from './day-timeline';
import { buildDailyReport, parseQuickAdd } from './quick-add';

const DAY_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const greeting = (now: string) => {
  if (!now) return 'Halo';
  const hour = Number(now.slice(0, 2));
  return hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
};
const longDate = (date: string) =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));

export function HomePage() {
  const { data, loading, error, refresh, routines: routinesReady } = useWorkspace('home');
  const { checks, setChecks, reload } = useRoutineChecks(routinesReady);
  const now = useJakartaClock();
  const date = today();
  const [day, setDay] = useState(date);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [openMeeting, setOpenMeeting] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [quick, setQuick] = useState('');
  const carousel = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const tasks = useMemo(() => data['work-items'] || [], [data]);
  const meetings = useMemo(() => (data.meetings || []).filter((m) => m.data.status !== 'dibatalkan'), [data]);
  const { manager, name: coop } = organizationInfo(data);
  const counts = countTaskStates(tasks, date);
  const deadlines = useMemo(
    () =>
      tasks
        .filter((task) => isActiveTask(task.data.status) && task.data.due_date && String(task.data.due_date) <= addDays(date, 14))
        .sort((a, b) => String(a.data.due_date).localeCompare(String(b.data.due_date))),
    [tasks, date],
  );
  const attention = getFollowUps(data, date).filter((item) => !item.id.startsWith('work-items') && !item.id.startsWith('meetings')).slice(0, 4);
  const projects = (data.workstreams || []).filter((p) => !isProjectHistory(p)).slice(0, 4);
  const week = weekDays(day);
  const dayTasks = tasks.filter((task) => task.data.due_date === day && task.data.status !== 'dibatalkan');
  const dayMeetings = meetings.filter((m) => m.data.date === day);
  const late = counts.terlambat;
  const task = tasks.find((row) => row.id === openTask);

  if (error) return <ErrorState message={error} onRetry={() => void refresh()} />;
  if (loading) return <PageLoading />;

  const copyReport = async () => {
    const states = routineStates(data.routines || [], checks, date, now);
    const text = buildDailyReport({
      date,
      coop,
      routines: states.map((s) => ({ title: String(s.routine.data.title), time: String(s.routine.data.time), done: s.done })),
      tasks: tasks.map((t) => ({ title: String(t.data.title), status: String(t.data.status), due: String(t.data.due_date || ''), completedAt: String(t.data.completed_at || ''), assignee: String(t.data.assignee || '') })),
      meetings: meetings.filter((m) => m.data.date === date).map((m) => ({ title: String(m.data.title), time: String(m.data.time || ''), kind: MEETING_KINDS[meetingKindOf(m)].label })),
      activities: (data.journal || []).filter((j) => j.data.date === date).map((j) => ({ title: String(j.data.title) })),
    });
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Laporan hari ini disalin. Tempel di grup WhatsApp pengurus.');
    } catch {
      window.prompt('Salin laporan ini:', text);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${greeting(now)}${manager ? `, ${manager.split(' ')[0]}` : ''}`}
        subtitle={
          <>
            {longDate(date)}
            {late > 0 && (
              <>
                {' · '}
                <Link href="/tasks?status=terlambat" className="font-bold text-late-ink hover:underline">{late} tugas terlambat</Link>
              </>
            )}
          </>
        }
        actions={
          <>
            <Button onClick={() => void copyReport()}>
              <ClipboardCopy />
              <span className="max-sm:hidden">Salin laporan hari ini</span>
            </Button>
            <Button asChild>
              <Link href="/world?lokasi=kantor"><Globe2 /><span className="max-sm:hidden">Masuk ke 3D</span></Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <RoutinesCard routines={data.routines || []} checks={checks} setChecks={setChecks} reload={reload} refresh={refresh} ready={routinesReady} />
        <section aria-labelledby="overview-title" className="flex flex-col gap-3">
          <h2 id="overview-title" className="text-lg font-extrabold">Ringkasan tugas</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Belum" value={counts.rencana} tone="lavender" icon={<CircleDashed />} note="Rencana" onClick={() => router.push('/tasks?status=rencana')} />
            <StatTile label="Dikerjakan" value={counts.proses} tone="sky" icon={<LoaderCircle />} note="Sedang berjalan" onClick={() => router.push('/tasks?status=proses')} />
            <StatTile label="Selesai" value={counts.selesai} tone="mint" icon={<CircleCheck />} note="30 hari terakhir" onClick={() => router.push('/tasks?status=selesai')} />
            <StatTile label="Terlambat" value={late} tone="rose" icon={<AlarmClock />} note={late ? 'Perlu ditindak' : 'Tidak ada'} onClick={() => router.push('/tasks?status=terlambat')} />
          </div>
          <form
            className="relative"
            onSubmit={(event) => {
              event.preventDefault();
              if (!quick.trim()) return;
              const parsed = parseQuickAdd(quick, {
                today: date,
                staff: (data.staff || []).map((row) => String(row.data.title)),
                projects: (data.workstreams || []).map((row) => ({ id: row.id, title: String(row.data.title) })),
              });
              setDraft({ due_date: date, ...parsed });
              setQuick('');
            }}
          >
            <label className="sr-only" htmlFor="quick-add">Tambah tugas cepat</label>
            <Sparkles className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-accent-strong" />
            <Input id="quick-add" value={quick} onChange={(event) => setQuick(event.target.value)} maxLength={200} placeholder="Tugas cepat: Cek stok gula @Budi #gerai besok !tinggi" className="bg-surface pr-24 pl-10 shadow-card" />
            <Button type="submit" size="sm" variant="primary" className="absolute top-1/2 right-1.5 -translate-y-1/2" disabled={!quick.trim()}>
              Tambah
            </Button>
          </form>
        </section>
      </div>

      <section aria-labelledby="deadline-title" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="deadline-title" className="text-lg font-extrabold">Tenggat dekat</h2>
          <div className="flex gap-1">
            <Button size="icon-sm" variant="ghost" aria-label="Geser ke kiri" onClick={() => carousel.current?.scrollBy({ left: -320, behavior: 'smooth' })}>
              <ChevronLeft />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Geser ke kanan" onClick={() => carousel.current?.scrollBy({ left: 320, behavior: 'smooth' })}>
              <ChevronRight />
            </Button>
          </div>
        </div>
        {deadlines.length ? (
          <div ref={carousel} className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:-mx-1 md:px-1">
            {deadlines.map((row, index) => (
              <div key={row.id} className="enter w-[min(19rem,80vw)] shrink-0 snap-start" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                <TaskCard task={row} ws={data} refresh={refresh} onOpen={() => setOpenTask(row.id)} className="h-full" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Tidak ada tenggat dalam 14 hari" description="Tugas aktif bertenggat akan muncul di sini, yang terlambat paling depan." />
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section aria-labelledby="today-title" className="rounded-[var(--radius-card)] bg-surface p-4 shadow-card md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="today-title" className="text-lg font-extrabold">{day === date ? 'Hari ini' : formatDate(day)}</h2>
            <Link href="/agenda" className="flex items-center gap-1 text-sm font-bold text-accent-ink hover:underline">
              Agenda <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mb-4 grid grid-cols-7 gap-1.5" role="group" aria-label="Pilih hari">
            {week.map((value, index) => {
              const busy = tasks.some((t) => t.data.due_date === value && isActiveTask(t.data.status)) || meetings.some((m) => m.data.date === value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={value === day}
                  onClick={() => setDay(value)}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 rounded-2xl py-2.5 transition',
                    value === day ? 'bg-late text-late-ink' : 'text-ink-2 hover:bg-surface-2',
                  )}
                >
                  <span className="text-xs font-semibold">{DAY_SHORT[index]}</span>
                  <span className="tabular text-lg font-extrabold">{Number(value.slice(8))}</span>
                  <span className={cn('size-1.5 rounded-full', busy ? 'bg-current' : 'bg-transparent', value === date && value !== day && 'bg-accent-strong')} />
                </button>
              );
            })}
          </div>
          <DayTimeline date={day} meetings={dayMeetings} tasks={dayTasks} ws={data} now={now} refresh={refresh} onOpenTask={setOpenTask} onOpenMeeting={setOpenMeeting} />
        </section>

        <div className="flex flex-col gap-5">
          <section aria-labelledby="attention-title" className="rounded-[var(--radius-card)] bg-surface p-4 shadow-card md:p-5">
            <h2 id="attention-title" className="mb-3 text-lg font-extrabold">Perlu perhatian</h2>
            {attention.length ? (
              <ul className="flex flex-col gap-2">
                {attention.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className={cn('flex flex-col rounded-2xl px-4 py-3 transition hover:brightness-[0.98]', item.urgent ? 'bg-late text-late-ink' : 'bg-warn text-warn-ink')}>
                      <span className="text-sm font-bold text-ink">{item.title}</span>
                      <span className="text-xs font-semibold">{item.kind} · {item.reason}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-done px-4 py-3 text-sm font-semibold text-done-ink">Dokumen, stok, risiko, dan kendala aman.</p>
            )}
          </section>
          <section aria-labelledby="projects-title" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 id="projects-title" className="text-lg font-extrabold">Proyek berjalan</h2>
              <Link href="/projects" className="text-sm font-bold text-accent-ink hover:underline">Semua</Link>
            </div>
            {projects.length ? (
              projects.map((project) => {
                const projectTasks = tasks.filter((t) => t.data.workstream_id === project.id);
                const progress = scopeProgress(projectTasks.map((t) => t.data as unknown as Task));
                const milestone = (data.milestones || []).filter((m) => m.data.workstream_id === project.id && !m.data.actual_date).sort((a, b) => String(a.data.due_date).localeCompare(String(b.data.due_date)))[0];
                return (
                  <Link key={project.id} href={`/projects/${project.id}`} data-tone={projectTone(project)} className="relative overflow-hidden rounded-[var(--radius-card)] bg-tone p-4 text-tone-ink transition hover:shadow-card">
                    <Wave />
                    <span className="relative block font-bold text-ink">{String(project.data.title)}</span>
                    <span className="relative mt-1 block text-xs font-semibold">
                      {projectTasks.length} tugas{milestone ? ` · Milestone ${formatDate(String(milestone.data.due_date))}` : ''}
                    </span>
                    <span className="relative mt-3 flex items-center gap-3">
                      <SegmentBar value={progress} className="flex-1" label={`Progres ${String(project.data.title)}`} />
                      <span className="tabular text-xs font-bold">{progress}%</span>
                    </span>
                  </Link>
                );
              })
            ) : (
              <EmptyState title="Belum ada proyek berjalan" action={<Button asChild variant="primary"><Link href="/projects?new=1">Buat proyek</Link></Button>} />
            )}
          </section>
        </div>
      </div>

      <TaskSheet task={task} ws={data} open={Boolean(task)} onClose={() => setOpenTask(null)} refresh={refresh} siblings={deadlines} onNavigate={setOpenTask} />
      <RecordDetailSheet
        entity="meetings"
        row={meetings.find((m) => m.id === openMeeting)}
        ws={data}
        open={Boolean(openMeeting)}
        onClose={() => setOpenMeeting(null)}
        onEdit={() => router.push(`/agenda?record=${openMeeting}&edit=1`)}
        refresh={refresh}
      />
      <RecordFormSheet open={Boolean(draft)} entity="work-items" prefill={draft || undefined} workspace={data} refresh={refresh} onClose={() => setDraft(null)} />
    </div>
  );
}
