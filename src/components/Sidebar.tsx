import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import LibrarySearch from './LibrarySearch';
import InstalledGameList from './InstalledGameList';
import CommunityPanel from './CommunityPanel';
import type { InstalledGame } from '../data/mock';

export default function Sidebar({
  libraryQuery,
  setLibraryQuery,
  filteredGames,
  selectedId,
  setSelectedId,
}: {
  libraryQuery: string;
  setLibraryQuery: (v: string) => void;
  filteredGames: InstalledGame[];
  selectedId: string;
  setSelectedId: (id: string) => void;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex h-full w-[176px] shrink-0 flex-col gap-3 rounded-[18px] border border-white/[0.07] bg-[rgba(28,16,45,0.66)] p-2.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl lg:w-[198px] xl:w-[210px]"
    >
      {/* top row */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.94 }}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-white/[0.08] bg-white/[0.04] text-white/70"
        >
          <Menu size={15} />
        </motion.button>
        <div className="flex-1">
          <LibrarySearch value={libraryQuery} onChange={setLibraryQuery} />
        </div>
      </div>

      {/* library */}
      <div className="flex-1 overflow-hidden">
        <div className="mb-1.5 px-1.5 text-[10.5px] font-semibold tracking-wide text-white/75">Ready To Play</div>
        <div className="no-scrollbar max-h-full overflow-y-auto pb-2">
          <InstalledGameList games={filteredGames} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      <CommunityPanel />
    </motion.aside>
  );
}
