import { describe, expect, it } from 'vitest';
import { createMemoryCacheStore } from '../../src/integrations/cache/cacheStore';
import { createSteamCommunityLoader } from '../../src/integrations/steam/steamNews';

describe('Steam Community aggregation', () => {
  it('merges all requested game feeds, removes duplicate gids and orders newest first', async () => {
    const loader = createSteamCommunityLoader({
      cache: createMemoryCacheStore(),
      client: {
        getNews: async (appId) => ({
          appnews: {
            newsitems: appId === 570
              ? [{ gid: 'same', title: 'Dota update', url: 'https://steam.test/dota', date: 1700000000 }]
              : [{ gid: 'same', title: 'Duplicate', url: 'https://steam.test/duplicate', date: 1600000000 }, { gid: 'new', title: 'CS2 update', url: 'https://steam.test/cs2', date: 1800000000 }],
          },
        }),
      },
    });

    await expect(loader.load([{ appId: 570, gameTitle: 'Dota 2' }, { appId: 730, gameTitle: 'Counter-Strike 2' }])).resolves.toMatchObject({
      stale: false,
      failedAppIds: [],
      items: [
        { id: 'new', gameTitle: 'Counter-Strike 2', appId: 730 },
        { id: 'same', gameTitle: 'Dota 2', appId: 570 },
      ],
    });
  });

  it('keeps successful announcements when one game feed fails', async () => {
    const loader = createSteamCommunityLoader({
      cache: createMemoryCacheStore(),
      client: {
        getNews: async (appId) => {
          if (appId === 730) throw new Error('rate limited');
          return { appnews: { newsitems: [{ gid: 'ok', title: 'Working feed', url: 'https://steam.test/ok', date: 1700000000 }] } };
        },
      },
    });

    await expect(loader.load([{ appId: 570, gameTitle: 'Dota 2' }, { appId: 730, gameTitle: 'Counter-Strike 2' }])).resolves.toMatchObject({
      stale: true,
      failedAppIds: [730],
      items: [{ id: 'ok', gameTitle: 'Dota 2' }],
    });
  });
});
