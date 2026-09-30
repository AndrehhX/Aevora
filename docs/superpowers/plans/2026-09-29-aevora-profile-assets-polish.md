# Aevora Profile, Assets and Shell Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved Cap. 1, Cap. 2 and Cap. 3 for Aevora: stable Steam artwork and layout, a public in-app profile with a separate local cosmetics shop, and a polished glass shell with aligned navigation and motion.

**Architecture:** Keep the existing React/Tauri split and versioned local state. Extract image candidate selection into a small pure helper, add page-level profile and profile-store views that consume the existing normalized profile state, and centralize shell geometry in CSS tokens/classes instead of adding another UI framework.

**Tech Stack:** React, TypeScript, Tailwind utility classes, CSS variables, Framer Motion, Vitest, Testing Library, Tauri/Rust.

**Spec:** `docs/superpowers/specs/2026-09-29-aevora-profile-assets-polish-design.md`

## Global Constraints

- The application remains local-first; no backend is added and Steam is not presented as storage for Aevora points or cosmetics.
- Steam library, news, offers and achievements remain the source for provider data when the account is connected.
- Profile points, purchased items and equipped items remain in the versioned local profile state.
- No passwords, API keys or tokens are stored in the frontend, repository or `localStorage`.
- Invalid assets must advance through the fallback chain and end in a stable placeholder without layout growth.
- All new motion must respect both `prefers-reduced-motion` and the existing internal reduced-motion preference.
- Store and Community must continue using real provider data or honest loading, empty, cached and error states; no fake production cards.

## Review Focus

- A primary Steam asset fails while the fallback is empty or duplicated: the component must reach a placeholder without looping or rendering a broken image.
- A library contains many games or unusually long names: sidebar, search and content must stay within their columns without horizontal overflow.
- A profile has points below an item's price or purchases the same item twice: the local state must not spend points or duplicate ownership.
- A profile has equipped items from an older state version: rendering must ignore invalid equipment without crashing.
- Reduced motion is enabled while changing views: decorative transitions must settle without leaving hidden content or focus traps.

---

### Task 1: Stabilize Steam artwork and shell alignment

**Files:**
- Create: `src/components/imageSources.ts`
- Modify: `src/components/SmartImage.tsx`
- Modify: `src/components/HeroBanner.tsx`
- Modify: `src/components/GameCard.tsx`
- Modify: `src/components/GameCarousel.tsx`
- Modify: `src/views/StoreView.tsx`
- Modify: `src/components/TopNavigation.tsx`
- Modify: `src/components/LibrarySearch.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/index.css`
- Create: `tests/ui/smart-image.test.tsx`
- Create: `tests/ui/layout-contracts.test.tsx`

**Interfaces:**
- Produces `getImageCandidates(src: string, fallback: string, fallback2?: string): string[]`, which returns unique non-empty sources in priority order.
- `SmartImage` consumes `getImageCandidates` and advances one candidate per error before rendering its placeholder.
- Shell components expose stable `data-aevora-layout` markers for the visual verification pass.

- [ ] **Step 1: Write the failing image fallback tests**

  Add tests for unique candidate ordering, fallback progression after two image errors, and placeholder rendering after the final failure. Assert that the rendered source changes to the expected URL and that the placeholder has the image accessible name.

- [ ] **Step 2: Run the image tests to verify they fail for the missing helper/behavior**

  Run: `npm test -- --run tests/ui/smart-image.test.tsx`

  Expected: FAIL because the candidate helper and stable fallback behavior are not yet implemented.

- [ ] **Step 3: Implement the candidate helper and stable image component**

  Add `getImageCandidates`, reset the candidate index when any source prop changes, preserve the fixed class/style contract while loading, and render the existing placeholder only after every unique candidate fails. Keep `alt`, `loading` and reduced-motion-safe opacity behavior intact.

- [ ] **Step 4: Run the image tests to verify they pass**

  Run: `npm test -- --run tests/ui/smart-image.test.tsx`

  Expected: all image fallback tests pass.

