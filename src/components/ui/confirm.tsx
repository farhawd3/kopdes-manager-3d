'use client';
import { AlertDialog } from 'radix-ui';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Button } from './button';

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
};
const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(
  async () => false,
);

/** Satu-satunya dialog di tengah layar: konfirmasi sebelum tindakan yang tidak bisa diurungkan. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(undefined);
  const confirm = useCallback(
    (next: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOptions(next);
      }),
    [],
  );
  const finish = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = undefined;
    setOptions(null);
  };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={Boolean(options)} onOpenChange={(open) => !open && finish(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="overlay fixed inset-0 z-[60] bg-[var(--scrim)]" />
          <AlertDialog.Content className="pop fixed top-1/2 left-1/2 z-[60] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-surface p-6 shadow-float outline-none">
            <AlertDialog.Title className="text-lg font-bold text-ink">
              {options?.title}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-ink-2">
              {options?.description || 'Tindakan ini tidak dapat diurungkan.'}
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="ghost">Batal</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="primary"
                  className={
                    options?.danger
                      ? 'bg-late-ink text-surface hover:bg-late-ink hover:brightness-110'
                      : ''
                  }
                  onClick={() => finish(true)}
                >
                  {options?.confirmLabel || 'Lanjutkan'}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
