import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DURATION, EASE } from '../motion/presets';

export interface ToastData {
  id: number;
  msg: string;
}

export default function ToastHost({ toast, onDone }: { toast: ToastData | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex flex-col items-end gap-2">
      <AnimatePresence mode="popLayout">
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: DURATION.fast, ease: EASE.out }}
            className="pointer-events-auto flex max-w-[280px] items-start gap-2 rounded-[12px] border border-[rgba(217,198,234,0.14)] bg-[rgba(23,16,31,0.92)] px-3.5 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            <p className="flex-1 text-[12px] font-medium leading-snug text-[#F1EAF8]/90">{toast.msg}</p>
            <button onClick={onDone} aria-label="Dismiss notification" className="text-[#BEA0D8]/60 transition-colors hover:text-[#F1EAF8]">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
