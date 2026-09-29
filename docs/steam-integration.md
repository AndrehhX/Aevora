# Steam integration

## What is public and what is private

Steam's public `ISteamNews/GetNewsForApp/v2` endpoint can return news for an AppID without putting a secret in the frontend. Aevora normalizes those items into a title, source URL, publication timestamp and stale-cache state.

Owned games are different. Steam's `IPlayerService/GetOwnedGames` endpoint requires a Web API key and SteamID, and the profile must expose the library. That request belongs behind the native boundary; it must not be made from React or shipped with a `VITE_*` secret.

## Local configuration

The desktop Settings panel accepts a SteamID64 or Steam vanity identifier and a Steam Web API key. The key is masked in the form, sent only to the local `steam_save_credentials` command, and stored in Windows Credential Manager under the Aevora launcher service. It is not written to `localStorage`, the repository, `.env`, or the frontend bundle.

Aevora deliberately does not ask for a Steam password. The current supported path is API-key plus SteamID/vanity resolution; browser preview reports that a desktop runtime is required. A future OpenID flow may remove the manual identifier step, but it is not claimed as implemented here.

## Expected flow

1. User opens Settings and saves a SteamID64/vanity identifier plus API key.
2. Windows Credential Manager stores the local credential record.
3. The native layer resolves the identifier and validates the Steam account summary.
4. The native layer retrieves the owned library through the protected Web API request.
5. The adapter normalizes records into `UnifiedGame[]` and caches them with a TTL.
6. Artwork/logos come from Steam-owned hashes or Store API details; public news keeps its source link.
7. Disconnect clears the local provider cache and session state. Clearing local setup also deletes the Credential Manager record.

## Failure states

- `canceled`: the user closed or rejected sign-in.
- `expired`: the saved provider session must be connected again.
- `rate-limited`: Steam should be retried later; cached data may remain visible as stale.
- `offline`: no live request succeeded and no usable cache exists.
- `missing-client`: the desktop runtime or Steam client is not available.
- `unsupported`: the record has no valid Steam AppID or the provider is not implemented.
- `private-profile`: Steam did not expose owned-game details for the configured profile.

## References

- [Steam IPlayerService / GetOwnedGames](https://partner.steamgames.com/doc/webapi/iplayerservice)
- [Steam ISteamNews / GetNewsForApp](https://partner.steamgames.com/doc/webapi/ISteamNews)
