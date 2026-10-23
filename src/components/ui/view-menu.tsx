'use client';
import type { ReactNode } from 'react';
import { DropdownMenu } from 'radix-ui';
import { Check, ChevronDown } from 'lucide-react';

type ViewItem = { id: string; label: string; icon?: ReactNode };

/** Pemilih tampilan bergaya "Board — Daily Task ⌄" pada acuan: nama tampilan besar, keterangan kecil, panah. */
export function ViewMenu({ label, caption, value, items, onChange }: { label: string; caption: string; value: string; items: ViewItem[]; onChange: (id: string) => void }) {
  const current = items.find((item) => item.id === value) || items[0];
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger aria-label={`${label}: ${current.label}`} className="flex h-11 items-center gap-3 rounded-xl px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-strong">
        <span className="text-[22px] font-extrabold tracking-tight text-ink">{current.label}</span>
        <span className="h-0.5 w-3 rounded-full bg-ink-2" aria-hidden="true" />
        <span className="text-[13px] font-semibold text-ink-2">{caption}</span>
        <ChevronDown className="size-4 text-ink-2" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={8} className="pop z-50 w-56 rounded-2xl bg-surface p-1.5 shadow-float">
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.id}
              onSelect={() => onChange(item.id)}
              className="flex h-10 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-2 outline-none data-[highlighted]:bg-surface-2 data-[highlighted]:text-ink [&_svg]:size-4"
            >
              {item.icon}
              {item.label}
              {item.id === current.id && <Check className="ml-auto text-accent-strong" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
