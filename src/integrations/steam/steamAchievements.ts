import type { CacheStore } from '../cache/cacheStore';
import type { SteamClient } from './steamClient';

export interface SteamAchievementPayload {
  apiname?: string;
  achieved?: number;
  unlocktime?: number;
  name?: string;
  description?: string;
}

export interface SteamPlayerAchievementsResponse {
  playerstats?: { achievements?: unknown[] };
}

export interface SteamAchievement {
  appId: number;
  apiName: string;
  name: string;
  description?: string;
  unlockedAt?: number;
}

export interface SteamAchievementsResult {
  appId: number;
  items: SteamAchievement[];
  stale: boolean;
}

function isPayload(value: unknown): value is SteamAchievementPayload {
  return typeof value === 'object' && value !== null;
}

export function normalizeSteamAchievements(appId: number, payload: SteamPlayerAchievementsResponse): SteamAchievement[] {
  if (!Number.isInteger(appId) || appId <= 0) return [];
  return (payload.playerstats?.achievements ?? []).filter(isPayload).flatMap((item) => {
    if (item.achieved !== 1 || typeof item.apiname !== 'string' || !item.apiname.trim()) return [];
    return [{
      appId,
      apiName: item.apiname.trim(),
      name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : item.apiname.trim(),
      description: typeof item.description === 'string' && item.description.trim() ? item.description.trim() : undefined,
      unlockedAt: typeof item.unlocktime === 'number' && item.unlocktime > 0 ? item.unlocktime : undefined,
    }];
  });
}

export function createSteamAchievementsLoader(options: {
  client: Pick<SteamClient, 'getPlayerAchievements'>;
  cache: CacheStore;
  now?: () => number;
  ttlMs?: number;
}) {
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? 15 * 60 * 1000;
  return {
    async load(appId: number): Promise<SteamAchievementsResult> {
      const cacheKey = `steam:achievements:${appId}`;
      try {
        const payload = await options.client.getPlayerAchievements(appId);
        const result = { appId, items: normalizeSteamAchievements(appId, payload), stale: false };
        await options.cache.set(cacheKey, result, ttlMs);
        return result;
      } catch {
        const cached = await options.cache.get<SteamAchievementsResult>(cacheKey);
        if (cached?.value) return { ...cached.value, stale: true };
        throw new Error('Steam achievements are unavailable for this game.');
      }
    },
  };
}
