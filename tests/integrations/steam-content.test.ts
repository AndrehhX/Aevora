import { describe, expect, it } from 'vitest';
import { createMemoryCacheStore } from '../../src/integrations/cache/cacheStore';
import { resolveSteamAssets } from '../../src/integrations/steam/steamAssets';
import { createSteamNewsLoader, normalizeSteamNews, type SteamNewsResponse } from '../../src/integrations/steam/steamNews';

describe('Steam content normalization', () => {
  it('derives artwork from a complete Steam app-details response', () => {
    const assets = resolveSteamAssets({
      appid: 570,
      name: 'Dota 2',
      header_image: 'https://cdn.test/header.jpg',
      capsule_image: 'https://cdn.test/capsule.jpg',
      background: 'https://cdn.test/background.jpg',
      logo: 'https://cdn.test/logo.png',
    });

    expect(assets).toEqual({
      cover: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/570/library_600x900_2x.jpg',
      coverFallback: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/570/library_600x900.jpg',
      coverFallback2: 'https://cdn.test/header.jpg',
      hero: 'https://cdn.test/background.jpg',
      heroFallback: 'https://cdn.test/header.jpg',
      logo: 'https://cdn.test/logo.png',
    });
  });

  it('uses the official app logo path and creates a CDN fallback for missing background', () => {
    const assets = resolveSteamAssets({ appid: 730, name: 'Counter-Strike 2', header_image: 'https://cdn.test/header.jpg' });

    expect(assets.logo).toBe('https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/logo.png');
    expect(assets.cover).toBe('https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/library_600x900_2x.jpg');
    expect(assets.coverFallback).toBe('https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/library_600x900.jpg');
    expect(assets.coverFallback2).toBe('https://cdn.test/header.jpg');
    expect(assets.hero).toContain('/730/library_hero.jpg');
    expect(assets.heroFallback).toBe('https://cdn.test/header.jpg');
  });

  it('filters malformed news and normalizes publication dates and links', () => {
    const payload: SteamNewsResponse = {
      appnews: {
        newsitems: [
          { gid: '1', title: 'Patch notes', url: 'https://steam.test/1', date: 1700000000, contents: 'Details' },
          { gid: '2', title: '', url: 'https://steam.test/2', date: 1700000000, contents: 'Ignore me' },
          { gid: '3', title: 'No link', date: 1700000000, contents: 'Ignore me' },
        ],
      },
    };

    expect(normalizeSteamNews(payload)).toEqual([
      {
        id: '1',
        title: 'Patch notes',
        url: 'https://steam.test/1',
        contents: 'Details',
        publishedAt: '2023-11-14T22:13:20.000Z',
        stale: false,
      },
    ]);
  });

  it('marks cached news stale when the live request fails', async () => {
    let now = 1000;
    const cache = createMemoryCacheStore(() => now);
    const live: SteamNewsResponse = { appnews: { newsitems: [{ gid: '1', title: 'Live', url: 'https://steam.test/1', date: 1000 }] } };
    const first = createSteamNewsLoader({
      cache,
      now: () => now,
      ttlMs: 100,
      client: { getNews: async () => live },
    });
    await expect(first.load(570)).resolves.toMatchObject({ stale: false, items: [{ title: 'Live' }] });

    now = 5000;
    const offline = createSteamNewsLoader({
      cache,
      now: () => now,
      ttlMs: 100,
      client: { getNews: async () => { throw new Error('offline'); } },
    });
    await expect(offline.load(570)).resolves.toMatchObject({ stale: true, items: [{ title: 'Live' }] });
  });
});
