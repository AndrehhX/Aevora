import { motion } from 'framer-motion';
import type { UnifiedGame } from '../domain/game';
import { CARD_STAGGER, EASE, SPRING } from '../motion/presets';
import { SmartImage } from './SmartImage';

export default function GameCard({
  game,
  index,
  selected,
  focused = false,
  onSelect,
  onFocus,
}: {
  game: UnifiedGame;
  index: number;
  selected: boolean;
  focused?: boolean;
  onSelect: (id: string) => void;
  onFocus?: (index: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * CARD_STAGGER, duration: 0.45, ease: EASE.out }}
      onClick={() => onSelect(game.id)}
      onMouseEnter={() => onFocus?.(index)}
      className="group w-[clamp(110px,10.2vw,158px)] shrink-0 cursor-pointer snap-start"
      data-cursor="interactive"
    >
      <motion.div
        whileHover={{ scale: 1.035, y: -3 }}
        whileTap={{ scale: 0.97 }}
        transition={SPRING.soft}
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-[14px] border bg-[#17101F] shadow-[0_14px_36px_-14px_rgba(0,0,0,0.8)] transition-[box-shadow,border-color,filter] duration-200 ${
          selected
            ? 'border-[#A07CC1]/60 shadow-[0_18px_44px_-12px_rgba(190,160,216,0.30)]'
            : 'border-[rgba(217,198,234,0.10)] group-hover:border-[rgba(190,160,216,0.35)] group-hover:shadow-[0_18px_44px_-12px_rgba(190,160,216,0.28)]'
        } ${focused ? 'ring-1 ring-[rgba(190,160,216,0.8)] ring-offset-2 ring-offset-[#0D0912]' : ''}`}
      >
        <SmartImage
          src={game.artwork.cover}
          fallback={game.artwork.coverFallback}
          alt={game.title}
          className={`h-full w-full object-cover object-top transition-all duration-200 group-hover:brightness-110 ${
            selected ? 'brightness-[1.04]' : 'brightness-[0.96]'
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
        <div
          className={`pointer-events-none absolute inset-0 rounded-[14px] transition-all duration-200 ${
            selected
              ? 'border border-[#A07CC1]/40 shadow-[inset_0_0_20px_rgba(190,160,216,0.12)]'
              : 'border border-white/0 group-hover:border-[#A07CC1]/40 group-hover:shadow-[inset_0_0_20px_rgba(190,160,216,0.15)]'
          }`}
        />
      </motion.div>
      <div
        className={`mt-1.5 truncate px-0.5 text-center text-[11px] font-medium transition-colors ${
          selected ? 'text-[#F1EAF8]' : 'text-[#D9C6EA]/80 group-hover:text-[#F1EAF8]'
        }`}
      >
        {game.title}
      </div>
    </motion.div>
  );
}
