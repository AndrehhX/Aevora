import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import HeroBanner from './HeroBanner';
import GameCarousel from './GameCarousel';
import ToastHost, { type ToastData } from './Toast';
import CustomCursor from './CustomCursor';
import GameDetails from './GameDetails';
import SettingsPanel, { DEFAULT_PREFS, type Prefs } from './SettingsPanel';
import ProfilePanel from './ProfilePanel';
import CommunityPreview from './CommunityPreview';
import SignOutDialog from './SignOutDialog';
import StoreView from '../views/StoreView';
import CommunityView from '../views/CommunityView';
import { EarlyView, IndiesView } from '../views/Collections';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { EASE } from '../motion/presets';
import { communityItems, getGame, installedGames, popularGames, type CommunityItem } from '../data/mock';

type Overlay =
  | { type: 'game'; id: string }
  | { type: 'settings' }
  | { type: 'profile' }
  | { type: 'community'; item: CommunityItem }
  | { type: 'signout' };

const BACKGROUNDS: Record<Prefs['theme'], string> = {
  aevora:
    'radial-gradient(1200px 700px at 70% -10%, rgba(101,74,127,0.20), transparent 60%), radial-gradient(900px 600px at 8% 108%, rgba(74,53,96,0.22), transparent 60%), radial-gradient(700px 500px at 50% 50%, rgba(74,53,96,0.12), transparent 70%), linear-gradient(180deg,#17101F 0%,#0D0912 55%,#0D0912 100%)',
  midnight:
    'radial-gradient(1200px 700px at 70% -10%, rgba(90,110,200,0.14), transparent 60%), radial-gradient(900px 600px at 8% 108%, rgba(74,53,96,0.16), transparent 60%), radial-gradient(700px 500px at 50% 50%, rgba(60,70,140,0.10), transparent 70%), linear-gradient(180deg,#12121e 0%,#0b0b14 60%,#090910 100%)',
};

function sanitizePrefs(raw: Prefs): Prefs {
  return {
    theme: raw.theme === 'midnight' ? 'midnight' : 'aevora',
    sidebarCollapsed: !!raw.sidebarCollapsed,
    cursor: raw.cursor !== false,
    parallax: raw.parallax !== false,
    inertia: raw.inertia !== false,
    startOnHome: raw.startOnHome !== false,
    rememberGame: raw.rememberGame !== false,
    reduceMotion: !!raw.reduceMotion,
  };
}

