import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateNav } from '@/components/ui/DateNav';
import { useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { addDays, formatDate, today } from '@/lib/date';
import type { Item } from '../records/schemas';
export function TaskCalendar({
  items,
  render,
  onCreate,
  onEdit,
}: {
  items: Item[];
  onCreate?: (date: string) => void;
  onEdit?: (item: Item) => void;
  render: (item: Item) => React.ReactNode;
}) {
  const [month, setMonth] = useState(today().slice(0, 7));
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<'month' | 'week' | 'day'>('month');
  const [anchor, setAnchor] = useState(today());
  const getItemDate = (item: Item) => {
    const d = item.data.due_date || item.data.date;
    if (!d || d === 'undefined' || d === 'null') return '';
    return String(d);
  };
  const monthItems = items.filter((item) => getItemDate(item).startsWith(month));
  const monthLabel = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(month + '-01T12:00:00Z'));
  function moveMonth(offset: number) {
    if (mode !== 'month') {
      const next = addDays(anchor, offset * (mode === 'week' ? 7 : 1));
      setAnchor(next);
      setMonth(next.slice(0, 7));
      setSelected(null);
      return;
    }
    const date = new Date(month + '-01T12:00:00Z');
    date.setUTCMonth(date.getUTCMonth() + offset);
    setMonth(date.toISOString().slice(0, 7));
    setAnchor(date.toISOString().slice(0, 10));
    setSelected(null);
  }
  const first = month + '-01',
    weekday = (new Date(first + 'T12:00:00Z').getUTCDay() + 6) % 7;
  const start = addDays(first, -weekday),
    days = Array.from({ length: 42 }, (_, index) => addDays(start, index));
  const weekStart = addDays(anchor, -((new Date(anchor + 'T12:00:00Z').getUTCDay() + 6) % 7));
  const visibleDays =
    mode === 'month'
      ? days
      : mode === 'day'
        ? [anchor]
        : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const periodItems =
    mode === 'month'
      ? monthItems
      : items.filter((item) => visibleDays.includes(getItemDate(item)));
  return (
    <section className={`task-calendar calendar-mode-${mode}`}>
      <header className="calendar-toolbar">
        <div className="calendar-title">
          <span className="calendar-symbol">
            <CalendarDays size={22} />
          </span>
          <div>
            <h3 aria-live="polite">
              {mode === 'day'
                ? formatDate(anchor)
                : mode === 'week'
                  ? `${formatDate(weekStart)} – ${formatDate(addDays(weekStart, 6))}`
                  : monthLabel}
            </h3>
            <small>{periodItems.length} tugas · pribadi</small>
          </div>
        </div>
        <DateNav
          previousLabel={mode === 'month' ? 'Bulan sebelumnya' : mode === 'week' ? 'Minggu sebelumnya' : 'Hari sebelumnya'}
          nextLabel={mode === 'month' ? 'Bulan berikutnya' : mode === 'week' ? 'Minggu berikutnya' : 'Hari berikutnya'}
          onPrevious={() => moveMonth(-1)} onNext={() => moveMonth(1)}
          onToday={() => { setMonth(today().slice(0, 7)); setSelected(today()); setAnchor(today()); }}
        />
        <div className="calendar-modes" aria-label="Rentang kalender">
          {(['month', 'week', 'day'] as const).map((value) => (
            <Button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                setSelected(null);
              }}
            >
              {value === 'month' ? 'Bulan' : value === 'week' ? 'Minggu' : 'Hari'}
            </Button>
          ))}
        </div>

        <label className="calendar-month">
          Bulan
          <Input
            aria-label="Bulan kalender"
            type="month"
            value={month}
            onChange={(e) => {
              if (e.target.value) {
                setMonth(e.target.value);
                setAnchor(e.target.value + '-01');
                setSelected(null);
              }
            }}
          />
        </label>
      </header>

      <div className="calendar-grid">
        <div className="calendar-week">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <strong key={day}>{day}</strong>
          ))}
        </div>
        <div className="calendar-days">
          {visibleDays.map((date) => {
            const isSelected = selected === date;
            const isToday = date === today();
            const isOutside = date.slice(0, 7) !== month;
            const dayTasks = items.filter((item) => getItemDate(item) === date);
            const hasTasks = dayTasks.length > 0;

            return (
              <section
                key={date}
                className={`calendar-day-cell ${hasTasks ? 'calendar-has-tasks' : ''} ${isToday ? 'calendar-today' : ''} ${isOutside ? 'calendar-outside' : ''} ${isSelected ? 'calendar-selected' : ''}`}
                onClick={() => {
                  setMonth(date.slice(0, 7));
                  setSelected(date);
                  setAnchor(date);
                }}
              >
                <div className="calendar-day-header">
                  <Button
                    type="button"
                    className="calendar-day-number"
                    aria-label={formatDate(date)}
                    aria-pressed={isSelected}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMonth(date.slice(0, 7));
                      setSelected(date);
                      setAnchor(date);
                    }}
                  >
                    {Number(date.slice(-2))}
                  </Button>
                  {onCreate && (
                    <Button
                      className="calendar-add"
                      type="button"
                      title={`Tambah tugas ${formatDate(date)}`}
                      aria-label={`Tambah tugas ${formatDate(date)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreate(date);
                      }}
                    >
                      <Plus size={14} strokeWidth={2} />
                    </Button>
                  )}
                </div>
                {/* Mobile Event Dots Indicator */}
                {hasTasks && (
                  <div className="calendar-mobile-dots" aria-hidden="true">
                    {dayTasks.slice(0, 3).map((task, idx) => {
                      const priority = String(task.data?.priority || 'normal');
                      const status = String(task.data?.status || 'rencana');
                      const isUrgent = priority === 'mendesak';
                      const isHigh = priority === 'tinggi';
                      const isDone = status === 'selesai';
                      const dotType = isUrgent
                        ? 'urgent'
                        : isHigh
                          ? 'high'
                          : isDone
                            ? 'done'
                            : 'normal';
                      return (
                        <span
                          key={task.id || idx}
                          className={`cal-mobile-dot dot-${dotType}`}
                        />
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="cal-mobile-more">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="calendar-events-wrap">
                  {dayTasks.map((item) => (
                    <Button
                      type="button"
                      className="calendar-event"
                      data-status={String(item.data.status)}
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMonth(date.slice(0, 7));
                        setSelected(date);
                        onEdit?.(item);
                      }}
                    >
                      <span className="cal-task-dot" aria-hidden="true" />
                      <span className="cal-task-title">{String(item.data.title)}</span>
                    </Button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <div className="calendar-agenda">
        <div className="section-head calendar-agenda-header">
          <div className="calendar-agenda-title-group">
            <span className="calendar-agenda-header-icon" aria-hidden="true">
              <CalendarDays size={18} />
            </span>
            <h3>
              {selected
                ? formatDate(selected)
                : mode === 'month'
                  ? 'Agenda bulan ini'
                  : mode === 'week'
                    ? 'Agenda minggu ini'
                    : 'Agenda hari ini'}
            </h3>
            {selected && (
              <span className="calendar-agenda-task-count">
                {items.filter((item) => getItemDate(item) === selected).length} catatan
              </span>
            )}
          </div>
          <div className="calendar-agenda-actions">
            {onCreate && (
              <Button
                type="button"
                className="calendar-agenda-add-btn"
                onClick={() => onCreate(selected || anchor)}
              >
                <Plus size={15} strokeWidth={2.2} />
                <span>Tambah tugas</span>
              </Button>
            )}
            {selected && (
              <Button
                type="button"
                className="calendar-agenda-clear-btn"
                onClick={() => setSelected(null)}
              >
                Semua tanggal
              </Button>
            )}
          </div>
        </div>
        {(selected
          ? !items.some((item) => getItemDate(item) === selected)
          : !periodItems.length) && (
          <p className="calendar-empty">
            {selected
              ? 'Tidak ada tugas pada tanggal ini.'
              : mode === 'month'
                ? 'Belum ada tugas bulan ini.'
                : 'Belum ada tugas pada rentang ini.'}
          </p>
        )}
        {Array.from(
          new Set(
            periodItems
              .map((item) => getItemDate(item))
              .filter(
                (date) =>
                  Boolean(date) &&
                  date !== 'undefined' &&
                  date !== 'null' &&
                  (selected ? date === selected : true),
              ),
          ),
        )
          .sort()
          .map((date) => (
            <section
              key={date}
              className={`calendar-agenda-day-group ${selected ? 'is-selected-view' : ''}`}
            >
              {!selected && (
                <div className="calendar-agenda-day-head">
                  <span className="agenda-day-pill">{formatDate(date)}</span>
                  <span className="agenda-day-count">
                    {items.filter((item) => getItemDate(item) === date).length} catatan
                  </span>
                </div>
              )}
              <div className="calendar-agenda-compact-list records">
                {items
                  .filter((item) => getItemDate(item) === date)
                  .map((item) => render(item))}
              </div>
            </section>
          ))}
      </div>
    </section>
  );
}
