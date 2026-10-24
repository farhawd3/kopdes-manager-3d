'use client';
import { useEffect, useState } from 'react';
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
  // Isi mengalir dari ruas pertama: tampil mulai 0, lalu tiap ruas menunggu ruas sebelumnya penuh.
  const [fill, setFill] = useState({ from: 0, to: 0 });
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setFill((current) => ({ from: current.to, to: exact })),
    );
    return () => cancelAnimationFrame(frame);
  }, [exact]);
  const fills = (amount: number) =>
    Array.from({ length: segments }, (_, index) => Math.max(0, Math.min(1, amount - index)));
  const before = fills(fill.from);
  const after = fills(fill.to);
  // Mengisi berurutan dari kiri, mengosongkan dari kanan; satu ruas penuh 180 ms.
  const filling = fill.to >= fill.from;
  const timing: { delay: number; duration: number }[] = [];
  let elapsed = 0;
  for (let step = 0; step < segments; step++) {
    const index = filling ? step : segments - 1 - step;
    const duration = Math.abs(after[index] - before[index]) * 180;
    timing[index] = { delay: elapsed, duration };
    elapsed += duration;
  }
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
        return (
          <span
            key={index}
            className={cn(
              'relative flex-1 overflow-hidden rounded-full',
              onTone
                ? 'bg-surface/80'
                : 'bg-[color-mix(in_srgb,var(--tone-bar,var(--ink-3))_22%,transparent)]',
            )}
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--tone-bar,var(--accent-strong))] transition-[width] ease-linear"
              style={{
                width: `${after[index] * 100}%`,
                transitionDuration: `${timing[index].duration}ms`,
                transitionDelay: `${timing[index].delay}ms`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}

export function Bar({
  value,
  className,
  label,
}: {
  value: number;
  className?: string;
  label?: string;
}) {
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
