import type { CacheStore } from '../cache/cacheStore';
import type { UnifiedGame } from '../../domain/game';
import type { SteamAppDetails, SteamClient, SteamConnectionResponse, SteamOwnedGame } from './steamClient';
import { createSteamClient } from './steamClient';
import { resolveSteamAssets } from './steamAssets';
import { createSteamCommunityLoader, createSteamNewsLoader, type SteamCommunityResult, type SteamNewsResult } from './steamNews';
import { createSteamStoreLoader, type SteamStoreCategories } from './steamStore';
import { createSteamCredentialClient, type SteamCredentialClient, type SteamCredentialsInput } from './steamCredentials';

export type ConnectionState =
  | { status: 'disconnected' }
  | { status: 'connected'; steamId: string; displayName?: string; expiresAt?: string }
  | { status: 'canceled' };

export type SteamAdapterErrorCode = 'expired' | 'rate-limited' | 'offline' | 'not-connected' | 'invalid-response';

export class SteamAdapterError extends Error {
  constructor(public readonly code: SteamAdapterErrorCode, message: string) {
    super(message);
    this.name = 'SteamAdapterError';
  }
}

export interface SteamAdapter {
  saveCredentials(credentials: SteamCredentialsInput): Promise<void>;
  hasCredentials(): Promise<boolean>;
  clearCredentials(): Promise<void>;
  connect(): Promise<ConnectionState>;
  disconnect(): Promise<void>;
  getLibrary(): Promise<UnifiedGame[]>;
  getAppDetails(appId: number): Promise<SteamAppDetails>;
  getNews(appId: number): Promise<SteamNewsResult>;
  getCommunity(games: UnifiedGame[]): Promise<SteamCommunityResult>;
  getStore(): Promise<SteamStoreCategories>;
  getConnection(): ConnectionState;
}

interface SteamAdapterOptions {
  client?: SteamClient;
  credentials?: SteamCredentialClient;
  cache: CacheStore;
  now?: () => number;
  libraryTtlMs?: number;
}

const LIBRARY_TTL_MS = 5 * 60 * 1000;
const APP_DETAILS_TTL_MS = 24 * 60 * 60 * 1000;
const STEAM_COMMUNITY_ASSET_BASE = 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps';

function providerErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

function mapConnection(response: SteamConnectionResponse): ConnectionState {
  if (response.status === 'connected' && response.steamId) {
    return { status: 'connected', steamId: response.steamId, displayName: response.displayName, expiresAt: response.expiresAt };
  }
  if (response.status === 'canceled') return { status: 'canceled' };
  if (response.status === 'expired') throw new SteamAdapterError('expired', 'Your Steam connection expired. Connect again.');
  if (response.status === 'rate-limited') throw new SteamAdapterError('rate-limited', 'Steam is rate-limiting requests. Try again shortly.');
  throw new SteamAdapterError('offline', 'Steam could not be reached.');
}

function normalizeOwnedGame(game: SteamOwnedGame, details?: SteamAppDetails): UnifiedGame {
  const appId = String(game.appid);
  const fallbackCover = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
  const fallbackHero = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`;
  const fallbackLogo = game.img_logo_url ? `${STEAM_COMMUNITY_ASSET_BASE}/${appId}/${game.img_logo_url}.jpg` : undefined;
  const artwork = details ? resolveSteamAssets(details) : {
    cover: fallbackCover,
    coverFallback: fallbackCover,
    coverFallback2: fallbackCover,
    hero: fallbackHero,
    heroFallback: fallbackCover,
    logo: fallbackLogo,
  };
  const genres = details?.genres?.map((genre) => genre.description).filter((genre): genre is string => !!genre?.trim());
  return {
    id: `steam:${appId}`,
    title: details?.name?.trim() || game.name,
    subtitle: details?.developers?.[0] ?? 'Steam library',
    highlight: game.installed ? 'Installed on Steam' : 'Owned on Steam',
    description: details?.short_description,
    artwork,
    metadata: details
      ? {
          developer: details.developers?.[0],
          publisher: details.publishers?.[0],
          releaseDate: details.release_date?.date,
          genres,
        }
      : undefined,
    providers: [{
      provider: 'steam',
      externalId: appId,
      owned: true,
      installed: game.installed === true,
      installPath: game.installPath,
      launchUri: `steam://rungameid/${appId}`,
      installUri: `steam://install/${appId}`,
      playtimeMinutes: game.playtime_forever ?? 0,
      lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000).toISOString() : undefined,
    }],
  };
}

