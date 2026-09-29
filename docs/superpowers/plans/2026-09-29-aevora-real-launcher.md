# Aevora Real Launcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current Aevora frontend prototype into a desktop-first launcher that can connect Steam, load real library metadata and images, show current news, and launch supported games honestly.

**Architecture:** Keep React/TypeScript as the UI and preserve the existing normalized `UnifiedGame` domain model. Move provider authentication, secrets, HTTP calls that require keys, filesystem checks, and game launching behind a Tauri/Rust adapter boundary. The UI must consume provider states (`loading`, `ready`, `stale`, `offline`, `error`) instead of pretending that mock actions are real.

**Tech Stack:** React 18, TypeScript, Vite, Framer Motion, Vitest, Tauri 2, Rust, SQLite or an equivalent local cache, Steam OpenID/API endpoints, Steam News API, Windows Credential Manager/DPAPI through the native layer.

**Spec:** This document is the working specification for the Aevora launcher roadmap.

## Global Constraints

- Production UI must not ship the current hand-written demo library as if it were the user's real library.
- Steam passwords, refresh tokens, API keys, and session secrets must never be stored in React state, `localStorage`, or source code.
- Provider integrations must be isolated behind typed adapters; components cannot call Steam endpoints directly.
- Every network-backed view must show loading, empty, stale/offline, and error states.
- Remote artwork must have a bounded fallback and must not block the rest of the library from rendering.
- Motion must respect `prefers-reduced-motion` and the existing user preference.
- Tests must use fixtures and mocked adapters; no test may depend on live Steam availability.
- Each task ends with verification and one focused commit; do not create fake history.

## Review Focus

- A revoked/expired Steam connection must return an actionable error without exposing secrets; test the adapter error mapping in Task 4.
- A library with no installed games must render a real empty state rather than demo cards; test the production data boundary in Task 2.
- Steam artwork/news being slow, missing, or offline must not blank the shell; test cache and fallback behavior in Tasks 3 and 5.
- A missing Steam client or unsupported launch target must never show “Playing”; test the launch result contract in Task 6.
- Reduced motion and keyboard navigation must remain usable after adding the cursor and fluid transitions; test the UI shell in Task 7.

### Task 1: Establish the clean launcher baseline and verification harness

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Create: `tests/domain/library.test.ts`
- Create: `tests/domain/storage.test.ts`
- Create: `vitest.config.ts`

**Interfaces:**
- Consumes: current selectors in `src/domain/library.ts` and persistence contract in `src/domain/storage.ts`.
- Produces: `npm test` and `npm run check` commands that later tasks must keep passing.

- [ ] Write tests for ownership, installation, provider preference, playtime, last-played formatting, and malformed persisted state.
- [ ] Run `npm test` and confirm the new tests fail or are not yet configured.
- [ ] Add Vitest and scripts: `test`, `test:watch`, `check` (`tsc -b && npm test && npm run build`).
- [ ] Run `npm test` and `npm run check`; expected: PASS on the current domain behavior.
- [ ] Rewrite the README title and scope so it says Aevora is currently a frontend prototype moving toward a local-first launcher.
- [ ] Commit: `test: add launcher verification harness`.

### Task 2: Remove demo data from production without breaking the shell

