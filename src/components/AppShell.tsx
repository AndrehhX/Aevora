import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import HeroBanner from './HeroBanner';
import GameCarousel from './GameCarousel';
import ToastHost, { type ToastData } from './Toast';
import CustomCursor from './CustomCursor';
import GameDetails from './GameDetails';
import SettingsPanel from './SettingsPanel';
import ProfilePanel from './ProfilePanel';
import CommunityPreview from './CommunityPreview';
import SignOutDialog from './SignOutDialog';
import ProviderSelector from './ProviderSelector';
import LibraryEmptyState from './LibraryEmptyState';
import StoreView from '../views/StoreView';
import CommunityView from '../views/CommunityView';
import { EarlyView, IndiesView } from '../views/Collections';
import { getInstalledGames } from '../domain/library';
import type { GameProviderEntry, ProviderId } from '../domain/provider';
import { providerName } from '../domain/provider';
import type { UnifiedGame } from '../domain/game';
import { DEFAULT_STATE, loadState, saveState, type PersistedPrefs } from '../domain/storage';
import { EASE } from '../motion/presets';
import { carouselIds, getLibraryGame, libraryGames, setLibraryGames } from '../data/library';
import type { CommunityItem } from '../data/navigation';
import { navItems } from '../data/navigation';
import { createLocalCacheStore } from '../integrations/cache/cacheStore';
import { createSteamAdapter, SteamAdapterError, type ConnectionState } from '../integrations/steam/steamAdapter';
import type { SteamNewsItem } from '../integrations/steam/steamNews';
import { launchGame, openStore, type LaunchResult } from '../integrations/steam/steamLaunch';
import { getDesktopBridge } from '../integrations/desktop/bridge';
import type { SteamCredentialsInput } from '../integrations/steam/steamCredentials';

type Overlay =
  | { type: 'game'; id: string }
  | { type: 'provider'; id: string; mode: 'play' | 'install' }
  | { type: 'settings' }
  | { type: 'profile' }
  | { type: 'community'; item: CommunityItem }
  | { type: 'signout' };

const BACKGROUNDS: Record<PersistedPrefs['theme'], string> = {
  aevora:
    'radial-gradient(1200px 700px at 70% -10%, rgba(101,74,127,0.20), transparent 60%), radial-gradient(900px 600px at 8% 108%, rgba(74,53,96,0.22), transparent 60%), radial-gradient(700px 500px at 50% 50%, rgba(74,53,96,0.12), transparent 70%), linear-gradient(180deg,#17101F 0%,#0D0912 55%,#0D0912 100%)',
  midnight:
    'radial-gradient(1200px 700px at 70% -10%, rgba(90,110,200,0.14), transparent 60%), radial-gradient(900px 600px at 8% 108%, rgba(74,53,96,0.16), transparent 60%), radial-gradient(700px 500px at 50% 50%, rgba(60,70,140,0.10), transparent 70%), linear-gradient(180deg,#12121e 0%,#0b0b14 60%,#090910 100%)',
};

const VALID_NAV = new Set(navItems);

