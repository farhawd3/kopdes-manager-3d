import { Slot } from 'radix-ui';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

const VARIANTS = {
  primary: 'bg-action text-on-action hover:bg-action-hover shadow-[0_8px_20px_-12px_var(--action)]',
  secondary: 'bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
  soft: 'bg-accent text-accent-ink hover:brightness-[0.97]',
  danger: 'text-late-ink hover:bg-late',
} as const;
const SIZES = {
  sm: 'h-9 gap-1.5 rounded-xl px-3 text-[13px]',
  md: 'h-11 gap-2 rounded-2xl px-4 text-sm',
  icon: 'size-10 rounded-xl',
  'icon-sm': 'size-8 rounded-lg',
} as const;

export type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  busy?: boolean;
  asChild?: boolean;
};

export function Button({
  variant = 'secondary',
  size = 'md',
  busy,
  asChild,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex shrink-0 select-none items-center justify-center font-semibold whitespace-nowrap transition duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-[18px] [&_svg]:shrink-0',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  if (asChild)
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
