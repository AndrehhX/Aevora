// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Modal from '../../src/components/Modal';
import CustomCursor from '../../src/components/CustomCursor';
import { reducedMotionTransition } from '../../src/motion/presets';

function setMedia(pointer: 'fine' | 'coarse', reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('pointer') ? query.includes(pointer) : reduced,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe('accessibility and motion boundaries', () => {
  beforeEach(() => setMedia('fine', false));

  it('keeps the dialog close control keyboard-focusable and closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} labelledBy="test-title">
        <h2 id="test-title">Settings</h2>
        <button type="button">Focusable content</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    const close = screen.getByRole('button', { name: 'Close dialog' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    close.focus();
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render the decorative custom cursor on coarse pointers', () => {
    setMedia('coarse', false);
    const { container } = render(<CustomCursor enabled />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('does not render the decorative custom cursor when reduced motion is preferred', () => {
    setMedia('fine', true);
    const { container } = render(<CustomCursor enabled />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('uses an immediate transition contract when reduced motion is enabled', () => {
    expect(reducedMotionTransition(true).duration).toBe(0);
    expect(reducedMotionTransition(false).duration).toBeGreaterThan(0);
  });

  it('does not crash when the host has no matchMedia implementation', () => {
    const previous = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: undefined });
    expect(() => render(<CustomCursor enabled />)).not.toThrow();
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: previous });
  });
});
