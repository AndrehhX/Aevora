import type { SteamAppDetails } from './steamClient';

export interface GameArtwork {
  cover: string;
  coverFallback: string;
  coverFallback2?: string;
  hero: string;
  heroFallback: string;
  logo?: string;
}

const STEAM_ASSET_BASE = 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps';

export function resolveSteamAssets(details: SteamAppDetails): GameArtwork {
  const appId = String(details.appid);
  const header = details.header_image ?? `${STEAM_ASSET_BASE}/${appId}/header.jpg`;
  // `capsule_image` is a wide store banner. Library cards are portrait,
  // so use Steam's native library artwork instead of stretching/cropping it.
  const cover = `${STEAM_ASSET_BASE}/${appId}/library_600x900_2x.jpg`;
  const coverFallback = `${STEAM_ASSET_BASE}/${appId}/library_600x900.jpg`;
  const hero = details.background_raw ?? details.background ?? `${STEAM_ASSET_BASE}/${appId}/library_hero.jpg`;
  return {
    cover,
    coverFallback,
    coverFallback2: header,
    hero,
    heroFallback: header,
    // Steam sometimes omits `logo` even when the official app asset exists.
    // Try the official transparent asset before falling back to the title.
    logo: details.logo ?? `${STEAM_ASSET_BASE}/${appId}/logo.png`,
  };
}
