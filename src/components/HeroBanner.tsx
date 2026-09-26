import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { ResolvedGame } from '../data/mock';
import { preloadImage } from '../hooks/usePreloadImage';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { EASE, HERO_CROSSFADE } from '../motion/presets';

function ForzaLogo() {
  return (
    <>
      <div className="flex items-center gap-1 opacity-90">
        <div className="h-[26px] w-[64px] bg-white/[0.92] [clip-path:polygon(0_0,100%_0,72%_100%,0_100%)] opacity-90" />
        <div className="h-[26px] w-[20px] bg-white/[0.92] [clip-path:polygon(20%_0,100%_0,80%_100%,0_100%)] opacity-90" />
      </div>
      <div className="mt-1.5 text-[clamp(36px,3.4vw,56px)] font-extrabold leading-[0.9] tracking-[0.08em] text-white/95 drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
        FORZA
      </div>
      <div className="relative mt-[2px] inline-block">
        <span className="relative z-10 px-2 text-[clamp(22px,1.9vw,32px)] font-extrabold italic tracking-[0.06em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
          HORIZON
        </span>
        <span className="absolute inset-0 -skew-x-[14deg] rounded-[4px] bg-gradient-to-r from-[#ff1a1a] via-[#ff2d55] to-[#ff2fb3] shadow-[0_6px_24px_rgba(255,45,85,0.5)]" />
      </div>
    </>
  );
}

function GenericLogo({ game }: { game: ResolvedGame }) {
  return (
    <>
      <div className="h-[3px] w-[44px] rounded-full bg-[#A07CC1]/80 shadow-[0_0_12px_rgba(190,160,216,0.5)]" />
      <div className="mt-2.5 max-w-[420px] text-[clamp(30px,2.8vw,46px)] font-extrabold leading-[0.95] tracking-[0.06em] text-[#F1EAF8]/95 drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
        {game.displayTitle}
      </div>
      {game.subtitle && (
        <div className="mt-1.5 text-[12px] font-medium tracking-wide text-[#BEA0D8]/90">{game.subtitle}</div>
      )}
    </>
  );
}

export default function HeroBanner({
  game,
  onCta,
  parallax = true,
  forceReduced = false,
}: {
  game: ResolvedGame;
  onCta: (game: ResolvedGame) => void;
  parallax?: boolean;
  forceReduced?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const systemReduced = usePrefersReducedMotion();
  const reduced = forceReduced || systemReduced;
  // Displayed game lags selection until next artwork is preloaded — never blank.
  const [display, setDisplay] = useState(game);
  const [heroSrc, setHeroSrc] = useState(game.hero);
  const reqId = useRef(0);

  useEffect(() => {
    if (game.id === display.id) return;
    const id = ++reqId.current;
    let alive = true;
    preloadImage(game.hero, game.heroFallback)
      .then((src) => {
        if (!alive || reqId.current !== id) return;
        setDisplay(game);
        setHeroSrc(src);
      })
      .catch(() => {
        if (!alive || reqId.current !== id) return;
        setDisplay(game);
        setHeroSrc(game.heroFallback);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  // Subtle cursor parallax, interpolated — max ~6px.
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const imgX = useTransform(sx, [0, 1], [6, -6]);
  const imgY = useTransform(sy, [0, 1], [4, -4]);

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !parallax) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.6, ease: EASE.out }}
      className="relative w-full"
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        className="group relative h-[clamp(300px,52vh,560px)] w-full overflow-hidden rounded-[18px] border border-[rgba(217,198,234,0.10)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        {/* parallax wrapper holds the crossfade stack so transforms never fight */}
        <motion.div className="absolute inset-0" style={reduced || !parallax ? undefined : { x: imgX, y: imgY }}>
          <AnimatePresence initial={false}>
            <motion.img
              key={display.id}
              initial={{ opacity: 0, scale: reduced ? 1 : 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduced ? 1 : 1.02 }}
              transition={{ duration: reduced ? 0.25 : HERO_CROSSFADE, ease: EASE.out }}
              src={display.id === game.id && heroSrc ? heroSrc : display.hero}
              onError={(e) => {
                if ((e.target as HTMLImageElement).src !== display.heroFallback) {
                  (e.target as HTMLImageElement).src = display.heroFallback;
                }
              }}
              alt={display.title}
              draggable={false}
              className="absolute inset-0 h-[112%] w-[112%] object-cover object-[50%_35%]"
            />
          </AnimatePresence>
        </motion.div>

        {/* per-game ambience — faint, Aevora lavender stays dominant */}
        <AnimatePresence initial={false}>
          <motion.div
            key={display.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE.out }}
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(620px 300px at 72% 18%, rgba(${display.ambient},0.13), transparent 70%)` }}
          />
        </AnimatePresence>

        {/* gradients for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#0D0912]/60 to-transparent" />

        {/* logo — staggered ~50ms after background */}
        <div className="pointer-events-none absolute left-[26px] top-[46px] select-none">
          <AnimatePresence initial={false}>
            <motion.div
              key={display.id}
              className="absolute left-0 top-0 w-max max-w-[440px]"
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -6 }}
              transition={{ duration: 0.32, delay: 0.05, ease: EASE.out }}
            >
              {display.id === 'forza' ? <ForzaLogo /> : <GenericLogo game={display} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA — staggered ~50ms after logo */}
        <div className="absolute bottom-[18px] right-[18px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={display.id}
              className="absolute bottom-0 right-0 w-max"
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: EASE.out }}
            >
              <motion.button
                whileHover={{ scale: 1.04, borderColor: 'rgba(217,198,234,0.25)', backgroundColor: 'rgba(74,53,96,0.5)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 550, damping: 32 }}
                onClick={() => onCta(display)}
                className="rounded-full border border-[rgba(217,198,234,0.14)] bg-black/45 px-4 py-[7px] text-[12px] font-medium text-[#F1EAF8]/90 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              >
                {display.status ?? 'Available now'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* subtle top highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-[rgba(217,198,234,0.06)]" />
      </div>
    </motion.section>
  );
}
