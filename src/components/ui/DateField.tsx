'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { addDays, formatDate, today } from '@/lib/date';
import { usePopoverPlacement } from './usePopoverPlacement';
export function DateInput({
  name,
  label,
  defaultValue = '',
  required = false,
  disabled = false,
  value: controlledValue,
  onValueChange,
  className,
  min,
  max,
  'aria-label': ariaLabel,
}: {
  name?: string;
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  min?: string;
  max?: string;
  'aria-label'?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const id = useId(),
    trigger = useRef<HTMLButtonElement>(null);
  const [internalValue, setValue] = useState(defaultValue),
    [open, setOpen] = useState(false),
    [month, setMonth] = useState((defaultValue || today()).slice(0, 7));
  const value = controlledValue ?? internalValue;
  function changeValue(next: string) {
    setValue(next);
    onValueChange?.(next);
  }
  const root = usePopoverPlacement(open && !disabled, true);
  useEffect(() => {
    if (!open || disabled) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open, disabled, root]);
  const first = month + '-01';
  const offset = (new Date(first + 'T12:00:00Z').getUTCDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, index) => addDays(first, index - offset));
  function move(amount: number) {
    const date = new Date(first + 'T12:00:00Z');
    date.setUTCMonth(date.getUTCMonth() + amount);
    setMonth(date.toISOString().slice(0, 7));
  }
  function choose(date: string) {
    changeValue(date);
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <div
      className="ui-date"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      {label && <label htmlFor={id}>{label}</label>}
      <div className="ui-date-control">
        <input
          id={id}
          aria-label={ariaLabel || label}
          name={name}
          className="ui-date-native"
          tabIndex={-1}
          aria-hidden="true"
          min={min}
          max={max}
          type="date"
          required={required}
          disabled={disabled}
          value={value}
          onInvalid={(event) => {
            event.preventDefault();
            setMonth((value || today()).slice(0, 7));
            setOpen(true);
            trigger.current?.focus();
          }}
          onClick={(event) => {
            event.preventDefault();
            setMonth((value || today()).slice(0, 7));
            setOpen(true);
          }}
          onChange={(event) => {
            changeValue(event.target.value);
            if (event.target.value) setMonth(event.target.value.slice(0, 7));
          }}
        />
        <button
          className={`ui-btn ui-date-trigger ${className || ''}`}
          type="button"
          disabled={disabled}
          ref={trigger}
          aria-label={`Pilih ${(label || ariaLabel || 'tanggal').toLowerCase()}`}
          aria-expanded={open}
          aria-controls={id + '-picker'}
          aria-describedby={value ? id + '-value' : undefined}
          onClick={() => {
            setMonth((value || today()).slice(0, 7));
            setOpen(!open);
          }}
        >
          <span id={id + '-value'} className="date-trigger-value">
            {value ? value.split('-').reverse().join('/') : 'Pilih tanggal'}
          </span>
          <CalendarDays size={18} />
        </button>
      </div>
      {open && !disabled && (
        <div
          id={id + '-picker'}
          className="date-picker"
          data-popover
          role="group"
          aria-label={`Kalender ${label || ariaLabel || 'tanggal'}`}
        >
          <div className="date-picker-head">
            <button type="button" aria-label="Bulan sebelumnya" onClick={() => move(-1)}>
              <ChevronLeft size={16} />
            </button>
            <strong aria-live="polite">
              {new Intl.DateTimeFormat('id-ID', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              }).format(new Date(first + 'T12:00:00Z'))}
            </strong>
            <button type="button" aria-label="Bulan berikutnya" onClick={() => move(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="date-picker-week">
            {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, index) => (
              <span key={index}>{day}</span>
            ))}
          </div>
          <div className="date-picker-days">
            {days.map((date) => (
              <button
                type="button"
                key={date}
                aria-label={formatDate(date)}
                disabled={Boolean((min && date < min) || (max && date > max))}
                aria-pressed={date === value}
                aria-current={date === today() ? 'date' : undefined}
                data-outside={date.slice(0, 7) !== month}
                onClick={() => choose(date)}
              >
                {Number(date.slice(-2))}
              </button>
            ))}
          </div>
          <div className="date-picker-footer">
            <button
              type="button"
              disabled={Boolean((min && today() < min) || (max && today() > max))}
              onClick={() => choose(today())}
            >
              Hari ini
            </button>
            {!required && (
              <button type="button" onClick={() => choose('')}>
                Kosongkan
              </button>
            )}
            <button
              type="button"
              aria-label="Tutup kalender"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DateField(props: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return <DateInput {...props} />;
}
