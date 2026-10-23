import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

const CONTROL =
  'w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink transition outline-none hover:border-line-strong focus:border-accent-strong focus:ring-4 focus:ring-accent disabled:opacity-55 aria-invalid:border-late-ink';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(CONTROL, 'h-11', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea className={cn(CONTROL, 'min-h-24 py-2.5 leading-relaxed', className)} {...props} />
  );
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <span className="relative block">
      <select className={cn(CONTROL, 'h-11 appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3"
        aria-hidden="true"
      />
    </span>
  );
}

/** Label, kontrol, petunjuk, dan pesan galat dalam satu susunan yang sama di semua formulir. */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[13px] font-semibold text-ink-2">
        {label}
        {required && <span className="text-late-ink"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-ink-3">{hint}</span>}
      {error && (
        <span className="text-xs font-semibold text-late-ink" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
