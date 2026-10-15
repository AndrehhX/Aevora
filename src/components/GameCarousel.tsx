import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { DURATION, EASE } from '../motion/presets';
import GameCard from './GameCard';
import Tooltip from './Tooltip';

export default function GameCarousel({
  games,
  selectedId,
  onSelect,
  inertia = true,
  title = 'Special offers',
  onLearnMore,
}: {
  games: UnifiedGame[];
  selectedId: string;
  onSelect: (id: string) => void;
  inertia?: boolean;
  title?: string;
  onLearnMore?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [focusIdx, setFocusIdx] = useState(() => Math.max(0, games.findIndex((g) => g.id === selectedId)));
  const [kbActive, setKbActive] = useState(false);

  // drag-with-momentum refs (no rerenders while dragging)
  const drag = useRef({ down: false, startX: 0, startScroll: 0, lastX: 0, lastT: 0, vel: 0, moved: 0, raf: 0 });
  const suppressClick = useRef(false);
  const inertiaPref = useRef(inertia);
  inertiaPref.current = inertia;

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft((v) => (el.scrollLeft > 4) !== v ? el.scrollLeft > 4 : v);
    setCanRight((v) => (el.scrollLeft < max - 4) !== v ? el.scrollLeft < max - 4 : v);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, games.length]);

  const stopMomentum = () => {
    if (drag.current.raf) cancelAnimationFrame(drag.current.raf);
    drag.current.raf = 0;
  };

  const step = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    stopMomentum();
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const onWindowMove = useCallback((e: PointerEvent) => {
    const el = trackRef.current;
    const d = drag.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    el.scrollLeft = d.startScroll - dx;
    const now = performance.now();
    const dt = Math.max(now - d.lastT, 1);
    d.vel = 0.85 * d.vel + 0.15 * ((e.clientX - d.lastX) / dt); // px per ms
    d.lastX = e.clientX;
    d.lastT = now;
    el.setAttribute('data-dragging', d.moved > 6 ? 'true' : 'false');
  }, []);

  const onWindowUp = useCallback(() => {
    const el = trackRef.current;
    const d = drag.current;
    window.removeEventListener('pointermove', onWindowMove);
    window.removeEventListener('pointerup', onWindowUp);
    window.removeEventListener('pointercancel', onWindowUp);
    if (!d.down || !el) return;
    d.down = false;
    el.setAttribute('data-dragging', 'false');
    if (d.moved > 6) {
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 0);
    }
    if (!inertiaPref.current) return;
    // momentum glide
    let v = -d.vel * 16; // px per frame
    if (Math.abs(v) < 2) return;
    const glide = () => {
      if (!trackRef.current) return;
      v *= 0.94;
      if (Math.abs(v) < 0.6) {
        drag.current.raf = 0;
        return;
      }
      trackRef.current.scrollLeft += v;
      drag.current.raf = requestAnimationFrame(glide);
    };
    drag.current.raf = requestAnimationFrame(glide);
  }, [onWindowMove]);

  useEffect(() => () => window.removeEventListener('pointermove', onWindowMove), [onWindowMove]);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || e.button !== 0) return;
    stopMomentum();
    const d = drag.current;
    d.down = true;
    d.moved = 0;
    d.startX = e.clientX;
    d.lastX = e.clientX;
    d.lastT = performance.now();
    d.vel = 0;
    d.startScroll = el.scrollLeft;
    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onWindowUp);
    window.addEventListener('pointercancel', onWindowUp);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: EASE.out }}
      className="relative w-full"
    >
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[17px] font-bold text-white tracking-tight">{title}</h2>
          <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[10.5px] font-medium text-[#8E929E]">
            Featured
          </span>
        </div>
        {onLearnMore && (
          <button
            type="button"
            onClick={onLearnMore}
            className="text-[12px] font-semibold text-[#8E929E] hover:text-[#FFA043] transition-colors"
          >
            Learn more
          </button>
        )}
      </div>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={updateArrows}
          onPointerDown={onPointerDown}
          tabIndex={0}
          role="listbox"
          aria-label={`${title}. Arrow keys move focus, Enter selects.`}
          onFocus={() => setKbActive(true)}
          onBlur={() => setKbActive(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.preventDefault();
              const dir = e.key === 'ArrowRight' ? 1 : -1;
              const next = Math.min(games.length - 1, Math.max(0, focusIdx + dir));
              setFocusIdx(next);
              setKbActive(true);
              trackRef.current?.children[next]?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
            } else if ((e.key === 'Enter' || e.key === ' ') && games[focusIdx]) {
              e.preventDefault();
              onSelect(games[focusIdx].id);
            }
          }}
          onClickCapture={(e) => {
            if (suppressClick.current) {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          onWheel={(e) => {
            const el = trackRef.current;
            if (!el) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            if ((e.deltaY > 0 && el.scrollLeft + el.clientWidth < el.scrollWidth - 4) || (e.deltaY < 0 && el.scrollLeft > 0)) {
              e.preventDefault();
              stopMomentum();
              el.scrollBy({ left: e.deltaY * 1.2, behavior: 'auto' });
            }
          }}
          className="no-scrollbar flex snap-x gap-3.5 overflow-x-auto pb-2 pr-10 active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', cursor: 'grab', touchAction: 'pan-y' }}
        >
          {games.map((g, i) => (
            <GameCard
              key={g.id}
              game={g}
              index={i}
              selected={g.id === selectedId}
              focused={kbActive && i === focusIdx}
              onFocus={setFocusIdx}
              onSelect={(id) => {
                setFocusIdx(i);
                onSelect(id);
              }}
            />
          ))}
        </div>

        {/* fade edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[72px] bg-gradient-to-l from-[#0E1015] to-transparent" />

        <AnimatePresence>
          {canLeft && (
            <motion.span
              key="left"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: DURATION.fast, ease: EASE.out }}
              className="absolute left-[2px] top-[42%] -translate-y-1/2 z-20"
            >
              <Tooltip label="Previous">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => step(-1)}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-white/10 bg-[#161922]/90 text-[#8E929E] shadow-[0_10px_28px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:text-white hover:border-[#FF6B2B]/40"
                  aria-label="previous"
                >
                  <ChevronLeft size={16} />
                </motion.button>
              </Tooltip>
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canRight && (
            <motion.span
              key="right"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: DURATION.fast, ease: EASE.out }}
              className="absolute right-[2px] top-[42%] -translate-y-1/2 z-20"
            >
              <Tooltip label="Next">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => step(1)}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-white/10 bg-[#161922]/90 text-[#8E929E] shadow-[0_10px_28px_rgba(0,0,0,0.6)] backdrop-blur-xl hover:text-white hover:border-[#FF6B2B]/40"
                  aria-label="next"
                >
                  <ChevronRight size={16} />
                </motion.button>
              </Tooltip>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
