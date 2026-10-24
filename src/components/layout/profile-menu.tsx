'use client';
import Link from 'next/link';
import { DropdownMenu } from 'radix-ui';
import { ChevronsUpDown, LockKeyhole, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { api, resetAuthNavigation } from '@/lib/client';
import { useLoadedWorkspace, organizationInfo } from '@/features/workspace/use-loaded-workspace';
import { MenuContent, MenuItem, MenuSeparator } from '@/components/ui/menu';
import { cn } from '@/lib/utils';

/** Profil manajer: pengaturan dan kunci aplikasi. Tema dan warna sorotan ada di halaman Pengaturan. */
export function ProfileMenu({ compact }: { compact?: boolean }) {
  const data = useLoadedWorkspace();
  const { manager, name: organization } = organizationInfo(data);
  const name = manager || 'Manajer';
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
        className="w-64 rounded-3xl p-2"
      >
        <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
          <Avatar name={name} className="size-11 ring-0" />
          <div className="min-w-0">
            <p className="truncate font-bold">{name}</p>
            <p className="truncate text-xs text-ink-3">{organization || 'Manajer koperasi'}</p>
          </div>
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
