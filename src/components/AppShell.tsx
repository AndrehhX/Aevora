import { useCallback, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import HeroBanner from './HeroBanner';
import GameCarousel from './GameCarousel';
import ToastHost, { type ToastData } from './Toast';
import CustomCursor from './CustomCursor';
import { getGame, installedGames, popularGames } from '../data/mock';

export default function AppShell() {
  const [libraryQuery, setLibraryQuery] = useState('');
  const [globalQuery, setGlobalQuery] = useState('');
  // ONE centralized selection — sidebar + carousel + hero share it.
  const [selectedId, setSelectedId] = useState('forza');
  const [activeNav, setActiveNav] = useState('Home');
  const [dark, setDark] = useState(true);
  const [toast, setToast] = useState<ToastData | null>(null);

  const notify = useCallback((msg: string) => {
    setToast({ id: Date.now(), msg });
  }, []);

  const selectedGame = useMemo(() => getGame(selectedId) ?? getGame('forza')!, [selectedId]);

  const filteredGames = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return installedGames;
    return installedGames.filter((g) => g.title.toLowerCase().includes(q));
  }, [libraryQuery]);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{
        background: dark
          ? 'radial-gradient(1200px 700px at 70% -10%, rgba(101,74,127,0.20), transparent 60%), radial-gradient(900px 600px at 8% 108%, rgba(74,53,96,0.22), transparent 60%), radial-gradient(700px 500px at 50% 50%, rgba(74,53,96,0.12), transparent 70%), linear-gradient(180deg,#17101F 0%,#0D0912 55%,#0D0912 100%)'
          : 'radial-gradient(1200px 700px at 70% -10%, rgba(101,74,127,0.28), transparent 60%), linear-gradient(180deg,#1d1429 0%,#17101F 100%)',
      }}
    >
      {/* film grain / vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,transparent_55%,rgba(0,0,0,0.45)_100%)]" />

      <div className="relative z-10 flex h-full w-full gap-3 p-3">
        <Sidebar
          libraryQuery={libraryQuery}
          setLibraryQuery={setLibraryQuery}
          filteredGames={filteredGames}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onCommunityClick={() => notify('Community preview coming soon')}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <TopNavigation
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            globalQuery={globalQuery}
            setGlobalQuery={setGlobalQuery}
            dark={dark}
            toggleTheme={() => setDark((d) => !d)}
            onSelectGame={setSelectedId}
            onNotify={notify}
          />
          <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1">
            <HeroBanner game={selectedGame} onCta={() => notify('Game launching will be available soon')} />
            <GameCarousel games={popularGames} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </main>
      </div>

      <ToastHost toast={toast} onDone={() => setToast(null)} />
      <CustomCursor />
    </div>
  );
}
