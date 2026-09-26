import { motion } from 'framer-motion';
import { earlyGames, indieGames } from '../data/mock';
import { EASE } from '../motion/presets';
import GameCard from '../components/GameCard';

function Collection({
  title,
  subtitle,
  ids,
  selectedId,
  onSelect,
  source,
}: {
  title: string;
  subtitle: string;
  ids: string[];
  selectedId: string;
  onSelect: (id: string) => void;
  source: typeof indieGames;
}) {
  const games = ids.map((id) => source.find((g) => g.id === id)!).filter(Boolean);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE.out }}>
      <h3 className="px-0.5 text-[12.5px] font-semibold text-[#F1EAF8]/90">{title}</h3>
      <p className="mb-2 mt-0.5 px-0.5 text-[11px] text-[#BEA0D8]/60">{subtitle}</p>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {games.map((g, i) => (
          <GameCard key={g.id} game={g} index={Math.min(i, 4)} selected={g.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </motion.div>
  );
}

export function IndiesView({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <Collection
      title="Indie Spotlight"
      subtitle="Curated independent games. Cards work exactly like Home."
      ids={indieGames.map((g) => g.id)}
      selectedId={selectedId}
      onSelect={onSelect}
      source={indieGames}
    />
  );
}

export function EarlyView({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <Collection
      title="Early2025"
      subtitle="New and upcoming releases on Aevora."
      ids={earlyGames.map((g) => g.id)}
      selectedId={selectedId}
      onSelect={onSelect}
      source={earlyGames}
    />
  );
}
