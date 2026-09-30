# Aevora

Aevora is a desktop-first game launcher built around one unified library. The interface is React and TypeScript; the native boundary is Tauri and Rust. Without a connected provider, the library stays empty instead of showing invented games.

## Stack

- React, TypeScript, Vite and Tailwind CSS
- Framer Motion for restrained interface motion
- Vitest and Testing Library for verification
- Tauri 2 and Rust for desktop commands
- Steam adapter contracts for library, artwork, store offers, community news, achievements and launch flows

## Requirements on Windows

- Node.js LTS and npm
- Git
- Microsoft C++ Build Tools with **Desktop development with C++**, MSVC and a Windows SDK
- Microsoft Edge WebView2 Runtime
- Rust with the `stable-x86_64-pc-windows-msvc` toolchain

## Local development

Install JavaScript dependencies:

```bash
npm install
```

Run the browser shell:

```bash
npm run dev
```

Run the desktop shell:

```bash
npm run tauri:dev
```

The Vite development server uses port `1420`, matching the Tauri configuration.

## Verification

```bash
npm run check
npm run tauri -- info
cargo check --manifest-path src-tauri/Cargo.toml
```

Build the Windows desktop bundle with:

```bash
npm run tauri:build
```

Generated Rust output under `src-tauri/target` and generated Tauri schemas under `src-tauri/gen` are intentionally ignored.

## Steam state

The frontend never asks for a Steam password and never embeds a secret. From the desktop Settings panel, each user can enter a SteamID64 or vanity identifier plus their own Steam Web API key. The key is sent once to the local Tauri command and stored in Windows Credential Manager; all later Steam requests read it from there. Browser preview disables this form because it cannot provide the same local boundary.

The native adapter resolves the account, validates the profile, loads owned games through `IPlayerService/GetOwnedGames`, reads public app details for artwork and logos, loads current news through `ISteamNews/GetNewsForApp`, reads public Store categories, and requests exposed player achievements. Steam launch and store actions go through typed Tauri commands; the UI only reports `Playing` after the native command reports success. Private profiles and unavailable APIs are reported honestly.

Store offers are public Steam Store data, not account-specific recommendations. Community combines public Steam News feeds for every linked game, deduplicates them and keeps successful feeds when another game is unavailable. Steam's public APIs do not expose a complete copy of every discussion post in every Community hub.

The profile panel is intentionally local to the PC: display name, bio, points, unlocked achievements and cosmetic items are stored in the versioned local state. Points are awarded locally for newly observed unlocked achievements, and the profile shop contains only local frames, backgrounds, badges and titles. It does not modify Steam Wallet, inventory or account profile data.

For local setup, create a Steam Web API key at [Steam Web API Key](https://steamcommunity.com/dev/apikey), open the desktop Settings panel, save the SteamID/vanity identifier and key, then choose Connect. Never commit the key, put it in a `VITE_*` variable, or paste it into an issue.

## Repository map

```text
src/domain/                  canonical game and provider contracts
src/integrations/cache/     versioned TTL cache with stale metadata
src/integrations/steam/     Steam normalization and adapter boundary
src/integrations/desktop/   typed native bridge
src/components/             UI and interaction surfaces
src-tauri/                   Tauri shell and native Steam launch commands
tests/                       domain, integration and accessibility tests
docs/                        architecture and provider notes
```

## Release checklist

- [x] Production library starts empty and has an honest connect state.
- [x] Provider and cache failures are represented without fake success.
- [x] Steam artwork/news normalizers have offline coverage.
- [x] Steam launch and store commands are distinct.
- [x] Steam credentials use Windows Credential Manager instead of browser storage.
- [x] Owned games, Steam artwork/logos and public news use live provider responses.
- [x] Store rows use live public Steam offers with real prices and discount labels.
- [x] Community combines public news from all linked Steam games with partial-failure handling.
- [x] Profile identity, achievement points and cosmetic shop persist locally.
- [x] Keyboard Escape, focus, reduced-motion and coarse-pointer behavior are tested.
- [x] `npm run check` passes.
- [x] `cargo check --manifest-path src-tauri/Cargo.toml` passes on Windows.
- [ ] Manually verify Steam account linking with a real account and a profile that exposes game details.
- [ ] Run a packaged `npm run tauri:build` smoke test on the target Windows machine.

## Known limitations

Aevora does not claim to support Epic, GOG or other providers yet. It also does not invent install progress, cloud saves, friend activity or account data. Those surfaces remain unavailable until their provider adapters exist.

Steam's API key route requires a visible profile for owned-game data. If a profile is private, the launcher will keep the library unavailable instead of filling it with demo records.
