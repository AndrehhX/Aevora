import { AnimatePresence, motion } from 'framer-motion';
import { friends, recentActivity } from '../data/mock';
import { DURATION, EASE } from '../motion/presets';
import { useClickOutside } from '../hooks/useClickOutside';
import { useEffect } from 'react';

// Compact mock social popover anchored to the header social button.
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

  const online = friends.filter((f) => f.online);

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
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">
            Friends Online · {online.length}
          </div>
          {online.length === 0 ? (
            <p className="py-2 text-center text-[11.5px] text-[#BEA0D8]/55">No friends online right now.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {online.map((f) => (
                <div key={f.id} className="flex items-center gap-2.5 rounded-[8px] px-1.5 py-1.5">
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4A3560] to-[#8263A1] text-[11px] font-bold text-[#F1EAF8]">
                    {f.name[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-[#F1EAF8]/90">{f.name}</span>
                    <span className="block truncate text-[10px] text-[#BEA0D8]/60">{f.game}</span>
                  </span>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#90d490]" />
                </div>
              ))}
            </div>
          )}
          <div className="mb-1.5 mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">Recent Activity</div>
          {recentActivity.length === 0 ? (
            <p className="py-2 text-center text-[11.5px] text-[#BEA0D8]/55">No recent activity.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {recentActivity.map((a) => (
                <div key={a.id} className="text-[11px] leading-snug">
                  <span className="font-semibold text-[#D9C6EA]/90">{a.user}</span>{' '}
                  <span className="text-[#BEA0D8]/65">{a.action}</span>{' '}
                  <span className="text-[#BEA0D8]/40">· {a.time}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
