import { motion } from 'framer-motion';
import type { PopularGame } from '../data/mock';
import { getGame, popularGames, storeDealIds, storeFeaturedIds } from '../data/mock';
import { EASE } from '../motion/presets';
import GameCard from '../components/GameCard';

function toPopular(ids: string[]): PopularGame[] {
  return ids
    .map((id) => {
      const direct = popularGames.find((p) => p.id === id);
      if (direct) return direct;
      const g = getGame(id);
      if (!g) return undefined;
      return { ...g, shortTitle: g.title } as PopularGame;
    })
    .filter((g): g is PopularGame => !!g);
}

function Row({ title, games, selectedId, onPick, deals }: {
  title: string;
  games: PopularGame[];
  selectedId: string;
  onPick: (id: string) => void;
  deals?: Record<string, string>;
}) {
  return (
    <div>
      <h3 className="mb-2 px-0.5 text-[12.5px] font-semibold text-[#F1EAF8]/90">{title}</h3>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {games.map((g, i) => (
          <div key={g.id} className="relative shrink-0">
            {deals?.[g.id] && (
              <span className="absolute -top-1 right-1 z-10 rounded-full bg-gradient-to-r from-[#8263A1] to-[#A07CC1] px-2 py-0.5 text-[9.5px] font-bold text-[#F1EAF8] shadow">
                {deals[g.id]}
              </span>
            )}
            <GameCard game={g} index={Math.min(i, 3)} selected={g.id === selectedId} onSelect={onPick} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoreView({
  selectedId,
  onSelect,
  onInspect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onInspect: (id: string) => void;
}) {
  const deals: Record<string, string> = Object.fromEntries(storeDealIds.map((d) => [d.id, d.discount]));
  const pick = (id: string) => {
    onSelect(id);
    onInspect(id);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE.out }} className="flex flex-col gap-4">
      <Row title="Featured" games={toPopular(storeFeaturedIds)} selectedId={selectedId} onPick={pick} />
      <Row title="Popular" games={popularGames} selectedId={selectedId} onPick={pick} />
      <Row title="Deals" games={toPopular(storeDealIds.map((d) => d.id))} selectedId={selectedId} onPick={pick} deals={deals} />
    </motion.div>
  );
}
