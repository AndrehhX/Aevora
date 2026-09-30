import type { CacheStore } from '../cache/cacheStore';
import type { SteamClient } from './steamClient';

export interface SteamNewsArticle {
  gid?: string | number;
  title?: string;
  url?: string;
  date?: number;
  contents?: string;
  feedlabel?: string;
}

export interface SteamNewsResponse {
  appnews?: { newsitems?: unknown[] };
}

export interface SteamNewsItem {
  id: string;
  title: string;
  url: string;
  contents: string;
  publishedAt: string;
  feedLabel?: string;
  stale: boolean;
}

export interface SteamCommunityItem extends SteamNewsItem {
  appId: number;
  gameTitle: string;
}

export interface SteamNewsResult {
  items: SteamNewsItem[];
  stale: boolean;
  fetchedAt: number;
}

export interface SteamCommunityResult {
  items: SteamCommunityItem[];
  failedAppIds: number[];
  stale: boolean;
  fetchedAt: number;
}

function isArticle(value: unknown): value is SteamNewsArticle {
  return typeof value === 'object' && value !== null;
}

export function normalizeSteamNews(payload: SteamNewsResponse, stale = false): SteamNewsItem[] {
  const raw = payload.appnews?.newsitems ?? [];
  return raw.filter(isArticle).flatMap((item) => {
    const id = String(item.gid ?? '');
    if (!id || typeof item.title !== 'string' || !item.title.trim() || typeof item.url !== 'string' || !item.url.trim() || typeof item.date !== 'number' || !Number.isFinite(item.date)) return [];
    return [{
      id,
      title: item.title.trim(),
      url: item.url,
      contents: typeof item.contents === 'string' ? item.contents.trim() : '',
      publishedAt: new Date(item.date * 1000).toISOString(),
      feedLabel: typeof item.feedlabel === 'string' && item.feedlabel.trim() ? item.feedlabel.trim() : undefined,
      stale,
    }];
  });
}

interface NewsLoaderOptions {
  client: Pick<SteamClient, 'getNews'>;
  cache: CacheStore;
  now?: () => number;
  ttlMs?: number;
}

const NEWS_TTL_MS = 10 * 60 * 1000;

export function createSteamNewsLoader(options: NewsLoaderOptions) {
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? NEWS_TTL_MS;
  return {
    async load(appId: number): Promise<SteamNewsResult> {
      const cacheKey = `steam:news:${appId}`;
      try {
        const payload = await options.client.getNews(appId);
        const result: SteamNewsResult = { items: normalizeSteamNews(payload), stale: false, fetchedAt: now() };
        await options.cache.set(cacheKey, result, ttlMs);
        return result;
      } catch {
        const cached = await options.cache.get<SteamNewsResult>(cacheKey);
        if (cached?.value) return { ...cached.value, stale: true, items: cached.value.items.map((item) => ({ ...item, stale: true })) };
        throw new Error('Steam news is unavailable right now.');
      }
    },
  };
}

interface CommunityGameRef {
  appId: number;
  gameTitle: string;
}

export function createSteamCommunityLoader(options: NewsLoaderOptions) {
  const now = options.now ?? Date.now;
  const newsLoader = createSteamNewsLoader(options);
  return {
    async load(games: CommunityGameRef[]): Promise<SteamCommunityResult> {
      const validGames = games.filter((game) => Number.isInteger(game.appId) && game.appId > 0 && game.gameTitle.trim());
      const items: SteamCommunityItem[] = [];
      const failedAppIds: number[] = [];
      let stale = false;
      for (let index = 0; index < validGames.length; index += 4) {
        const batch = validGames.slice(index, index + 4);
        const results = await Promise.all(batch.map(async (game) => {
          try {
            const result = await newsLoader.load(game.appId);
            return { game, result };
          } catch {
            return { game, result: null };
          }
        }));
        for (const { game, result } of results) {
          if (!result) {
            failedAppIds.push(game.appId);
            stale = true;
            continue;
          }
          stale = stale || result.stale;
          items.push(...result.items.map((item) => ({ ...item, appId: game.appId, gameTitle: game.gameTitle })));
        }
      }
      const unique = new Map<string, SteamCommunityItem>();
      for (const item of items) if (!unique.has(item.id)) unique.set(item.id, item);
      return {
        items: [...unique.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
        failedAppIds,
        stale,
        fetchedAt: now(),
      };
    },
  };
}
