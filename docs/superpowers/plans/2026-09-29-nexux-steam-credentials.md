# Nexux Steam Credentials and Live Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let each Nexux user configure Steam locally and load real owned games, artwork, logos and news through the native Tauri boundary.

**Architecture:** The React layer owns only form state and typed bridge calls. Rust/Tauri owns Windows Credential Manager, Steam Web API requests, response validation and error boundaries. The existing adapter/cache remains the single frontend integration surface.

**Tech Stack:** React, TypeScript, Vitest, Tauri 2, Rust, `keyring` Windows Credential Manager, `reqwest` with Rustls, Steam Web API.

**Spec:** `docs/superpowers/specs/2026-09-29-nexux-steam-credentials-design.md`

## Global Constraints

- Never commit or persist a real Steam API key in the frontend, repository, localStorage, or `.env` files.
- Never ask for or store a Steam password.
- Native commands receive no API key from the frontend; Rust reads it from Windows Credential Manager.
- Browser preview must report native-unavailable honestly.
- Every production behavior change gets a failing test before implementation.
- Keep the existing Aevora in-app label; use `Nexux` for the public repository name.

## Review Focus

- A private Steam profile must not turn into an empty fake success; test the actionable error.
- A missing Windows keyring record must not trigger a network request; test the early failure.
- An API key must never cross the bridge payload; test the command payload shape.
- Steam responses with missing app names or invalid IDs must be discarded safely; test normalization.
- Browser mode must not claim that account setup or live data succeeded; test native-unavailable behavior.

### Task 1: Credential contract and native storage boundary

**Files:**
- Create: `src/integrations/steam/steamCredentials.ts`
- Create: `tests/integrations/steam-credentials.test.ts`
- Create: `src-tauri/src/commands/credentials.rs`
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/Cargo.toml`

**Interfaces:**
- Produces `SteamCredentialsInput`, `validateSteamCredentials`, and typed adapter methods that later UI consumes.
- Produces Tauri commands `steam_save_credentials`, `steam_has_credentials`, `steam_clear_credentials`, and an internal keyring reader for API commands.

- [ ] Write failing TypeScript tests for rejecting blank account/key, accepting SteamID64/vanity identifiers, and ensuring the save bridge payload contains only the input at the command boundary.
- [ ] Run `npm test -- tests/integrations/steam-credentials.test.ts`; confirm it fails because the contract is absent.
- [ ] Implement the pure TypeScript validation and bridge-backed credential client without storing the API key in browser storage.
- [ ] Implement Rust keyring commands with Windows Credential Manager and redact all credential values from errors.
- [ ] Add Rust unit tests for account/key validation and run `cargo test --manifest-path src-tauri/Cargo.toml`.
- [ ] Run the focused TypeScript tests and commit `feat: store Steam credentials locally`.

### Task 2: Native Steam live-data commands

**Files:**
- Create: `src-tauri/src/commands/steam.rs`
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/Cargo.toml`
- Create: `tests/integrations/steam-live-data.test.ts`
- Modify: `src/integrations/steam/steamClient.ts`

**Interfaces:**
- Consumes the credential reader from Task 1.
- Produces native commands for `steam_connect`, `steam_get_owned_games`, `steam_get_app_details`, `steam_get_news`, and `steam_disconnect`.

- [ ] Write failing tests for normalizing owned games, app detail artwork/logo URLs and news source links.
- [ ] Run the focused tests and confirm they fail on the missing live-data contract.
- [ ] Implement Rust HTTP helpers and typed response normalization for Steam's official endpoints; resolve vanity identifiers before private-library requests.
- [ ] Register commands and update the TypeScript client contract so no secret is passed in invoke payloads.
- [ ] Run Rust tests, focused TypeScript tests and `cargo check`; commit `feat: connect native Steam live data`.

### Task 3: Settings UI and adapter wiring

**Files:**
- Modify: `src/integrations/steam/steamAdapter.ts`
- Modify: `src/components/ProviderConnectPanel.tsx`
- Modify: `src/components/SettingsPanel.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `tests/integrations/steam-adapter.test.ts`
- Create: `tests/ui/steam-credentials.test.tsx`

**Interfaces:**
- Consumes the credential client and native commands from Tasks 1–2.
- Produces a Settings form with masked API key input, local-storage disclosure, save/clear actions and honest runtime errors.

- [ ] Write failing UI/adapter tests for save, clear, masked key input, and browser-native-unavailable state.
- [ ] Run the focused tests and confirm the new behavior is absent.
- [ ] Implement the form and connect flow; only reload library/news after native connection succeeds.
- [ ] Replace remaining fixed Steam artwork mappings with live detail values when available, preserving valid CDN fallback URLs.
- [ ] Run `npm run check`; commit `feat: expose local Steam setup in settings`.

### Task 4: Documentation, release verification and publication

**Files:**
- Modify: `README.md`
- Modify: `docs/steam-integration.md`
- Modify: `.env.example`
- Modify: `.gitignore`

- [ ] Document local Windows Credential Manager behavior, SteamID/vanity input, API-key revocation and browser limitations.
- [ ] Add secret-pattern checks and verify no real key is present in tracked files.
- [ ] Run `npm run check`, `cargo check --manifest-path src-tauri/Cargo.toml`, `npm audit --omit=dev --audit-level=high`, and `npm run tauri:build`.
- [ ] Review `git diff --check`, status and history; commit `docs: document Nexux Steam configuration`.
- [ ] Create the public GitHub repository `Nexux`, set `origin`, push the verified branch, and confirm the remote URL.
