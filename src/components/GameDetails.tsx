import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, ChevronDown, Clock, Download, HardDrive, Heart, Play } from 'lucide-react';
import type { UnifiedGame } from '../domain/game';
import type { GameProviderEntry, ProviderId } from '../domain/provider';
import { providerName } from '../domain/provider';
import {
  formatLastPlayed,
  formatPlaytime,
  getInstalledProviders,
  getLastPlayed,
  getOwnedProviders,
  getPreferredOwned,
  getPreferredProvider,
  getTotalPlaytimeMinutes,
  isInstalled,
  isOwned,
} from '../domain/library';
import { DURATION, EASE } from '../motion/presets';
import Modal from './Modal';
import ProviderBadge from './ProviderBadge';
import { SmartImage } from './SmartImage';
import type { LaunchResult } from '../integrations/steam/steamLaunch';
import { getSteamCoverCandidates } from '../integrations/steam/steamAssets';

type Phase = 'idle' | 'working' | 'playing';

export default function GameDetails({
  game,
  open,
  isFav,
  onToggleFav,
  preferred,
  sessionLastPlayed,
  onPlay,
  onInstall,
  onNeedProviderChoice,
  onClose,
}: {
  game: UnifiedGame | null;
  open: boolean;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  preferred?: ProviderId;
  sessionLastPlayed?: number;
  onPlay: (game: UnifiedGame, entry: GameProviderEntry) => Promise<LaunchResult> | void;
  onInstall: (game: UnifiedGame, entry: GameProviderEntry) => Promise<LaunchResult> | void;
  onNeedProviderChoice: (game: UnifiedGame, mode: 'play' | 'install') => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [moreInfo, setMoreInfo] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (open) {
      setPhase('idle');
      setMoreInfo(false);
    }
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [open, game?.id ]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (!game) return null;
  const owned = isOwned(game);
  const installed = isInstalled(game);
  const ownedProviders = getOwnedProviders(game);
  const installedProviders = getInstalledProviders(game);
  const totalPlay = getTotalPlaytimeMinutes(game);
  const lastPlayed = getLastPlayed(game, sessionLastPlayed);

  const primary: 'play' | 'install' | null = installed ? 'play' : owned ? 'install' : null;

  const activate = () => {
    if (phase !== 'idle' || !primary) return;
    if (primary === 'play') {
      const pick = getPreferredProvider(game, preferred);
      if (!pick) return;
      if (installedProviders.length > 1 && !(preferred && pick.provider === preferred)) {
        onNeedProviderChoice(game, 'play');
        return;
      }
      setPhase('working');
      void Promise.resolve(onPlay(game, pick)).then((result: void | LaunchResult) => {
        if (result && result.status === 'started') {
          setPhase('playing');
          timers.current.push(window.setTimeout(() => setPhase('idle'), 2600));
        } else {
          setPhase('idle');
        }
      });
    } else {
      const candidates = ownedProviders;
      if (candidates.length === 0) return;
      const pick = getPreferredOwned(game, preferred);
      if (candidates.length > 1 && !(preferred && pick && pick.provider === preferred)) {
        onNeedProviderChoice(game, 'install');
        return;
      }
      const entry = pick ?? candidates[0];
      setPhase('working');
      void Promise.resolve(onInstall(game, entry)).then(() => setPhase('idle'));
    }
  };

  const steamEntry = game.providers.find((p) => p.provider === 'steam');
  const appId = steamEntry ? steamEntry.externalId : game.id.startsWith('steam:') ? game.id.slice(6) : undefined;
  const coverCandidates = appId
    ? getSteamCoverCandidates(appId, game.artwork.cover, game.artwork.coverFallback, game.artwork.coverFallback2)
    : [game.artwork.cover, game.artwork.coverFallback, game.artwork.coverFallback2].filter(Boolean) as string[];

  const ambientColor = game.ambient ?? '160,124,193';

  return (
    <Modal open={open} onClose={onClose} labelledBy="game-details-title" panelClass="max-w-[660px] p-0 overflow-hidden border border-white/[0.12] bg-[#140E1C] shadow-[0_36px_100px_-20px_rgba(0,0,0,0.95)]">
      {/* Ambient header glow backdrop */}
      <div className="relative h-[130px] w-full overflow-hidden">
        {game.artwork.hero && (
          <img
            src={game.artwork.hero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center filter blur-sm brightness-75 scale-105"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(600px 140px at 50% 0%, rgba(${ambientColor},0.4), transparent 85%), linear-gradient(180deg, rgba(20,14,28,0.2) 0%, #140E1C 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140E1C] via-[#140E1C]/40 to-transparent" />
      </div>

      <div className="relative -mt-16 flex max-h-[82vh] flex-col sm:flex-row px-6 pb-6 gap-6">
        {/* artwork */}
        <div className="relative h-[220px] w-[148px] shrink-0 overflow-hidden rounded-[16px] border border-white/15 bg-[rgba(74,53,96,0.3)] shadow-[0_20px_45px_-10px_rgba(0,0,0,0.85)]">
          {game.artwork.cover ? (
            <SmartImage
              candidates={coverCandidates}
              src={coverCandidates[0] ?? game.artwork.cover}
              fallback={coverCandidates[1] ?? game.artwork.coverFallback}
              fallback2={coverCandidates[2] ?? game.artwork.coverFallback2}
              alt={game.title}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#4A3560] via-[#8263A1] to-[#17101F] text-[64px] font-extrabold text-[#F1EAF8]">
              P
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span className="absolute bottom-2.5 left-2.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-[#F1EAF8] backdrop-blur-xl">
            {game.highlight ?? (installed ? 'Installed' : 'In Library')}
          </span>
        </div>

        {/* info */}
        <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto pt-1">
          <h2 id="game-details-title" className="pr-6 text-[22px] font-black tracking-[0.02em] text-[#F1EAF8]">
            {game.displayTitle ?? game.title.toUpperCase()}
          </h2>
          {game.subtitle && <p className="mt-0.5 text-[12.5px] font-medium text-[#BEA0D8]/90">{game.subtitle}</p>}

          {/* owned-on */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#BEA0D8]/55">Owned on</span>
            {ownedProviders.length === 0 && <span className="text-[11.5px] text-[#BEA0D8]/55">Not in library</span>}
            {ownedProviders.map((p) => (
              <ProviderBadge key={p.provider} provider={p.provider} />
            ))}
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {[
              { icon: Clock, k: 'Playtime', v: formatPlaytime(totalPlay) },
              { icon: CalendarClock, k: 'Last played', v: formatLastPlayed(lastPlayed) },
              { icon: HardDrive, k: 'State', v: installed ? `Installed${installedProviders.length > 1 ? ` · ${installedProviders.length}` : ''}` : owned ? 'Not installed' : 'Not owned' },
              { icon: Download, k: 'Providers', v: `${ownedProviders.length} owned` },
            ].map((m) => (
              <div key={m.k} className="rounded-[10px] border border-[rgba(217,198,234,0.10)] bg-[rgba(74,53,96,0.16)] px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#BEA0D8]/55">
                  <m.icon size={11} />
                  {m.k}
                </div>
                <div className="mt-0.5 truncate text-[12px] font-medium text-[#F1EAF8]/90">{m.v}</div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[12.5px] leading-relaxed text-[#D9C6EA]/80">
            {game.description ?? `Experience ${game.title} on Aevora with cloud saves and seamless updates.`}
          </p>

          {/* actions */}
          <div className="mt-4 flex items-center gap-2">
            {primary === 'play' && (
              <motion.button
                whileHover={phase === 'idle' ? { scale: 1.03 } : undefined}
                whileTap={phase === 'idle' ? { scale: 0.97 } : undefined}
                onClick={activate}
                disabled={phase !== 'idle'}
                aria-label={`Play ${game.title}`}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold transition-colors ${
                  phase === 'idle'
                    ? 'bg-gradient-to-r from-[#8263A1] to-[#A07CC1] text-[#F1EAF8] shadow-[0_10px_28px_-8px_rgba(190,160,216,0.5)]'
                    : 'cursor-default bg-[rgba(74,53,96,0.4)] text-[#D9C6EA]/80'
                }`}
              >
                <Play size={14} />
                {phase === 'idle' ? 'PLAY' : phase === 'working' ? 'Launching...' : 'Playing'}
              </motion.button>
            )}
            {primary === 'install' && (
              <motion.button
                whileHover={phase === 'idle' ? { scale: 1.03 } : undefined}
                whileTap={phase === 'idle' ? { scale: 0.97 } : undefined}
                onClick={activate}
                disabled={phase !== 'idle'}
                aria-label={`Install ${game.title}`}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold transition-colors ${
                  phase === 'idle'
                    ? 'bg-gradient-to-r from-[#8263A1] to-[#A07CC1] text-[#F1EAF8] shadow-[0_10px_28px_-8px_rgba(190,160,216,0.5)]'
                    : 'cursor-default bg-[rgba(74,53,96,0.4)] text-[#D9C6EA]/80'
                }`}
              >
                <Download size={14} />
                {phase === 'idle' ? 'INSTALL' : 'Opening...'}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onToggleFav(game.id)}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFav}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-medium transition-colors ${
                isFav
                  ? 'border-[rgba(190,160,216,0.5)] bg-[rgba(130,99,161,0.30)] text-[#F1EAF8]'
                  : 'border-[rgba(217,198,234,0.14)] bg-[rgba(74,53,96,0.22)] text-[#D9C6EA]/85 hover:text-[#F1EAF8]'
              }`}
            >
              <Heart size={13} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Favorited' : 'Favorite'}
            </motion.button>
          </div>

          {/* more info */}
          <button
            onClick={() => setMoreInfo((v) => !v)}
            aria-expanded={moreInfo}
            className="mt-3 flex items-center gap-1 text-[11.5px] font-medium text-[#BEA0D8]/75 transition-colors hover:text-[#F1EAF8]"
          >
            More Info
            <motion.span animate={{ rotate: moreInfo ? 180 : 0 }} transition={{ duration: DURATION.micro }}>
              <ChevronDown size={13} />
            </motion.span>
          </button>
          {moreInfo && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.fast, ease: EASE.out }}
              className="mt-2 space-y-1.5 rounded-[10px] border border-[rgba(217,198,234,0.10)] bg-black/25 p-3 text-[11.5px]"
            >
              {[
                ['Developer', game.metadata?.developer ?? '—'],
                ['Publisher', game.metadata?.publisher ?? '—'],
                ['Release', game.metadata?.releaseDate ?? '—'],
                ['Genres', game.metadata?.genres?.join(' · ') ?? '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-[#BEA0D8]/55">{k}</span>
                  <span className="text-right text-[#D9C6EA]/90">{v}</span>
                </div>
              ))}
              <div className="my-1 h-px bg-[rgba(217,198,234,0.08)]" />
              {game.providers.map((p) => (
                <div key={p.provider} className="flex items-center justify-between gap-3">
                  <span className="text-[#BEA0D8]/55">{providerName(p.provider)}</span>
                  <span className="text-right text-[#D9C6EA]/90">
                    {p.installed ? 'Installed' : p.owned ? 'Owned' : '—'}
                    {p.playtimeMinutes ? ` · ${formatPlaytime(p.playtimeMinutes)}` : ''}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
}
