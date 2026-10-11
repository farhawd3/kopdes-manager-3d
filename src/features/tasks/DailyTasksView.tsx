'use client';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CalendarDays,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { schemas, type Item } from '../records/schemas';
import { planProgress } from '@/lib/progress';
import type { Workspace } from '../workspace/useWorkspace';
import { addDays, formatDate, today } from '@/lib/date';
import { toggleTaskStatus } from '@/lib/task-status';
import { api } from '@/lib/client';
import { formatDisplayCode } from './task-code';
import { SubtaskToggle } from './SubtaskToggle';

const DAY_LABELS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;

function formatFullDayDate(dateStr: string): string {
  const parsed = new Date(dateStr + 'T12:00:00Z');
  if (isNaN(parsed.getTime())) return formatDate(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

export function DailyTasksView({
  tasks,
  workspace,
  onOpenTask,
  onCreateTask,
  onRefresh,
}: {
  tasks: Item[];
  workspace: Workspace;
  onOpenTask: (task: Item) => void;
  onCreateTask: (date: string) => void;
  onRefresh: () => Promise<void>;
}) {
  const currentDate = today();
  const [selectedDate, setSelectedDate] = useState<string>(currentDate);
  const [viewMode, setViewMode] = useState<'focused' | 'all-week'>('focused');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingSubtask, setPendingSubtask] = useState<string | null>(null);

  // Calculate week range relative to the selectedDate
  const dayOfWeek = (new Date(selectedDate + 'T12:00:00Z').getUTCDay() + 6) % 7;
  const monday = addDays(selectedDate, -dayOfWeek);
  const sunday = addDays(monday, 6);

  // 7 Days of the Active Week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    const dayName = DAY_LABELS[i];
    const items = tasks.filter((t) => t.data.due_date === date);
    return {
      date,
      dayName,
      items,
      isToday: date === currentDate,
      isSelected: date === selectedDate,
    };
  });

  // Overdue / past tasks (due before Monday of this week and not yet completed)
  const pastOverdueTasks = tasks.filter(
    (t) =>
      !['selesai', 'dibatalkan'].includes(String(t.data.status)) &&
      String(t.data.due_date) < monday,
  );

  // Upcoming tasks (after this week)
  const upcomingTasks = tasks.filter((t) => String(t.data.due_date) > sunday);

  // Active day tasks
  const activeDayTasks = tasks.filter((t) => t.data.due_date === selectedDate);
  const activeDayDoneCount = activeDayTasks.filter((t) => t.data.status === 'selesai').length;
  const activeDayCount = activeDayTasks.filter((task) => task.data.status !== 'dibatalkan').length;
  const activeDayProgressPercent = planProgress(
    activeDayTasks.map((task) => ({
      status: schemas['work-items'].shape.status.parse(task.data.status),
    })),
  );

  async function toggleComplete(task: Item, e: React.MouseEvent) {
    e.stopPropagation();
    if (busyId) return;
    setBusyId(task.id);
    setError('');
    try {
      const change = toggleTaskStatus(task.data.status);
      await api('work-items', {
        id: task.id,
        data: {
          ...task.data,
          ...change,
        },
      });
      await onRefresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleSubtask(task: Item, subIndex: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (busyId) return;
    setBusyId(task.id);
    setPendingSubtask(`${task.id}:${subIndex}`);
    setError('');
    try {
      const subtasks = Array.isArray(task.data.subtasks)
        ? (task.data.subtasks as { title: string; done: boolean; code?: string }[])
        : [];
      const updated = subtasks.map((s, idx) => (idx === subIndex ? { ...s, done: !s.done } : s));
      await api('work-items', {
        id: task.id,
        data: { ...task.data, subtasks: updated },
      });
      await onRefresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
      setPendingSubtask(null);
    }
  }

  async function deleteTask(task: Item, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Hapus tugas "${task.data.title}"?`)) return;
    setBusyId(task.id);
    setError('');
    try {
      await api('work-items', { id: task.id, data: { ...task.data, status: 'dibatalkan' } });
      await onRefresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  function renderTaskRow(task: Item, showDueTag = false) {
    const isDone = task.data.status === 'selesai';
    const subtasks = Array.isArray(task.data.subtasks)
      ? (task.data.subtasks as { title: string; done: boolean; code?: string }[])
      : [];
    const project = workspace.workstreams?.find((w) => w.id === task.data.workstream_id);

    return (
      <div key={task.id} className={`daily-task-row-wrap ${isDone ? 'is-completed' : ''}`}>
        {/* Parent Task Row */}
        <div
          className="daily-task-item"
          role="button"
          tabIndex={0}
          onClick={() => onOpenTask(task)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenTask(task);
            }
          }}
        >
          <Button
            type="button"
            className={`task-round-check ${isDone ? 'checked' : ''}`}
            onClick={(e) => toggleComplete(task, e)}
            title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
            aria-label={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
          >
            {isDone && <Check size={13} strokeWidth={2.8} />}
          </Button>

          <span className="task-code-tag">
            {formatDisplayCode(String(task.data.code), 'work-items', task.id)}
          </span>

          <span className="task-title-text">{String(task.data.title)}</span>

          {showDueTag && Boolean(task.data.due_date) && (
            <span className="task-due-tag is-overdue">
              {formatDate(String(task.data.due_date))}
            </span>
          )}

          {project && (
            <span
              className="task-project-pill"
              style={{
                borderColor: String(project.data.color || 'var(--line)'),
              }}
            >
              {String(project.data.title)}
            </span>
          )}

          {subtasks.length > 0 && (
            <span className="subtasks-count-pill">
              {subtasks.filter((s) => s.done).length}/{subtasks.length}
            </span>
          )}

          {/* Quick Hover Actions */}
          <div className="task-row-actions">
            <Button
              type="button"
              className="action-icon-btn"
              title="Ubah / Buka detail"
              aria-label="Ubah / Buka detail"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTask(task);
              }}
            >
              <Edit2 size={15} />
            </Button>
            <Button
              type="button"
              className="action-icon-btn delete-btn"
              title="Hapus Tugas"
              aria-label="Hapus Tugas"
              onClick={(e) => deleteTask(task, e)}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </div>

        {/* Indented Subtasks Tree Connector */}
        {subtasks.length > 0 && (
          <div className="nested-subtasks-tree">
            {subtasks.map((sub, sIdx) => (
              <div
                key={sIdx}
                className={`tree-subtask-item ${sub.done ? 'sub-done' : ''}`}
                onClick={(e) => toggleSubtask(task, sIdx, e)}
              >
                <SubtaskToggle
                  done={Boolean(sub.done)}
                  title={sub.title}
                  disabled={Boolean(busyId)}
                  busy={busyId === task.id && pendingSubtask === `${task.id}:${sIdx}`}
                  onClick={(event) => void toggleSubtask(task, sIdx, event)}
                />
                {sub.code && <span className="subtask-code-tag">{sub.code}</span>}
                <span className="subtask-title-text">{sub.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isToday = selectedDate === currentDate;
  const isTomorrow = selectedDate === addDays(currentDate, 1);
  const isYesterday = selectedDate === addDays(currentDate, -1);

  return (
    <div className="daily-tasks-container">
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}

      {/* ── Top Day Strip Navigator (No Dropdown) ───────────────────────── */}
      <div className="daily-nav-header">
        <div className="daily-nav-left">
          {/* Day Jump Arrows */}
          <div className="daily-nav-arrows">
            <Button
              type="button"
              className="daily-nav-arrow-btn"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              title="Hari sebelumnya"
              aria-label="Hari sebelumnya"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              type="button"
              className={`daily-btn-today ${isToday ? 'is-active-today' : ''}`}
              onClick={() => setSelectedDate(currentDate)}
              title="Kembali ke Hari Ini"
            >
              Hari Ini
            </Button>
            <Button
              type="button"
              className="daily-nav-arrow-btn"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              title="Hari berikutnya"
              aria-label="Hari berikutnya"
            >
              <ChevronRight size={18} />
            </Button>
          </div>

          {/* 7-Day Week Strip */}
          <div className="daily-week-strip" role="tablist" aria-label="Navigasi hari pekan ini">
            {weekDays.map(({ date, dayName, items, isToday: dayIsToday, isSelected }) => {
              const dayNum = Number(date.slice(-2));
              const hasIncomplete = items.some(
                (t) => t.data.status !== 'selesai' && t.data.status !== 'dibatalkan',
              );
              return (
                <Button
                  key={date}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`week-strip-day-btn ${dayIsToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedDate(date)}
                  title={`${dayName}, ${formatDate(date)} · ${items.length} tugas`}
                >
                  <span className="strip-day-name">{dayName.slice(0, 3)}</span>
                  <span className="strip-day-num">{dayNum}</span>
                  <span className="strip-day-meta">
                    {items.length > 0 ? (
                      <span
                        className={`strip-count-dot ${hasIncomplete ? 'has-pending' : 'all-done'}`}
                      >
                        {items.length}
                      </span>
                    ) : (
                      <span className="strip-empty-dot" />
                    )}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* View Switcher & Quick Add Button */}
        <div className="daily-nav-right">
          <div className="daily-view-mode-tabs" role="group" aria-label="Mode tampilan harian">
            <Button
              type="button"
              className={`btn-mode-tab ${viewMode === 'focused' ? 'is-active' : ''}`}
              onClick={() => setViewMode('focused')}
              title="Tampilkan tugas satu hari secara terfokus"
            >
              Fokus Hari
            </Button>
            <Button
              type="button"
              className={`btn-mode-tab ${viewMode === 'all-week' ? 'is-active' : ''}`}
              onClick={() => setViewMode('all-week')}
              title="Tampilkan seluruh hari dalam pekan secara terbuka"
            >
              Semua Pekan
            </Button>
          </div>

          <Button
            type="button"
            className="btn-add-task-day-primary"
            onClick={() => onCreateTask(selectedDate)}
            title={`Tambah tugas untuk ${formatFullDayDate(selectedDate)}`}
          >
            <Plus size={16} />
            <span>Tambah Tugas</span>
          </Button>
        </div>
      </div>

      {/* ── Main View Content ────────────────────────────────────────── */}
      {viewMode === 'focused' ? (
        /* FOCUSED DAY VIEW: Open card, zero accordions, zero dropdowns */
        <section className={`daily-active-day-card ${isToday ? 'is-current-today' : ''}`}>
          <header className="daily-active-day-header">
            <div className="active-day-title-block">
              <div className="active-day-icon-wrap" aria-hidden="true">
                <CalendarDays size={22} />
              </div>
              <div>
                <div className="active-day-heading-row">
                  <h3 className="active-day-heading">{formatFullDayDate(selectedDate)}</h3>
                  {isToday && <span className="daily-today-pill">Hari Ini</span>}
                  {isTomorrow && <span className="daily-rel-pill">Besok</span>}
                  {isYesterday && <span className="daily-rel-pill">Kemarin</span>}
                </div>
                <p className="active-day-subtext">
                  {activeDayTasks.length === 0
                    ? 'Belum ada agenda tugas terdaftar pada tanggal ini.'
                    : `${activeDayDoneCount} dari ${activeDayCount} tugas selain dibatalkan telah selesai (${activeDayProgressPercent}%)`}
                </p>
              </div>
            </div>

            {activeDayTasks.length > 0 && (
              <div className="active-day-progress-container">
                <div className="active-day-progress-track">
                  <div
                    className="active-day-progress-fill"
                    style={{ width: `${activeDayProgressPercent}%` }}
                  />
                </div>
                <span className="active-day-progress-text">{activeDayProgressPercent}%</span>
              </div>
            )}
          </header>

          <div className="daily-active-day-body">
            {activeDayTasks.length === 0 ? (
              <div className="daily-empty-day-card">
                <div className="daily-empty-icon" aria-hidden="true">
                  <Calendar size={36} strokeWidth={1.5} />
                </div>
                <div className="daily-empty-text">
                  <h4>Tidak Ada Tugas</h4>
                  <p>Tidak ada jadwal pekerjaan untuk hari {formatFullDayDate(selectedDate)}.</p>
                </div>
                <Button
                  type="button"
                  className="btn-create-task-empty"
                  onClick={() => onCreateTask(selectedDate)}
                >
                  <Plus size={16} />
                  <span>Buat Tugas Hari Ini</span>
                </Button>
              </div>
            ) : (
              <div className="daily-task-items-list">
                {activeDayTasks.map((task) => renderTaskRow(task))}
              </div>
            )}
          </div>
        </section>
      ) : (
        /* ALL WEEK STREAM VIEW: Open continuous cards for all 7 days (No dropdowns) */
        <div className="daily-all-week-stream">
          {weekDays.map(({ date, dayName, items, isToday: dayIsToday, isSelected }) => (
            <section
              key={date}
              className={`daily-group-card ${dayIsToday ? 'current-day-group' : ''} ${isSelected ? 'selected-day-group' : ''}`}
            >
              <header className="daily-group-header-open">
                <div className="day-title-wrap">
                  <span className="day-name">{dayName}</span>
                  <small className="day-date">{formatDate(date)}</small>
                  {dayIsToday && <span className="today-badge">Hari ini</span>}
                </div>
                <div className="day-count-badge">
                  <span>{items.length.toString().padStart(2, '0')}</span>
                </div>
                <Button
                  type="button"
                  className="btn-quick-add-day"
                  title={`Tambah tugas untuk ${dayName}`}
                  onClick={() => onCreateTask(date)}
                >
                  <Plus size={16} />
                </Button>
              </header>

              <div className="daily-task-items-list">
                {items.length === 0 ? (
                  <p className="empty-day-note">Tidak ada tugas pada hari ini.</p>
                ) : (
                  items.map((task) => renderTaskRow(task))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ── Past Overdue Section (If Any): Open Card, No Dropdown ────── */}
      {pastOverdueTasks.length > 0 && (
        <section className="daily-group-card overdue-group-card open-card">
          <header className="daily-group-header-open alert-header">
            <div className="day-title-wrap">
              <AlertCircle size={18} className="alert-icon" />
              <span className="day-name alert-text">Tugas Terlewat / Perlu Tindak Lanjut</span>
              <small className="day-date">
                {pastOverdueTasks.length} tugas jatuh tempo sebelum pekan ini
              </small>
            </div>
            <div className="day-count-badge alert-count-badge">
              <span>{pastOverdueTasks.length.toString().padStart(2, '0')}</span>
            </div>
          </header>

          <div className="daily-task-items-list">
            {pastOverdueTasks.map((task) => renderTaskRow(task, true))}
          </div>
        </section>
      )}

      {/* ── Upcoming Tasks Section (If Any): Open Card, No Dropdown ──── */}
      {upcomingTasks.length > 0 && (
        <section className="daily-group-card upcoming-group-card open-card">
          <header className="daily-group-header-open">
            <div className="day-title-wrap">
              <Clock size={18} />
              <span className="day-name">Tugas Mendatang (Pekan Depan & Seterusnya)</span>
              <small className="day-date">{upcomingTasks.length} tugas terjadwal</small>
            </div>
            <div className="day-count-badge">
              <span>{upcomingTasks.length.toString().padStart(2, '0')}</span>
            </div>
          </header>

          <div className="daily-task-items-list">
            {upcomingTasks.map((task) => renderTaskRow(task, true))}
          </div>
        </section>
      )}
    </div>
  );
}