**Files:**
- Modify: `src/data/library.ts`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/HeroBanner.tsx`
- Create: `src/data/fixtures/library.fixture.ts`
- Create: `tests/data/production-library.test.ts`

**Interfaces:**
- Consumes: `UnifiedGame[]` and the existing `getInstalledGames`/`getLibraryGame` selectors.
- Produces: an empty production library state plus an explicit fixture-only demo mode for tests and local UI development.

- [ ] Write a test proving production boot does not expose Cyberpunk, Forza, Elden, or other fixture entries.
- [ ] Run the test and confirm it fails against the current hand-written production library.
- [ ] Move fixture records out of `src/data/library.ts`; production boot must start with `[]` until a provider supplies data.
- [ ] Add explicit empty, loading, and disconnected states to the sidebar, hero, carousel, and details flow.
- [ ] Run the production-data test and full `npm run check`; expected: PASS with no demo game cards in production.
- [ ] Commit: `refactor: isolate launcher fixtures from production`.

### Task 3: Add the native desktop boundary and secure local cache

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/commands/cache.rs`
- Create: `src/integrations/desktop/bridge.ts`
- Create: `src/integrations/cache/cacheStore.ts`
- Modify: `src/domain/storage.ts`
- Modify: `vite.config.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: normalized provider data and current `PersistedState`.
- Produces: typed `DesktopBridge` methods for secure commands and a versioned cache with TTL/stale metadata.

- [ ] Write tests for cache hit, expired entry, corrupt entry, and offline fallback.
- [ ] Run the tests and confirm the cache implementation is missing.
- [ ] Create the Tauri shell and expose only typed commands; keep secrets and filesystem operations outside React.
- [ ] Implement `CacheStore.get<T>(key): Promise<CacheEntry<T> | null>` and `CacheStore.set<T>(key, value, ttlMs): Promise<void>`.
- [ ] Preserve the existing preference state while moving provider/library cache data out of ad-hoc component state.
- [ ] Run native checks, `npm test`, and `npm run build`; expected: PASS without changing the visible shell yet.
- [ ] Commit: `feat: add desktop bridge and local cache boundary`.

### Task 4: Implement the Steam adapter and connection flow

**Files:**
- Create: `src/integrations/steam/steamTypes.ts`
- Create: `src/integrations/steam/steamClient.ts`
- Create: `src/integrations/steam/steamAdapter.ts`
- Create: `src-tauri/src/commands/steam.rs`
- Create: `src/components/ProviderConnectPanel.tsx`
- Modify: `src/domain/provider.ts`
- Modify: `src/components/SettingsPanel.tsx`
- Create: `tests/integrations/steam-adapter.test.ts`

**Interfaces:**
- Consumes: `DesktopBridge`, `CacheStore`, and `ProviderId`.
- Produces: `SteamAdapter.connect(): Promise<ConnectionState>`, `getLibrary(): Promise<UnifiedGame[]>`, and `getAppDetails(appId): Promise<SteamAppDetails>`.

- [ ] Write adapter tests for connected, canceled, expired, rate-limited, and offline responses using mocked transport.
- [ ] Run the tests and confirm the adapter contract is missing.
- [ ] Implement Steam OpenID/account linking through the native boundary; never request or store the user's Steam password.
- [ ] Store only the minimum credential/session material in Windows Credential Manager/DPAPI through Tauri.
- [ ] Implement owned-game retrieval and normalize provider records into canonical `UnifiedGame` entries.
- [ ] Add a visible Steam connection state and a disconnect action that clears local provider state.
- [ ] Run adapter tests, `npm run check`, and a manual connect/disconnect smoke test.
- [ ] Commit: `feat: connect Steam through a secure provider adapter`.

### Task 5: Replace manual artwork and add real Steam news

**Files:**
- Create: `src/integrations/steam/steamAssets.ts`
- Create: `src/integrations/steam/steamNews.ts`
- Modify: `src/domain/game.ts`
- Modify: `src/data/library.ts`
- Modify: `src/components/SmartImage.tsx`
- Modify: `src/components/HeroBanner.tsx`
- Modify: `src/components/CommunityView.tsx`
- Create: `tests/integrations/steam-content.test.ts`

**Interfaces:**
- Consumes: `SteamAdapter.getAppDetails()` and `SteamAdapter.getNews()`.
- Produces: `resolveSteamAssets(details): GameArtwork` and `SteamNewsItem[]` with `publishedAt`, `url`, and `stale` state.

- [ ] Write tests for a complete app-details response, missing logo, missing background, malformed news, and stale cache.
- [ ] Run the tests and confirm the new normalizers are missing.
- [ ] Derive header, capsule, background, and optional logo URLs from Steam metadata/CDN instead of hand-written image paths.
- [ ] Add bounded image loading, fallback artwork, lazy loading outside the hero, and visible broken-image recovery.
- [ ] Load news through Steam's public news endpoint with cache, refresh timestamp, source link, empty state, and offline state.
- [ ] Replace the fake community/news cards with real mapped Steam items while keeping unrelated community UI separate.
- [ ] Run integration tests, build, and manual slow/offline image/news checks.
- [ ] Commit: `feat: load Steam artwork and news from live data`.

### Task 6: Make Play and Install honest and functional for Steam

**Files:**
- Create: `src/integrations/steam/steamLaunch.ts`
- Create: `src-tauri/src/commands/launch.rs`
- Modify: `src/components/GameDetails.tsx`
- Modify: `src/components/ProviderSelector.tsx`
- Modify: `src/components/Toast.tsx`
- Create: `tests/integrations/steam-launch.test.ts`

**Interfaces:**
- Consumes: normalized provider entries and native bridge.
- Produces: `launchGame(providerEntry): Promise<LaunchResult>` and `openStore(providerEntry): Promise<LaunchResult>` with `started`, `missing-client`, `unsupported`, and `failed` outcomes.

- [ ] Write tests for a valid Steam AppID, missing AppID, missing Steam client, rejected shell open, and successful launch.
- [ ] Run the tests and confirm current toast-only behavior does not satisfy them.
- [ ] Implement `steam://rungameid/<appid>` or the native equivalent and keep install/store actions distinct from play.
- [ ] Only show “Playing” after the adapter reports success; show actionable error text otherwise.
- [ ] Add a “last launch result” and retry path without inventing install progress.
- [ ] Run launch tests and manual checks with Steam unavailable and available.
- [ ] Commit: `feat: launch Steam games through the desktop adapter`.

