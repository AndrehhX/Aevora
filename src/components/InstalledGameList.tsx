import { AnimatePresence, motion } from 'framer-motion';
import type { UnifiedGame } from '../domain/game';
import InstalledGameItem from './InstalledGameItem';

export default function InstalledGameList({
  games,
  selectedId,
  onSelect,
  compact = false,
}: {
  games: UnifiedGame[];
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  if (games.length === 0) {
    return <div className="px-2 py-4 text-[11px] text-[#BEA0D8]/40">No games found</div>;
  }
  return (
    <motion.div layout className="flex flex-col gap-[2px]">
      <AnimatePresence initial={false}>
        {games.map((g, i) => (
          <InstalledGameItem key={g.id} game={g} index={i} active={g.id === selectedId} onSelect={() => onSelect(g.id)} compact={compact} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
