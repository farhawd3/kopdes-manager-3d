'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Popover } from 'radix-ui';
import { Toaster } from 'sonner';
import { LazyMotion } from 'motion/react';
import { Plus, Search } from 'lucide-react';
import { ConfirmProvider } from '@/components/ui/confirm';
import { Sheet } from '@/components/ui/sheet';
import { PageIcon } from '@/components/ui/icon';
import { useTheme } from '@/lib/theme';
import { Sidebar, activePage } from './sidebar';
import { MobileDock } from './mobile-dock';
import dynamic from 'next/dynamic';
import { QuickActionsPanel } from './quick-actions';
import { ProfileMenu } from './profile-menu';
import { NAV_FOOTER, NAV_GROUPS, PAGES } from './nav';
import { NotificationBell } from '@/features/notifications/notification-bell';
import { ShortcutList } from './shortcuts';
import { Greeting } from './greeting';

const CommandPalette = dynamic(
  () => import('./command-palette').then((module) => module.CommandPalette),
  { ssr: false },
);

// Fitur animasi dimuat sesudah halaman tampil agar unduhan awal kecil.
const loadMotion = () => import('@/components/ui/motion-features').then((module) => module.default);

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));

export function AppShell({ children }: { children: React.ReactNode }) {
  useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [palette, setPalette] = useState(false);
  const [quick, setQuick] = useState(false);
  const [quickSheet, setQuickSheet] = useState(false);
  const [menu, setMenu] = useState(false);
  const [help, setHelp] = useState(false);
  const page = activePage(pathname);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette((open) => !open);
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || typing(event.target)) return;
      if (document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"]'))
        return;
      if (event.key === '/') {
        event.preventDefault();
        setPalette(true);
      } else if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        router.push('/tasks?new=1');
      } else if (event.key === '?') {
        event.preventDefault();
        setHelp(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const overlays = (
    <>
      {palette && <CommandPalette open={palette} onOpenChange={setPalette} />}
      <Toaster
        position="bottom-center"
        offset={88}
        mobileOffset={96}
        toastOptions={{
          classNames: {
            toast:
              '!rounded-2xl !border-0 !bg-action !text-on-action !shadow-float !font-sans !font-semibold',
            actionButton:
              '!rounded-xl !bg-[color-mix(in_srgb,var(--on-action)_16%,transparent)] !text-on-action !font-bold',
            description: '!text-on-action/80',
          },
        }}
      />
    </>
  );
  // Dunia 3D memakai layar penuh dengan bilahnya sendiri.
  if (pathname.startsWith('/world'))
    return (
      <LazyMotion features={loadMotion}>
        <ConfirmProvider>
          {children}
          {overlays}
        </ConfirmProvider>
      </LazyMotion>
    );
  return (
    <LazyMotion features={loadMotion}>
      <ConfirmProvider>
        <div className="flex min-h-dvh">
          <Suspense fallback={<div className="hidden w-[84px] md:block lg:w-[264px]" />}>
            <Sidebar />
          </Suspense>
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur-md md:px-8 md:py-4">
              <div className="md:hidden">
                <ProfileMenu />
              </div>
              <Greeting className="flex min-w-0 max-md:flex-1 md:max-lg:hidden" />
              <button
                type="button"
                onClick={() => setPalette(true)}
                className="hidden h-12 min-w-0 items-center gap-3 rounded-2xl bg-surface px-4 text-sm font-semibold text-ink-2 shadow-card transition hover:text-ink md:flex md:w-[min(34rem,40vw)] lg:mx-auto"
                aria-label="Cari atau buka (Ctrl K)"
              >
                <Search className="size-5 shrink-0" />
                <span className="truncate">Cari tugas, catatan, atau halaman</span>
                <kbd className="ml-auto flex items-center gap-1.5 text-[12px] font-bold text-ink">
                  <span className="rounded-md px-1.5 py-0.5 ring-1 ring-line-strong">Ctrl</span>K
                </kbd>
              </button>
              <div className="flex items-center gap-3 md:max-lg:ml-auto">
                <div className="flex items-center gap-1 rounded-full bg-surface p-1 shadow-card">
                  <button
                    type="button"
                    onClick={() => setPalette(true)}
                    aria-label="Cari"
                    className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-surface-2 md:hidden"
                  >
                    <Search className="size-5" />
                  </button>
                  <NotificationBell />
                  <Popover.Root open={quick} onOpenChange={setQuick}>
                    <Popover.Trigger className="hidden h-10 items-center gap-1.5 rounded-full bg-action pr-4 pl-3 text-sm font-bold text-on-action transition hover:bg-action-hover active:scale-[0.97] md:inline-flex">
                      <Plus className="size-[18px]" strokeWidth={2.6} />
                      Tambah
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        align="end"
                        sideOffset={10}
                        collisionPadding={16}
                        className="pop z-50 w-[min(36rem,calc(100vw-2rem))] rounded-3xl bg-surface p-4 shadow-float"
                      >
                        <QuickActionsPanel onPick={() => setQuick(false)} />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
                <div className="hidden lg:block">
                  <ProfileMenu />
                </div>
              </div>
            </header>
            <main id="main" className="flex-1 px-4 pt-4 pb-32 md:px-8 md:pt-6 md:pb-12">
              {children}
            </main>
          </div>
        </div>
        <MobileDock
          onAdd={() => setQuickSheet(true)}
          onMenu={() => setMenu(true)}
          adding={quickSheet}
        />
        <Sheet
          open={quickSheet}
          onOpenChange={setQuickSheet}
          title="Tambah catatan"
          description="Pilih yang ingin dicatat"
        >
          <QuickActionsPanel onPick={() => setQuickSheet(false)} />
        </Sheet>
        <Sheet open={menu} onOpenChange={setMenu} title="Semua menu">
          <nav aria-label="Semua halaman" className="flex flex-col gap-5">
            {[...NAV_GROUPS, { label: 'Lainnya', pages: NAV_FOOTER }].map((group) => (
              <section key={group.label}>
                <h3 className="mb-2 text-xs font-bold tracking-wide text-ink-3 uppercase">
                  {group.label}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {group.pages.map((id) => (
                    <Link
                      key={id}
                      href={`/${id}`}
                      onClick={() => setMenu(false)}
                      aria-current={page === id ? 'page' : undefined}
                      className="flex flex-col items-center gap-2 rounded-2xl bg-surface-2 px-2 py-4 text-center text-[13px] font-bold text-ink-2 aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink"
                    >
                      <PageIcon name={PAGES[id].icon} className="size-6" />
                      {PAGES[id].label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </Sheet>
        <Sheet open={help} onOpenChange={setHelp} title="Pintasan papan ketik">
          <ShortcutList />
        </Sheet>
        {overlays}
      </ConfirmProvider>
    </LazyMotion>
  );
}
