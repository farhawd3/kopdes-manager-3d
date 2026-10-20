'use client';
import { type ReactNode, useEffect, useRef } from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export function SegmentedControl({
  label,
  value,
  options,
  onChange,
  className,
  children,
}: {
  label: string;
  value: string;
  options: { value: string; label: ReactNode; disabled?: boolean }[];
  onChange: (value: string) => void;
  className?: string;
  children?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLElement>('.ui-segmented-item.is-active');
    if (!activeEl) return;
    const pad = 8;
    if (
      activeEl.offsetLeft < container.scrollLeft + pad ||
      activeEl.offsetLeft + activeEl.offsetWidth > container.scrollLeft + container.clientWidth - pad
    ) {
      if (typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [value]);

  return (
    <div ref={containerRef} role="group" aria-label={label} className={cn('ui-segmented', className)}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            disabled={option.disabled}
            aria-pressed={active}
            className={cn('ui-segmented-item', active && 'is-active')}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {active && <span className="ui-segmented-active-dot" aria-hidden="true" />}
          </Button>
        );
      })}
      {children}
    </div>
  );
}
