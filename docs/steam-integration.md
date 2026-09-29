# Steam integration

## What is public and what is private

Steam's public `ISteamNews/GetNewsForApp/v2` endpoint can return news for an AppID without putting a secret in the frontend. Aevora normalizes those items into a title, source URL, publication timestamp and stale-cache state.

Owned games are different. Steam's `IPlayerService/GetOwnedGames` endpoint requires a Web API key and SteamID, and the profile must expose the library. That request belongs behind the native boundary; it must not be made from React or shipped with a `VITE_*` secret.

## Local configuration

Copy `.env.example` only for local native development. Real values must stay outside Git and outside frontend bundles. A production implementation should read the key from a platform credential store and keep only the minimum session material required to refresh the local provider state.

The current desktop shell includes the typed command boundary and real Steam launch commands. The account-linking command is intentionally not reported as complete until its OpenID callback and secure credential storage are implemented and manually verified. Until then the UI must show the unavailable/offline state rather than a fake connected account.

## Expected flow

1. User opens Settings and chooses Connect Steam.
2. The native layer starts an OpenID flow; Aevora never asks for or sees the Steam password.
3. The callback validates the returned Steam identity.
4. The native layer retrieves the owned library through the protected Web API request.
5. The adapter normalizes records into `UnifiedGame[]` and caches them with a TTL.
6. Artwork and public news are loaded by AppID. News keeps its source link.
7. Disconnect clears the local provider cache and session state.

## Failure states

- `canceled`: the user closed or rejected sign-in.
- `expired`: the saved provider session must be connected again.
- `rate-limited`: Steam should be retried later; cached data may remain visible as stale.
- `offline`: no live request succeeded and no usable cache exists.
- `missing-client`: the desktop runtime or Steam client is not available.
- `unsupported`: the record has no valid Steam AppID or the provider is not implemented.

## References

- [Steam IPlayerService / GetOwnedGames](https://partner.steamgames.com/doc/webapi/iplayerservice)
- [Steam ISteamNews / GetNewsForApp](https://partner.steamgames.com/doc/webapi/ISteamNews)