function isOwnedGame(value: SteamOwnedGame): boolean {
  return Number.isInteger(value.appid) && value.appid > 0 && typeof value.name === 'string' && value.name.trim().length > 0;
}

export function createSteamAdapter(options: SteamAdapterOptions): SteamAdapter {
  const client = options.client ?? createSteamClient();
  const credentials = options.credentials ?? createSteamCredentialClient();
  const now = options.now ?? Date.now;
  const ttlMs = options.libraryTtlMs ?? LIBRARY_TTL_MS;
  const newsLoader = createSteamNewsLoader({ client, cache: options.cache, now });
  const communityLoader = createSteamCommunityLoader({ client, cache: options.cache, now });
  const storeLoader = createSteamStoreLoader({ client, cache: options.cache, now });
  let connection: ConnectionState = { status: 'disconnected' };

  async function hydrateGame(game: SteamOwnedGame): Promise<UnifiedGame> {
    const detailsKey = `steam:app:${game.appid}`;
    const cached = await options.cache.get<SteamAppDetails>(detailsKey);
    if (cached && !cached.stale) return normalizeOwnedGame(game, cached.value);
    try {
      const details = await client.getAppDetails(game.appid);
      await options.cache.set(detailsKey, details, APP_DETAILS_TTL_MS);
      return normalizeOwnedGame(game, details);
    } catch {
      if (cached?.value) return normalizeOwnedGame(game, cached.value);
      return normalizeOwnedGame(game);
    }
  }

  return {
    saveCredentials: (input) => credentials.save(input),
    hasCredentials: () => credentials.has(),
    clearCredentials: () => credentials.clear(),
    async connect() {
      try {
        connection = mapConnection(await client.connect());
        return connection;
      } catch (error) {
        if (error instanceof SteamAdapterError) throw error;
        throw new SteamAdapterError('offline', providerErrorMessage(error, 'Steam connection is unavailable.'));
      }
    },
    async disconnect() {
      const steamId = connection.status === 'connected' ? connection.steamId : undefined;
      await client.disconnect();
      connection = { status: 'disconnected' };
      if (steamId) await options.cache.remove(`steam:library:${steamId}`);
    },
    async getLibrary() {
      if (connection.status !== 'connected') throw new SteamAdapterError('not-connected', 'Connect Steam before loading your library.');
      const cacheKey = `steam:library:${connection.steamId}`;
      try {
        const ownedGames = (await client.getOwnedGames()).filter(isOwnedGame);
        const games: UnifiedGame[] = [];
        for (let index = 0; index < ownedGames.length; index += 4) {
          const batch = ownedGames.slice(index, index + 4);
          games.push(...await Promise.all(batch.map(hydrateGame)));
        }
        await options.cache.set(cacheKey, games, ttlMs);
        return games;
      } catch (error) {
        const cached = await options.cache.get<UnifiedGame[]>(cacheKey);
        if (cached?.stale && cached.value.length > 0) return cached.value;
        if (error instanceof SteamAdapterError) throw error;
        throw new SteamAdapterError('offline', providerErrorMessage(error, 'Steam library is unavailable right now.'));
      }
    },
    async getAppDetails(appId) {
      if (!Number.isInteger(appId) || appId <= 0) throw new SteamAdapterError('invalid-response', 'Steam AppID must be a positive number.');
      try {
        return await client.getAppDetails(appId);
      } catch (error) {
        throw new SteamAdapterError('offline', providerErrorMessage(error, 'Steam game details are unavailable right now.'));
      }
    },
    async getNews(appId) {
      try {
        return await newsLoader.load(appId);
      } catch (error) {
        throw new SteamAdapterError('offline', providerErrorMessage(error, 'Steam news is unavailable right now.'));
      }
    },
    async getCommunity(games) {
      const refs = games.flatMap((game) => {
        const steam = game.providers.find((entry) => entry.provider === 'steam');
        const appId = steam ? Number(steam.externalId) : 0;
        return appId > 0 ? [{ appId, gameTitle: game.title }] : [];
      });
      return communityLoader.load(refs);
    },
    async getStore() {
      try {
        return await storeLoader.load();
      } catch (error) {
        throw new SteamAdapterError('offline', providerErrorMessage(error, 'Steam store offers are unavailable right now.'));
      }
    },
    getConnection: () => connection,
  };
}
