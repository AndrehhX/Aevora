import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { PopularGame } from '../data/mock';
import GameCard from './GameCard';

export default function GameCarousel({ games }: { games: PopularGame[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      <div className="mb-2 flex items-center justify-between px-0.5">
        <h2 className="text-[12.5px] font-semibold text-white/90">Most Popular</h2>
      </div>
      <div className="relative">
        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x gap-3 overflow-x-auto scroll-smooth pb-1 pr-10"
          style={{ scrollbarWidth: 'none' }}
          onWheel={(e) => {
            // horizontal wheel + shift support; vertical wheel scrolls carousel when over it
            const el = trackRef.current;
            if (!el) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            if ((e.deltaY > 0 && el.scrollLeft + el.clientWidth < el.scrollWidth - 4) || (e.deltaY < 0 && el.scrollLeft > 0)) {
              e.preventDefault();
              el.scrollBy({ left: e.deltaY * 1.2, behavior: 'auto' });
            }
          }}
        >
          {games.map((g, i) => (
            <GameCard key={g.id} game={g} index={i} />
          ))}
        </div>

        {/* fade edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[72px] bg-gradient-to-l from-[#0f0819] to-transparent" />

        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollBy(1)}
          className="absolute right-[2px] top-[42%] flex h-[30px] w-[30px] -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.12] bg-black/50 text-white/85 shadow-[0_10px_28px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          aria-label="next"
        >
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </motion.section>
  );
}
