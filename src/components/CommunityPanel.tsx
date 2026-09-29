import { motion } from 'framer-motion';
import type { CommunityItem } from '../data/navigation';

export default function CommunityPanel({ onItemClick }: { onItemClick: (item: CommunityItem) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[14px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.14)] p-2.5 backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center gap-1.5 px-0.5">
        <span className="text-[11px] font-semibold text-[#F1EAF8]/90">Community</span>
      </div>
      <div className="rounded-[10px] border border-dashed border-[rgba(217,198,234,0.14)] px-2.5 py-3 text-[10px] leading-snug text-[#BEA0D8]/55">
        Connect Steam to see current activity here.
      </div>
    </motion.div>
  );
}
