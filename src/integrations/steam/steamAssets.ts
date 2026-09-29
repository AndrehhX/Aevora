import type { SteamAppDetails } from './steamClient';

export interface GameArtwork {
  cover: string;
  coverFallback: string;
  hero: string;
  heroFallback: string;
  logo?: string;
}

const STEAM_ASSET_BASE = 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps';

export function resolveSteamAssets(details: SteamAppDetails): GameArtwork {
  const appId = String(details.appid);
  const header = details.header_image ?? `${STEAM_ASSET_BASE}/${appId}/header.jpg`;
  const capsule = details.capsule_image ?? header;
  const hero = details.background_raw ?? details.background ?? `${STEAM_ASSET_BASE}/${appId}/library_hero.jpg`;
  return {
    cover: capsule,
    coverFallback: header,
    hero,
    heroFallback: header,
    logo: details.logo,
  };
}
