import { describe, expect, it } from 'vitest';
import { createMemoryCacheStore } from '../../src/integrations/cache/cacheStore';
import {
  createSteamStoreLoader,
  normalizeSteamStoreCategories,
  type SteamStoreCategoriesPayload,
} from '../../src/integrations/steam/steamStore';

const payload: SteamStoreCategoriesPayload = {
  featured_win: {
    items: [
      {
        id: 570,
        name: 'Dota 2',
        large_capsule_image: 'https://cdn.test/dota-large.jpg',
        header_image: 'https://cdn.test/dota-header.jpg',
        discount_percent: 0,
        final_price: 0,
        currency: 'USD',
      },
    ],
  },
  top_sellers: {
    items: [{ id: 730, name: 'Counter-Strike 2', header_image: 'https://cdn.test/cs2.jpg' }],
  },
  specials: {
    items: [
      {
        id: 440,
        name: 'Team Fortress 2',
        small_capsule_image: 'https://cdn.test/tf2.jpg',
        discount_percent: 75,
        original_price: 799,
        final_price: 199,
        currency: 'USD',
      },
      { id: 0, name: '' },
    ],
  },
};

describe('Steam Store normalization', () => {
  it('maps real featured, top-seller and special items without fixture ids', () => {
    const result = normalizeSteamStoreCategories(payload);

    expect(result.featured[0]).toMatchObject({
      appId: 570,
      name: 'Dota 2',
      capsuleImage: 'https://cdn.test/dota-large.jpg',
      price: 'Free',
      storeUrl: 'https://store.steampowered.com/app/570/',
      category: 'featured',
    });
    expect(result.topSellers[0].category).toBe('top-sellers');
    expect(result.specials).toEqual([
      expect.objectContaining({
        appId: 440,
        discountPercent: 75,
        price: '$1.99',
        originalPrice: '$7.99',
        capsuleImage: 'https://cdn.test/tf2.jpg',
        category: 'specials',
      }),
    ]);
  });

  it('serves cached offers as stale data when the public store is unavailable', async () => {
    const cache = createMemoryCacheStore(() => 1000);
    const live = createSteamStoreLoader({ cache, client: { getStoreCategories: async () => payload }, now: () => 1000, ttlMs: 100 });
    await expect(live.load()).resolves.toMatchObject({ stale: false, specials: [{ appId: 440 }] });

    const offline = createSteamStoreLoader({ cache, client: { getStoreCategories: async () => { throw new Error('offline'); } }, now: () => 5000, ttlMs: 100 });
    await expect(offline.load()).resolves.toMatchObject({ stale: true, specials: [{ appId: 440 }] });
  });
});
