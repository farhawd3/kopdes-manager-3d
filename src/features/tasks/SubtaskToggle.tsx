'use client';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import type { MouseEventHandler } from 'react';

export function SubtaskToggle({
  done,
  title,
  busy,
  disabled,
  onClick,
}: {
  done: boolean;
  title: string;
  busy?: boolean;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <Button
      type="button"
      className="subtask-toggle"
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy}
      aria-pressed={done}
      aria-label={
        busy
          ? `Menyimpan: ${title}`
          : `${done ? 'Tandai belum selesai' : 'Tandai selesai'}: ${title}`
      }
    >
      <span className="subtask-toggle-mark" aria-hidden="true">
        {busy ? (
          <span className="subtask-pending-dot" />
        ) : done ? (
          <Check size={14} strokeWidth={2.5} />
        ) : null}
      </span>
    </Button>
  );
}
