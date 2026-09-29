import { motion } from 'framer-motion';
import type { UnifiedGame } from '../domain/game';
import { earlyIds, getLibraryGame, indieIds } from '../data/library';
import { EASE } from '../motion/presets';
import GameCard from '../components/GameCard';

function Collection({
  title,
  subtitle,
  games,
  selectedId,
  onSelect,
}: {
  title: string;
  subtitle: string;
  games: UnifiedGame[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
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

function byIds(ids: string[]): UnifiedGame[] {
  return ids.map(getLibraryGame).filter((g): g is UnifiedGame => !!g);
}

export function IndiesView({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <Collection
      title="Indie Spotlight"
      subtitle="Curated independent games. Cards work exactly like Home."
      games={byIds(indieIds)}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}

export function EarlyView({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <Collection
      title="Release"
      subtitle="New and upcoming releases on Aevora."
      games={byIds(earlyIds)}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  );
}
