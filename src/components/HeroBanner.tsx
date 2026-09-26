import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { UnifiedGame } from '../domain/game';
import { preloadImage } from '../hooks/usePreloadImage';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { EASE, HERO_CROSSFADE } from '../motion/presets';

const FALLBACK_AMBIENT = '160,124,193';

function TitleFallback({ game }: { game: UnifiedGame }) {
  return (
    <>
      <div className="h-[3px] w-[44px] rounded-full bg-[#A07CC1]/80 shadow-[0_0_12px_rgba(190,160,216,0.5)]" />
      <div className="mt-2.5 max-w-[420px] text-[clamp(30px,2.8vw,46px)] font-extrabold leading-[0.95] tracking-[0.06em] text-[#F1EAF8]/95 drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
        {game.displayTitle ?? game.title.toUpperCase()}
      </div>
      {game.subtitle && (
        <div className="mt-1.5 text-[12px] font-medium tracking-wide text-[#BEA0D8]/90">{game.subtitle}</div>
      )}
    </>
  );
}

function HeroBrand({ game, logoFailed, onLogoError }: { game: UnifiedGame; logoFailed: boolean; onLogoError: () => void }) {
  const [logoReady, setLogoReady] = useState(false);
  useEffect(() => setLogoReady(false), [game.id, game.artwork.logo]);
  const maxW = game.branding?.logoMaxWidth ?? 300;
  const scale = game.branding?.logoScale ?? 1;

  // Generic rule: real logo when available, styled title otherwise.
  // No text is rendered while the logo loads — no flash, no shift.
  if (game.artwork.logo && !logoFailed) {
    return (
      <div className="flex min-h-[104px] flex-col justify-end" style={{ maxWidth: maxW }}>
        <img
          src={game.artwork.logo}
          alt={`${game.title} logo`}
          draggable={false}
          onLoad={() => setLogoReady(true)}
          onError={onLogoError}
          className="max-h-[110px] w-auto object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]"
          style={{ maxWidth: maxW, transform: `scale(${scale})`, transformOrigin: 'bottom left', opacity: logoReady ? 1 : 0, transition: 'opacity 300ms ease' }}
        />
      </div>
    );
  }
  return <TitleFallback game={game} />;
}

export default function HeroBanner({
  game,
  onCta,
  parallax = true,
  forceReduced = false,
}: {
  game: UnifiedGame;
  onCta: (game: UnifiedGame) => void;
  parallax?: boolean;
  forceReduced?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const systemReduced = usePrefersReducedMotion();
  const reduced = forceReduced || systemReduced;
  // Displayed game lags selection until next artwork is preloaded — never blank.
  const [display, setDisplay] = useState(game);
  const [heroSrc, setHeroSrc] = useState(game.artwork.hero);
  const [logoFailed, setLogoFailed] = useState<Record<string, boolean>>({});
  const reqId = useRef(0);

  useEffect(() => {
    if (game.id === display.id) return;
    const id = ++reqId.current;
    let alive = true;
    // preload hero + logo together so no text flashes while the logo loads
    if (game.artwork.logo) {
      preloadImage(game.artwork.logo, game.artwork.logo).catch(() => undefined);
    }
    preloadImage(game.artwork.hero, game.artwork.heroFallback)
      .then((src) => {
        if (!alive || reqId.current !== id) return;
        setDisplay(game);
        setHeroSrc(src);
      })
      .catch(() => {
        if (!alive || reqId.current !== id) return;
        setDisplay(game);
        setHeroSrc(game.artwork.heroFallback);
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
              src={display.id === game.id && heroSrc ? heroSrc : display.artwork.hero}
              onError={(e) => {
                if ((e.target as HTMLImageElement).src !== display.artwork.heroFallback) {
                  (e.target as HTMLImageElement).src = display.artwork.heroFallback;
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
            style={{ background: `radial-gradient(620px 300px at 72% 18%, rgba(${display.ambient ?? FALLBACK_AMBIENT},0.13), transparent 70%)` }}
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
              <HeroBrand
                game={display}
                logoFailed={!!logoFailed[display.id]}
                onLogoError={() => setLogoFailed((prev) => ({ ...prev, [display.id]: true }))}
              />
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
                {display.highlight ?? 'Available now'}
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
