import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { popularGames } from '../data/mock';
import { SmartImage } from './SmartImage';

export default function GlobalSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const show = focused && value.length > 0;
  const results = popularGames.filter((g) => g.title.toLowerCase().includes(value.toLowerCase())).slice(0, 4);

  return (
    <div className="relative w-[min(400px,42%)]">
      <motion.div
        animate={{
          scale: focused ? 1.02 : 1,
          borderColor: focused ? 'rgba(160,124,193,0.55)' : 'rgba(217,198,234,0.10)',
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 rounded-full border bg-[rgba(23,16,31,0.66)] py-[6px] pl-4 pr-2 shadow-[0_8px_28px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        <Search size={13} className="shrink-0 text-[#BEA0D8]/40" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 140)}
          placeholder="Search"
          className="w-full bg-transparent text-center text-[12px] text-[#F1EAF8] outline-none placeholder:text-[#BEA0D8]/50"
        />
        <span className="flex h-[22px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[rgba(74,53,96,0.30)] text-[#D9C6EA]/60">
          <SlidersHorizontal size={12} />
        </span>
      </motion.div>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-[38px] z-50 overflow-hidden rounded-[14px] border border-[rgba(217,198,234,0.10)] bg-[#17101F]/95 p-1.5 shadow-2xl backdrop-blur-2xl"
          >
            {results.length === 0 && <div className="px-3 py-2 text-[12px] text-[#BEA0D8]/50">No results</div>}
            {results.map((r) => (
              <div key={r.id} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] p-1.5 hover:bg-[rgba(74,53,96,0.32)]">
                <span className="h-[36px] w-[28px] shrink-0 overflow-hidden rounded-[6px]">
                  <SmartImage src={r.cover} fallback={r.fallback} alt={r.title} className="h-full w-full object-cover" />
                </span>
                <span className="text-[12px] font-medium text-[#D9C6EA]/85">{r.title}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
