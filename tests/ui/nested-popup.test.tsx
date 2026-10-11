import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';
afterEach(cleanup);
it('Escape/cancel pada modal anak tidak menutup dialog induk', () => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  const closeParent = vi.fn(), closeChild = vi.fn();
  render(<dialog open onCancel={closeParent}><Modal aria-label="Popup anak" onDismiss={closeChild}>Isi anak</Modal></dialog>);
  fireEvent(screen.getByRole('dialog', { name: 'Popup anak' }), new Event('cancel', { bubbles: true, cancelable: true }));
  expect(closeChild).toHaveBeenCalledOnce();
  expect(closeParent).not.toHaveBeenCalled();
});
