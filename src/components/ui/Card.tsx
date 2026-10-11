import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={cn('ui-card', className)} />;
}
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header {...props} className={cn('ui-card-header', className)} />;
}
