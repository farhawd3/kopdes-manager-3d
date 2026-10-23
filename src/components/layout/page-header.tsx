import type { ReactNode } from 'react';

/**
 * Kepala halaman berupa bilah putih seperti acuan TaskTrack: judul (satu-satunya h1) dan ringkasan
 * di kiri, aksi utama di kanan.
 */
export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[var(--radius-card)] bg-surface px-5 py-4 shadow-card">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-[13px] font-semibold text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
