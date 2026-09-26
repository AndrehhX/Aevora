import { motion } from 'framer-motion';
import { communityItems } from '../data/mock';
import { SmartImage } from './SmartImage';

export default function CommunityPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-2.5 backdrop-blur-xl"
    >
      <div className="mb-2 flex items-center gap-1.5 px-0.5">
        <span className="text-[11px] font-semibold text-white/90">Community</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {communityItems.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.07, duration: 0.35 }}
            className="group flex cursor-pointer items-start gap-2"
          >
            <span className="h-[26px] w-[26px] shrink-0 overflow-hidden rounded-[6px] border border-white/10">
              <SmartImage
                src={c.thumb}
                fallback={c.fallback}
                alt="thumb"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
              />
            </span>
            <p className="line-clamp-2 text-[9px] font-medium leading-[1.35] text-white/55 transition-colors group-hover:text-white/85">
              {c.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
