import type { SteamAppDetails } from './steamClient';

export interface GameArtwork {
  cover: string;
  coverFallback: string;
  coverFallback2?: string;
  hero: string;
  heroFallback: string;
  logo?: string;
}

export const STEAM_ASSET_BASE = 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps';
export const STEAM_AKAMAI_BASE = 'https://cdn.akamai.steamstatic.com/steam/apps';
export const STEAM_MEDIA_BASE = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

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

export function getSteamHeroCandidates(appId: string | number, primaryHero?: string, fallbackHero?: string): string[] {
  const id = String(appId);
  const candidates: string[] = [];
  if (primaryHero) candidates.push(primaryHero);
  candidates.push(
    `${STEAM_ASSET_BASE}/${id}/library_hero.jpg`,
    `${STEAM_AKAMAI_BASE}/${id}/library_hero.jpg`,
    `${STEAM_MEDIA_BASE}/${id}/library_hero.jpg`,
    `${STEAM_ASSET_BASE}/${id}/page_bg_generated_v6b.jpg`,
    `${STEAM_AKAMAI_BASE}/${id}/page_bg_generated_v6b.jpg`,
    `${STEAM_ASSET_BASE}/${id}/capsule_616x353.jpg`,
  );
  if (fallbackHero) candidates.push(fallbackHero);
  candidates.push(`${STEAM_ASSET_BASE}/${id}/header.jpg`);

  const seen = new Set<string>();
  return candidates.filter((url) => {
    const clean = url?.trim();
    if (!clean || seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
}

export function getSteamCoverCandidates(appId: string | number, primaryCover?: string, fallbackCover?: string, fallbackCover2?: string): string[] {
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
    `${STEAM_ASSET_BASE}/${id}/capsule_616x353.jpg`,
  );
  if (fallbackCover) candidates.push(fallbackCover);
  if (fallbackCover2) candidates.push(fallbackCover2);
  candidates.push(`${STEAM_ASSET_BASE}/${id}/header.jpg`);

  const seen = new Set<string>();
  return candidates.filter((url) => {
    const clean = url?.trim();
    if (!clean || seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
}

