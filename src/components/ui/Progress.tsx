'use client';
import { useMotionEntry } from './useMotionEntry';

export function Progress({ value, label }: { value: number | null; label: string }) {
  const { ref, entered } = useMotionEntry<HTMLDivElement>();
  const percentage = value === null ? 0 : Math.min(100, Math.max(0, value));
  return (
    <div
      ref={ref}
      className="ui-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value === null ? undefined : percentage}
      aria-valuetext={value === null ? 'Belum dinilai' : `${value}%`}
    >
      <span style={{ transform: `scaleX(${entered ? percentage / 100 : 0})` }} />
    </div>
  );
}
