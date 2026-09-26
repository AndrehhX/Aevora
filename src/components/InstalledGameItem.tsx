import { motion } from 'framer-motion';
import type { InstalledGame } from '../data/mock';
import { SmartImage } from './SmartImage';

export default function InstalledGameItem({
  game,
  active,
  index,
  onSelect,
}: {
  game: InstalledGame;
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 + index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`group relative flex w-full items-center gap-2.5 rounded-[10px] px-1.5 py-[5px] text-left transition-colors duration-200 ${
        active ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
      }`}
    >
      {/* active indicator */}
      <span
        className={`absolute left-[-8px] top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#c084fc] to-[#e5489b] transition-all duration-200 ${
          active ? 'opacity-100 shadow-[0_0_12px_rgba(181,101,255,0.8)]' : 'opacity-0'
        }`}
      />
      <span className="relative h-[28px] w-[28px] shrink-0 overflow-hidden rounded-[7px] border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <SmartImage
          src={game.cover}
          fallback={game.fallback}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
        />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className={`block truncate text-[11px] font-medium ${active ? 'text-white' : 'text-white/85 group-hover:text-white'}`}>
          {game.title}
        </span>
        {game.subtitle && (
          <span className="block truncate text-[8.5px] font-medium text-[#7ee787]/90">{game.subtitle}</span>
        )}
      </span>
      {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c084fc] shadow-[0_0_8px_rgba(192,132,252,0.9)]" />}
    </motion.button>
  );
}
