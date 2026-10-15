import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { UnifiedGame } from '../domain/game';
import { isInstalled } from '../domain/library';
import { SmartImage } from './SmartImage';
import { getSteamCoverCandidates } from '../integrations/steam/steamAssets';

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
  const steamEntry = game.providers.find((p) => p.provider === 'steam');
  const appId = steamEntry ? steamEntry.externalId : game.id.startsWith('steam:') ? game.id.slice(6) : undefined;
  
  const coverCandidates = useMemo(() => {
    if (appId) {
      return getSteamCoverCandidates(appId, game.artwork.cover, game.artwork.coverFallback, game.artwork.coverFallback2);
    }
    return [game.artwork.cover, game.artwork.coverFallback, game.artwork.coverFallback2].filter(Boolean) as string[];
  }, [appId, game.artwork.cover, game.artwork.coverFallback, game.artwork.coverFallback2]);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: 0.05 + index * 0.03, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={compact ? undefined : { x: 3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      title={compact ? game.title : undefined}
      aria-label={game.title}
      className={`group relative flex w-full items-center gap-2.5 rounded-[12px] px-2 py-1.5 text-left transition-all duration-200 ${
        compact ? 'justify-center' : ''
      } ${
        active
          ? 'bg-gradient-to-r from-[#8263A1]/35 to-[#A07CC1]/20 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
          : 'border border-transparent hover:bg-white/[0.04] hover:border-white/[0.05]'
      }`}
    >
      {/* active indicator */}
      <span
        className={`absolute -left-1 top-1/2 h-[18px] w-[3.5px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[#BEA0D8] to-[#8263A1] transition-all duration-300 ${
          active ? 'opacity-100 shadow-[0_0_12px_rgba(190,160,216,0.8)] scale-100' : 'opacity-0 scale-50'
        }`}
      />
      <span className="relative h-[32px] w-[32px] shrink-0 overflow-hidden rounded-[8px] border border-white/10 bg-[#17101F] shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        <SmartImage
          src={coverCandidates[0] ?? game.artwork.cover}
          fallback={coverCandidates[1] ?? game.artwork.coverFallback}
          fallback2={coverCandidates[2] ?? game.artwork.coverFallback2}
          alt={game.title}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
        />
      </span>
      <span className={`min-w-0 flex-1 leading-tight ${compact ? 'hidden' : ''}`}>
        <span className={`block truncate text-[11.5px] font-semibold tracking-wide ${active ? 'text-white' : 'text-[#D9C6EA]/80 group-hover:text-white'}`}>
          {game.title}
        </span>
        <span className="block truncate text-[9px] font-medium text-[#BEA0D8]/70">
          {isInstalled(game) ? 'Installed' : game.subtitle ?? 'Steam library'}
        </span>
      </span>
      {active && !compact && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#A07CC1] shadow-[0_0_8px_rgba(190,160,216,0.8)]" />
      )}
    </motion.button>
  );
}
