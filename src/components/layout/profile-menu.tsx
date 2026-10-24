'use client';
import Link from 'next/link';
import { DropdownMenu } from 'radix-ui';
import { Check, ChevronsUpDown, LockKeyhole, Moon, Settings, Sun } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { ACCENTS, useTheme } from '@/lib/theme';
import { api, resetAuthNavigation } from '@/lib/client';
import { useLoadedWorkspace, organizationInfo } from '@/features/workspace/use-loaded-workspace';
import { MenuContent, MenuItem, MenuSeparator } from '@/components/ui/menu';
import { cn } from '@/lib/utils';

/** Profil manajer: tema, warna sorotan, pengaturan, dan kunci aplikasi. */
export function ProfileMenu({ compact }: { compact?: boolean }) {
  const data = useLoadedWorkspace();
  const { manager, name: organization } = organizationInfo(data);
  const name = manager || 'Manajer';
  const { theme, setTheme, accent, setAccent } = useTheme();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl text-left transition hover:bg-surface-2',
          compact
            ? 'bg-surface p-2 shadow-card max-lg:justify-center max-lg:bg-transparent max-lg:shadow-none'
            : 'p-0',
        )}
        aria-label="Profil dan tampilan"
      >
        <Avatar name={name} className={compact ? 'size-10 ring-0' : 'size-11 ring-0'} />
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
      <MenuContent
        side={compact ? 'right' : 'bottom'}
        align="end"
        sideOffset={10}
        className="w-72 rounded-3xl p-2"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
          <Avatar name={name} className="size-11 ring-0" />
          <div className="min-w-0">
            <p className="truncate font-bold">{name}</p>
            <p className="truncate text-xs text-ink-3">{organization || 'Manajer koperasi'}</p>
          </div>
        </div>
        <div
          className="mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1"
          role="group"
          aria-label="Tema"
        >
          {(['light', 'dark'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
              className="flex h-9 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-ink-3 transition aria-pressed:bg-surface aria-pressed:font-bold aria-pressed:text-ink aria-pressed:shadow-card"
            >
              {value === 'light' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {value === 'light' ? 'Terang' : 'Gelap'}
            </button>
          ))}
        </div>
        <div
          className="flex items-center justify-between px-2 py-3"
          role="group"
          aria-label="Warna sorotan"
        >
          {ACCENTS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-label={option.label}
              aria-pressed={accent === option.id}
              onClick={() => setAccent(option.id)}
              className="grid size-8 place-items-center rounded-full text-white ring-offset-2 ring-offset-surface transition hover:scale-110 active:scale-95 aria-pressed:ring-2 aria-pressed:ring-ink-3"
              style={{ background: `var(--swatch-${option.id})` }}
            >
              {accent === option.id && <Check className="size-4" strokeWidth={3} />}
            </button>
          ))}
        </div>
        <MenuSeparator />
        <MenuItem asChild>
          <Link href="/settings">
            <Settings />
            Pengaturan
          </Link>
        </MenuItem>
        <MenuItem
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
        </MenuItem>
      </MenuContent>
    </DropdownMenu.Root>
  );
}
