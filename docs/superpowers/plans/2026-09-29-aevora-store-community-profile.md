# Aevora Store, Community y perfil local Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Aevora's empty Store, single-game Community feed and static profile into real Steam-backed surfaces with robust artwork and a local achievement points system.

**Architecture:** Keep secrets and Steam HTTP calls in Tauri commands, normalize responses in focused TypeScript integration modules, and pass domain models into views. Extend the existing versioned local state for profile cosmetics, achievements, points and purchases; use cache and partial-failure handling so one unavailable game does not break the whole app.

**Tech Stack:** React, TypeScript, Framer Motion, Vitest, Tauri/Rust, reqwest, serde, Windows Credential Manager.

**Spec:** `docs/superpowers/specs/2026-09-29-aevora-store-community-profile.md`

## Global Constraints

- Steam credentials remain in the native bridge and never enter the web bundle or repository.
- Store uses only public Steam Store offers; no fake fixture IDs in production.
- Community uses public Steam News feeds and labels partial/cache results.
- Profile points and cosmetics are local and do not claim to modify Steam inventory or wallet.
- New decorative motion respects `prefers-reduced-motion`.
- Every task ends with its focused tests passing before its commit.

## Review Focus

- Missing or malformed Steam Store categories must produce an explained empty state; test normalization and missing fields in the Store task.
- One Community request failing must not erase successful feeds; test partial aggregation and duplicate gids in the Community task.
- Broken/mismatched image URLs must not stretch cards or leave an invisible hero; test fallback selection in the image task.
- Private/no-achievement games must be skipped without failing profile sync; test achievement normalization in the Profile task.
- Repeated point purchases and profile reloads must not duplicate items or create negative balances; test idempotency in the Profile task.

### Task 1: Store offers and image contracts

**Files:**
- Create: `src/integrations/steam/steamStore.ts`
- Modify: `src/integrations/steam/steamClient.ts`
- Modify: `src-tauri/src/commands/steam.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/domain/game.ts`
- Modify: `src/components/SmartImage.tsx`
- Modify: `src/views/StoreView.tsx`
- Test: `tests/integrations/steam-store.test.ts`
- Test: `tests/ui/store-view.test.tsx`

**Interfaces:**
- Produces `SteamStoreOffer`, `SteamStoreCategories`, `SteamClient.getStoreCategories()` and a loader that returns cached categories when the request fails.
- `StoreView` consumes normalized offers and renders `featured`, `topSellers` and `specials` without reading `src/data/library.ts` fixtures.

- [ ] Write failing tests for category normalization, discount formatting, empty categories and image-type class contracts.
- [ ] Run focused Vitest tests and verify they fail for the missing interfaces.
- [ ] Add the native `steam_get_store_categories` command using Steam's public `featuredcategories` endpoint and register it in `lib.rs`.
- [ ] Add TypeScript client/loader normalization, cache behavior and `StoreView` states.
- [ ] Update `SmartImage` and consumers so portrait, hero and logo assets use stable dimensions and ordered official fallbacks.
- [ ] Run focused Store/image tests and verify they pass.
- [ ] Commit `feat: load real Steam store offers`.

### Task 2: Aggregate Community announcements

**Files:**
- Modify: `src/integrations/steam/steamNews.ts`
- Modify: `src/integrations/steam/steamClient.ts`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/views/CommunityView.tsx`
- Test: `tests/integrations/steam-community.test.ts`
- Test: `tests/ui/community-view.test.tsx`

**Interfaces:**
- Produces `SteamCommunityItem` with `appId`, `gameTitle`, source URL, date and stale state, plus `loadCommunityForLibrary(games)` with bounded concurrency.
- `AppShell` calls the aggregate loader after library sync and passes all items to `CommunityView`.

- [ ] Write failing tests for merging two app feeds, deduplicating gids, ordering by date and retaining successful items after one error.
- [ ] Run focused tests and verify failure.
- [ ] Implement bounded requests, cache keys per app and aggregate normalization.
- [ ] Add game name/source labels and explicit loading, partial, empty and cached states to Community.
- [ ] Run focused tests and verify pass.
- [ ] Commit `feat: aggregate Steam community news`.

### Task 3: Local profile, achievements and points shop

**Files:**
- Modify: `src/domain/storage.ts`
- Create: `src/domain/profile.ts`
- Create: `src/integrations/steam/steamAchievements.ts`
- Modify: `src/integrations/steam/steamClient.ts`
- Modify: `src-tauri/src/commands/steam.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src/components/ProfilePanel.tsx`
- Modify: `src/components/AppShell.tsx`
- Test: `tests/domain/profile.test.ts`
- Test: `tests/integrations/steam-achievements.test.ts`
- Test: `tests/ui/profile-panel.test.tsx`

**Interfaces:**
- `ProfileState`, `ProfileItem`, `AchievementSummary`, `awardPoints`, `purchaseProfileItem`, `equipProfileItem` are pure local domain functions.
- `SteamClient.getPlayerAchievements(appId)` returns a normalized response or a typed unavailable result.

- [ ] Write failing tests for state migration, achievement filtering, deterministic points, idempotent purchase and insufficient balance.
- [ ] Run focused tests and verify failure.
- [ ] Add versioned profile state with safe defaults and migration from the current persisted state.
- [ ] Add native achievements command and TypeScript loader with cache and per-game failure tolerance.
- [ ] Replace hardcoded Neo Aura panel with editable local profile, points, achievements summary and shop/equip actions.
- [ ] Run focused tests and verify pass.
- [ ] Commit `feat: add local Steam achievement profile`.

### Task 4: Integration, visual states and runtime verification

**Files:**
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/HomeOverview.tsx`
- Modify: `src/styles.css` or the existing style entry if needed
- Modify: `README.md`
- Test: existing full test suite plus focused integration tests

- [ ] Connect Store, Community and Profile loading to the real Steam connection lifecycle without losing the existing session.
- [ ] Add reduced-motion handling and polish loading/error/empty transitions without adding fake content.
- [ ] Run `npm test -- --run`.
- [ ] Run `cargo test --manifest-path src-tauri/Cargo.toml`.
- [ ] Run `npm run build`.
- [ ] Run `npm run tauri build`.
- [ ] Run `git diff --check` and inspect the final diff for secrets, fixture data and hardcoded profile copy.
- [ ] Commit `feat: complete Aevora Steam surfaces`.
