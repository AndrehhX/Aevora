import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Settings, Sparkles, User } from 'lucide-react';
import { DURATION, EASE } from '../motion/presets';
import { useClickOutside } from '../hooks/useClickOutside';

const ITEMS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'pointsshop', label: 'Points Shop', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'signout', label: 'Sign out', icon: LogOut },
];

export type ProfileAction = 'profile' | 'pointsshop' | 'settings' | 'signout';

export default function ProfileDropdown({
  open,
  onClose,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  onAction: (id: ProfileAction) => void;
}) {
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
          transition={{ duration: DURATION.micro, ease: EASE.out }}
          className="absolute right-0 top-[calc(100%+8px)] z-[90] w-[175px] overflow-hidden rounded-[16px] border border-white/10 bg-[#161922]/95 p-1.5 shadow-[0_20px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        >
          {ITEMS.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onAction(item.id as ProfileAction);
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[12px] font-medium text-[#8E929E] transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <item.icon size={14} className={item.id === 'pointsshop' ? 'text-[#FFA043]' : 'text-[#8E929E]'} />
              {item.label}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
