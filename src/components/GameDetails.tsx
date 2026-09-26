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
  onPlay: (game: UnifiedGame, entry: GameProviderEntry) => void;
  onInstall: (game: UnifiedGame, entry: GameProviderEntry) => void;
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
      timers.current.push(
        window.setTimeout(() => {
          setPhase('playing');
          onPlay(game, pick);
          timers.current.push(window.setTimeout(() => setPhase('idle'), 2600));
        }, 900)
      );
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
      timers.current.push(
        window.setTimeout(() => {
          setPhase('idle');
          onInstall(game, entry);
        }, 900)
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="game-details-title" panelClass="max-w-[600px]">
      <div className="flex max-h-[86vh] flex-col sm:flex-row">
        {/* artwork */}
        <div className="relative h-[190px] w-full shrink-0 overflow-hidden bg-[rgba(74,53,96,0.25)] sm:h-auto sm:min-h-[430px] sm:w-[220px]">
          {game.artwork.cover ? (
            <SmartImage src={game.artwork.cover} fallback={game.artwork.coverFallback} alt={game.title} className="absolute inset-0 h-full w-full object-cover object-top" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#4A3560] via-[#8263A1] to-[#17101F] text-[64px] font-extrabold text-[#F1EAF8]">
              P
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(13,9,18,0.75)] via-transparent to-transparent" />
          <span className="absolute bottom-2.5 left-2.5 rounded-full border border-[rgba(217,198,234,0.16)] bg-black/50 px-2.5 py-1 text-[10px] font-medium text-[#D9C6EA]/90 backdrop-blur-xl">
            {game.highlight ?? 'Available now'}
          </span>
        </div>

        {/* info */}
        <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto p-5">
          <h2 id="game-details-title" className="pr-6 text-[19px] font-extrabold tracking-[0.04em] text-[#F1EAF8]">
            {game.displayTitle ?? game.title.toUpperCase()}
          </h2>
          {game.subtitle && <p className="mt-0.5 text-[12px] font-medium text-[#BEA0D8]/80">{game.subtitle}</p>}

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
