import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useDragSort } from '@/components/ui/useDragSort';
import { Button } from '@/components/ui/Button';

function Harness({
  drop,
  disabled = false,
}: {
  drop: (id: string, target: string) => void;
  disabled?: boolean;
}) {
  const { root: dragRef, preview: dragPreview, handle: dragHandle } = useDragSort(drop, disabled);
  return (
    <div ref={dragRef}>
      <Button {...dragHandle('task')}>Seret</Button>
      <div data-drop-zone="proses">Tujuan</div>
      <output>{dragPreview ? 'Aktif' : 'Diam'}</output>
    </div>
  );
}
function pointer(type: string, target: Element, options: Record<string, unknown> = {}) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: 100,
    clientY: 100,
  });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: options.pointerType || 'touch' },
    isPrimary: { value: true },
  });
  for (const [key, value] of Object.entries(options))
    if (key !== 'pointerType') Object.defineProperty(event, key, { value });
  fireEvent(target, event);
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: vi.fn(() => document.querySelector('[data-drop-zone]')),
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it('sentuhan singkat dan scroll sebelum long-press tidak mengubah status', () => {
  const drop = vi.fn();
  render(<Harness drop={drop} />);
  const handle = screen.getByRole('button');
  pointer('pointerdown', handle);
  pointer('pointerup', handle);
  act(() => vi.advanceTimersByTime(300));
  expect(drop).not.toHaveBeenCalled();
  pointer('pointerdown', handle);
  pointer('pointermove', handle, { clientY: 120 });
  act(() => vi.advanceTimersByTime(300));
  pointer('pointerup', handle);
  expect(drop).not.toHaveBeenCalled();
});
it('long-press 220ms memindahkan sekali ke zona pada posisi pelepasan', () => {
  const drop = vi.fn();
  render(<Harness drop={drop} />);
  const handle = screen.getByRole('button');
  pointer('pointerdown', handle);
  act(() => vi.advanceTimersByTime(219));
  expect(screen.getByText('Diam')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByText('Aktif')).toBeTruthy();
  pointer('pointerup', handle);
  pointer('pointerup', handle);
  expect(drop).toHaveBeenCalledExactlyOnceWith('task', 'proses');
});
it('Escape dan pointercancel membatalkan drag tanpa mutasi', () => {
  const drop = vi.fn();
  render(<Harness drop={drop} />);
  const handle = screen.getByRole('button');
  pointer('pointerdown', handle, { pointerType: 'mouse' });
  fireEvent.keyDown(window, { key: 'Escape' });
  pointer('pointerup', handle);
  pointer('pointerdown', handle, { pointerType: 'mouse' });
  pointer('pointercancel', handle);
  pointer('pointerup', handle);
  expect(drop).not.toHaveBeenCalled();
});
it('busy dan tujuan di luar papan tidak memindahkan catatan', () => {
  const drop = vi.fn();
  const view = render(<Harness drop={drop} disabled />);
  pointer('pointerdown', screen.getByRole('button'), { pointerType: 'mouse' });
  expect(screen.getByText('Diam')).toBeTruthy();
  view.rerender(<Harness drop={drop} />);
  vi.mocked(document.elementFromPoint).mockReturnValue(document.body);
  pointer('pointerdown', screen.getByRole('button'), { pointerType: 'mouse' });
  pointer('pointerup', screen.getByRole('button'));
  expect(drop).not.toHaveBeenCalled();
});
