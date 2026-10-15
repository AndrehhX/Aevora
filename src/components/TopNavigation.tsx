import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronDown, ShoppingBag } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { navItems } from '../data/navigation';
import GlobalSearch from './GlobalSearch';
import ProfileDropdown, { type ProfileAction } from './ProfileDropdown';
import SocialPanel from './SocialPanel';
import Tooltip from './Tooltip';

export default function TopNavigation({
  activeNav,
  setActiveNav,
  globalQuery,
  setGlobalQuery,
  library,
  favorites,
  theme,
  profileName,
  onCycleTheme,
  onSelectGame,
  onOpenSettings,
  onOpenProfile,
  onOpenPointsShop,
  onOpenSignOut,
  closeSignal,
}: {
  activeNav: string;
  setActiveNav: (v: string) => void;
  globalQuery: string;
  setGlobalQuery: (v: string) => void;
  library: UnifiedGame[];
  favorites: string[];
  theme: 'aevora' | 'midnight';
  profileName: string;
  onCycleTheme: () => void;
  onSelectGame: (id: string) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenPointsShop?: () => void;
  onOpenSignOut: () => void;
  closeSignal: unknown;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);

  useEffect(() => {
    setProfileOpen(false);
    setSocialOpen(false);
  }, [closeSignal]);

  const onProfileAction = (id: ProfileAction) => {
    if (id === 'profile') onOpenProfile();
    else if (id === 'pointsshop') onOpenPointsShop ? onOpenPointsShop() : onOpenProfile();
    else if (id === 'settings') onOpenSettings();
    else onOpenSignOut();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      data-testid="aevora-layout-top-navigation"
      className="relative z-30 flex w-full min-w-0 flex-col items-center"
    >
      <GlobalSearch library={library} favorites={favorites} value={globalQuery} onChange={setGlobalQuery} onSelect={onSelectGame} />

      {/* nav row */}
      <div className="mt-2 flex w-full min-w-0 items-center justify-between gap-3">
        <nav aria-label="Sections" className="no-scrollbar flex min-w-0 flex-1 items-center gap-4 overflow-x-auto pl-1 sm:gap-6">
          {navItems.map((item) => {
            const active = item === activeNav;
            return (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                aria-current={active ? 'page' : undefined}
                className="group relative pb-1 text-[13px] font-medium transition-colors"
              >
                <span className={`transition-colors ${active ? 'font-semibold text-white' : 'text-[#8E929E] group-hover:text-white'}`}>
                  {item}
                </span>
                {active && (
                  <motion.span
                    layoutId="nav-glow"
                    className="absolute -bottom-[1px] left-1/2 h-[2.5px] w-[80%] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FF6B2B] to-[#FFA043] shadow-[0_0_12px_rgba(255,107,43,0.7)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                {!active && <span className="absolute -bottom-[1px] left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-white/20 transition-all duration-200 group-hover:w-[50%]" />}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 pr-1">
          {/* Notification Bell with unread indicator */}
          <Tooltip label="Notifications">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSocialOpen((o) => !o);
                setProfileOpen(false);
              }}
              aria-label="Social panel"
              aria-expanded={socialOpen}
              className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/5 bg-[#171922] text-[#8E929E] transition-colors hover:border-white/10 hover:text-white"
            >
              <Bell size={15} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF453A] ring-2 ring-[#171922]" />
            </motion.button>
          </Tooltip>
          <SocialPanel open={socialOpen} onClose={() => setSocialOpen(false)} />

          {/* Store / Cart Icon */}
          <Tooltip label="Store Cart">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveNav('Store')}
              aria-label="Open store"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/5 bg-[#171922] text-[#8E929E] transition-colors hover:border-white/10 hover:text-white"
            >
              <ShoppingBag size={15} />
            </motion.button>
          </Tooltip>

          {/* User Profile Pill */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setProfileOpen((o) => !o);
                setSocialOpen(false);
              }}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-full border border-white/5 bg-[#171922] py-1 pl-1 pr-3 transition-colors hover:border-white/15"
            >
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B2B] to-[#D84315] text-[11px] font-bold text-white shadow-sm ring-1 ring-[#FF6B2B]/40">
                {(profileName || 'A').charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[90px] truncate text-[12px] font-medium text-white">
                {profileName || 'User'}
              </span>
              <ChevronDown size={13} className="text-[#8E929E]" />
            </motion.button>
            <ProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} onAction={onProfileAction} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
