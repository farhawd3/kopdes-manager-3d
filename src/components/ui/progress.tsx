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
  onTone,
}: {
  value: number;
  segments?: number;
  label?: string;
  className?: string;
  /** Di atas kartu pastel: ruas kosong putih seperti acuan. */
  onTone?: boolean;
}) {
  // Ruas terakhir bisa terisi sebagian (70% = lima ruas dan setengah ruas), seperti batang TaskTrack.
  const exact = (Math.max(0, Math.min(100, value)) / 100) * segments;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('flex h-[5px] gap-1', className)}
    >
      {Array.from({ length: segments }, (_, index) => {
        const fill = Math.max(0, Math.min(1, exact - index));
        return (
          <span
            key={index}
            className={cn(
              'relative flex-1 overflow-hidden rounded-full',
              onTone ? 'bg-surface/80' : 'bg-[color-mix(in_srgb,var(--tone-bar,var(--ink-3))_22%,transparent)]',
            )}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--tone-bar,var(--accent-strong))] transition-[width] duration-500"
              style={{ width: `${fill * 100}%` }}
            />
          </span>
        );
      })}
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
