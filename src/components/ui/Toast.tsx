'use client';
import { Button } from './Button';
export function Toast({ message, action, busy }: { message: string; action?: { label: string; onClick: () => void }; busy?: boolean }) {
  return <div className="ui-toast" role="status"><span>{message}</span>{action && <Button type="button" variant="ghost" disabled={busy} onClick={action.onClick}>{action.label}</Button>}</div>;
}
