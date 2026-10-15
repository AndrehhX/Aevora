import type { SteamAppDetails } from './steamClient';

export interface GameArtwork {
  cover: string;
  coverFallback: string;
  coverFallback2?: string;
  hero: string;
  heroFallback: string;
  logo?: string;
  icon?: string;
}

export const STEAM_ASSET_BASE = 'https://shared.steamstatic.com/store_item_assets/steam/apps';
export const STEAM_AKAMAI_BASE = 'https://cdn.akamai.steamstatic.com/steam/apps';
export const STEAM_MEDIA_BASE = 'https://cdn.cloudflare.steamstatic.com/steam/apps';
export const STEAM_AKAMAIHD_BASE = 'https://steamcdn-a.akamaihd.net/steam/apps';

export function resolveSteamAssets(details: SteamAppDetails): GameArtwork {
  const appId = String(details.appid);
  const header = details.header_image ?? `${STEAM_ASSET_BASE}/${appId}/header.jpg`;
  const cover = `${STEAM_ASSET_BASE}/${appId}/library_600x900_2x.jpg`;
  const coverFallback = `${STEAM_ASSET_BASE}/${appId}/library_600x900.jpg`;
  // Use official Steam Library Hero banner (1920x620) as the primary hero image.
  // details.background_raw / details.background is the dim store page backdrop.
  const hero = `${STEAM_ASSET_BASE}/${appId}/library_hero.jpg`;
  const heroFallback = details.background_raw ?? details.background ?? header;
  return {
    cover,
    coverFallback,
    coverFallback2: header,
    hero,
    heroFallback,
    logo: details.logo ?? `${STEAM_ASSET_BASE}/${appId}/logo.png`,
  };
}

export function getSteamHeroCandidates(appId: string | number, primaryHero?: string, fallbackHero?: string): string[] {
  const id = String(appId);
  const candidates: string[] = [];
  
  // 1. Official Steam Library Hero (1920x620) across all mirrors
  candidates.push(
    `${STEAM_ASSET_BASE}/${id}/library_hero.jpg`,
    `${STEAM_AKAMAI_BASE}/${id}/library_hero.jpg`,
    `${STEAM_MEDIA_BASE}/${id}/library_hero.jpg`,
    `${STEAM_AKAMAIHD_BASE}/${id}/library_hero.jpg`,
  );
  
  if (primaryHero) candidates.push(primaryHero);

  // 2. High-res page background / screenshots / capsules
  candidates.push(
    `${STEAM_ASSET_BASE}/${id}/page_bg_generated_v6b.jpg`,
    `${STEAM_AKAMAI_BASE}/${id}/page_bg_generated_v6b.jpg`,
    `${STEAM_ASSET_BASE}/${id}/capsule_616x353.jpg`,
    `${STEAM_ASSET_BASE}/${id}/header.jpg`,
    `${STEAM_AKAMAI_BASE}/${id}/header.jpg`,
  );
  if (fallbackHero) candidates.push(fallbackHero);

  const seen = new Set<string>();
  return candidates.filter((url) => {
    const clean = url?.trim();
    if (!clean || seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
}

export function getSteamCoverCandidates(
  appId: string | number,
  primaryCover?: string,
  fallbackCover?: string,
  fallbackCover2?: string,
  icon?: string
): string[] {
  const id = String(appId);
  const candidates: string[] = [];
  if (primaryCover) candidates.push(primaryCover);
  candidates.push(
    `${STEAM_ASSET_BASE}/${id}/library_600x900_2x.jpg`,
    `${STEAM_AKAMAI_BASE}/${id}/library_600x900_2x.jpg`,
    `${STEAM_MEDIA_BASE}/${id}/library_600x900_2x.jpg`,
    `${STEAM_ASSET_BASE}/${id}/library_600x900.jpg`,
    `${STEAM_AKAMAI_BASE}/${id}/library_600x900.jpg`,
    `${STEAM_ASSET_BASE}/${id}/library_capsule.jpg`,
    `${STEAM_ASSET_BASE}/${id}/header.jpg`,
    `${STEAM_AKAMAI_BASE}/${id}/header.jpg`,
    `${STEAM_ASSET_BASE}/${id}/capsule_616x353.jpg`,
  );
  if (icon) candidates.push(icon);
  if (fallbackCover) candidates.push(fallbackCover);
  if (fallbackCover2) candidates.push(fallbackCover2);

  const seen = new Set<string>();
  return candidates.filter((url) => {
    const clean = url?.trim();
    if (!clean || seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
}

