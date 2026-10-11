import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  primary?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger-soft';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
};
/** Tombol bersama: status proses dan ukuran sentuh mengikuti token global. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { busy, loading, primary, variant, size = 'md', iconOnly, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      {...props}
      className={cn('ui-btn', primary && 'primary', className)}
      data-variant={variant ?? (primary || className?.split(/\s+/).includes('primary') ? 'primary' : 'secondary')}
      data-size={size}
      data-icon-only={iconOnly || undefined}
      disabled={disabled || busy || loading}
      aria-busy={busy || loading || props['aria-busy']}
    >
      {busy || loading ? (iconOnly ? children : 'Memproses…') : children}
    </button>
  );
});

export const IconButton = forwardRef<HTMLButtonElement, ButtonProps & { 'aria-label': string }>(
  function IconButton(props, ref) { return <Button {...props} ref={ref} iconOnly />; },
);