- [ ] **Step 5: Write the failing shell layout contract tests**

  Render `TopNavigation`, `LibrarySearch` and the shell-level navigation state. Assert that the search, section navigation and profile controls remain present in one layout contract, that the active section exposes `aria-current="page"`, and that `data-aevora-layout="content"` and `data-aevora-layout="sidebar"` are attached to their intended regions.

- [ ] **Step 6: Run the layout tests to verify the contract is missing**

  Run: `npm test -- --run tests/ui/layout-contracts.test.tsx`

  Expected: FAIL because the new layout markers and aligned structure are not yet present.

- [ ] **Step 7: Implement Cap. 1 layout and asset sizing**

  Apply explicit aspect-ratio and `object-fit` contracts to library cards, hero, logos and Store cards; pass `coverFallback2` into card consumers; constrain the shell with `min-width: 0`, stable search height/width and non-shifting nav alignment; add the layout markers without changing provider data behavior.

- [ ] **Step 8: Run Cap. 1 tests and the full frontend suite**

  Run: `npm test -- --run tests/ui/smart-image.test.tsx tests/ui/layout-contracts.test.tsx` and then `npm test -- --run`.

  Expected: both targeted tests and the full existing suite pass.

- [ ] **Step 9: Commit Cap. 1**

  ```bash
  git add src tests/ui/smart-image.test.tsx tests/ui/layout-contracts.test.tsx
  git commit -m "fix: stabilize Steam artwork and shell alignment"
  ```

### Task 2: Add public profile and separate local cosmetics shop