export default function AppShell() {
  const [prefsRaw, setPrefs] = useLocalStorage<Prefs>('aevora:prefs', DEFAULT_PREFS);
  const prefs = useMemo(() => sanitizePrefs({ ...DEFAULT_PREFS, ...prefsRaw }), [prefsRaw]);

  const [libraryQuery, setLibraryQuery] = useState('');
  const [globalQuery, setGlobalQuery] = useState('');
  const [favorites, setFavorites] = useLocalStorage<string[]>('aevora:favorites', []);
  const [lastPlayed, setLastPlayed] = useLocalStorage<Record<string, number>>('aevora:lastPlayed', {});
  const [storedGame, setStoredGame] = useLocalStorage<string>('aevora:lastGame', 'forza');
  const [storedNav, setStoredNav] = useLocalStorage<string>('aevora:lastNav', 'Home');

  // ONE centralized selection — sidebar + carousel + hero + views share it.
  const [selectedId, setSelectedId] = useState(() => (prefsRaw.rememberGame !== false && storedGame && getGame(storedGame) ? storedGame : 'forza'));
  const [activeNav, setActiveNav] = useState(() => (prefsRaw.startOnHome !== false ? 'Home' : storedNav || 'Home'));
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const notify = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
  }, []);

  const selectGame = useCallback(
    (id: string) => {
      if (!getGame(id)) return;
      setSelectedId(id);
      if (prefs.rememberGame) setStoredGame(id);
    },
    [prefs.rememberGame, setStoredGame]
  );

  const changeNav = useCallback(
    (nav: string) => {
      setActiveNav(nav);
      setStoredNav(nav);
    },
    [setStoredNav]
  );

  const openOverlay = useCallback((o: Overlay) => {
    setOverlay(o);
    (document.activeElement as HTMLElement | null)?.blur?.();
  }, []);

  // Ctrl+K / Cmd+K focuses global search (or closes the top overlay first).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay) {
          setOverlay(null);
          return;
        }
        document.getElementById('global-search')?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overlay]);

  const toggleFav = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const has = prev.includes(id);
        const g = getGame(id);
        notify(has ? `Removed ${g?.title ?? 'game'} from favorites` : `Added ${g?.title ?? 'game'} to favorites`);
        return has ? prev.filter((f) => f !== id) : [...prev, id];
      });
    },
    [notify, setFavorites]
  );

  const handlePlayed = useCallback(
    (id: string) => {
      setLastPlayed((prev) => ({ ...prev, [id]: Date.now() }));
      notify('Game launch simulation');
    },
    [notify, setLastPlayed]
  );

  const selectedGame = useMemo(() => getGame(selectedId) ?? getGame('forza')!, [selectedId]);
  const safeFavorites = useMemo(() => (Array.isArray(favorites) ? favorites.filter((f) => getGame(f)) : []), [favorites]);

  const filteredGames = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return installedGames;
    return installedGames.filter((g) => g.title.toLowerCase().includes(q));
  }, [libraryQuery]);

  const gameOverlay = overlay?.type === 'game' ? getGame(overlay.id) ?? null : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: BACKGROUNDS[prefs.theme] }}>
      {/* film grain / vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,transparent_55%,rgba(0,0,0,0.45)_100%)]" />

      <div className="relative z-10 flex h-full w-full gap-3 p-3">
        <Sidebar
          libraryQuery={libraryQuery}
          setLibraryQuery={setLibraryQuery}
          filteredGames={filteredGames}
          selectedId={selectedId}
          setSelectedId={selectGame}
          onCommunityClick={(item) => openOverlay({ type: 'community', item })}
          collapsed={prefs.sidebarCollapsed}
          onToggleCollapse={() => setPrefs({ ...prefs, sidebarCollapsed: !prefs.sidebarCollapsed })}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <TopNavigation
            activeNav={activeNav}
            setActiveNav={changeNav}
            globalQuery={globalQuery}
            setGlobalQuery={setGlobalQuery}
            theme={prefs.theme}
            onCycleTheme={() => setPrefs({ ...prefs, theme: prefs.theme === 'aevora' ? 'midnight' : 'aevora' })}
            onSelectGame={selectGame}
            onOpenSettings={() => openOverlay({ type: 'settings' })}
            onOpenProfile={() => openOverlay({ type: 'profile' })}
            onOpenSignOut={() => openOverlay({ type: 'signout' })}
            closeSignal={overlay}
          />
          <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeNav}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: EASE.out }}
                className="flex min-h-0 flex-1 flex-col gap-3"
              >
                {activeNav === 'Home' && (
                  <>
                    <HeroBanner
                      game={selectedGame}
                      onCta={(g) => openOverlay({ type: 'game', id: g.id })}
                      parallax={prefs.parallax}
                      forceReduced={prefs.reduceMotion}
                    />
                    <GameCarousel games={popularGames} selectedId={selectedId} onSelect={selectGame} inertia={prefs.inertia} />
                  </>
                )}
                {activeNav === 'Store' && (
                  <StoreView selectedId={selectedId} onSelect={selectGame} onInspect={(id) => openOverlay({ type: 'game', id })} />
                )}
                {activeNav === 'Community' && (
                  <CommunityView onPreview={(item) => openOverlay({ type: 'community', item })} />
                )}
                {activeNav === 'Indies' && <IndiesView selectedId={selectedId} onSelect={selectGame} />}
                {activeNav === 'Early2025' && <EarlyView selectedId={selectedId} onSelect={selectGame} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <GameDetails
        game={gameOverlay}
        open={overlay?.type === 'game'}
        isFav={overlay?.type === 'game' ? safeFavorites.includes(overlay.id) : false}
        onToggleFav={toggleFav}
        lastPlayed={overlay?.type === 'game' ? lastPlayed[overlay.id] : undefined}
        onPlayed={handlePlayed}
        onClose={() => setOverlay(null)}
      />
      <SettingsPanel open={overlay?.type === 'settings'} prefs={prefs} onChange={setPrefs} onClose={() => setOverlay(null)} />
      <ProfilePanel
        open={overlay?.type === 'profile'}
        favorites={safeFavorites}
        onSelectGame={(id) => {
          selectGame(id);
          changeNav('Home');
        }}
        onClose={() => setOverlay(null)}
      />
      <CommunityPreview
        item={overlay?.type === 'community' ? overlay.item : communityItems[0]}
        open={overlay?.type === 'community'}
        onClose={() => setOverlay(null)}
      />
      <SignOutDialog
        open={overlay?.type === 'signout'}
        onConfirm={() => {
          setOverlay(null);
          notify('Signed out (prototype mode)');
        }}
        onClose={() => setOverlay(null)}
      />

      <ToastHost toast={toast} onDone={() => setToast(null)} />
      <CustomCursor enabled={prefs.cursor && !prefs.reduceMotion} />
    </div>
  );
}
