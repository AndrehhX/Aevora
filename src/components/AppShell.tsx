import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import HomeOverview from './HomeOverview';
import StoreView from '../views/StoreView';
import CommunityView from '../views/CommunityView';
import { EarlyView, IndiesView } from '../views/Collections';
import { getOwnedGames } from '../domain/library';
import type { GameProviderEntry, ProviderId } from '../domain/provider';
import { providerName } from '../domain/provider';
import type { UnifiedGame } from '../domain/game';
import { DEFAULT_STATE, loadState, saveState, type PersistedPrefs } from '../domain/storage';
import { EASE } from '../motion/presets';
import { libraryGames, setLibraryGames } from '../data/library';
import type { CommunityItem } from '../data/navigation';
import { navItems } from '../data/navigation';
import { createLocalCacheStore } from '../integrations/cache/cacheStore';
import { createSteamAdapter, SteamAdapterError, type ConnectionState } from '../integrations/steam/steamAdapter';
import type { SteamCommunityItem } from '../integrations/steam/steamNews';
import type { SteamStoreCategories, SteamStoreOffer } from '../integrations/steam/steamStore';
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
    store.prefs.rememberGame && libraryGames.some((game) => game.id === store.lastSelectedGame) ? store.lastSelectedGame : 'forza'
  );
  const [activeNav, setActiveNav] = useState(() =>
    store.prefs.startOnHome ? 'Home' : VALID_NAV.has(store.lastNav) ? store.lastNav : 'Home'
  );
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const steamAdapter = useMemo(() => createSteamAdapter({ cache: createLocalCacheStore() }), []);
  const [steamConnection, setSteamConnection] = useState<ConnectionState>({ status: 'disconnected' });
  const [steamConnectionMessage, setSteamConnectionMessage] = useState<string | null>(null);
  const [activeLibrary, setActiveLibrary] = useState<UnifiedGame[]>(() => libraryGames);
  const [steamNews, setSteamNews] = useState<SteamCommunityItem[]>([]);
  const [steamStore, setSteamStore] = useState<SteamStoreCategories | null>(null);
  const [steamStoreLoading, setSteamStoreLoading] = useState(false);
  const [steamStoreError, setSteamStoreError] = useState<string | null>(null);
  const nativeAvailable = useMemo(() => getDesktopBridge().isNative, []);
  const autoConnectAttempted = useRef(false);

  const notify = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
  }, []);

  const connectSteam = useCallback(async () => {
    setSteamConnectionMessage('Connecting to Steam…');
    try {
      const connection = await steamAdapter.connect();
      setSteamConnection(connection);
      if (connection.status === 'connected') {
        let games: UnifiedGame[];
        try {
          games = await steamAdapter.getLibrary();
        } catch (error) {
          const message = error instanceof SteamAdapterError ? error.message : 'Steam library could not be loaded.';
          setSteamConnectionMessage(message);
          notify(message);
          return;
        }
        setLibraryGames(games);
        setActiveLibrary(games);
        let newsMessage: string | null = null;
        if (games[0]) setSelectedId(games[0].id);
        if (games.length > 0) {
          try {
            const community = await steamAdapter.getCommunity(games);
            setSteamNews(community.items);
            if (community.failedAppIds.length > 0) {
              newsMessage = `Community loaded with ${community.failedAppIds.length} unavailable game feed${community.failedAppIds.length === 1 ? '' : 's'}.`;
            }
          } catch (error) {
            newsMessage = error instanceof SteamAdapterError ? error.message : 'Steam news could not be loaded.';
            setSteamNews([]);
          }
        } else {
          newsMessage = 'Steam connected, but no games were returned for this account.';
        }
        const connectedMessage = `Connected to Steam${connection.displayName ? ` as ${connection.displayName}` : ''}.${newsMessage ? ` ${newsMessage}` : ''}`;
        setSteamConnectionMessage(newsMessage);
        notify(connectedMessage);
      } else {
        setSteamConnectionMessage('Steam connection was canceled.');
        notify('Steam connection canceled.');
      }
    } catch (error) {
      const message = error instanceof SteamAdapterError ? error.message : 'Steam connection is unavailable.';
      setSteamConnection({ status: 'disconnected' });
      setSteamConnectionMessage(message);
      notify(message);
    }
  }, [notify, steamAdapter]);

  // Credentials live in Windows Credential Manager, so an app update does not
  // need to ask for the API key again. Reconnect silently on the next launch.
  useEffect(() => {
    if (!nativeAvailable || autoConnectAttempted.current) return;
    autoConnectAttempted.current = true;
    let active = true;
    void steamAdapter.hasCredentials().then((hasCredentials) => {
      if (active && hasCredentials) void connectSteam();
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [connectSteam, nativeAvailable, steamAdapter]);

  const disconnectSteam = useCallback(async () => {
    try {
      await steamAdapter.disconnect();
      setSteamConnection({ status: 'disconnected' });
      setSteamConnectionMessage(null);
      setLibraryGames([]);
      setActiveLibrary([]);
      setSteamNews([]);
      notify('Steam disconnected.');
    } catch {
      notify('Steam could not be disconnected.');
    }
  }, [notify, steamAdapter]);

  const loadSteamStore = useCallback(async () => {
    if (steamStoreLoading || steamStore) return;
    setSteamStoreLoading(true);
    setSteamStoreError(null);
    try {
      setSteamStore(await steamAdapter.getStore());
    } catch (error) {
      const message = error instanceof SteamAdapterError ? error.message : 'Steam store offers are unavailable right now.';
      setSteamStoreError(message);
    } finally {
      setSteamStoreLoading(false);
    }
  }, [steamAdapter, steamStore, steamStoreLoading]);

  useEffect(() => {
    if (activeNav === 'Store') void loadSteamStore();
  }, [activeNav, loadSteamStore]);

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
      if (!activeLibrary.some((game) => game.id === id)) return;
      setSelectedId(id);
      setStore((s) => (s.prefs.rememberGame ? { ...s, lastSelectedGame: id } : s));
    },
    [activeLibrary]
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
      const g = activeLibrary.find((game) => game.id === id);
      if (!g) return;
      setStore((s) => {
        const has = s.favorites.includes(id);
        if (has) notify(`Removed ${g.title} from favorites`);
        else notify(`Added ${g.title} to favorites`);
        return { ...s, favorites: has ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] };
      });
    },
    [activeLibrary, notify]
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

  const selectedGame = useMemo(() => activeLibrary.find((game) => game.id === selectedId), [activeLibrary, selectedId]);
  const carouselGames = useMemo(
    () => activeLibrary.slice(0, 12),
    [activeLibrary]
  );
  const safeFavorites = useMemo(
    () => (Array.isArray(store.favorites) ? store.favorites.filter((f) => activeLibrary.some((game) => game.id === f)) : []),
    [activeLibrary, store.favorites]
  );

  // Ready To Play derives from installed state — no separate sidebar list.
  const readyToPlay = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase();
    const library = getOwnedGames(activeLibrary);
    if (!q) return library;
    return library.filter((g) => g.title.toLowerCase().includes(q));
  }, [activeLibrary, libraryQuery]);

  const gameOverlay = overlay?.type === 'game' ? activeLibrary.find((game) => game.id === overlay.id) ?? null : null;
  const providerOverlay = overlay?.type === 'provider' ? activeLibrary.find((game) => game.id === overlay.id) ?? null : null;

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
            library={activeLibrary}
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
                        <HomeOverview
                          library={activeLibrary}
                          selectedGame={selectedGame}
                          steamConnected={steamConnection.status === 'connected'}
                          newsCount={steamNews.length}
                          onOpenSelected={() => openOverlay({ type: 'game', id: selectedGame.id })}
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
                  <StoreView
                    offers={steamStore}
                    selectedAppId={selectedGame?.providers.find((entry) => entry.provider === 'steam')?.externalId ? Number(selectedGame.providers.find((entry) => entry.provider === 'steam')?.externalId) : null}
                    loading={steamStoreLoading}
                    error={steamStoreError}
                    onOpenStore={(offer: SteamStoreOffer) => {
                      const entry: GameProviderEntry = { provider: 'steam', externalId: String(offer.appId), owned: false, installed: false };
                      void handleInstall({ id: `steam:${offer.appId}`, title: offer.name, artwork: { cover: offer.capsuleImage ?? offer.headerImage ?? '', coverFallback: offer.headerImage ?? offer.capsuleImage ?? '', hero: offer.headerImage ?? offer.capsuleImage ?? '', heroFallback: offer.capsuleImage ?? offer.headerImage ?? '' }, providers: [entry] }, entry);
                    }}
                  />
                )}
                {activeNav === 'Community' && (
                  <CommunityView news={steamNews} onPreview={(item) => openOverlay({ type: 'community', item })} />
                )}
                {activeNav === 'Indies' && <IndiesView selectedId={selectedId} onSelect={selectGame} />}
                {activeNav === 'Release' && <EarlyView selectedId={selectedId} onSelect={selectGame} />}
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
        steamConnectionMessage={steamConnectionMessage}
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
