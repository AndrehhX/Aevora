import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Settings, User } from 'lucide-react';
import { DURATION, EASE } from '../motion/presets';
import { useClickOutside } from '../hooks/useClickOutside';

const ITEMS = [
  { id: 'profile', label: 'Profile', icon: User, msg: 'Profile coming soon' },
  { id: 'settings', label: 'Settings', icon: Settings, msg: 'Settings coming soon' },
  { id: 'signout', label: 'Sign out', icon: LogOut, msg: 'Sign out is disabled in this prototype' },
];

export default function ProfileDropdown({
  open,
  onClose,
  onAction,
}: {
  open: boolean;
  onClose: () => void;
  onAction: (msg: string) => void;
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
          className="absolute right-0 top-[calc(100%+8px)] z-[90] w-[160px] overflow-hidden rounded-[12px] border border-[rgba(217,198,234,0.12)] bg-[rgba(23,16,31,0.95)] p-1 shadow-[0_20px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          {ITEMS.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onAction(item.msg);
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[12px] font-medium text-[#D9C6EA]/85 transition-colors hover:bg-[rgba(74,53,96,0.32)] hover:text-[#F1EAF8]"
            >
              <item.icon size={14} className="text-[#BEA0D8]/70" />
              {item.label}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
