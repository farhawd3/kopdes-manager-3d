import type { ReactNode } from 'react';

/** Kepala halaman: satu-satunya h1 di halaman, ringkasan singkat, dan aksi utama di kanan. */
export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-1 pb-5">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-ink md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
