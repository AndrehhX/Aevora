import { useState } from 'react';
import { motion } from 'framer-motion';
import { navItems } from '../data/mock';
import GlobalSearch from './GlobalSearch';
import ProfileDropdown from './ProfileDropdown';
import Tooltip from './Tooltip';

export default function TopNavigation({
  activeNav,
  setActiveNav,
  globalQuery,
  setGlobalQuery,
  dark,
  toggleTheme,
  onSelectGame,
  onNotify,
}: {
  activeNav: string;
  setActiveNav: (v: string) => void;
  globalQuery: string;
  setGlobalQuery: (v: string) => void;
  dark: boolean;
  toggleTheme: () => void;
  onSelectGame: (id: string) => void;
  onNotify: (msg: string) => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 flex flex-col items-center"
    >
      <GlobalSearch value={globalQuery} onChange={setGlobalQuery} onSelect={onSelectGame} />

      {/* nav row */}
      <div className="mt-2 flex w-full items-center justify-between">
        <nav className="flex items-center gap-6 pl-2">
          {navItems.map((item) => {
            const active = item === activeNav;
            return (
              <button
                key={item}
                onClick={() => {
                  setActiveNav(item);
                  if (item !== 'Home') onNotify(`${item} section coming soon`);
                }}
                className="group relative pb-1 text-[12.5px] font-medium"
              >
                <span className={`transition-colors ${active ? 'text-[#BEA0D8]' : 'text-[#D9C6EA]/60 group-hover:text-[#F1EAF8]'}`}>
                  {item === 'Early2025' ? (
                    <span>
                      <span className="text-[#BEA0D8]">E</span>arly2025
                    </span>
                  ) : (
                    item
                  )}
                </span>
                {active && (
                  <motion.span
                    layoutId="nav-glow"
                    className="absolute -bottom-[1px] left-1/2 h-[2px] w-[70%] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#8263A1] to-[#A07CC1] shadow-[0_0_14px_rgba(190,160,216,0.55)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                {active && <span className="absolute inset-0 -z-10 blur-[14px] bg-[#8263A1]/25 rounded-full" />}
                {!active && <span className="absolute -bottom-[1px] left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#BEA0D8]/30 transition-all duration-200 group-hover:w-[50%]" />}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 pr-1">
          <Tooltip label="Discord coming soon">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onNotify('Discord integration coming soon')}
              className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-[rgba(217,198,234,0.12)] bg-gradient-to-br from-[#4A3560] to-[#654A7F] text-[14px] font-bold text-[#F1EAF8] shadow-[0_6px_18px_-6px_rgba(74,53,96,0.7)]"
            >
              <span className="text-[13px]">◈</span>
            </motion.button>
          </Tooltip>

          {/* theme + profile chip */}
          <div className="relative flex items-center gap-1.5 rounded-full border border-[rgba(217,198,234,0.10)] bg-[rgba(23,16,31,0.66)] py-[3px] pl-[6px] pr-[4px] backdrop-blur-xl">
            <Tooltip label="Toggle theme">
              <button onClick={toggleTheme} className="text-[13px] leading-none text-[#D9C6EA]/90 transition-transform hover:scale-110" aria-label="toggle">
                {dark ? '🌙' : '☀️'}
              </button>
            </Tooltip>
            <span className="h-3 w-px bg-[#BEA0D8]/10" />
            <button onClick={() => setProfileOpen((o) => !o)} className="text-[11px] font-medium text-[#D9C6EA]/80 transition-colors hover:text-[#F1EAF8]">
              Neo Aura
            </button>
            <Tooltip label="Settings">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setProfileOpen((o) => !o)}
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(74,53,96,0.32)] text-[#D9C6EA]/70"
                aria-label="profile and settings"
              >
                <span className="text-[12px]">⚙</span>
              </motion.button>
            </Tooltip>
            <ProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} onAction={onNotify} />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
