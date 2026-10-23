'use client';
import { useLoadedWorkspace, organizationInfo } from '@/features/workspace/use-loaded-workspace';
import { greeting, useJakartaClock } from '@/lib/clock';
import { cn } from '@/lib/utils';

/** Sapaan di bilah atas, seperti "Welcome back" pada acuan: sapaan kecil di atas nama manajer. */
export function Greeting({ className }: { className?: string }) {
  const now = useJakartaClock();
  const { manager } = organizationInfo(useLoadedWorkspace());
  return (
    <div className={cn('flex-col leading-tight', className)}>
      <span className="text-[13px] font-semibold text-ink-3">{greeting(now)},</span>
      <span className="truncate text-[16px] font-extrabold text-ink">{manager || 'Manajer'}</span>
    </div>
  );
}
