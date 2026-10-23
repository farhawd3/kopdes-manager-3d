'use client';
import Link from 'next/link';
import { DropdownMenu } from 'radix-ui';
import { Check, ChevronsUpDown, LockKeyhole, Moon, Settings, Sun } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { ACCENTS, useTheme } from '@/lib/theme';
import { api, resetAuthNavigation } from '@/lib/client';
import { useLoadedWorkspace, organizationInfo } from '@/features/workspace/use-loaded-workspace';
import { cn } from '@/lib/utils';

const ITEM =
  'flex h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-2 outline-none data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink [&_svg]:size-[18px]';

/** Profil manajer: tema, warna sorotan, pengaturan, dan kunci aplikasi. */
export function ProfileMenu({ compact }: { compact?: boolean }) {
  const data = useLoadedWorkspace();
  const { manager } = organizationInfo(data);
  const name = manager || 'Manajer';
  const { theme, setTheme, accent, setAccent } = useTheme();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl text-left transition hover:bg-surface-2',
          compact ? 'bg-surface p-2 shadow-card max-lg:justify-center max-lg:bg-transparent max-lg:shadow-none' : 'p-0',
        )}
        aria-label="Profil dan tampilan"
      >
        <Avatar name={name} className="size-10 ring-0" />
        {compact && (
          <>
            <span className="min-w-0 flex-1 max-lg:hidden">
              <span className="block truncate text-sm font-bold">{name}</span>
              <span className="block text-xs text-ink-3">Manajer koperasi</span>
            </span>
            <ChevronsUpDown className="size-4 text-ink-3 max-lg:hidden" />
          </>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={compact ? 'right' : 'bottom'}
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="pop z-50 w-64 rounded-3xl bg-surface p-2 shadow-float"
        >
          <div className="px-3 py-2">
            <p className="font-bold">{name}</p>
            <p className="text-xs text-ink-3">Manajer koperasi</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item className={ITEM} onSelect={(event) => { event.preventDefault(); setTheme(theme === 'dark' ? 'light' : 'dark'); }}>
            {theme === 'dark' ? <Sun /> : <Moon />}
            {theme === 'dark' ? 'Tema terang' : 'Tema gelap'}
          </DropdownMenu.Item>
          <div className="flex items-center gap-2 px-3 py-2" role="group" aria-label="Warna sorotan">
            {ACCENTS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-label={option.label}
                aria-pressed={accent === option.id}
                onClick={() => setAccent(option.id)}
                className="grid size-8 place-items-center rounded-full text-white ring-offset-2 ring-offset-surface transition aria-pressed:ring-2 aria-pressed:ring-ink-3"
                style={{ background: option.swatch }}
              >
                {accent === option.id && <Check className="size-4" strokeWidth={3} />}
              </button>
            ))}
          </div>
          <DropdownMenu.Item asChild className={ITEM}>
            <Link href="/settings">
              <Settings />
              Pengaturan
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={ITEM}
            onSelect={async () => {
              try {
                await api('auth/pin', { action: 'logout' });
              } finally {
                resetAuthNavigation('/pin');
              }
            }}
          >
            <LockKeyhole />
            Kunci aplikasi
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
