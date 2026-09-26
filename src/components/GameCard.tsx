import { motion } from 'framer-motion';
import type { PopularGame } from '../data/mock';
import { SmartImage } from './SmartImage';

export default function GameCard({ game, index }: { game: PopularGame; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group w-[clamp(110px,10.2vw,158px)] shrink-0 cursor-pointer snap-start"
    >
      <motion.div
        whileHover={{ scale: 1.045, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#1a102c] shadow-[0_14px_36px_-14px_rgba(0,0,0,0.8)] transition-shadow duration-200 group-hover:shadow-[0_18px_44px_-12px_rgba(181,101,255,0.35)]"
      >
        <SmartImage
          src={game.cover}
          fallback={game.fallback}
          alt={game.title}
          className="h-full w-full object-cover object-top brightness-[0.96] transition-all duration-200 group-hover:brightness-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
        <div className="pointer-events-none absolute inset-0 rounded-[14px] border border-white/0 transition-all duration-200 group-hover:border-[#c084fc]/40 group-hover:shadow-[inset_0_0_20px_rgba(181,101,255,0.15)]" />
      </motion.div>
      <div className="mt-1.5 truncate px-0.5 text-center text-[11px] font-medium text-white/80 transition-colors group-hover:text-white">
        {game.shortTitle}
      </div>
    </motion.div>
  );
}
