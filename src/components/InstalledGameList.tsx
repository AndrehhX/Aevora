import type { InstalledGame } from '../data/mock';
import InstalledGameItem from './InstalledGameItem';

export default function InstalledGameList({
  games,
  selectedId,
  onSelect,
}: {
  games: InstalledGame[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (games.length === 0) {
    return <div className="px-2 py-4 text-[11px] text-white/40">No games found</div>;
  }
  return (
    <div className="flex flex-col gap-[2px]">
      {games.map((g, i) => (
        <InstalledGameItem key={g.id} game={g} index={i} active={g.id === selectedId} onSelect={() => onSelect(g.id)} />
      ))}
    </div>
  );
}
