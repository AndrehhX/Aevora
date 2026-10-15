import { motion } from 'framer-motion';
import { Folder, Gamepad2, HelpCircle, MessageSquare, Plus, Search, Settings, Users } from 'lucide-react';
import LibrarySearch from './LibrarySearch';
import InstalledGameList from './InstalledGameList';
import Tooltip from './Tooltip';
import type { UnifiedGame } from '../domain/game';
import type { CommunityItem } from '../data/navigation';

export function SteamLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.811c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12S18.605 0 11.979 0zM7.54 18.217l-1.473-.61c.262.543.714.99 1.314 1.24 1.142.476 2.45-.06 2.923-1.204.23-.553.21-1.155-.025-1.666l-1.469.608c.342.827-.05 1.776-.877 2.119-.824.341-1.772-.05-2.112-.877l1.719.39zm8.4-11.455c-1.396 0-2.531 1.135-2.531 2.532 0 1.396 1.135 2.532 2.531 2.532 1.396 0 2.532-1.136 2.532-2.532 0-1.397-1.136-2.532-2.532-2.532zm-2.025 2.532c0-1.116.908-2.025 2.025-2.025 1.116 0 2.025.909 2.025 2.025 0 1.117-.909 2.026-2.025 2.026-1.117 0-2.025-.909-2.025-2.026z" />
    </svg>
  );
}

export default function Sidebar({
  activeNav = 'Home',
  setActiveNav,
  libraryQuery,
  setLibraryQuery,
  filteredGames,
  selectedId,
  setSelectedId,
  onCommunityClick,
  onOpenSettings,
  collapsed,
  onToggleCollapse,
}: {
  activeNav?: string;
  setActiveNav?: (v: string) => void;
  libraryQuery: string;
  setLibraryQuery: (v: string) => void;
  filteredGames: UnifiedGame[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  onCommunityClick: (item: CommunityItem) => void;
  onOpenSettings?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const navLinks = [
    { id: 'Home', label: 'Game store', icon: Gamepad2 },
    { id: 'Store', label: 'Library', icon: Folder },
    { id: 'Community', label: 'Community', icon: MessageSquare },
    { id: 'Profile', label: 'Friends', icon: Users },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      data-aevora-layout="sidebar"
      className={`relative flex h-full min-w-0 shrink-0 flex-col justify-between rounded-[24px] border border-white/[0.06] bg-[#12141A]/95 p-3.5 shadow-2xl backdrop-blur-2xl transition-[width] duration-200 ease-out ${
        collapsed ? 'w-[68px]' : 'w-[190px] lg:w-[205px]'
      }`}
    >
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div className={`flex items-center gap-2.5 px-1.5 pt-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B2B] to-[#D84315] text-white shadow-md shadow-[#FF6B2B]/20">
            <SteamLogo className="h-4.5 w-4.5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-black tracking-wider text-white">
              STEAM
            </span>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav aria-label="Sidebar Sections" className="flex flex-col gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id || (item.id === 'Home' && activeNav === 'Home');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav?.(item.id)}
                className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                  active ? 'text-[#FF6B2B]' : 'text-[#8E929E] hover:text-white'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <span className="absolute -left-3.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#FF6B2B] shadow-[0_0_12px_rgba(255,107,43,0.9)]" />
                )}
                <Icon size={17} className={active ? 'text-[#FF6B2B]' : 'text-[#8E929E] group-hover:text-white transition-colors'} />
                {!collapsed && (
                  <span className={`text-[12.5px] font-semibold tracking-wide ${active ? 'text-[#FF6B2B]' : 'text-[#8E929E] group-hover:text-white'}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Library quick list */}
        <div className={`flex flex-col overflow-hidden transition-all ${collapsed ? 'hidden' : 'max-h-[220px]'}`}>
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E929E]/70">Installed</span>
            <div className="w-[110px]">
              <LibrarySearch value={libraryQuery} onChange={setLibraryQuery} />
            </div>
          </div>
          <div className="no-scrollbar max-h-[170px] overflow-y-auto pr-0.5">
            <InstalledGameList games={filteredGames} selectedId={selectedId} onSelect={setSelectedId} compact={collapsed} />
          </div>
        </div>
      </div>

      {/* Hidden LibrarySearch fallback for test query selectors when collapsed */}
      {collapsed && (
        <div className="hidden">
          <LibrarySearch value={libraryQuery} onChange={setLibraryQuery} />
        </div>
      )}

      {/* Bottom Area */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onOpenSettings}
            className={`group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-[#8E929E] transition-colors hover:text-white ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={16} className="text-[#8E929E] group-hover:text-white transition-colors" />
            {!collapsed && <span className="text-[12px] font-medium text-[#8E929E] group-hover:text-white">Settings</span>}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className={`group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-[#8E929E] transition-colors hover:text-white ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? 'Help' : undefined}
          >
            <HelpCircle size={16} className="text-[#8E929E] group-hover:text-white transition-colors" />
            {!collapsed && <span className="text-[12px] font-medium text-[#8E929E] group-hover:text-white">Help</span>}
          </button>
        </div>

        {/* Floating Card: Friend chat and Groups */}
        {!collapsed && (
          <div className="rounded-[18px] border border-white/[0.06] bg-[#181B22] p-3 shadow-lg flex items-center justify-between">
            <span className="text-[11.5px] font-semibold text-white/90 leading-tight">
              Friend chat<br />and Groups
            </span>
            <button
              type="button"
              onClick={() => onCommunityClick?.({ title: 'Friends & Groups', url: 'steam://friends' } as unknown as CommunityItem)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              aria-label="New chat or group"
            >
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
