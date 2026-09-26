import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, SlidersHorizontal, X } from 'lucide-react';
import { searchIndex, type SearchCategory } from '../data/mock';
import { DURATION, EASE } from '../motion/presets';
import { useClickOutside } from '../hooks/useClickOutside';
import { SmartImage } from './SmartImage';
import Tooltip from './Tooltip';

type Filter = 'all' | SearchCategory;
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'installed', label: 'Installed' },
  { id: 'popular', label: 'Popular' },
  { id: 'indie', label: 'Indie' },
];

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
  const [filter, setFilter] = useState<Filter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const open = focused && value.length > 0;

  const results = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return searchIndex
      .filter((g) => (filter === 'all' ? true : g.category === filter))
      .filter((g) => g.title.toLowerCase().includes(q))
      .slice(0, 5);
  }, [value, filter]);

  useEffect(() => setActiveIndex(0), [value, filter]);

  const ref = useClickOutside<HTMLDivElement>(open || filterOpen, () => {
    setFocused(false);
    setFilterOpen(false);
  });

  useEffect(() => {
    if (!open && !filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocused(false);
        setFilterOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, filterOpen]);

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
          id="global-search"
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
          aria-label="Global search"
          aria-expanded={open}
          aria-activedescendant={open && results[activeIndex] ? `gs-${results[activeIndex].id}` : undefined}
          className="w-full bg-transparent text-center text-[12px] text-[#F1EAF8] outline-none placeholder:text-[#BEA0D8]/50"
        />
        {value.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[rgba(74,53,96,0.30)] text-[#D9C6EA]/70 transition-colors hover:text-[#F1EAF8]"
          >
            <X size={12} />
          </motion.button>
        )}
        <Tooltip label="Search filters">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setFilterOpen((o) => !o)}
            aria-label="Search filters"
            aria-expanded={filterOpen}
            className={`flex h-[22px] w-[28px] shrink-0 items-center justify-center rounded-full transition-colors ${
              filter === 'all' ? 'bg-[rgba(74,53,96,0.30)] text-[#D9C6EA]/60' : 'bg-[rgba(130,99,161,0.45)] text-[#F1EAF8]'
            }`}
          >
            <SlidersHorizontal size={12} />
          </motion.button>
        </Tooltip>
      </motion.div>

      {/* filter menu */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: DURATION.micro, ease: EASE.out }}
            className="absolute right-0 top-[38px] z-[60] w-[150px] overflow-hidden rounded-[12px] border border-[rgba(217,198,234,0.12)] bg-[rgba(23,16,31,0.97)] p-1 shadow-2xl backdrop-blur-2xl"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setFilterOpen(false);
                }}
                aria-pressed={filter === f.id}
                className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
                  filter === f.id ? 'bg-[rgba(130,99,161,0.28)] text-[#F1EAF8]' : 'text-[#D9C6EA]/75 hover:bg-[rgba(74,53,96,0.32)] hover:text-[#F1EAF8]'
                }`}
              >
                {f.label}
                {filter === f.id && <Check size={13} className="text-[#BEA0D8]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && !filterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: DURATION.fast, ease: EASE.out }}
            className="absolute left-0 right-0 top-[38px] z-50 overflow-hidden rounded-[14px] border border-[rgba(217,198,234,0.10)] bg-[#17101F]/95 p-1.5 shadow-2xl backdrop-blur-2xl"
          >
            {filter !== 'all' && (
              <div className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[#BEA0D8]/50">
                {FILTERS.find((f) => f.id === filter)?.label}
              </div>
            )}
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
                  <span className="block text-[10px] text-[#BEA0D8]/50">
                    {r.categoryLabel}{r.status ? ` · ${r.status}` : ''}
                  </span>
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
