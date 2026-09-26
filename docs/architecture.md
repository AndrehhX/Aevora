# Aevora Architecture — Unified Game Library

This document describes the frontend domain model that prepares Aevora for
real provider integrations (Tauri, Steam, Epic, GOG, …). Everything below is
mock data shaped like future normalized provider output. No real providers,
filesystem access, or executables are involved yet.

## Core idea

**One game, multiple providers.** Aevora displays one entry per game.
Ownership and installation live *inside* the game under `providers` —
never as separate per-provider UI models.

```
Steam Adapter ──┐
Epic Adapter ───┤
GOG Adapter ────┤   (future — not implemented)
                ▼
      NORMALIZATION LAYER   ← mock data in src/data/library.ts
                │             already behaves like this output
                ▼
          UnifiedGame[]
                │
                ▼
          AEVORA LIBRARY    ← selectors in src/domain/library.ts
                │
                ▼
             REACT UI       ← consumes UnifiedGame only
```

## Domain layer (`src/domain/`)

- `provider.ts` — `ProviderId` (`steam | epic | gog | ea | ubisoft | xbox
  | battle-net | riot | local`), `GameProviderEntry` (externalId, owned,
  installed, playtimeMinutes, lastPlayed, …), `providerDefinitions`
  (central display names — never scattered through components).
- `game.ts` — `UnifiedGame`: canonical `id`, title/display strings,
  `artwork` (cover/hero + transparent `logo`), `branding` hints,
  `providers[]`, `metadata` (developer/publisher/release/genres), ambient.
- `library.ts` — all derived state, in one place:
  `isOwned`, `isInstalled`, `getOwnedProviders`, `getInstalledProviders`,
  `getPreferredProvider` (explicit preference wins when still installed,
  else fallback), `getTotalPlaytimeMinutes` (sums providers),
  `getLastPlayed` (most recent valid timestamp incl. session override),
  `formatPlaytime` (`45m`, `1h 30m`, `97h`), `formatLastPlayed`
  (`Today`, `Yesterday`, `3 days ago`, `Sep 14`, `Never`),
  plus `getInstalledGames`, `getOwnedGames`, `getFavoriteGames`,
  `getRecentlyPlayedGames` (sorted desc), `getGamesByProvider`,
  `searchGames` (title/developer/publisher/genre/provider).
- `storage.ts` — versioned (`aevora:state:v1`) persistence for favorites,
  preferredProviders, lastSelectedGame, lastNav, prefs, playHistory.
  Defensive parsing, safe defaults, one-time migration from the legacy
  per-key prototype keys.

## Identity rules

- Aevora canonical ids (`cyberpunk`, `elden`, …) are stable UI keys.
  Provider `externalId`s (Steam AppIDs, …) are never used as keys.
- Favorites, preferred providers, and play history are keyed by canonical
  id and stored *outside* the immutable mock provider data.
- Session plays update `playHistory` (timestamp), which overrides stale
  mock `lastPlayed` values via `getLastPlayed`.

## UI contracts

- Hero prefers `artwork.logo` (`object-fit: contain`); falls back to a
  styled title. Logos preload with the hero — never text-flash.
- Game Details derives everything (Owned on, playtime, last played,
  PLAY vs INSTALL) from selectors. PLAY auto-uses a single installed
  provider; multiple installed/owned providers open the provider selector
  ("Remember my choice" persists the preference).
- Ready To Play derives from `getInstalledGames` — no separate list.
- Search operates over `UnifiedGame` with working filters
  (All/Installed/Favorites/Steam/Epic/GOG/EA).
- Store catalog (`storeFeaturedIds`, `storeDealIds`, …) is id lists only;
  ownership always resolves from the library.
