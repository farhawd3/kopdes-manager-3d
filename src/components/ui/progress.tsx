import { cn } from '@/lib/utils';

/**
 * Batang progres bersegmen ala TaskTrack. Warna mengikuti nada induknya (`data-tone`) bila ada,
 * selain itu warna aksen.
 */
export function SegmentBar({
  value,
  segments = 8,
  label,
  className,
}: {
  value: number;
  segments?: number;
  label?: string;
  className?: string;
}) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * segments);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('flex h-1.5 gap-1', className)}
    >
      {Array.from({ length: segments }, (_, index) => (
        <span
          key={index}
          className={cn(
            'flex-1 rounded-full transition-colors duration-500',
            index < filled ? 'bg-[var(--tone-bar,var(--accent-strong))]' : 'bg-[color-mix(in_srgb,var(--tone-bar,var(--ink-3))_22%,transparent)]',
          )}
        />
      ))}
    </div>
  );
}

export function Bar({ value, className, label }: { value: number; className?: string; label?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 overflow-hidden rounded-full bg-surface-3', className)}
    >
      <span
        className="block h-full rounded-full bg-[var(--tone-bar,var(--accent-strong))] transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
