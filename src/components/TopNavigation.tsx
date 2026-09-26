import { motion } from 'framer-motion';
import { navItems } from '../data/mock';
import GlobalSearch from './GlobalSearch';

export default function TopNavigation({
  activeNav,
  setActiveNav,
  globalQuery,
  setGlobalQuery,
  dark,
  toggleTheme,
}: {
  activeNav: string;
  setActiveNav: (v: string) => void;
  globalQuery: string;
  setGlobalQuery: (v: string) => void;
  dark: boolean;
  toggleTheme: () => void;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 flex flex-col items-center"
    >
      <GlobalSearch value={globalQuery} onChange={setGlobalQuery} />

      {/* nav row */}
      <div className="mt-2 flex w-full items-center justify-between">
        <nav className="flex items-center gap-6 pl-2">
          {navItems.map((item) => {
            const active = item === activeNav;
            return (
              <button key={item} onClick={() => setActiveNav(item)} className="group relative pb-1 text-[12.5px] font-medium">
                <span className={`transition-colors ${active ? 'text-[#d8b4fe]' : 'text-white/60 group-hover:text-white'}`}>
                  {item === 'Early2025' ? (
                    <span>
                      <span className="text-[#7ee787]">E</span>arly2025
                    </span>
                  ) : (
                    item
                  )}
                </span>
                {active && (
                  <motion.span
                    layoutId="nav-glow"
                    className="absolute -bottom-[1px] left-1/2 h-[2px] w-[70%] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#b565ff] to-[#e5489b] shadow-[0_0_14px_rgba(181,101,255,0.9)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                {active && <span className="absolute inset-0 -z-10 blur-[14px] bg-[#b565ff]/25 rounded-full" />}
                {!active && <span className="absolute -bottom-[1px] left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-white/30 transition-all duration-200 group-hover:w-[50%]" />}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 pr-1">
          {/* discord */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-[28px] w-[28px] items-center justify-center rounded-[8px] border border-white/10 bg-gradient-to-br from-[#5865F2] to-[#7b8cff] text-[14px] font-bold text-white shadow-[0_6px_18px_-6px_rgba(88,101,242,0.7)]"
          >
            <span className="text-[13px]">◈</span>
          </motion.button>

          {/* theme + profile chip */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.05] py-[3px] pl-[6px] pr-[4px] backdrop-blur-xl">
            <button onClick={toggleTheme} className="text-[13px] leading-none text-yellow-200/90 transition-transform hover:scale-110" aria-label="toggle">
              {dark ? '🌙' : '☀️'}
            </button>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-[11px] font-medium text-white/80">Neo Aura</span>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/[0.08] text-white/70">
              <span className="text-[12px]">⚙</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
