import { motion } from 'framer-motion';
import type { CommunityItem } from '../data/mock';
import { communityItems } from '../data/mock';
import { SmartImage } from './SmartImage';

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
      <div className="flex flex-col gap-2.5">
        {communityItems.map((c, i) => (
          <motion.button
            key={c.id}
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.07, duration: 0.35 }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onItemClick(c)}
            className="group flex w-full cursor-pointer items-start gap-2 text-left"
          >
            <span className="h-[26px] w-[26px] shrink-0 overflow-hidden rounded-[6px] border border-[rgba(217,198,234,0.12)] bg-[rgba(74,53,96,0.25)]">
              <SmartImage
                src={c.thumb}
                fallback={c.fallback}
                alt="thumb"
                className="h-full w-full object-cover transition-all duration-200 group-hover:scale-110 group-hover:brightness-110"
              />
            </span>
            <span className="line-clamp-2 text-[9px] font-medium leading-[1.35] text-[#BEA0D8]/55 transition-colors group-hover:text-[#D9C6EA]/85">
              {c.text}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
