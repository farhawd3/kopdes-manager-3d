'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cloneElement, useState, type ReactElement } from 'react';
import * as motion from 'motion/react-m';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { PageIcon } from '@/components/ui/icon';
import { LogoMark } from '@/components/ui/logo';
import { NAV_FOOTER, NAV_GROUPS, PAGES, type PageId } from './nav';
import { useLoadedWorkspace, organizationInfo } from '@/features/workspace/use-loaded-workspace';
import { projectTone } from '@/lib/tones';
import { usePreference } from '@/lib/use-preference';
import { useMedia } from '@/lib/use-media';
import { isProjectHistory } from '@/features/projects/lifecycle';
import { ProfileMenu } from './profile-menu';
import { cn } from '@/lib/utils';

export const activePage = (pathname: string): PageId | undefined =>
  (Object.keys(PAGES) as PageId[]).find((id) => pathname === `/${id}` || pathname.startsWith(`/${id}/`));

/** Nama koperasi pendek untuk ruang sempit sidebar. */
function shortCoopName(name: string) {
  if (name.length <= 18) return name;
  return name.replace(/^Koperasi Produsen/i, 'Kop. Produsen').replace(/^Koperasi/i, 'Kop.');
}

/**
 * Keterangan saat ikon rel disorot atau difokus. Posisi tetap (fixed) agar tidak terpotong oleh
 * daftar menu yang bisa digulir; sengaja tanpa pustaka tooltip supaya unduhan awal tetap kecil.
 */
function Hint({ label, show, children }: { label: string; show: boolean; children: ReactElement<React.HTMLAttributes<HTMLElement>> }) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  if (!show) return children;
  const open = (event: React.SyntheticEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAt({ x: rect.right + 10, y: rect.top + rect.height / 2 });
  };
  const close = () => setAt(null);
  return (
    <>
      {cloneElement(children, { onMouseEnter: open, onMouseLeave: close, onFocus: open, onBlur: close })}
      {at && (
        <span
          role="tooltip"
          className="pop pointer-events-none fixed z-50 -translate-y-1/2 rounded-xl bg-action px-3 py-1.5 text-[13px] font-bold whitespace-nowrap text-on-action shadow-float"
          style={{ left: at.x, top: at.y }}
        >
          {label}
        </span>
      )}
    </>
  );
}

function NavLink({ id, active, wide }: { id: PageId; active: boolean; wide: boolean }) {
  const page = PAGES[id];
  return (
    <Hint label={page.label} show={!wide}>
      <Link
        href={`/${id}`}
        aria-current={active ? 'page' : undefined}
        aria-label={wide ? undefined : page.label}
        className={cn(
          'group relative flex h-11 items-center rounded-2xl text-[14.5px] font-semibold transition-colors',
          wide ? 'gap-3 px-3' : 'w-11 justify-center',
          active ? 'font-bold text-accent-ink' : 'text-ink-3 hover:bg-surface-2 hover:text-ink',
        )}
      >
        {active && (
          <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-2xl bg-accent" transition={{ type: 'spring', stiffness: 420, damping: 38 }} />
        )}
        <PageIcon name={page.icon} className={cn('relative size-5 shrink-0', active && 'text-accent-strong')} />
        {wide && <span className="relative truncate">{page.label}</span>}
      </Link>
    </Hint>
  );
}

/**
 * Menu samping: rel ikon ramping (acuan "Task management") dengan keterangan saat disorot. Di laptop
 * bisa dibuka lebar berlabel; pilihan disimpan di peramban. Disembunyikan di HP.
 */
export function Sidebar() {
  const pathname = usePathname();
  const query = useSearchParams();
  const data = useLoadedWorkspace();
  const [mode, setMode] = usePreference('kopdes-sidebar', 'rail');
  const active = activePage(pathname);
  const coop = organizationInfo(data).name;
  const projects = (data.workstreams || []).filter((row) => !isProjectHistory(row)).slice(0, 6);
  // Tablet selalu rel; laptop mengikuti pilihan pengguna.
  const wide = useMedia('(min-width: 1024px)') && mode === 'wide';
  return (
      <aside
        data-wide={wide || undefined}
        className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center border-r border-line bg-surface md:flex data-[wide]:w-[256px] data-[wide]:items-stretch"
      >
        <Link href="/home" className={cn('flex items-center gap-3 pt-6 pb-5', wide && 'px-5')} aria-label="Kopdes, ke Beranda">
          <LogoMark />
          {wide && (
            <span className="min-w-0">
              <span className="block text-[23px] leading-none font-extrabold tracking-[-0.03em]">Kopdes</span>
              <span className="mt-1 block truncate text-xs font-semibold text-ink-3">{coop ? shortCoopName(coop) : 'Ruang kerja manajer'}</span>
            </span>
          )}
        </Link>
        <nav aria-label="Menu utama" className={cn('scrollbar-none flex w-full flex-1 flex-col items-center overflow-y-auto pb-3', wide && 'items-stretch px-3')}>
          {NAV_GROUPS.map((group, index) => (
            <div key={group.label} className={cn('flex flex-col items-center gap-1.5', wide && 'items-stretch')}>
              {wide ? (
                <p className="px-3 pt-3 pb-1 text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">{group.label}</p>
              ) : (
                index > 0 && <span className="my-2 h-px w-8 bg-line" aria-hidden="true" />
              )}
              {group.pages.map((id) => (
                <NavLink key={id} id={id} active={active === id} wide={wide} />
              ))}
            </div>
          ))}
          {wide && projects.length > 0 && (
            <div className="mt-2">
              <p className="px-3 pt-3 pb-1 text-[11px] font-bold tracking-[0.08em] text-ink-3 uppercase">Proyek aktif</p>
              {projects.map((project) => {
                const current = pathname === `/projects/${project.id}` || (active === 'tasks' && query.get('project') === project.id);
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    data-tone={projectTone(project)}
                    className={cn('flex h-9 items-center gap-3 rounded-xl px-3 text-[13.5px] font-semibold transition-colors', current ? 'bg-tone text-tone-ink' : 'text-ink-2 hover:bg-surface-2')}
                  >
                    <span className="size-2.5 shrink-0 rounded-[4px] bg-tone-bar" />
                    <span className="truncate">{String(project.data.title)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
        <div className={cn('flex w-full flex-col items-center gap-1.5 border-t border-line pt-3', wide && 'items-stretch px-3')}>
          {NAV_FOOTER.map((id) => (
            <NavLink key={id} id={id} active={active === id} wide={wide} />
          ))}
          <Hint label="Perluas menu" show={!wide}>
            <button
              type="button"
              onClick={() => setMode(wide ? 'rail' : 'wide')}
              aria-label={wide ? 'Ciutkan menu' : 'Perluas menu'}
              className={cn('hidden h-11 items-center rounded-2xl text-[14.5px] font-semibold text-ink-3 transition hover:bg-surface-2 hover:text-ink lg:flex', wide ? 'gap-3 px-3' : 'w-11 justify-center')}
            >
              {wide ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
              {wide && 'Ciutkan menu'}
            </button>
          </Hint>
        </div>
        <div className={cn('w-full p-3', !wide && 'flex justify-center')}>
          <ProfileMenu compact={wide} />
        </div>
      </aside>
  );
}