**Files:**
- Create: `src/components/PublicProfileView.tsx`
- Create: `src/views/ProfileStoreView.tsx`
- Create: `tests/ui/public-profile.test.tsx`
- Create: `tests/ui/profile-store.test.tsx`
- Modify: `src/data/navigation.ts`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/TopNavigation.tsx`
- Modify: `src/components/ProfilePanel.tsx`
- Modify: `src/domain/profile.ts`
- Modify: `tests/domain/profile.test.ts`

**Interfaces:**
- `PublicProfileView` accepts `profile`, `achievements`, `library`, `favorites`, `mode: 'owner' | 'visitor'`, `syncing`, `syncError`, `onChange`, `onSelectGame`, `onOpenStore` and `onModeChange`.
- `ProfileStoreView` accepts `profile`, `items`, `onPurchase`, `onEquip` and `onBack`.
- Both views consume `ProfileState` and `ProfileItem` without writing directly to storage.
- `AppShell` remains the only owner of persisted state and profile actions.

- [ ] **Step 1: Write the failing profile domain tests**

  Add tests proving an affordable purchase deducts points once, a duplicate purchase is idempotent, an unaffordable purchase leaves the profile unchanged, and equipping only an owned item changes the corresponding equipped slot.

- [ ] **Step 2: Run the profile domain tests to verify the new expectations fail**

  Run: `npm test -- --run tests/domain/profile.test.ts`

  Expected: FAIL for the new purchase/equip edge cases or missing item definitions.

- [ ] **Step 3: Implement the minimal profile rules and item catalog needed by the views**

  Keep the existing point reward model, normalize equipped IDs against the catalog, and add a small balanced catalog with visible frame, background, badge and title effects. Do not add remote inventory behavior.

- [ ] **Step 4: Run the profile domain tests to verify they pass**

  Run: `npm test -- --run tests/domain/profile.test.ts`

  Expected: all profile domain tests pass.

- [ ] **Step 5: Write the failing public profile and store view tests**

  Assert that visitor mode hides edit controls while showing identity, stats, achievements and equipped cosmetics; owner mode exposes editing; the shop is a separate view; buying calls `onPurchase`; equipping calls `onEquip`; and the profile reflects the equipped item labels.

- [ ] **Step 6: Run the view tests to verify the new screens are missing**

  Run: `npm test -- --run tests/ui/public-profile.test.tsx tests/ui/profile-store.test.tsx`

  Expected: FAIL because the new components and page wiring do not exist.

- [ ] **Step 7: Implement the public profile page and separate local shop**

  Add a `Profile` section to navigation, render `PublicProfileView` and `ProfileStoreView` from `AppShell`, keep edit mode owner-only, and move shop actions out of the old modal. Apply equipped frame/background/badge/title styles visibly and retain a visitor-preview toggle so the read-only state can be verified locally.

- [ ] **Step 8: Run profile tests and the full frontend suite**

  Run: `npm test -- --run tests/domain/profile.test.ts tests/ui/public-profile.test.tsx tests/ui/profile-store.test.tsx` and then `npm test -- --run`.

  Expected: targeted profile tests and the complete frontend suite pass.

- [ ] **Step 9: Commit Cap. 2**

  ```bash
  git add src tests/domain/profile.test.ts tests/ui/public-profile.test.tsx tests/ui/profile-store.test.tsx
  git commit -m "feat: add public profile and local cosmetics store"
  ```

### Task 3: Polish Store, navigation and motion

**Files:**
- Modify: `src/views/StoreView.tsx`
- Modify: `src/components/TopNavigation.tsx`
- Modify: `src/components/GlobalSearch.tsx`
- Modify: `src/components/LibrarySearch.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/index.css`
- Modify: `src/motion/presets.ts`
- Modify: `tests/ui/store-view.test.tsx`
- Modify: `tests/ui/accessibility-motion.test.tsx`

**Interfaces:**
- `StoreView` preserves the existing `SteamStoreCategories` and `SteamStoreOffer` contracts and only changes presentation, geometry and states.
- Navigation and search preserve existing callbacks and accessibility labels.
- Motion presets remain reusable by all view transitions and support a reduced-motion duration of zero or near-zero.

- [ ] **Step 1: Write the failing Store and motion regression tests**

  Add assertions for aligned loading/error/empty geometry markers, visible retry state, an active Store navigation item that does not move surrounding content, and a reduced-motion render with no decorative transition classes left active.

- [ ] **Step 2: Run the regression tests to verify the new contracts fail**

  Run: `npm test -- --run tests/ui/store-view.test.tsx tests/ui/accessibility-motion.test.tsx`

  Expected: FAIL for the new geometry/state/motion assertions.

- [ ] **Step 3: Implement the final Store, shell and motion polish**

  Redesign Store cards and rows around a shared card geometry, add stable skeleton/empty/error containers, align the global and library search controls, wrap the app in the rounded glass shell, and use restrained Framer Motion transitions that stop under reduced motion.

- [ ] **Step 4: Run the regression tests and full suite**

  Run: `npm test -- --run tests/ui/store-view.test.tsx tests/ui/accessibility-motion.test.tsx` and then `npm test -- --run`.

  Expected: all targeted and full frontend tests pass.

- [ ] **Step 5: Run production verification**

  Run: `cargo test --manifest-path src-tauri/Cargo.toml`, `npm run build`, `npm run tauri:build` and `git diff --check`.

  Expected: Rust tests pass, frontend build succeeds, Tauri produces the existing MSI/NSIS bundles, and `git diff --check` is clean.

- [ ] **Step 6: Perform the visual verification pass**

  Open the built app and inspect Home, Store, Community, Profile owner, Profile visitor preview and the local shop at the normal window size. Exercise a failed image source, loading/error/empty states, a purchase/equip flow and reduced motion. Confirm no horizontal overflow, broken image icon or clipped search/nav control remains.

- [ ] **Step 7: Commit Cap. 3**

  ```bash
  git add src tests/ui/store-view.test.tsx tests/ui/accessibility-motion.test.tsx
  git commit -m "style: refine Aevora shell and navigation motion"
  ```

## Final verification

- [ ] Run `npm test -- --run` and record the complete passing count.
- [ ] Run `cargo test --manifest-path src-tauri/Cargo.toml` and record the complete passing count.
- [ ] Run `npm run build`.
- [ ] Run `npm run tauri:build`.
- [ ] Run `git diff --check`.
- [ ] Confirm the worktree is clean and list the three Cap. 1–3 commits.
