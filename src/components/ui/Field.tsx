import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Field({ id, label, helper, error, children, className }: {
  id: string; label: string; helper?: string; error?: string; children: ReactNode; className?: string;
}) {
  return <div className={cn('ui-field', className)}>
    <label className="ui-field-label" htmlFor={id}>{label}</label>
    {children}
    {helper && <span id={`${id}-helper`} className="ui-field-helper">{helper}</span>}
    {error && <span id={`${id}-error`} className="ui-field-error" role="alert">{error}</span>}
  </div>;
}
