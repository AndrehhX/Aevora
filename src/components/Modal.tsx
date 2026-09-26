import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DURATION, EASE } from '../motion/presets';

// Reusable Aevora overlay shell: backdrop, Escape, outside-click, focus-safe.
export default function Modal({
  open,
  onClose,
  children,
  labelledBy,
  panelClass = 'max-w-[560px]',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
  panelClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.out }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: DURATION.normal, ease: EASE.out }}
            className={`relative max-h-[86vh] w-full overflow-hidden rounded-[18px] border border-[rgba(217,198,234,0.14)] bg-[rgba(23,16,31,0.97)] shadow-[0_32px_90px_rgba(0,0,0,0.7)] backdrop-blur-2xl ${panelClass}`}
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-3 top-3 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[rgba(217,198,234,0.12)] bg-black/40 text-[#D9C6EA]/80 backdrop-blur-xl transition-colors hover:text-[#F1EAF8]"
            >
              <X size={14} />
            </motion.button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
