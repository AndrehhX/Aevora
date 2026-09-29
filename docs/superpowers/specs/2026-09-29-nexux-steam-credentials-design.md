# Nexux Steam Credentials and Live Data

## Goal

Allow each Nexux user to configure their own Steam account on their own Windows machine and use Steam's live APIs for the private library plus public artwork and news, without putting credentials in the repository or browser storage.

## Decisions

- The public repository will be named `Nexux`; the existing in-app product label remains `Aevora` until a separate branding change is requested.
- The launcher accepts a SteamID64 or Steam vanity identifier and a Steam Web API key. It never asks for or stores a Steam password.
- Credentials are stored as one JSON record in Windows Credential Manager through the Tauri/Rust boundary. The frontend never receives the API key after saving it.
- The frontend sends the API key only to the one local save command. All later native commands receive no credentials; Rust reads the credential record, calls Steam, validates responses, and returns normalized data.
- The owned library uses `IPlayerService/GetOwnedGames` with app info and played free games enabled. A private Steam profile produces a clear unavailable state rather than fake games.
- App details use Steam's public Store API; news uses `ISteamNews/GetNewsForApp`. Artwork URLs are taken from Steam's response when available and use Steam CDN fallbacks only for valid AppIDs.
- Browser mode remains a truthful preview: native-only configuration and live Steam calls report that the desktop runtime is required.

## Boundaries

The change covers Steam credentials, owned library retrieval, app details, news, and real artwork wiring. It does not add Epic/GOG adapters, background syncing, password login, or a cloud proxy.

## Failure behavior

- Missing native runtime: show a desktop-runtime message.
- Missing credentials: show a setup message; never claim connected.
- Invalid credentials or private profile: show an actionable Steam configuration error.
- Network/rate-limit errors: keep valid stale cache when available and explain the offline state.
- Keyring failures: stop before any API request and show that local credential storage failed.

## Verification

- TypeScript tests cover credential validation, bridge calls, normalization and honest native-unavailable behavior.
- Rust tests cover AppID/account validation and Steam response normalization without network calls.
- `npm run check`, `cargo check --manifest-path src-tauri/Cargo.toml`, and a packaged Tauri build must pass before publication.
