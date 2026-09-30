import { motion } from 'framer-motion';
import type { UnifiedGame } from '../domain/game';
import { isInstalled } from '../domain/library';
import { SmartImage } from './SmartImage';

export default function InstalledGameItem({
  game,
  active,
  index,
  onSelect,
  compact = false,
}: {
  game: UnifiedGame;
  active: boolean;
  index: number;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: 0.08 + index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={compact ? undefined : { x: 3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      title={compact ? game.title : undefined}
      aria-label={game.title}
      className={`group relative flex w-full items-center gap-2.5 rounded-[10px] px-1.5 py-[5px] text-left transition-colors duration-200 ${
        compact ? 'justify-center' : ''
      } ${active ? 'bg-[rgba(130,99,161,0.22)]' : 'hover:bg-[rgba(74,53,96,0.28)]'}`}
    >
      {/* active indicator */}
      <span
        className={`absolute left-[-8px] top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#A07CC1] to-[#8263A1] transition-all duration-200 ${
          active ? 'opacity-100 shadow-[0_0_12px_rgba(190,160,216,0.55)]' : 'opacity-0'
        }`}
      />
      <span className="relative h-[28px] w-[28px] shrink-0 overflow-hidden rounded-[7px] border border-[rgba(217,198,234,0.12)] bg-[rgba(74,53,96,0.25)] shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <SmartImage
          src={game.artwork.cover}
          fallback={game.artwork.coverFallback}
          fallback2={game.artwork.coverFallback2}
          alt={game.title}
          className="h-full w-full object-cover transition-all duration-200 group-hover:scale-[1.03] group-hover:brightness-110"
        />
      </span>
      <span className={`min-w-0 flex-1 leading-tight ${compact ? 'hidden' : ''}`}>
        <span className={`block truncate text-[11px] font-medium ${active ? 'text-[#F1EAF8]' : 'text-[#D9C6EA]/85 group-hover:text-[#F1EAF8]'}`}>
          {game.title}
        </span>
        <span className="block truncate text-[8.5px] font-medium text-[#BEA0D8]/90">
          {isInstalled(game) ? 'Installed' : game.subtitle ?? 'Owned on Steam'}
        </span>
      </span>
      {active && !compact && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A07CC1] shadow-[0_0_8px_rgba(190,160,216,0.6)]" />}
    </motion.button>
  );
}
