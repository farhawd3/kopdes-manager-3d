'use client';
import { Button } from '@/components/ui/Button';
import { DateNav } from '@/components/ui/DateNav';
import { DateInput } from '@/components/ui/DateField';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronRight,
  ChevronLeft,
  MoveHorizontal,
  Flag,
  Plus,
  ChartGantt,
  ListTodo,
  Maximize2,
  RotateCw,
  X,
} from 'lucide-react';
import { addDays, daysBetween, formatDate, today } from '@/lib/date';
import { timelineBar, shiftSchedule, scheduleConflicts } from '@/lib/timeline';
import { api } from '@/lib/client';
import { schemas, type Item } from '../records/schemas';
import type { Workspace } from '../workspace/useWorkspace';
import { Editor } from '../records/Editor';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
export function TaskTimeline({
  items,
  workspace,
  refresh,
  scopeId,
}: {
  items: Item[];
  workspace: Workspace;
  refresh: () => Promise<void>;
  scopeId?: string;
}) {
  const [start, setStart] = useState(addDays(today(), -7));
  const [days, setDays] = useState(42);
  const [scale, setScale] = useState('minggu');
  const [edit, setEdit] = useState<Item | undefined>();
  const [pending, setPending] = useState<{
    item: Item;
    start_date: string;
    due_date: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showMobileChart, setShowMobileChart] = useState(false);
  const [isStockChartOpen, setIsStockChartOpen] = useState(false);
  const [isRotatedLandscape, setIsRotatedLandscape] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ item: Item; x: number; width: number; resize: boolean } | null>(null);
  const end = addDays(start, days - 1);
  const allTasks = (workspace['work-items'] || []).map((item) => ({
    ...schemas['work-items'].parse(item.data),
    ...(pending?.item.id === item.id
      ? { start_date: pending.start_date, due_date: pending.due_date }
      : {}),
    id: item.id,
  }));
  const tasks = items
    .filter((item) => item.data.status !== 'dibatalkan')
    .map((item) => ({
      item,
      task: {
        ...schemas['work-items'].parse(item.data),
        ...(pending?.item.id === item.id
          ? { start_date: pending.start_date, due_date: pending.due_date }
          : {}),
        id: item.id,
      },
    }));
  const visible = tasks.filter(({ task }) => timelineBar(task, start, end));
  const dayWidth = scale === 'hari' ? 52 : scale === 'minggu' ? 24 : 9;
  const step = scale === 'hari' ? 1 : scale === 'minggu' ? 7 : 30;
  const milestones = (workspace.milestones || []).filter(
    (item) =>
      (!scopeId || item.data.workstream_id === scopeId) &&
      String(item.data.due_date) >= start &&
      String(item.data.due_date) <= end,
  );
  const conflictCount = tasks.filter(({ task }) => scheduleConflicts(task, allTasks).length).length;
  const newTask = () =>
    setEdit({
      id: '',
      created_at: '',
      updated_at: '',
      data: schemas['work-items'].parse({
        title: 'Tugas baru',
        start_date: today(),
        due_date: today(),
        workstream_id: scopeId || '',
      }),
    });

  useEffect(() => {
    if (isStockChartOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isStockChartOpen]);

  useEffect(() => {
    if (!isStockChartOpen) return;
    const previousFocus = document.activeElement;
    fullscreenRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsStockChartOpen(false);
        setIsRotatedLandscape(false);
      }
      if (e.key === 'Tab') {
        const controls = fullscreenRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]');
        const first = controls?.[0], last = controls?.[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus(); };
  }, [isStockChartOpen]);

  const renderTimelineCanvas = (isStock = false) => (
    <div
      className={`timeline-canvas ${isStock ? 'stock-canvas' : ''}`}
      style={{ width: Math.max(700, days * dayWidth + (isStock ? 180 : 230)) }}
    >
      <div className="timeline-line timeline-axis">
        <div className="timeline-name">
          Pekerjaan <small>{visible.length} ditampilkan</small>
        </div>
        <div className="timeline-track">
          {Array.from({ length: Math.ceil(days / step) }, (_, index) => (
            <span key={index} style={{ left: `${((index * step) / days) * 100}%` }}>
              {formatDate(addDays(start, index * step)).replace(/ \d{4}$/, '')}
            </span>
          ))}
        </div>
      </div>
      {visible.map(({ item, task }) => {
        const bar = timelineBar(task, start, end)!;
        const conflicts = scheduleConflicts(task, allTasks);
        return (
          <div className="timeline-line" key={item.id}>
            <Button className="timeline-name" onClick={() => setEdit(item)}>
              <strong>{task.title}</strong>
              <small>
                {task.assignee || 'Tanpa PIC'}
                {conflicts.length ? ' · Jadwal bertabrakan' : ''}
              </small>
            </Button>
            <div
              className="timeline-track"
              style={{ backgroundSize: `${(step / days) * 100}% 100%` }}
            >
              {today() >= start && today() <= end && (
                <span
                  className="today-line"
                  style={{ left: `${(daysBetween(start, today()) / days) * 100}%` }}
                />
              )}
              <Button
                disabled={busy}
                className={`timeline-bar ${task.status}`}
                style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
                aria-label={`${task.title}, ${formatDate(task.start_date || task.due_date)} sampai ${formatDate(task.due_date)}. Panah kiri atau kanan menggeser satu hari, Shift dan panah mengubah tenggat.`}
                title={`${task.title} · ${formatDate(task.start_date || task.due_date)} – ${formatDate(task.due_date)}${bar.clipped ? ' · sebagian di luar rentang' : ''}`}
                onDoubleClick={() => setEdit(item)}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                  event.preventDefault();
                  setPending({
                    item,
                    ...shiftSchedule(task, event.key === 'ArrowRight' ? 1 : -1, event.shiftKey),
                  });
                }}
                onPointerDown={(event) => {
                  if (event.pointerType === 'touch' || busy) return;
                  const target = event.target as HTMLElement;
                  drag.current = {
                    item: {
                      ...item,
                      data: {
                        ...item.data,
                        start_date: task.start_date,
                        due_date: task.due_date,
                      },
                    },
                    x: event.clientX,
                    width: event.currentTarget.parentElement!.getBoundingClientRect().width,
                    resize: target.dataset.resize === 'true',
                  };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                  if (!drag.current) return;
                  const delta = Math.round(
                    ((event.clientX - drag.current.x) / drag.current.width) * days,
                  );
                  setPending({
                    item,
                    ...shiftSchedule(
                      schemas['work-items'].parse(drag.current.item.data),
                      delta,
                      drag.current.resize,
                    ),
                  });
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
              >
                <span>
                  {bar.clipped ? '↔ ' : ''}
                  {task.title}
                </span>
                <span data-resize="true" className="resize-grip" aria-hidden>
                  ⋮
                </span>
              </Button>
            </div>
          </div>
        );
      })}
      {milestones.map((item) => (
        <div className="timeline-line" key={item.id}>
          <Button className="timeline-name" onClick={() => setEdit(item)}>
            <strong>◇ {String(item.data.title)}</strong>
            <small>{formatDate(String(item.data.due_date))}</small>
          </Button>
          <div className="timeline-track">
            <span
              className="milestone-pin"
              style={{
                left: `${(daysBetween(start, String(item.data.due_date)) / days) * 100}%`,
              }}
            >
              ◆
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className={`timeline-panel ${showMobileChart ? 'mobile-chart-open' : ''}`}>
      <div className="timeline-toolbar">
        <DateNav onPrevious={() => setStart(addDays(start, -days))} onToday={() => setStart(today())} onNext={() => setStart(addDays(start, days))} />
        <label>
          Mulai
          <DateInput
            aria-label="Awal rentang Gantt"
            value={start}
            onValueChange={(value) => {
              if (value) setStart(value);
            }}
          />
        </label>
        <label>
          Sampai
          <DateInput
            aria-label="Akhir rentang Gantt"
            min={start}
            max={addDays(start, 365)}
            value={end}
            onValueChange={(value) => {
              const length = daysBetween(start, value) + 1;
              if (length >= 1 && length <= 366) setDays(length);
            }}
          />
        </label>
        <label>
          Skala
          <Select
            value={scale}
            onChange={setScale}
            options={[
              { value: 'hari', label: 'Hari' },
              { value: 'minggu', label: 'Minggu' },
              { value: 'bulan', label: 'Bulan' },
            ]}
            ariaLabel="Skala waktu"
          />
        </label>
        <Button
          variant="secondary"
          className="timeline-fit-button"
          onClick={() => {
            if (!tasks.length) return;
            const dates = tasks
              .flatMap(({ task }) => [task.start_date || task.due_date, task.due_date])
              .sort();
            setStart(addDays(dates[0], -2));
            setDays(Math.min(366, daysBetween(dates[0], dates[dates.length - 1]) + 5));
            setMessage('Rentang disesuaikan, maksimal satu tahun per tampilan.');
          }}
          title="Sesuaikan rentang tampilan jadwal"
        >
          <Maximize2 size={13} />
          <span>Lihat jadwal</span>
        </Button>
        <Button variant="primary" className="primary timeline-add-task-btn" disabled={Boolean(scopeId && workspace.workstreams?.some((project) => project.id === scopeId && ['selesai', 'diarsipkan'].includes(String(project.data.status))))} onClick={newTask}>
          <Plus size={15} />
          <span>Tugas</span>
        </Button>
      </div>
      <div className="timeline-legend">
        <span>
          <i className="status-dot proses" />
          Sedang berjalan
        </span>
        <span>
          <i className="status-dot selesai" />
          Selesai
        </span>
        <span>
          <i className="status-dot rencana" />
          Belum dimulai
        </span>
        <span>
          <Flag size={13} />
          Milestone
        </span>
      </div>
      {conflictCount > 0 && (
        <p className="notice">
          {conflictCount} tugas memiliki jadwal prasyarat yang bertabrakan. Tinjau sebelum menyimpan
          perubahan.
        </p>
      )}
      {pending && (
        <div className="schedule-review" role="status">
          <div>
            <strong>{String(pending.item.data.title)}</strong>
            <p>
              {formatDate(pending.start_date)} → {formatDate(pending.due_date)}
            </p>
            <small>Perubahan belum disimpan. Jadwal tugas lain tidak digeser otomatis.</small>
          </div>
          <div className="actions">
            <Button disabled={busy} onClick={() => setPending(null)}>
              Batal
            </Button>
            <Button
              className="primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await api('work-items', {
                    id: pending.item.id,
                    data: {
                      ...pending.item.data,
                      start_date: pending.start_date,
                      due_date: pending.due_date,
                    },
                  });
                  setPending(null);
                  await refresh();
                  setMessage('Jadwal tersimpan.');
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Menyimpan…' : 'Simpan jadwal'}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="timeline-feedback" role="status">
          {message}
        </p>
      )}
      <div className="timeline-mobile-header-actions">
        <div className="timeline-view-switch" role="group" aria-label="Tampilan linimasa mobile">
          <Button
            type="button"
            className={`view-switch-btn ${!showMobileChart ? 'is-active' : ''}`}
            onClick={() => setShowMobileChart(false)}
          >
            <ListTodo size={14} />
            <span>Daftar</span>
          </Button>
          <Button
            type="button"
            className={`view-switch-btn ${showMobileChart ? 'is-active' : ''}`}
            onClick={() => setShowMobileChart(true)}
          >
            <ChartGantt size={14} />
            <span>Linimasa</span>
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="timeline-fullscreen-launch-btn"
          onClick={() => setIsStockChartOpen(true)}
          title="Buka linimasa layar penuh"
        >
          <Maximize2 size={14} />
          <span>Layar Penuh</span>
        </Button>
      </div>
      <div
        className="timeline-scroll"
        tabIndex={0}
        aria-label="Gantt. Geser horizontal untuk melihat tanggal lain."
      >
        {renderTimelineCanvas(false)}
      </div>
      {!visible.length && (
        <EmptyState
          ikon="kalender"
          title={
            tasks.length ? 'Tidak ada tugas pada rentang ini' : 'Susun garis waktu pertama Anda'
          }
          description={
            tasks.length
              ? 'Ubah rentang tanggal atau pilih rentang waktu yang lebih luas.'
              : 'Tambahkan tugas dengan tanggal mulai dan tenggat untuk memvisualisasikan jadwal kerja.'
          }
          tone="purple"
        />
      )}
      <p className="timeline-help">
        <MoveHorizontal size={15} /> Seret batang untuk memindahkan jadwal; tarik ujung kanan untuk
        mengubah durasi. Klik nama tugas untuk mengedit tanggal di semua perangkat.
      </p>
      <div className="timeline-mobile-list">
        {visible.map(({ item, task }) => (
          <Button key={item.id} onClick={() => setEdit(item)}>
            <span className={`status-dot ${task.status}`} />
            <span>
              <strong>{task.title}</strong>
              <small>
                {formatDate(task.start_date || task.due_date)} — {formatDate(task.due_date)}
              </small>
            </span>
            <ChevronRight size={16} />
          </Button>
        ))}
      </div>
      {edit && (
        <Editor
          entity={
            workspace.milestones?.some((item) => item.id === edit.id) ? 'milestones' : 'work-items'
          }
          item={edit}
          workspace={workspace}
          onClose={() => setEdit(undefined)}
          onSaved={refresh}
        />
      )}

      {isStockChartOpen && createPortal(
        <div
          ref={fullscreenRef}
          className={`stock-gantt-overlay ${isRotatedLandscape ? 'is-rotated-landscape' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Linimasa Layar Penuh"
        >
          {/* Bar 1: Clean Header Bar with pinned Close & Rotate buttons */}
          <div className="fullscreen-gantt-topbar">
            <div className="fullscreen-gantt-title">
              <ChartGantt size={18} className="fullscreen-gantt-icon" />
              <strong>Linimasa Layar Penuh</strong>
              <span className="task-count-chip">{visible.length} tugas</span>
            </div>

            <div className="fullscreen-gantt-window-actions">
              <Button
                type="button"
                className={`fullscreen-rotate-btn ${isRotatedLandscape ? 'is-active' : ''}`}
                onClick={() => setIsRotatedLandscape(!isRotatedLandscape)}
                title={isRotatedLandscape ? 'Kembalikan orientasi' : 'Putar orientasi lanskap'}
                aria-label="Putar lanskap"
              >
                <RotateCw size={14} />
                <span>Putar</span>
              </Button>
              <Button
                type="button"
                className="fullscreen-close-btn"
                onClick={() => {
                  setIsStockChartOpen(false);
                  setIsRotatedLandscape(false);
                }}
                title="Tutup linimasa"
                aria-label="Tutup linimasa"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          {/* Bar 2: Clean Single-Row Toolbar for Scale and Navigation */}
          <div className="fullscreen-gantt-toolbar">
            <div className="gantt-scale-group" role="group" aria-label="Skala waktu">
              <Button
                type="button"
                className={`gantt-scale-btn ${scale === 'hari' ? 'is-active' : ''}`}
                onClick={() => setScale('hari')}
              >
                1H
              </Button>
              <Button
                type="button"
                className={`gantt-scale-btn ${scale === 'minggu' ? 'is-active' : ''}`}
                onClick={() => setScale('minggu')}
              >
                1M
              </Button>
              <Button
                type="button"
                className={`gantt-scale-btn ${scale === 'bulan' ? 'is-active' : ''}`}
                onClick={() => setScale('bulan')}
              >
                1B
              </Button>
            </div>

            <div className="gantt-nav-group">
              <Button
                type="button"
                className="gantt-nav-btn"
                onClick={() => setStart(addDays(start, -days))}
                title="Rentang sebelumnya"
                aria-label="Rentang sebelumnya"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                type="button"
                className="gantt-nav-today-btn"
                onClick={() => setStart(today())}
                title="Pindah ke Hari Ini"
              >
                Hari Ini
              </Button>
              <Button
                type="button"
                className="gantt-nav-btn"
                onClick={() => setStart(addDays(start, days))}
                title="Rentang berikutnya"
                aria-label="Rentang berikutnya"
              >
                <ChevronRight size={16} />
              </Button>
            </div>

            <Button
              type="button"
              className="gantt-fit-btn"
              onClick={() => {
                if (!tasks.length) return;
                const dates = tasks
                  .flatMap(({ task }) => [task.start_date || task.due_date, task.due_date])
                  .sort();
                setStart(addDays(dates[0], -2));
                setDays(Math.min(366, daysBetween(dates[0], dates[dates.length - 1]) + 5));
              }}
              title="Sesuaikan seluruh jadwal"
            >
              <Maximize2 size={13} />
              <span>Sesuaikan</span>
            </Button>
          </div>

          <div className="stock-gantt-body">
            <div
              className="stock-gantt-scroll"
              tabIndex={0}
              aria-label="Kanvas grafik linimasa horizontal"
            >
              {renderTimelineCanvas(true)}
            </div>
          </div>

          <div className="stock-gantt-footer">
            <div className="stock-footer-legend">
              <span><i className="status-dot proses" /> Berjalan</span>
              <span><i className="status-dot selesai" /> Selesai</span>
              <span><i className="status-dot rencana" /> Rencana</span>
              <span><Flag size={11} /> Milestone</span>
            </div>
            <div className="stock-footer-hint">
              <MoveHorizontal size={13} />
              <span>Geser ke samping untuk jadwal lengkap</span>
            </div>
          </div>
        </div>, document.body
      )}
    </section>
  );
}
