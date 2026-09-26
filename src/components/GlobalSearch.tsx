import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { searchIndex } from '../data/mock';
import { DURATION, EASE } from '../motion/presets';
import { useClickOutside } from '../hooks/useClickOutside';
import { SmartImage } from './SmartImage';

export default function GlobalSearch({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (id: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const open = focused && value.length > 0;

  const results = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter((g) => g.title.toLowerCase().includes(q)).slice(0, 5);
  }, [value]);

  useEffect(() => setActiveIndex(0), [value]);

  const ref = useClickOutside<HTMLDivElement>(open, () => setFocused(false));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocused(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open ]);

  const choose = (id: string) => {
    onSelect(id);
    onChange('');
    setFocused(false);
  };

  return (
    <div ref={ref} className="relative w-[min(400px,42%)]">
      <motion.div
        animate={{
          scale: focused ? 1.02 : 1,
          borderColor: focused ? 'rgba(160,124,193,0.55)' : 'rgba(217,198,234,0.10)',
        }}
        transition={{ duration: DURATION.micro }}
        className="flex items-center gap-2 rounded-full border bg-[rgba(23,16,31,0.66)] py-[6px] pl-4 pr-2 shadow-[0_8px_28px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        <Search size={13} className="shrink-0 text-[#BEA0D8]/40" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
            } else if (e.key === 'Enter' && results[activeIndex]) {
              choose(results[activeIndex].id);
            }
          }}
          placeholder="Search"
          aria-expanded={open}
          aria-activedescendant={open && results[activeIndex] ? `gs-${results[activeIndex].id}` : undefined}
          className="w-full bg-transparent text-center text-[12px] text-[#F1EAF8] outline-none placeholder:text-[#BEA0D8]/50"
        />
        <span className="flex h-[22px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[rgba(74,53,96,0.30)] text-[#D9C6EA]/60">
          <SlidersHorizontal size={12} />
        </span>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: DURATION.fast, ease: EASE.out }}
            className="absolute left-0 right-0 top-[38px] z-50 overflow-hidden rounded-[14px] border border-[rgba(217,198,234,0.10)] bg-[#17101F]/95 p-1.5 shadow-2xl backdrop-blur-2xl"
          >
            {results.length === 0 && <div className="px-3 py-2 text-[12px] text-[#BEA0D8]/50">No results</div>}
            {results.map((r, i) => (
              <div
                key={r.id}
                id={`gs-${r.id}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(r.id)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] p-1.5 transition-colors ${
                  i === activeIndex ? 'bg-[rgba(130,99,161,0.28)]' : 'hover:bg-[rgba(74,53,96,0.32)]'
                }`}
              >
                <span className="h-[36px] w-[28px] shrink-0 overflow-hidden rounded-[6px] bg-[rgba(74,53,96,0.25)]">
                  <SmartImage src={r.cover} fallback={r.fallback} alt={r.title} className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-[#D9C6EA]/85">{r.title}</span>
                  {r.status && <span className="block text-[10px] text-[#BEA0D8]/50">{r.status}</span>}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
