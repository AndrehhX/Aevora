import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorState = 'default' | 'interactive' | 'pressed' | 'dragging' | 'text';

// Subtle Aevora pointer: precise dot + softly lagging lavender ring.
// MotionValues only — no React state per mousemove. Fine-pointer devices only.
export default function CustomCursor({ enabled: enabledProp = true }: { enabled?: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>('default');
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.dataset.aevoraCursor = enabledProp && finePointer && !reducedMotion ? 'on' : 'off';
    if (!enabledProp) {
      setEnabled(false);
      return;
    }
    if (!finePointer || reducedMotion) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    let down = false;
    const classify = (t: HTMLElement | null): CursorState => {
      if (!t || !t.closest) return 'default';
      if (down && t.closest('[data-dragging="true"]')) return 'dragging';
      if (t.closest('input, textarea, [contenteditable="true"]')) return 'text';
      if (t.closest('button, a, [role="button"], [data-cursor="interactive"]')) return 'interactive';
      return 'default';
    };
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setState((prev) => {
        const next: CursorState = down ? (prev === 'dragging' || (e.target as HTMLElement)?.closest?.('[data-dragging="true"]') ? 'dragging' : 'pressed') : classify(e.target as HTMLElement);
        return next === prev ? prev : next;
      });
    };
    const onDown = () => {
      down = true;
      setState('pressed');
    };
    const onUp = (e: MouseEvent) => {
      down = false;
      setState(classify(e.target as HTMLElement));
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
    return () => {
      document.documentElement.dataset.aevoraCursor = 'off';
    };
  }, [x, y, enabledProp]);

  if (!enabled) return null;

  const ringScale = state === 'interactive' ? 1.55 : state === 'pressed' ? 0.8 : state === 'dragging' ? 1.35 : 1;
  const ringOpacity = state === 'text' ? 0.35 : 0.9;

  return (
    <>
      {/* precise dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[200]"
        style={{ x, y, opacity: state === 'text' ? 0 : 1 }}
      >
        <div
          className="rounded-full bg-[#F1EAF8]"
          style={{ width: 5, height: 5, transform: 'translate(-50%, -50%)', boxShadow: '0 0 6px rgba(217,198,234,0.8)' }}
        />
      </motion.div>
      {/* lagging ring */}
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[200]" style={{ x: ringX, y: ringY }}>
        <div style={{ transform: 'translate(-50%, -50%)' }}>
          <motion.div
            className="rounded-full border border-[#D9C6EA]/60"
            animate={{ scale: ringScale, opacity: ringOpacity }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: 26, height: 26 }}
          />
        </div>
      </motion.div>
    </>
  );
}
