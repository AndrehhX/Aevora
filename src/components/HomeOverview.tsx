import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { getHomeStats } from '../domain/home';
import { EASE } from '../motion/presets';
import { SmartImage } from './SmartImage';
import { getSteamCoverCandidates } from '../integrations/steam/steamAssets';

function WindowsIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M0 2.268L6.444 1.39v6.082H0V2.268zm7.195-1.102L16 0v7.472H7.195V1.166zM0 8.528h6.444v6.083L0 13.732V8.528zm7.195 0H16V16l-8.805-1.166V8.528z" />
    </svg>
  );
}

export default function HomeOverview({
  library,
  selectedGame,
  steamConnected,
  newsCount,
  onOpenSelected,
}: {
  library: UnifiedGame[];
  selectedGame: UnifiedGame;
  steamConnected: boolean;
  newsCount: number;
  onOpenSelected: () => void;
}) {
  const stats = getHomeStats(library);
  const playtimeHours = Math.floor(stats.playtimeMinutes / 60);
  const developer = selectedGame.metadata?.developer ?? selectedGame.subtitle ?? 'Steam library';

  const steamEntry = selectedGame.providers.find((p) => p.provider === 'steam');
  const appId = steamEntry ? steamEntry.externalId : selectedGame.id.startsWith('steam:') ? selectedGame.id.slice(6) : undefined;
  const isInstalled = selectedGame.providers.some((p) => p.installed);

  const preview1Candidates = useMemo(() => {
    if (appId) {
      return [
        `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
        selectedGame.artwork.hero,
        selectedGame.artwork.heroFallback,
      ].filter(Boolean) as string[];
    }
    return [selectedGame.artwork.hero, selectedGame.artwork.cover].filter(Boolean) as string[];
  }, [appId, selectedGame.artwork.hero, selectedGame.artwork.heroFallback, selectedGame.artwork.cover]);

  const preview2Candidates = useMemo(() => {
    if (appId) {
      return [
        `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/capsule_616x353.jpg`,
        selectedGame.artwork.cover,
        selectedGame.artwork.coverFallback,
      ].filter(Boolean) as string[];
    }
    return [selectedGame.artwork.coverFallback, selectedGame.artwork.cover].filter(Boolean) as string[];
  }, [appId, selectedGame.artwork.cover, selectedGame.artwork.coverFallback]);

  const summary = selectedGame.description || selectedGame.subtitle || 
    `Immerse yourself in ${selectedGame.title} by ${developer}. Features high-fidelity visuals, cloud synchronization, and full controller support.`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.45, ease: EASE.out }}
      className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#14171E] p-6 shadow-2xl transition-all"
      aria-label="Aevora home overview"
    >
      {/* Warm orange spotlight radial glow in top right */}
      <div 
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,107,43,0.35)_0%,rgba(255,107,43,0.08)_50%,transparent_75%)] blur-2xl" 
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col">
        {/* Genre / Dev tag */}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#FF6B2B]">
          <Sparkles size={12} className="text-[#FF6B2B]" />
          <span>Spotlight Selection</span>
        </div>

        {/* Title */}
        <h2 className="mt-2 text-[22px] font-black tracking-tight text-white line-clamp-1">
          {selectedGame.title}
        </h2>

        {/* Short description */}
        <p className="mt-2.5 text-[12.5px] leading-relaxed text-[#8E929E] line-clamp-3">
          {summary}
        </p>

        {/* Price / Playtime Status */}
        <div className="mt-4 flex items-center justify-between text-[12px] font-semibold text-[#FFA043]">
          <span>{isInstalled ? `Installed • ${playtimeHours}h played` : 'Available on Steam'}</span>
          <span className="text-[#8E929E]/80 text-[11px] font-normal">{developer}</span>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={onOpenSelected}
          className="group mt-3.5 flex items-center justify-between w-full rounded-full bg-gradient-to-r from-[#FF6B2B] to-[#FF4B14] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_20px_-4px_rgba(255,107,43,0.45)] transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <span className="flex items-center gap-2">
            {isInstalled ? <Play size={14} className="fill-white" /> : null}
            {isInstalled ? 'Play now' : 'Available now'}
          </span>
          <div className="flex items-center gap-1.5 opacity-90 transition-transform group-hover:translate-x-0.5">
            <WindowsIcon className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Mini Preview Screenshots */}
      <div className="relative z-10 mt-5 pt-3 border-t border-white/[0.06]">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-[#8E929E]">
          <span>Media preview</span>
          <span className="text-[10px] text-[#FFA043]">{newsCount > 0 ? `${newsCount} updates` : 'Official assets'}</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-black/40 group">
            <SmartImage
              candidates={preview1Candidates}
              src={preview1Candidates[0] ?? ''}
              fallback={preview1Candidates[1]}
              alt={`${selectedGame.title} screenshot 1`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-black/40 group">
            <SmartImage
              candidates={preview2Candidates}
              src={preview2Candidates[0] ?? ''}
              fallback={preview2Candidates[1]}
              alt={`${selectedGame.title} screenshot 2`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
