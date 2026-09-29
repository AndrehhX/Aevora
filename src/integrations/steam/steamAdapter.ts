import type { CacheStore } from '../cache/cacheStore';
import type { UnifiedGame } from '../../domain/game';
import type { SteamAppDetails, SteamClient, SteamConnectionResponse, SteamOwnedGame } from './steamClient';
import { createSteamClient } from './steamClient';
import { createSteamNewsLoader, type SteamNewsResult } from './steamNews';

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
  connect(): Promise<ConnectionState>;
  disconnect(): Promise<void>;
  getLibrary(): Promise<UnifiedGame[]>;
  getAppDetails(appId: number): Promise<SteamAppDetails>;
  getNews(appId: number): Promise<SteamNewsResult>;
  getConnection(): ConnectionState;
}

interface SteamAdapterOptions {
  client?: SteamClient;
  cache: CacheStore;
  now?: () => number;
  libraryTtlMs?: number;
}

const LIBRARY_TTL_MS = 5 * 60 * 1000;

function mapConnection(response: SteamConnectionResponse): ConnectionState {
  if (response.status === 'connected' && response.steamId) {
    return { status: 'connected', steamId: response.steamId, displayName: response.displayName, expiresAt: response.expiresAt };
  }
  if (response.status === 'canceled') return { status: 'canceled' };
  if (response.status === 'expired') throw new SteamAdapterError('expired', 'Your Steam connection expired. Connect again.');
  if (response.status === 'rate-limited') throw new SteamAdapterError('rate-limited', 'Steam is rate-limiting requests. Try again shortly.');
  throw new SteamAdapterError('offline', 'Steam could not be reached.');
}

function normalizeOwnedGame(game: SteamOwnedGame): UnifiedGame {
  const appId = String(game.appid);
  const cover = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
  const hero = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`;
  return {
    id: `steam:${appId}`,
    title: game.name,
    subtitle: 'Steam library',
    highlight: 'Owned on Steam',
    artwork: { cover, coverFallback: cover, hero, heroFallback: cover },
    providers: [{
      provider: 'steam',
      externalId: appId,
      owned: true,
      installed: false,
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
  const now = options.now ?? Date.now;
  const ttlMs = options.libraryTtlMs ?? LIBRARY_TTL_MS;
  const newsLoader = createSteamNewsLoader({ client, cache: options.cache, now });
  let connection: ConnectionState = { status: 'disconnected' };

  return {
    async connect() {
      try {
        connection = mapConnection(await client.connect());
        return connection;
      } catch (error) {
        if (error instanceof SteamAdapterError) throw error;
        throw new SteamAdapterError('offline', 'Steam connection is unavailable.');
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
        const games = ownedGames.map(normalizeOwnedGame);
        await options.cache.set(cacheKey, games, ttlMs);
        return games;
      } catch (error) {
        const cached = await options.cache.get<UnifiedGame[]>(cacheKey);
        if (cached?.stale && cached.value.length > 0) return cached.value;
        if (error instanceof SteamAdapterError) throw error;
        throw new SteamAdapterError('offline', 'Steam library is unavailable right now.');
      }
    },
    async getAppDetails(appId) {
      if (!Number.isInteger(appId) || appId <= 0) throw new SteamAdapterError('invalid-response', 'Steam AppID must be a positive number.');
      try {
        return await client.getAppDetails(appId);
      } catch {
        throw new SteamAdapterError('offline', 'Steam game details are unavailable right now.');
      }
    },
    async getNews(appId) {
      try {
        return await newsLoader.load(appId);
      } catch {
        throw new SteamAdapterError('offline', 'Steam news is unavailable right now.');
      }
    },
    getConnection: () => connection,
  };
}
