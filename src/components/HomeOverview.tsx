import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Database, Radio, Sparkles } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { getHomeStats } from '../domain/home';
import { EASE } from '../motion/presets';
import { SmartImage } from './SmartImage';
import { getSteamCoverCandidates } from '../integrations/steam/steamAssets';

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
  
  const coverCandidates = useMemo(() => {
    if (appId) {
      return getSteamCoverCandidates(appId, selectedGame.artwork.cover, selectedGame.artwork.coverFallback, selectedGame.artwork.coverFallback2);
    }
    return [selectedGame.artwork.cover, selectedGame.artwork.coverFallback, selectedGame.artwork.coverFallback2].filter(Boolean) as string[];
  }, [appId, selectedGame.artwork.cover, selectedGame.artwork.coverFallback, selectedGame.artwork.coverFallback2]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.45, ease: EASE.out }}
      className="grid gap-3 lg:grid-cols-[1.35fr_0.8fr_0.8fr]"
      aria-label="Aevora home overview"
    >
      <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className="group relative min-h-[152px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#17101F]/80 p-4 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(130,99,161,0.20)] via-transparent to-transparent pointer-events-none" />
        <div className="relative flex h-full gap-3.5">
          <SmartImage
            src={coverCandidates[0] ?? selectedGame.artwork.cover}
            fallback={coverCandidates[1] ?? selectedGame.artwork.coverFallback}
            fallback2={coverCandidates[2] ?? selectedGame.artwork.coverFallback2}
            alt={selectedGame.title}
            className="h-[114px] w-[80px] shrink-0 rounded-[12px] border border-white/15 object-cover shadow-[0_12px_28px_-10px_rgba(0,0,0,0.85)]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#BEA0D8]/75">
              <Sparkles size={11} className="text-[#A07CC1]" /> Selected from library
            </div>
            <h2 className="mt-1.5 truncate text-[19px] font-black tracking-[0.02em] text-[#F1EAF8]">{selectedGame.title}</h2>
            <p className="mt-0.5 truncate text-[11.5px] font-medium text-[#BEA0D8]/85">{developer}</p>
            <button
              type="button"
              onClick={onOpenSelected}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-gradient-to-r from-[#8263A1]/35 to-[#A07CC1]/25 px-3.5 py-1.5 text-[10.5px] font-bold text-white shadow-sm transition-all hover:border-white/30 hover:bg-[#8263A1]/50"
            >
              Open details <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className="relative min-h-[152px] overflow-hidden rounded-[16px] border border-[rgba(217,198,234,0.11)] bg-[rgba(74,53,96,0.18)] p-3.5">
        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.16em] text-[#BEA0D8]/65">
          <span className="flex items-center gap-1.5"><Database size={11} /> Library</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#A07CC1] shadow-[0_0_10px_rgba(190,160,216,0.8)]" />
        </div>
        <div className="mt-5 flex items-end gap-2">
          <strong className="text-[34px] font-extrabold leading-none text-[#F1EAF8]">{stats.totalGames}</strong>
          <span className="pb-0.5 text-[11px] text-[#BEA0D8]/75">games synced</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-[#D9C6EA]/70">
          <span><b className="text-[#F1EAF8]/90">{stats.installedGames}</b> installed</span>
          <span><b className="text-[#F1EAF8]/90">{playtimeHours}h</b> played</span>
        </div>
      </motion.div>

      <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className="relative min-h-[152px] overflow-hidden rounded-[16px] border border-[rgba(217,198,234,0.11)] bg-[rgba(23,16,31,0.74)] p-3.5">
        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.16em] text-[#BEA0D8]/65">
          <span className="flex items-center gap-1.5"><Radio size={11} /> Live layer</span>
          <span className={steamConnected ? 'text-[#A8D6B0]' : 'text-[#BEA0D8]/55'}>{steamConnected ? 'Online' : 'Offline'}</span>
        </div>
        <div className="mt-4 space-y-2 text-[11px] text-[#D9C6EA]/75">
          <div className="flex items-center justify-between border-b border-[rgba(217,198,234,0.08)] pb-2"><span>Steam sync</span><span className="text-[#F1EAF8]/90">{steamConnected ? 'Live' : 'Waiting'}</span></div>
          <div className="flex items-center justify-between border-b border-[rgba(217,198,234,0.08)] pb-2"><span>News feed</span><span className="text-[#F1EAF8]/90">{newsCount} items</span></div>
          <div className="flex items-center justify-between"><span>Launch bridge</span><span className="text-[#A8D6B0]">Ready</span></div>
        </div>
      </motion.div>
    </motion.section>
  );
}
