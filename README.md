# Aevora

Aevora is a desktop-first game launcher built around one unified library. The interface is React and TypeScript; the native boundary is Tauri and Rust. The current product is intentionally honest about provider state: without a connected provider, the library stays empty instead of showing invented games.

## Stack

- React, TypeScript, Vite and Tailwind CSS
- Framer Motion for restrained interface motion
- Vitest and Testing Library for verification
- Tauri 2 and Rust for desktop commands
- Steam adapter contracts for library, artwork, news and launch flows

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

The frontend never asks for a Steam password and never embeds a secret. The adapter has explicit states for connected, canceled, expired, rate-limited, offline and unavailable desktop runtime. Steam launch and store actions go through typed Tauri commands; the UI only reports `Playing` after the native command reports success.

Library authentication and owned-game retrieval still require the native Steam account configuration described in [`docs/steam-integration.md`](docs/steam-integration.md). Until that boundary is configured, Aevora shows the connection state and an empty-library state.

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
- [x] Keyboard Escape, focus, reduced-motion and coarse-pointer behavior are tested.
- [x] `npm run check` passes.
- [x] `cargo check --manifest-path src-tauri/Cargo.toml` passes on Windows.
- [ ] Configure and manually verify Steam account linking with a real account.
- [ ] Run a packaged `npm run tauri:build` smoke test on the target Windows machine.

## Known limitations

Aevora does not claim to support Epic, GOG or other providers yet. It also does not invent install progress, cloud saves, friend activity or account data. Those surfaces remain unavailable until their provider adapters exist.

The current repository has no configured Git remote, so releases are local until a remote and publication workflow are intentionally added.
