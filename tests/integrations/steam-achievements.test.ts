import { describe, expect, it } from 'vitest';
import { createMemoryCacheStore } from '../../src/integrations/cache/cacheStore';
import { createSteamAchievementsLoader, normalizeSteamAchievements } from '../../src/integrations/steam/steamAchievements';

describe('Steam achievements', () => {
  it('keeps only unlocked achievements and normalizes Steam fields', () => {
    expect(normalizeSteamAchievements(570, {
      playerstats: {
        achievements: [
          { apiname: 'first', achieved: 1, unlocktime: 1700000000, name: 'First', description: 'One' },
          { apiname: 'locked', achieved: 0, unlocktime: 0, name: 'Locked', description: 'Two' },
        ],
      },
    })).toEqual([{
      appId: 570,
      apiName: 'first',
      name: 'First',
      description: 'One',
      unlockedAt: 1700000000,
    }]);
  });

  it('returns cached achievement data when Steam is temporarily unavailable', async () => {
    const cache = createMemoryCacheStore(() => 1000);
    const payload = { playerstats: { achievements: [{ apiname: 'first', achieved: 1, unlocktime: 1700000000, name: 'First' }] } };
    const live = createSteamAchievementsLoader({ cache, client: { getPlayerAchievements: async () => payload }, now: () => 1000, ttlMs: 100 });
    await expect(live.load(570)).resolves.toMatchObject({ stale: false, items: [{ apiName: 'first' }] });

    const offline = createSteamAchievementsLoader({ cache, client: { getPlayerAchievements: async () => { throw new Error('offline'); } }, now: () => 5000, ttlMs: 100 });
    await expect(offline.load(570)).resolves.toMatchObject({ stale: true, items: [{ apiName: 'first' }] });
  });
});
