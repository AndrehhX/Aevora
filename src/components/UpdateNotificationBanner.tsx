import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, Sparkles, X } from 'lucide-react';
import { installAppUpdate } from '../integrations/desktop/updater';

export default function UpdateNotificationBanner({
  version,
  body,
  onDismiss,
}: {
  version: string;
  body?: string;
  onDismiss: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setUpdating(true);
    setError(null);
    try {
      await installAppUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-30 mb-2 overflow-hidden rounded-[20px] border border-[#FF6B2B]/40 bg-gradient-to-r from-[#171922]/95 via-[#1E222D]/95 to-[#171922]/95 p-3.5 shadow-[0_12px_36px_rgba(255,107,43,0.18)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B2B] to-[#FF4B14] text-white shadow-md shadow-[#FF6B2B]/30">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-[13px] tracking-wide">
                Update available: Aevora v{version}
              </span>
              <span className="rounded-full bg-[#FF6B2B]/20 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#FFA043]">
                New
              </span>
            </div>
            <p className="truncate text-[11px] text-[#8E929E]">
              {body || 'A new release is available with performance improvements and new features.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={updating}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6B2B] to-[#FF4B14] px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-[#FF6B2B]/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {updating ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            <span>{updating ? 'Updating...' : 'Update & Restart'}</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full p-1.5 text-[#8E929E] hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Dismiss update"
          >
            <X size={15} />
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-[10.5px] text-red-400 font-medium">
          {error}
        </div>
      )}
    </motion.div>
  );
}
