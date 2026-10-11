import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'success' | 'danger' | 'warn' | 'info';
}) { return <span {...props} className={cn('ui-badge', className)} data-tone={tone} />; }
