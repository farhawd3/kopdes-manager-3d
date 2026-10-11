'use client';
import type { ReactNode } from 'react';
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
  return (
    <div role="group" aria-label={label} className={cn('ui-segmented', className)}>
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
