import { motion } from 'framer-motion';
import { Gamepad2, Clock, Heart } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { getInstalledGames } from '../domain/library';
import { getLibraryGame, libraryGames } from '../data/library';
import Modal from './Modal';
import { SmartImage } from './SmartImage';

export default function ProfilePanel({
  open,
  favorites,
  onSelectGame,
  onClose,
}: {
  open: boolean;
  favorites: string[];
  onSelectGame: (id: string) => void;
  onClose: () => void;
}) {
  const favGames = favorites.map(getLibraryGame).filter((g): g is UnifiedGame => !!g);

  return (
    <Modal open={open} onClose={onClose} labelledBy="profile-title" panelClass="max-w-[400px]">
      <div className="no-scrollbar max-h-[86vh] overflow-y-auto p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#4A3560] via-[#8263A1] to-[#17101F] text-[20px] font-extrabold text-[#F1EAF8]">
            N
          </span>
          <div className="min-w-0">
            <h2 id="profile-title" className="truncate text-[15px] font-bold text-[#F1EAF8]">
              Neo Aura
            </h2>
            <p className="flex items-center gap-1.5 text-[11px] text-[#BEA0D8]/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#90d490] shadow-[0_0_6px_rgba(144,212,144,0.8)]" />
              Online · Prototype account
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: Gamepad2, v: String(getInstalledGames(libraryGames).length), k: 'Games' },
            { icon: Clock, v: '1,240h', k: 'Played' },
            { icon: Heart, v: String(favGames.length), k: 'Favorites' },
          ].map((s) => (
            <div key={s.k} className="rounded-[10px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.16)] px-2 py-2.5 text-center">
              <s.icon size={14} className="mx-auto text-[#BEA0D8]/70" />
              <div className="mt-1 text-[14px] font-bold text-[#F1EAF8]">{s.v}</div>
              <div className="text-[9.5px] font-medium uppercase tracking-wider text-[#BEA0D8]/55">{s.k}</div>
            </div>
          ))}
        </div>

        <div className="mb-1.5 mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">Favorites</div>
        {favGames.length === 0 ? (
          <p className="rounded-[10px] border border-dashed border-[rgba(217,198,234,0.14)] px-3 py-4 text-center text-[11.5px] text-[#BEA0D8]/55">
            No favorites yet. Open a game and tap Favorite.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {favGames.map((g) => (
              <motion.button
                key={g.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelectGame(g.id);
                  onClose();
                }}
                className="flex items-center gap-2.5 rounded-[10px] p-1.5 text-left transition-colors hover:bg-[rgba(74,53,96,0.32)]"
              >
                <span className="h-[34px] w-[27px] shrink-0 overflow-hidden rounded-[6px] bg-[rgba(74,53,96,0.25)]">
                  {g.artwork.cover ? (
                    <SmartImage src={g.artwork.cover} fallback={g.artwork.coverFallback} alt={g.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4A3560] to-[#8263A1] text-[12px] font-bold text-white">P</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-[#F1EAF8]/90">{g.title}</span>
                  {(g.subtitle ?? g.highlight) && <span className="block text-[10px] text-[#BEA0D8]/55">{g.subtitle ?? g.highlight}</span>}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
