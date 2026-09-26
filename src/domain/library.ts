import type { UnifiedGame } from './game';
import { providerName, type ProviderId } from './provider';

// All derived game state lives here. Components must use these selectors
// instead of reimplementing ownership/installation logic.

export function isOwned(game: UnifiedGame): boolean {
  return game.providers.some((p) => p.owned);
}

export function isInstalled(game: UnifiedGame): boolean {
  return game.providers.some((p) => p.installed);
}

export function getOwnedProviders(game: UnifiedGame) {
  return game.providers.filter((p) => p.owned);
}

export function getInstalledProviders(game: UnifiedGame) {
  return game.providers.filter((p) => p.installed);
}

export function getTotalPlaytimeMinutes(game: UnifiedGame, extraMinutes = 0): number {
  return game.providers.reduce((sum, p) => sum + (p.playtimeMinutes ?? 0), 0) + extraMinutes;
}

/** Most recent valid timestamp across providers + session override. */
export function getLastPlayed(game: UnifiedGame, sessionOverride?: number): number | undefined {
  const candidates: number[] = [];
  for (const p of game.providers) {
    if (!p.lastPlayed) continue;
    const t = Date.parse(p.lastPlayed);
    if (!Number.isNaN(t)) candidates.push(t);
  }
  if (sessionOverride) candidates.push(sessionOverride);
  if (candidates.length === 0) return undefined;
  return Math.max(...candidates);
}

/**
 * Preferred installed provider: explicit preference wins when still
 * installed, otherwise fall back to another installed provider.
 */
export function getPreferredProvider(
  game: UnifiedGame,
  preferred?: ProviderId
): (typeof game.providers)[number] | undefined {
  const installed = getInstalledProviders(game);
  if (installed.length === 0) return undefined;
  if (preferred) {
    const match = installed.find((p) => p.provider === preferred);
    if (match) return match;
  }
  return installed[0];
}

export function getPreferredOwned(game: UnifiedGame, preferred?: ProviderId) {
  const owned = getOwnedProviders(game);
  if (owned.length === 0) return undefined;
  if (preferred) {
    const match = owned.find((p) => p.provider === preferred);
    if (match) return match;
  }
  return owned[0];
}

// ---------- formatting ----------

export function formatPlaytime(totalMinutes: number): string {
  if (totalMinutes < 1) return '0m';
  if (totalMinutes < 60) return `${Math.floor(totalMinutes)}m`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  if (hours < 100 && mins > 0) return `${hours}h ${mins}m`;
  return `${hours}h`;
}

export function formatLastPlayed(ts?: number): string {
  if (!ts) return 'Never';
  const date = new Date(ts);
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ---------- library selectors (pure, accept data) ----------

export function getInstalledGames(library: UnifiedGame[]): UnifiedGame[] {
  return library.filter(isInstalled);
}

export function getOwnedGames(library: UnifiedGame[]): UnifiedGame[] {
  return library.filter(isOwned);
}

export function getFavoriteGames(library: UnifiedGame[], favorites: string[]): UnifiedGame[] {
  const set = new Set(favorites);
  return library.filter((g) => set.has(g.id));
}

export function getRecentlyPlayedGames(
  library: UnifiedGame[],
  sessionHistory: Record<string, number>
): UnifiedGame[] {
  return library
    .map((g) => ({ g, t: getLastPlayed(g, sessionHistory[g.id]) ?? 0 }))
    .filter((x) => x.t > 0)
    .sort((a, b) => b.t - a.t)
    .map((x) => x.g);
}

export function getGamesByProvider(library: UnifiedGame[], provider: ProviderId): UnifiedGame[] {
  return library.filter((g) => g.providers.some((p) => p.provider === provider && p.owned));
}

export function searchGames(library: UnifiedGame[], query: string): UnifiedGame[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return library.filter((g) => {
    const hay = [
      g.title,
      g.metadata?.developer ?? '',
      g.metadata?.publisher ?? '',
      ...(g.metadata?.genres ?? []),
      ...g.providers.map((p) => providerName(p.provider)),
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}
