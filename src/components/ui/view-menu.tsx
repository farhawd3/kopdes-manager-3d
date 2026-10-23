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
      {/* Laptop: "Papan — Ganti tampilan ⌄" seperti acuan; HP dan tablet: kapsul ringkas berikon. */}
      <DropdownMenu.Trigger
        aria-label={`${label}: ${current.label}`}
        className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-surface-2 pr-3 pl-3.5 text-left ring-1 ring-line outline-none transition hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-accent-strong lg:gap-3 lg:rounded-xl lg:bg-transparent lg:px-1 lg:ring-0 lg:hover:bg-transparent [&>svg]:shrink-0"
      >
        <span className="text-accent-strong lg:hidden [&_svg]:size-[18px]">{current.icon}</span>
        <span className="text-[15px] font-bold text-ink lg:text-[22px] lg:font-extrabold lg:tracking-tight">{current.label}</span>
        <span className="hidden h-0.5 w-3 rounded-full bg-ink-2 lg:block" aria-hidden="true" />
        <span className="hidden text-[13px] font-semibold text-ink-2 lg:inline">{caption}</span>
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
