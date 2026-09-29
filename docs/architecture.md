# Aevora architecture

Aevora separates presentation from provider access. React renders canonical `UnifiedGame` records; Tauri/Rust owns native operations and future secret storage. A provider can be unavailable without making the UI pretend that its data exists.

```text
Steam transport / native commands
              |
       Steam adapter
              |
      UnifiedGame records
              |
       library selectors
              |
          React UI
```

## Frontend boundaries

- `src/domain/game.ts` defines the canonical game shape.
- `src/domain/provider.ts` defines provider identities and provider-owned fields.
- `src/domain/library.ts` contains ownership, installation, search and playtime selectors.
- `src/domain/storage.ts` persists preferences and local play history in a versioned record.
- `src/data/library.ts` starts empty in production. Provider adapters populate it after a real connection.
- `src/data/fixtures/` is isolated from production data and is not imported by the application shell.

## Integration boundaries

- `src/integrations/desktop/bridge.ts` is the only frontend entry point for native commands.
- `src/integrations/cache/cacheStore.ts` provides TTL and stale metadata for offline recovery.
- `src/integrations/steam/steamClient.ts` describes typed native calls.
- `src/integrations/steam/steamAdapter.ts` maps provider responses to the canonical domain model.
- `src/integrations/steam/steamAssets.ts` resolves Steam artwork with deterministic fallbacks.
- `src/integrations/steam/steamNews.ts` filters malformed news and preserves source URLs.
- `src/integrations/steam/steamLaunch.ts` maps native launch results to `started`, `missing-client`, `unsupported` or `failed`.

## Native boundary

`src-tauri/src/commands/launch.rs` is deliberately small. It receives a validated Steam AppID and opens either `steam://rungameid/<appid>` or `steam://store/<appid>`. React never executes a shell command directly.

Account linking, owned-game retrieval and secret storage must remain native. The frontend must not contain a Steam Web API key, a Steam password or a refresh token. See [`steam-integration.md`](steam-integration.md).

## State rules

1. No provider connection means no production games.
2. A stale cache may be displayed as stale, never as fresh.
3. Launch feedback comes from the native command, not from a timer.
4. Public news keeps its original source URL.
5. Decorative motion disappears for reduced-motion and coarse-pointer users.
