'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import * as motion from 'motion/react-m';
import { LogoMark } from '@/components/ui/logo';
import { PageIcon } from '@/components/ui/icon';
import { NAV_FOOTER, NAV_GROUPS, PAGES, type PageId } from './nav';
import { useLoadedWorkspace, organizationInfo } from '@/features/workspace/use-loaded-workspace';
import { projectTone } from '@/lib/tones';
import { isProjectHistory } from '@/features/projects/lifecycle';
import { ProfileMenu } from './profile-menu';
import { cn } from '@/lib/utils';

export const activePage = (pathname: string): PageId | undefined =>
  (Object.keys(PAGES) as PageId[]).find(
    (id) => pathname === `/${id}` || pathname.startsWith(`/${id}/`),
  );

/** Nama koperasi pendek untuk ruang sempit sidebar. */
function shortCoopName(name: string) {
  if (name.length <= 18) return name;
  return name.replace(/^Koperasi Produsen/i, 'Kop. Produsen').replace(/^Koperasi/i, 'Kop.');
}

function NavLink({ id, active, open }: { id: PageId; active: boolean; open?: number }) {
  const page = PAGES[id];
  return (
    <Link
      href={`/${id}`}
      aria-current={active ? 'page' : undefined}
      title={page.label}
      className={cn(
        'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[14.5px] font-semibold transition-colors',
        'max-lg:h-14 max-lg:flex-col max-lg:justify-center max-lg:gap-0.5 max-lg:px-1 max-lg:text-[10.5px]',
        active ? 'font-bold text-ink' : 'text-ink-2 hover:text-ink',
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-surface shadow-card ring-1 ring-line/70"
          transition={{ type: 'spring', stiffness: 420, damping: 38 }}
        />
      )}
      <PageIcon
        name={page.icon}
        className={cn('relative size-[19px] shrink-0', active && 'text-accent-strong')}
      />
      <span className="relative truncate max-lg:max-w-full">{page.label}</span>
      {open !== undefined && open > 0 && (
        <span className="tabular relative ml-auto rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-ink-2 shadow-sm max-lg:hidden">
          {open}
        </span>
      )}
    </Link>
  );
}

/** Sidebar laptop (penuh) dan rel tablet (ikon + label kecil). Disembunyikan di HP. */
export function Sidebar() {
  const pathname = usePathname();
  const query = useSearchParams();
  const data = useLoadedWorkspace();
  const active = activePage(pathname);
  const coop = organizationInfo(data).name;
  const projects = (data.workstreams || []).filter((row) => !isProjectHistory(row)).slice(0, 6);
  return (
    <aside className="sticky top-0 hidden h-dvh w-[84px] shrink-0 flex-col border-r border-line bg-surface-2 md:flex lg:w-[264px]">
      <Link
        href="/home"
        className="flex items-center gap-3 px-5 pt-6 pb-6 max-lg:justify-center max-lg:px-0"
        aria-label="Kopdes, ke Beranda"
      >
        <LogoMark />
        <span className="min-w-0 max-lg:hidden">
          <span className="block text-[23px] leading-none font-extrabold tracking-[-0.03em]">
            Kopdes
          </span>
          <span className="mt-1 block truncate text-xs font-semibold text-ink-3">
            {coop ? shortCoopName(coop) : 'Ruang kerja manajer'}
          </span>
        </span>
      </Link>
      <nav aria-label="Menu utama" className="scrollbar-none flex-1 overflow-y-auto px-3 pb-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase max-lg:hidden">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5 max-lg:border-t max-lg:border-line max-lg:pt-2">
              {group.pages.map((id) => (
                <NavLink key={id} id={id} active={active === id} />
              ))}
            </div>
          </div>
        ))}
        {projects.length > 0 && (
          <div className="mb-3 max-lg:hidden">
            <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">
              Proyek aktif
            </p>
            {projects.map((project) => {
              const current =
                pathname === `/projects/${project.id}` ||
                (active === 'tasks' && query.get('project') === project.id);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  data-tone={projectTone(project)}
                  className={cn(
                    'flex h-9 items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold transition-colors',
                    current ? 'bg-tone text-tone-ink' : 'text-ink-2 hover:bg-surface',
                  )}
                >
                  <span className="size-2.5 shrink-0 rounded-[4px] bg-tone-bar" />
                  <span className="truncate">{String(project.data.title)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
      <div className="flex flex-col gap-0.5 border-t border-line px-3 pt-2">
        {NAV_FOOTER.map((id) => (
          <NavLink key={id} id={id} active={active === id} />
        ))}
      </div>
      <div className="p-3">
        <ProfileMenu compact />
      </div>
    </aside>
  );
}
