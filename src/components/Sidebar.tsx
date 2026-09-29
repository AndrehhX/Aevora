import { motion } from 'framer-motion';
import { Menu, Search } from 'lucide-react';
import LibrarySearch from './LibrarySearch';
import InstalledGameList from './InstalledGameList';
import CommunityPanel from './CommunityPanel';
import Tooltip from './Tooltip';
import type { UnifiedGame } from '../domain/game';
import type { CommunityItem } from '../data/navigation';

export default function Sidebar({
  libraryQuery,
  setLibraryQuery,
  filteredGames,
  selectedId,
  setSelectedId,
  onCommunityClick,
  collapsed,
  onToggleCollapse,
}: {
  libraryQuery: string;
  setLibraryQuery: (v: string) => void;
  filteredGames: UnifiedGame[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  onCommunityClick: (item: CommunityItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex h-full shrink-0 flex-col gap-3 rounded-[18px] border border-[rgba(217,198,234,0.10)] bg-[rgba(23,16,31,0.72)] p-2.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-[width] duration-200 ease-out ${
        collapsed ? 'w-[64px]' : 'w-[176px] lg:w-[198px] xl:w-[210px]'
      }`}
    >
      {/* top row */}
      <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
        <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <motion.button
            whileHover={{ scale: 1.06, backgroundColor: 'rgba(74,53,96,0.32)' }}
            whileTap={{ scale: 0.94 }}
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.22)] text-[#D9C6EA]/70"
          >
            <Menu size={15} />
          </motion.button>
        </Tooltip>
        {collapsed ? (
          <Tooltip label="Expand to search">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onToggleCollapse}
              aria-label="Expand sidebar to search library"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.22)] text-[#D9C6EA]/70"
            >
              <Search size={14} />
            </motion.button>
          </Tooltip>
        ) : (
          <div className="min-w-0 flex-1">
            <LibrarySearch value={libraryQuery} onChange={setLibraryQuery} />
          </div>
        )}
      </div>

      {/* library */}
      <div className="flex-1 overflow-hidden">
        <div
          className={`px-1.5 text-[10.5px] font-semibold tracking-wide text-[#D9C6EA]/75 transition-all duration-200 ${
            collapsed ? 'mb-0 h-0 overflow-hidden opacity-0' : 'mb-1.5 opacity-100'
          }`}
        >
          Ready To Play
        </div>
        <div className="no-scrollbar max-h-full overflow-y-auto pb-2">
          <InstalledGameList games={filteredGames} selectedId={selectedId} onSelect={setSelectedId} compact={collapsed} />
        </div>
      </div>

      <div className={`transition-all duration-200 ${collapsed ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'}`} aria-hidden={collapsed}>
        <CommunityPanel onItemClick={onCommunityClick} />
      </div>
    </motion.aside>
  );
}