export default function AppShell() {
  // Centralized persisted state — one versioned blob, safe defaults.
  const [store, setStore] = useState(loadState);
  useEffect(() => saveState(store), [store]);

  const prefs = store.prefs.theme === 'midnight' ? { ...store.prefs, theme: 'midnight' as const } : { ...store.prefs, theme: 'aevora' as const };

  const [libraryQuery, setLibraryQuery] = useState('');
  const [globalQuery, setGlobalQuery] = useState('');
  // ONE centralized selection — sidebar + carousel + hero + views share it.
  const [selectedId, setSelectedId] = useState(() =>
    store.prefs.rememberGame && getLibraryGame(store.lastSelectedGame) ? store.lastSelectedGame : 'forza'
  );
  const [activeNav, setActiveNav] = useState(() =>
    store.prefs.startOnHome ? 'Home' : VALID_NAV.has(store.lastNav) ? store.lastNav : 'Home'
  );
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const steamAdapter = useMemo(() => createSteamAdapter({ cache: createLocalCacheStore() }), []);
  const [steamConnection, setSteamConnection] = useState<ConnectionState>({ status: 'disconnected' });
  const [steamNews, setSteamNews] = useState<SteamNewsItem[]>([]);
  const nativeAvailable = useMemo(() => getDesktopBridge().isNative, []);

  const notify = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
  }, []);

  const connectSteam = useCallback(async () => {
    try {
      const connection = await steamAdapter.connect();
      setSteamConnection(connection);
      if (connection.status === 'connected') {
        const games = await steamAdapter.getLibrary();
        setLibraryGames(games);
        const firstGame = games[0];
        if (firstGame) {
          setSelectedId(firstGame.id);
          const steamId = firstGame.providers.find((entry) => entry.provider === 'steam')?.externalId;
          if (steamId) {
            const news = await steamAdapter.getNews(Number(steamId));
            setSteamNews(news.items);
          }
        }
        notify(`Connected to Steam${connection.displayName ? ` as ${connection.displayName}` : ''}.`);
      } else {
        notify('Steam connection canceled.');
      }
    } catch (error) {
      notify(error instanceof SteamAdapterError ? error.message : 'Steam connection is unavailable.');
    }
  }, [notify, steamAdapter]);

  const disconnectSteam = useCallback(async () => {
    try {
      await steamAdapter.disconnect();
      setSteamConnection({ status: 'disconnected' });
      setLibraryGames([]);
      setSteamNews([]);
      notify('Steam disconnected.');
    } catch {
      notify('Steam could not be disconnected.');
    }
  }, [notify, steamAdapter]);

  const saveSteamCredentials = useCallback(async (credentials: SteamCredentialsInput) => {
    await steamAdapter.saveCredentials(credentials);
    notify('Steam setup saved locally on this PC.');
  }, [notify, steamAdapter]);

  const clearSteamCredentials = useCallback(async () => {
    await steamAdapter.clearCredentials();
    await disconnectSteam();
    notify('Local Steam setup cleared.');
  }, [disconnectSteam, notify, steamAdapter]);

  const selectGame = useCallback(
    (id: string) => {
      if (!getLibraryGame(id)) return;
      setSelectedId(id);
      setStore((s) => (s.prefs.rememberGame ? { ...s, lastSelectedGame: id } : s));
    },
    []
  );

  const changeNav = useCallback((nav: string) => {
    if (!VALID_NAV.has(nav)) return;
    setActiveNav(nav);
    setStore((s) => ({ ...s, lastNav: nav }));
  }, []);

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
  }, [overlay ]);

  const toggleFav = useCallback(
    (id: string) => {
      const g = getLibraryGame(id);
      if (!g) return;
      setStore((s) => {
        const has = s.favorites.includes(id);
        if (has) notify(`Removed ${g.title} from favorites`);
        else notify(`Added ${g.title} to favorites`);
        return { ...s, favorites: has ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] };
      });
    },
    [notify]
  );

  const handlePlay = useCallback(
    async (game: UnifiedGame, entry: GameProviderEntry): Promise<LaunchResult> => {
      const result = await launchGame(entry);
      if (result.status === 'started') {
        setStore((s) => ({ ...s, playHistory: { ...s.playHistory, [game.id]: Date.now() } }));
        notify(`Opened ${providerName(entry.provider)}.`);
      } else {
        notify(result.message);
      }
      return result;
    },
    [notify]
  );

  const handleInstall = useCallback(
    async (_game: UnifiedGame, entry: GameProviderEntry): Promise<LaunchResult> => {
      const result = await openStore(entry);
      notify(result.status === 'started' ? `Opened ${providerName(entry.provider)} store.` : result.message);
      return result;
    },
    [notify]
  );

  const handleProviderPick = useCallback(
    (game: UnifiedGame, mode: 'play' | 'install', entry: GameProviderEntry, remember: boolean) => {
      if (remember) {
        const provider: ProviderId = entry.provider;
        setStore((s) => ({ ...s, preferredProviders: { ...s.preferredProviders, [game.id]: provider } }));
      }
      setOverlay(null);
      if (mode === 'play') handlePlay(game, entry);
      else handleInstall(game, entry);
    },
    [handlePlay, handleInstall]
  );

  const selectedGame = useMemo(() => getLibraryGame(selectedId), [selectedId]);
  const carouselGames = useMemo(() => carouselIds.map(getLibraryGame).filter((g): g is UnifiedGame => !!g), []);
  const safeFavorites = useMemo(
    () => (Array.isArray(store.favorites) ? store.favorites.filter((f) => getLibraryGame(f)) : []),
    [store.favorites]
  );

  // Ready To Play derives from installed state — no separate sidebar list.
  const readyToPlay = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase();
    const installed = getInstalledGames(libraryGames);
    if (!q) return installed;
    return installed.filter((g) => g.title.toLowerCase().includes(q));
  }, [libraryQuery]);

  const gameOverlay = overlay?.type === 'game' ? getLibraryGame(overlay.id) ?? null : null;
  const providerOverlay = overlay?.type === 'provider' ? getLibraryGame(overlay.id) ?? null : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: BACKGROUNDS[prefs.theme] }}>
      {/* film grain / vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,transparent_55%,rgba(0,0,0,0.45)_100%)]" />

      <div className="relative z-10 flex h-full w-full gap-3 p-3">
        <Sidebar
          libraryQuery={libraryQuery}
          setLibraryQuery={setLibraryQuery}
          filteredGames={readyToPlay}
          selectedId={selectedId}
          setSelectedId={selectGame}
          onCommunityClick={(item) => openOverlay({ type: 'community', item })}
          collapsed={prefs.sidebarCollapsed}
          onToggleCollapse={() => setStore((s) => ({ ...s, prefs: { ...s.prefs, sidebarCollapsed: !s.prefs.sidebarCollapsed } }))}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <TopNavigation
            activeNav={activeNav}
            setActiveNav={changeNav}
            globalQuery={globalQuery}
            setGlobalQuery={setGlobalQuery}
            library={libraryGames}
            favorites={safeFavorites}
            theme={prefs.theme}
            onCycleTheme={() =>
              setStore((s) => ({ ...s, prefs: { ...s.prefs, theme: s.prefs.theme === 'aevora' ? 'midnight' : 'aevora' } }))
            }
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
                    {selectedGame ? (
                      <>
                        <HeroBanner
                          game={selectedGame}
                          onCta={(g) => openOverlay({ type: 'game', id: g.id })}
                          parallax={prefs.parallax}
                          forceReduced={prefs.reduceMotion}
                        />
                        {carouselGames.length > 0 && (
                          <GameCarousel games={carouselGames} selectedId={selectedId} onSelect={selectGame} inertia={prefs.inertia} />
                        )}
                      </>
                    ) : (
                      <LibraryEmptyState onConnect={() => openOverlay({ type: 'settings' })} />
                    )}
                  </>
                )}
                {activeNav === 'Store' && (
                  <StoreView selectedId={selectedId} onSelect={selectGame} onInspect={(id) => openOverlay({ type: 'game', id })} />
                )}
                {activeNav === 'Community' && (
                  <CommunityView news={steamNews} onPreview={(item) => openOverlay({ type: 'community', item })} />
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
        preferred={overlay?.type === 'game' ? store.preferredProviders[overlay.id] : undefined}
        sessionLastPlayed={overlay?.type === 'game' ? store.playHistory[overlay.id] : undefined}
        onPlay={handlePlay}
        onInstall={handleInstall}
        onNeedProviderChoice={(g, mode) => openOverlay({ type: 'provider', id: g.id, mode })}
        onClose={() => setOverlay(null)}
      />
      <ProviderSelector
        game={providerOverlay}
        mode={overlay?.type === 'provider' ? overlay.mode : 'play'}
        open={overlay?.type === 'provider'}
        onPick={(entry, remember) => {
          if (providerOverlay && overlay?.type === 'provider') handleProviderPick(providerOverlay, overlay.mode, entry, remember);
        }}
        onClose={() => setOverlay(null)}
      />
      <SettingsPanel
        open={overlay?.type === 'settings'}
        prefs={prefs}
        onChange={(p) => setStore((s) => ({ ...s, prefs: { ...DEFAULT_STATE.prefs, ...p } }))}
        onClose={() => setOverlay(null)}
        steamConnection={steamConnection}
        onSteamConnect={connectSteam}
        onSteamDisconnect={disconnectSteam}
        onSteamSaveCredentials={saveSteamCredentials}
        onSteamClearCredentials={clearSteamCredentials}
        steamNativeAvailable={nativeAvailable}
      />
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
        item={overlay?.type === 'community' ? overlay.item : null}
        open={overlay?.type === 'community'}
        onClose={() => setOverlay(null)}
      />
      <SignOutDialog
        open={overlay?.type === 'signout'}
        onConfirm={() => {
          setOverlay(null);
          void disconnectSteam();
          notify('Local Steam session cleared.');
        }}
        onClose={() => setOverlay(null)}
      />

      <ToastHost toast={toast} onDone={() => setToast(null)} />
      <CustomCursor enabled={prefs.cursor && !prefs.reduceMotion} />
    </div>
  );
}
