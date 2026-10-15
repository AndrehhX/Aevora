import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock, Play, Sparkles } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import { preloadImage } from '../hooks/usePreloadImage';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { EASE, HERO_CROSSFADE } from '../motion/presets';
import { getSteamHeroCandidates } from '../integrations/steam/steamAssets';
import { formatPlaytime, getTotalPlaytimeMinutes, isInstalled } from '../domain/library';

const FALLBACK_AMBIENT = '160,124,193';

function getGameHeroCandidates(game: UnifiedGame): string[] {
  const steamEntry = game.providers.find((p) => p.provider === 'steam');
  const appId = steamEntry ? steamEntry.externalId : game.id.startsWith('steam:') ? game.id.slice(6) : undefined;
  const list: string[] = [];
  if (appId) {
    list.push(...getSteamHeroCandidates(appId, game.artwork.hero, game.artwork.heroFallback));
  } else if (game.artwork.hero) {
    list.push(game.artwork.hero);
  }
  if (game.artwork.heroFallback) list.push(game.artwork.heroFallback);
  if (game.artwork.coverFallback) list.push(game.artwork.coverFallback);
  if (game.artwork.cover) list.push(game.artwork.cover);

  const seen = new Set<string>();
  return list.filter((s) => {
    const clean = s?.trim();
    if (!clean || seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
}

function TitleFallback({ game }: { game: UnifiedGame }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="h-[3px] w-[36px] rounded-full bg-gradient-to-r from-[#BEA0D8] to-[#8263A1] shadow-[0_0_12px_rgba(190,160,216,0.6)]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D9C6EA]/80">Featured Game</span>
      </div>
      <div className="mt-2.5 max-w-[500px] text-[clamp(28px,2.6vw,44px)] font-black leading-[0.98] tracking-[0.03em] text-[#F1EAF8] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
        {game.displayTitle ?? game.title.toUpperCase()}
      </div>
      {game.subtitle && (
        <div className="mt-1.5 text-[12px] font-medium tracking-wide text-[#BEA0D8]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">{game.subtitle}</div>
      )}
    </>
  );
}

function HeroBrand({ game, logoFailed, onLogoError }: { game: UnifiedGame; logoFailed: boolean; onLogoError: () => void }) {
  const [logoReady, setLogoReady] = useState(false);
  useEffect(() => setLogoReady(false), [game.id, game.artwork.logo]);
  const maxW = game.branding?.logoMaxWidth ?? 320;
  const scale = game.branding?.logoScale ?? 1;

  if (game.artwork.logo && !logoFailed) {
    return (
      <div className="flex min-h-[104px] flex-col justify-end" style={{ maxWidth: maxW }}>
        <img
          src={game.artwork.logo}
          alt={`${game.title} logo`}
          draggable={false}
          onLoad={() => setLogoReady(true)}
          onError={onLogoError}
          className="max-h-[110px] w-auto object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)]"
          style={{ maxWidth: maxW, transform: `scale(${scale})`, transformOrigin: 'bottom left', opacity: logoReady ? 1 : 0, transition: 'opacity 350ms cubic-bezier(0.16, 1, 0.3, 1)' }}
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

  const [display, setDisplay] = useState(game);
  const [logoFailed, setLogoFailed] = useState<Record<string, boolean>>({});
  const reqId = useRef(0);

  const candidates = useMemo(() => getGameHeroCandidates(display), [display]);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [heroSrc, setHeroSrc] = useState<string>(() => candidates[0] ?? display.artwork.hero);

  useEffect(() => {
    setCandidateIdx(0);
    setHeroSrc(candidates[0] ?? display.artwork.hero);
  }, [candidates, display.artwork.hero]);

  useEffect(() => {
    if (game.id === display.id) return;
    const id = ++reqId.current;
    let alive = true;

    if (game.artwork.logo) {
      preloadImage(game.artwork.logo).catch(() => undefined);
    }

    const nextCandidates = getGameHeroCandidates(game);
    preloadImage(nextCandidates[0], ...nextCandidates.slice(1))
      .then((src) => {
        if (!alive || reqId.current !== id) return;
        setDisplay(game);
        setHeroSrc(src);
        setCandidateIdx(Math.max(0, nextCandidates.indexOf(src)));
      })
      .catch(() => {
        if (!alive || reqId.current !== id) return;
        setDisplay(game);
        setHeroSrc(nextCandidates[0] ?? game.artwork.heroFallback);
        setCandidateIdx(0);
      });

    return () => {
      alive = false;
    };
  }, [game]);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 50, damping: 22 });
  const sy = useSpring(my, { stiffness: 50, damping: 22 });
  const imgX = useTransform(sx, [0, 1], [6, -6]);
  const imgY = useTransform(sy, [0, 1], [4, -4]);

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !parallax) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const handleImageError = () => {
    if (candidateIdx + 1 < candidates.length) {
      const nextIdx = candidateIdx + 1;
      setCandidateIdx(nextIdx);
      setHeroSrc(candidates[nextIdx]);
    } else {
      setCandidateIdx(candidates.length);
    }
  };

  const hasAllFailed = candidateIdx >= candidates.length;
  const installed = isInstalled(display);
  const totalPlay = getTotalPlaytimeMinutes(display);
  const ambientColor = display.ambient ?? FALLBACK_AMBIENT;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.12, duration: 0.55, ease: EASE.out }}
      className="relative w-full"
    >
      {/* Ambient background bloom behind the banner */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-[24px] opacity-40 blur-2xl transition-all duration-700"
        style={{
          background: `radial-gradient(800px 300px at 60% 30%, rgba(${ambientColor},0.32), transparent 75%)`,
        }}
      />

      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        className="group relative h-[clamp(260px,38vh,400px)] w-full overflow-hidden rounded-[20px] border border-white/[0.12] bg-[#120D1A] shadow-[0_24px_70px_-16px_rgba(0,0,0,0.85)]"
      >
        {/* Parallax layer */}
        <motion.div className="absolute inset-0" style={reduced || !parallax ? undefined : { x: imgX, y: imgY }}>
          <AnimatePresence initial={false}>
            {!hasAllFailed ? (
              <motion.img
                key={`${display.id}-${heroSrc}`}
                initial={{ opacity: 0, scale: reduced ? 1 : 1.03 }}
                animate={reduced ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [1, 1.025, 1], x: [0, -4, 0], y: [0, 2, 0] }}
                exit={{ opacity: 0, scale: reduced ? 1 : 1.02 }}
                transition={reduced ? { duration: 0.25, ease: EASE.out } : {
                  opacity: { duration: HERO_CROSSFADE, ease: EASE.out },
                  scale: { duration: 22, ease: 'easeInOut', repeat: Infinity },
                  x: { duration: 22, ease: 'easeInOut', repeat: Infinity },
                  y: { duration: 22, ease: 'easeInOut', repeat: Infinity },
                }}
                src={heroSrc}
                onError={handleImageError}
                alt={display.title}
                draggable={false}
                loading="eager"
                decoding="async"
                className="absolute -inset-[7%] h-[114%] w-[114%] object-cover object-center"
                style={{ imageRendering: 'auto' }}
              />
            ) : (
              <motion.div
                key={`fallback-${display.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{
                  background: `radial-gradient(1000px 500px at 70% 30%, rgba(${ambientColor}, 0.35), transparent 70%), linear-gradient(135deg, #241635 0%, #0D0912 60%, #17101F 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(190,160,216,0.15),transparent_60%)]" />
                <div className="pointer-events-none select-none text-[clamp(4rem,12vw,9rem)] font-black tracking-widest text-white/[0.04]">
                  {display.title.slice(0, 5).toUpperCase()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dynamic color atmosphere */}
        <AnimatePresence initial={false}>
          <motion.div
            key={display.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE.out }}
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(800px 380px at 75% 20%, rgba(${ambientColor},0.16), transparent 75%)`,
            }}
          />
        </AnimatePresence>

        {/* Clean, balanced cinematic gradient: dark left for logo legibility, clear artwork in center/right */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-[#0D0912]/85 via-[#0D0912]/35 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#0D0912] via-[#0D0912]/45 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent h-[30%]" />

        {/* Logo or Title Brand (Top Left) */}
        <div className="pointer-events-none absolute left-[30px] top-[40px] select-none">
          <AnimatePresence initial={false}>
            <motion.div
              key={display.id}
              className="w-max max-w-[480px]"
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -6 }}
              transition={{ duration: 0.35, delay: 0.05, ease: EASE.out }}
            >
              <HeroBrand
                game={display}
                logoFailed={!!logoFailed[display.id]}
                onLogoError={() => setLogoFailed((prev) => ({ ...prev, [display.id]: true }))}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Quick Metadata Chips (Bottom Left) */}
        <div className="pointer-events-none absolute bottom-[22px] left-[30px] hidden sm:flex items-center gap-2 select-none">
          <AnimatePresence initial={false}>
            <motion.div
              key={display.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.12 }}
              className="flex items-center gap-2"
            >
              {installed && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/50 px-3 py-1 text-[11px] font-semibold text-emerald-200 backdrop-blur-md shadow-[0_2px_12px_rgba(16,185,129,0.2)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  Ready to Play
                </span>
              )}
              {totalPlay > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-[#D9C6EA]/85 backdrop-blur-md">
                  <Clock size={11} className="text-[#BEA0D8]" />
                  {formatPlaytime(totalPlay)}
                </span>
              )}
              {display.metadata?.genres?.[0] && (
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-[#D9C6EA]/85 backdrop-blur-md">
                  <Sparkles size={11} className="text-[#BEA0D8]" />
                  {display.metadata.genres[0]}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA Launch / Details Button (Bottom Right) */}
        <div className="absolute bottom-[20px] right-[24px]">
          <AnimatePresence initial={false}>
            <motion.div
              key={display.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: EASE.out }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 12px 36px -6px rgba(160,124,193,0.5)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => onCta(display)}
                className="group relative flex items-center gap-2.5 overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-[#8263A1] via-[#A07CC1] to-[#654A7F] px-5 py-2.5 text-[12.5px] font-bold text-[#F1EAF8] shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:scale-110">
                  <Play size={11} className="fill-current text-white ml-0.5" />
                </span>
                <span>{display.highlight ?? (installed ? 'Play Now' : 'View Details')}</span>
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtle glass reflection ring */}
        <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/10" />
      </div>
    </motion.section>
  );
}

