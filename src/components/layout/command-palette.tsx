'use client';
import { Command } from 'cmdk';
import { Dialog } from 'radix-ui';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CornerDownLeft, ListPlus, Moon, Search, Sun, Zap } from 'lucide-react';
import { PageIcon } from '@/components/ui/icon';
import { NAV_FOOTER, NAV_GROUPS, PAGES, recordLink } from './nav';
import { useLoadedWorkspace } from '@/features/workspace/use-loaded-workspace';
import { searchWorkspace } from '@/features/notifications/follow-ups';
import { parseQuickAdd } from '@/features/home/quick-add';
import { useTheme } from '@/lib/theme';
import { today } from '@/lib/date';
import { QUICK_ACTIONS } from './quick-actions';

const ITEM =
  'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-2 data-[selected=true]:bg-accent data-[selected=true]:text-accent-ink [&_svg]:size-[18px] [&_svg]:shrink-0';
const GROUP =
  '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-ink-3';

/**
 * Palet Ctrl K: buka halaman, jalankan perintah, cari catatan yang sudah dimuat, atau buat tugas
 * dari kalimat. Pencarian tidak dikirim ke layanan lain.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const data = useLoadedWorkspace();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const results = useMemo(
    () => (query.trim().length > 1 ? searchWorkspace(data, query) : []),
    [data, query],
  );
  const go = (href: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(href);
  };
  const draft = query.trim()
    ? parseQuickAdd(query, {
        today: today(),
        staff: (data.staff || []).map((row) => String(row.data.title)),
        projects: (data.workstreams || []).map((row) => ({
          id: row.id,
          title: String(row.data.title),
        })),
      })
    : null;
  const draftHref = draft
    ? '/tasks?new=1&' +
      new URLSearchParams(
        Object.entries(draft)
          .filter(([, value]) => value)
          .map(([key, value]) => [`fill.${key}`, String(value)]),
      ).toString()
    : '';
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay fixed inset-0 z-50 bg-[var(--scrim)] backdrop-blur-[2px]" />
        <Dialog.Content className="pop fixed top-[10vh] left-1/2 z-50 w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-3xl bg-surface shadow-float">
          <Dialog.Title className="sr-only">Cari dan buka</Dialog.Title>
          <Dialog.Description className="sr-only">
            Cari halaman, perintah, atau catatan
          </Dialog.Description>
          <Command label="Cari dan buka" loop shouldFilter>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-5 text-ink-3" aria-hidden="true" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Cari tugas, halaman, atau tulis tugas baru…"
                className="h-14 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:text-ink-3"
              />
              <kbd className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] font-bold text-ink-3">
                Esc
              </kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="p-6 text-center text-sm text-ink-3">
                Tidak ada yang cocok. Coba kata lain.
              </Command.Empty>
              {draft && (
                <Command.Group heading="Buat" className={GROUP}>
                  <Command.Item
                    value={`buat tugas ${query}`}
                    onSelect={() => go(draftHref)}
                    className={ITEM}
                  >
                    <ListPlus />
                    <span className="truncate">
                      Buat tugas: <span className="text-ink">{draft.title}</span>
                    </span>
                    <CornerDownLeft className="ml-auto opacity-50" />
                  </Command.Item>
                </Command.Group>
              )}
              {results.length > 0 && (
                <Command.Group heading="Catatan" className={GROUP}>
                  {results.map((result) => (
                    <Command.Item
                      key={result.id}
                      value={`${result.title} ${result.kind} ${result.context} ${result.id}`}
                      onSelect={() => go(recordLink(result.entity, result.id.split(':')[1]))}
                      className={ITEM}
                    >
                      <span className="min-w-0 flex-1 truncate text-ink">{result.title}</span>
                      <span className="shrink-0 text-xs text-ink-3">{result.kind}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              <Command.Group heading="Perintah" className={GROUP}>
                {QUICK_ACTIONS.flatMap((group) => group.items).map((action) => (
                  <Command.Item
                    key={action.href}
                    value={`tambah ${action.label}`}
                    onSelect={() => go(action.href)}
                    className={ITEM}
                  >
                    <action.icon />
                    Tambah {action.label.toLowerCase()}
                  </Command.Item>
                ))}
                <Command.Item
                  value="lihat tugas terlambat"
                  onSelect={() => go('/tasks?status=terlambat')}
                  className={ITEM}
                >
                  <Zap />
                  Lihat tugas terlambat
                </Command.Item>
                <Command.Item
                  value={theme === 'dark' ? 'pakai tema terang' : 'pakai tema gelap'}
                  onSelect={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                    onOpenChange(false);
                  }}
                  className={ITEM}
                >
                  {theme === 'dark' ? <Sun /> : <Moon />}
                  {theme === 'dark' ? 'Pakai tema terang' : 'Pakai tema gelap'}
                </Command.Item>
              </Command.Group>
              <Command.Group heading="Halaman" className={GROUP}>
                {[...NAV_GROUPS.flatMap((group) => group.pages), ...NAV_FOOTER].map((id) => (
                  <Command.Item
                    key={id}
                    value={`buka ${PAGES[id].label}`}
                    onSelect={() => go(`/${id}`)}
                    className={ITEM}
                  >
                    <PageIcon name={PAGES[id].icon} />
                    {PAGES[id].label}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