### Task 7: Finish the fluid visual layer without masking real state

**Files:**
- Modify: `src/components/CustomCursor.tsx`
- Modify: `src/components/SmartImage.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/index.css`
- Create: `tests/ui/accessibility-motion.test.tsx`

**Interfaces:**
- Consumes: provider loading/error states and the existing `reduceMotion` preference.
- Produces: stable keyboard-first interactions, responsive media behavior, and a custom cursor that is decorative only.

- [ ] Write tests for keyboard focus, Escape closing overlays, reduced motion disabling transforms, and cursor absence on touch/coarse pointers.
- [ ] Run the tests and confirm the new UI assertions are missing.
- [ ] Tune image preloading, skeletons, panel transitions, cursor interpolation, and hover states without blocking network content.
- [ ] Add `aria-live` only for meaningful provider/launch status changes and keep decorative cursor elements `aria-hidden`.
- [ ] Run accessibility tests, `npm run check`, and manual desktop/mobile/reduced-motion passes.
- [ ] Commit: `polish: make launcher motion fluid and accessible`.

### Task 8: Remove prototype language, document real setup, and release a reviewable build

**Files:**
- Modify: `README.md`
- Modify: `docs/architecture.md`
- Modify: `package.json`
- Create: `.env.example`
- Create: `docs/steam-integration.md`

**Interfaces:**
- Consumes: all implemented adapter/cache/launch contracts from Tasks 3–7.
- Produces: reproducible setup instructions, secret boundaries, supported states, known limitations, and a release checklist.

- [ ] Document prerequisites, Tauri setup, Steam connection flow, local secret storage, cache behavior, supported launch states, and offline behavior.
- [ ] Document that the Steam API key is never committed and that real credentials are never placed in frontend code.
- [ ] Remove “mock”, “demo”, and “visual prototype” wording from shipped features; keep fixture instructions only under development/testing.
- [ ] Add a final smoke checklist: fresh install, no connection, connect Steam, load library, load artwork, load news, open details, launch supported game, disconnect, offline restart.
- [ ] Run `npm run check` and the smoke checklist; expected: PASS with an honest limitations section.
- [ ] Commit: `docs: document real launcher setup and release checks`.

## Recommended execution order

Do not start with the cursor or visual polish. The order that gives a usable product fastest is:

1. Verification harness and clean baseline.
2. Remove production demo data and build the real empty states.
3. Add the Tauri/native boundary and secure cache.
4. Connect Steam and load a real library.
5. Replace manual assets and fake news with Steam data.
6. Make Play/Install functional and honest.
7. Polish cursor, images, and transitions.
8. Rewrite README and run the release audit.

The first meaningful milestone is after Task 5: a real Steam-connected library with real artwork and current news. The second is after Task 6: opening a supported installed game. Only after those milestones should the launcher be presented as more than a UI prototype.
