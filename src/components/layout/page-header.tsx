import { Fragment, type ReactNode } from 'react';

/** Garis tegak pemisah bagian di bilah kepala, seperti bilah atas TaskTrack. */
export function HeaderDivider() {
  return <span className="hidden h-11 w-px bg-line lg:block" aria-hidden="true" />;
}

/**
 * Kepala halaman berupa bilah putih seperti acuan TaskTrack: judul (satu-satunya h1) dan ringkasan
 * di kiri, bagian tambahan dipisah garis tegak, aksi utama di kanan.
 */
export function PageHeader({
  title,
  subtitle,
  sections,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  sections?: ReactNode[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--radius-card)] bg-surface px-5 py-4 shadow-card ring-1 ring-line/60">
      <div className="min-w-0">
        <h1 className="text-[24px] leading-tight font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-[13px] font-semibold text-ink-3">{subtitle}</p>}
      </div>
      {sections?.map((section, index) => (
        <Fragment key={index}>
          <HeaderDivider />
          {section}
        </Fragment>
      ))}
      {actions && <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 md:ml-auto">{actions}</div>}
    </div>
  );
}
