import { AnimatePresence, motion } from 'framer-motion';
import { DURATION, EASE } from '../motion/presets';
import { useClickOutside } from '../hooks/useClickOutside';
import { useEffect } from 'react';

// Compact social popover anchored to the header social button.
export default function SocialPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(open, onClose);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: DURATION.fast, ease: EASE.out }}
          className="absolute right-0 top-[calc(100%+8px)] z-[90] w-[240px] overflow-hidden rounded-[14px] border border-[rgba(217,198,234,0.12)] bg-[rgba(23,16,31,0.97)] p-3 shadow-[0_20px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">Steam activity</div>
          <p className="py-2 text-center text-[11.5px] leading-snug text-[#BEA0D8]/55">Connect Steam to load friends and recent activity.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
