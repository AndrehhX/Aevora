import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Folder, Gamepad2, HelpCircle, MessageSquare, Plus, Search, Settings, Users } from 'lucide-react';
import LibrarySearch from './LibrarySearch';
import InstalledGameList from './InstalledGameList';
import Tooltip from './Tooltip';
import type { UnifiedGame } from '../domain/game';
import type { CommunityItem } from '../data/navigation';

export function AevoraLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="aevoraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA043" />
          <stop offset="100%" stopColor="#FF4B14" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5L28.5 9.5V22.5L16 29.5L3.5 22.5V9.5L16 2.5Z"
        fill="url(#aevoraGrad)"
        fillOpacity="0.18"
        stroke="url(#aevoraGrad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16 7L23 21.5H19.2L17.8 18.2H14.2L12.8 21.5H9L16 7Z"
        fill="url(#aevoraGrad)"
      />
      <path
        d="M16 11.8L17 15H15L16 11.8Z"
        fill="#0E1015"
      />
    </svg>
  );
}

// Retain SteamLogo export for compatibility if imported anywhere
export function SteamLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.811c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12S18.605 0 11.979 0z" />
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
  onOpenChat,
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
  onOpenChat?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [installedExpanded, setInstalledExpanded] = useState(true);

  const navLinks = [
    { id: 'Home', label: 'Game store', icon: Gamepad2 },
    { id: 'Store', label: 'Library', icon: Folder },
    { id: 'Community', label: 'Community', icon: MessageSquare },
    { id: 'Chat', label: 'Friends', icon: Users, isChat: true },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      data-aevora-layout="sidebar"
      className={`relative flex h-full min-w-0 shrink-0 flex-col justify-between rounded-[24px] border border-white/[0.06] bg-[#12141A]/95 p-3.5 shadow-2xl backdrop-blur-2xl transition-[width] duration-200 ease-out ${
        collapsed ? 'w-[68px]' : 'w-[195px] lg:w-[210px]'
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Brand Header */}
        <div className={`flex items-center gap-2.5 px-1.5 pt-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E222D] to-[#141720] border border-white/10 text-white shadow-lg shadow-black/40">
            <AevoraLogo className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[15px] font-black tracking-widest text-white leading-none">
                AEVORA
              </span>
              <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#FF6B2B] mt-0.5">
                Launcher
              </span>
            </div>
          )}
        </div>

        {/* Primary Navigation Links */}
        <nav aria-label="Sidebar Sections" className="flex flex-col gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = item.isChat ? false : activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.isChat) {
                    onOpenChat ? onOpenChat() : setActiveNav?.('Profile');
                  } else {
                    setActiveNav?.(item.id);
                  }
                }}
                className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-200 ${
                  active ? 'text-[#FF6B2B] bg-white/[0.03]' : 'text-[#8E929E] hover:text-white hover:bg-white/[0.02]'
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
        {!collapsed ? (
          <div className="flex flex-col overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => setInstalledExpanded(!installedExpanded)}
              className="mb-1.5 flex items-center justify-between px-2 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wider text-[#8E929E] hover:text-white hover:bg-white/[0.03] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Installed ({filteredGames.length})
              </span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${installedExpanded ? 'rotate-180' : ''}`} />
            </button>

            {installedExpanded && (
              <div className="flex flex-col gap-1.5">
                <div className="px-0.5">
                  <LibrarySearch value={libraryQuery} onChange={setLibraryQuery} />
                </div>
                <div className="no-scrollbar max-h-[160px] overflow-y-auto pr-0.5">
                  <InstalledGameList games={filteredGames} selectedId={selectedId} onSelect={setSelectedId} compact={collapsed} />
                </div>
              </div>
            )}
            {!installedExpanded && (
              <div className="hidden">
                <LibrarySearch value={libraryQuery} onChange={setLibraryQuery} />
              </div>
            )}
          </div>
        ) : (
          <div className="hidden">
            <LibrarySearch value={libraryQuery} onChange={setLibraryQuery} />
          </div>
        )}
      </div>

      {/* Bottom Area */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onOpenSettings}
            className={`group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-[#8E929E] transition-colors hover:text-white hover:bg-white/[0.03] ${
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
            className={`group flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-[#8E929E] transition-colors hover:text-white hover:bg-white/[0.03] ${
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
          <div className="rounded-[18px] border border-white/[0.08] bg-[#161922] p-3 shadow-lg flex items-center justify-between group hover:border-[#FF6B2B]/40 transition-colors">
            <button
              type="button"
              onClick={() => onOpenChat?.()}
              className="text-left flex-1 text-[11.5px] font-semibold text-white/90 leading-tight hover:text-[#FFA043] transition-colors"
            >
              Friend chat<br />and Groups
            </button>
            <button
              type="button"
              onClick={() => onOpenChat?.()}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-[#FF6B2B] text-white/80 hover:text-white transition-all shadow-sm"
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
