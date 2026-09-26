import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, SlidersHorizontal, X } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { getInstalledGames, isInstalled, searchGames } from '../domain/library';
import type { ProviderId } from '../domain/provider';
import { providerDefinitions } from '../domain/provider';
import { DURATION, EASE } from '../motion/presets';
import { useClickOutside } from '../hooks/useClickOutside';
import { SmartImage } from './SmartImage';
import ProviderBadge from './ProviderBadge';
import Tooltip from './Tooltip';

export type SearchFilter = 'all' | 'installed' | 'favorites' | ProviderId;

const PROVIDER_FILTERS: ProviderId[] = ['steam', 'epic', 'gog', 'ea'];

export default function GlobalSearch({
  library,
  favorites,
  value,
  onChange,
  onSelect,
}: {
  library: UnifiedGame[];
  favorites: string[];
  value: string;
  onChange: (v: string) => void;
  onSelect: (id: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const open = focused && value.length > 0;

  const results = useMemo(() => {
    let pool = searchGames(library, value).slice(0, 6);
    if (filter === 'installed') pool = pool.filter(isInstalled);
    else if (filter === 'favorites') pool = pool.filter((g) => favorites.includes(g.id));
    else if (filter !== 'all') pool = pool.filter((g) => g.providers.some((p) => p.provider === filter && p.owned));
    return pool.slice(0, 5);
  }, [library, value, filter, favorites]);

  const installedCount = useMemo(() => getInstalledGames(library).length, [library]);

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
  }, [open, filterOpen ]);

  const choose = (id: string) => {
    onSelect(id);
    onChange('');
    setFocused(false);
  };

  const firstProvider = (g: UnifiedGame): ProviderId | undefined => g.providers.find((p) => p.owned)?.provider;

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
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'installed', label: `Installed · ${installedCount}` },
                { id: 'favorites', label: `Favorites · ${favorites.length}` },
                ...PROVIDER_FILTERS.map((p) => ({ id: p as SearchFilter, label: providerDefinitions[p].name })),
              ] as Array<{ id: SearchFilter; label: string }>
            ).map((f) => (
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
            {results.length === 0 && <div className="px-3 py-2 text-[12px] text-[#BEA0D8]/50">No results</div>}
            {results.map((r, i) => {
              const fp = firstProvider(r);
              return (
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
                    {r.artwork.cover ? (
                      <SmartImage src={r.artwork.cover} fallback={r.artwork.coverFallback} alt={r.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4A3560] to-[#8263A1] text-[12px] font-bold text-white">P</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-[#D9C6EA]/85">{r.title}</span>
                    <span className="block truncate text-[10px] text-[#BEA0D8]/50">
                      {r.metadata?.developer ?? ''}
                      {isInstalled(r) ? ' · Installed' : ''}
                    </span>
                  </span>
                  {fp && <ProviderBadge provider={fp} tone="faint" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
