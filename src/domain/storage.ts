import type { ProviderId } from './provider';

// Tiny versioned storage abstraction. All local user state flows
// through here — no scattered localStorage calls in components.

const KEY = 'aevora:state:v1';
const LEGACY_KEYS = ['aevora:prefs', 'aevora:favorites', 'aevora:lastPlayed', 'aevora:lastGame', 'aevora:lastNav'] as const;

export interface PersistedPrefs {
  theme: 'aevora' | 'midnight';
  sidebarCollapsed: boolean;
  cursor: boolean;
  parallax: boolean;
  inertia: boolean;
  startOnHome: boolean;
  rememberGame: boolean;
  reduceMotion: boolean;
}

export interface PersistedState {
  version: 1;
  favorites: string[];
  preferredProviders: Record<string, ProviderId>;
  lastSelectedGame: string;
  lastNav: string;
  prefs: PersistedPrefs;
  /** session play history: game id -> timestamp */
  playHistory: Record<string, number>;
}

export const DEFAULT_STATE: PersistedState = {
  version: 1,
  favorites: [],
  preferredProviders: {},
  lastSelectedGame: 'forza',
  lastNav: 'Home',
  prefs: {
    theme: 'aevora',
    sidebarCollapsed: false,
    cursor: true,
    parallax: true,
    inertia: true,
    startOnHome: true,
    rememberGame: true,
    reduceMotion: false,
  },
  playHistory: {},
};

function safeParse(raw: string | null): unknown {
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

/** One-time migration from the previous per-key storage. */
function migrateLegacy(): Partial<PersistedState> {
  try {
    const prefs = asRecord(safeParse(localStorage.getItem('aevora:prefs')));
    const favorites = asStringArray(safeParse(localStorage.getItem('aevora:favorites')));
    const playHistoryRaw = asRecord(safeParse(localStorage.getItem('aevora:lastPlayed')));
    const playHistory: Record<string, number> = {};
    for (const [k, v] of Object.entries(playHistoryRaw)) {
      if (typeof v === 'number') playHistory[k] = v;
    }
    const lastGame = safeParse(localStorage.getItem('aevora:lastGame'));
    const lastNav = safeParse(localStorage.getItem('aevora:lastNav'));
    const out: Partial<PersistedState> = {};
    if (Object.keys(prefs).length > 0) {
      out.prefs = {
        theme: prefs.theme === 'midnight' ? 'midnight' : 'aevora',
        sidebarCollapsed: !!prefs.sidebarCollapsed,
        cursor: prefs.cursor !== false,
        parallax: prefs.parallax !== false,
        inertia: prefs.inertia !== false,
        startOnHome: prefs.startOnHome !== false,
        rememberGame: prefs.rememberGame !== false,
        reduceMotion: !!prefs.reduceMotion,
      };
    }
    if (favorites.length > 0 || localStorage.getItem('aevora:favorites') != null) out.favorites = favorites;
    if (Object.keys(playHistory).length > 0) out.playHistory = playHistory;
    if (typeof lastGame === 'string') out.lastSelectedGame = lastGame;
    if (typeof lastNav === 'string') out.lastNav = lastNav;
    return out;
  } catch {
    return {};
  }
}

export function loadState(): PersistedState {
  let current: Partial<PersistedState> = {};
  try {
    const raw = safeParse(localStorage.getItem(KEY));
    if (raw && typeof raw === 'object' && (raw as { version?: unknown }).version === 1) {
      const r = raw as Partial<PersistedState>;
      current = {
        favorites: asStringArray(r.favorites),
        preferredProviders: asRecord(r.preferredProviders) as Record<string, ProviderId>,
        lastSelectedGame: typeof r.lastSelectedGame === 'string' ? r.lastSelectedGame : DEFAULT_STATE.lastSelectedGame,
        lastNav: typeof r.lastNav === 'string' ? r.lastNav : DEFAULT_STATE.lastNav,
        prefs: { ...DEFAULT_STATE.prefs, ...asRecord(r.prefs) } as PersistedPrefs,
        playHistory: Object.fromEntries(
          Object.entries(asRecord(r.playHistory)).filter(([, v]) => typeof v === 'number')
        ) as Record<string, number>,
      };
    } else {
      // first run against the new schema: import legacy keys once
      current = migrateLegacy();
      try {
        LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      } catch {
        /* ignore */
      }
    }
  } catch {
    current = {};
  }
  return {
    ...DEFAULT_STATE,
    ...current,
    prefs: { ...DEFAULT_STATE.prefs, ...(current.prefs ?? {}) },
  };
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, version: 1 }));
  } catch {
    /* storage unavailable — keep in-memory state */
  }
}
