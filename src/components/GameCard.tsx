import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { UnifiedGame } from '../domain/game';
import { CARD_STAGGER, EASE, SPRING } from '../motion/presets';
import { SmartImage } from './SmartImage';
import { getSteamCoverCandidates } from '../integrations/steam/steamAssets';
import { isInstalled } from '../domain/library';

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
  const steamEntry = game.providers.find((p) => p.provider === 'steam');
  const appId = steamEntry ? steamEntry.externalId : game.id.startsWith('steam:') ? game.id.slice(6) : undefined;
  
  const coverCandidates = useMemo(() => {
    if (appId) {
      return getSteamCoverCandidates(appId, game.artwork.cover, game.artwork.coverFallback, game.artwork.coverFallback2);
    }
    return [game.artwork.cover, game.artwork.coverFallback, game.artwork.coverFallback2].filter(Boolean) as string[];
  }, [appId, game.artwork.cover, game.artwork.coverFallback, game.artwork.coverFallback2]);

  const installed = isInstalled(game);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * CARD_STAGGER, duration: 0.45, ease: EASE.out }}
      onClick={() => onSelect(game.id)}
      onMouseEnter={() => onFocus?.(index)}
      className="group w-[clamp(100px,8vw,140px)] shrink-0 cursor-pointer snap-start"
      data-cursor="interactive"
    >
      <motion.div
        whileHover={{ scale: 1.045, y: -4 }}
        whileTap={{ scale: 0.97 }}
        transition={SPRING.soft}
        className={`relative aspect-[2/3] w-full overflow-hidden rounded-[16px] border bg-[#17101F] transition-all duration-300 ${
          selected
            ? 'border-[#A07CC1]/90 shadow-[0_16px_40px_-8px_rgba(160,124,193,0.45),inset_0_0_16px_rgba(160,124,193,0.25)] ring-1 ring-[#A07CC1]/50'
            : 'border-white/[0.08] shadow-[0_14px_32px_-12px_rgba(0,0,0,0.8)] group-hover:border-[#A07CC1]/50 group-hover:shadow-[0_20px_44px_-10px_rgba(160,124,193,0.30)]'
        } ${focused ? 'ring-2 ring-[rgba(190,160,216,0.9)] ring-offset-2 ring-offset-[#0D0912]' : ''}`}
      >
        <SmartImage
          candidates={coverCandidates}
          src={coverCandidates[0] ?? game.artwork.cover}
          fallback={coverCandidates[1] ?? game.artwork.coverFallback}
          fallback2={coverCandidates[2] ?? game.artwork.coverFallback2}
          alt={game.title}
          className={`h-full w-full object-cover object-top transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 ${
            selected ? 'brightness-105 contrast-105' : 'brightness-95'
          }`}
        />

        {/* Ambient bottom gradient for title readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15 opacity-90 transition-opacity duration-300 group-hover:opacity-75" />

        {/* Specular sheen on top edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Installed indicator pill */}
        {installed && (
          <span className="absolute top-2 left-2 flex h-2 w-2 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </span>
        )}

        {/* Active glowing border inset */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-[16px] transition-all duration-300 ${
            selected
              ? 'ring-1 ring-inset ring-white/20'
              : 'group-hover:ring-1 group-hover:ring-inset group-hover:ring-white/10'
          }`}
        />
      </motion.div>

      <div
        className={`mt-2 truncate px-1 text-center text-[11.5px] font-semibold tracking-wide transition-colors duration-200 ${
          selected ? 'text-white' : 'text-[#D9C6EA]/75 group-hover:text-white'
        }`}
      >
        {game.title}
      </div>
    </motion.div>
  );
}

