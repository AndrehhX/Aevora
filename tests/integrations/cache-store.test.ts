import { describe, expect, it } from 'vitest';
import { createLocalCacheStore, createMemoryCacheStore } from '../../src/integrations/cache/cacheStore';

describe('cache store', () => {
  it('returns a fresh cache hit before its TTL expires', async () => {
    let now = 1000;
    const cache = createMemoryCacheStore(() => now);
    await cache.set('library', { count: 2 }, 5000);

    expect(await cache.get<{ count: number }>('library')).toMatchObject({ value: { count: 2 }, stale: false });
    now = 5999;
    expect((await cache.get('library'))?.stale).toBe(false);
  });

  it('returns expired data as stale for offline fallback', async () => {
    let now = 1000;
    const cache = createMemoryCacheStore(() => now);
    await cache.set('news', ['cached'], 1000);
    now = 2001;

    expect(await cache.get<string[]>('news')).toMatchObject({ value: ['cached'], stale: true });
  });

  it('ignores corrupt local entries instead of throwing', async () => {
    const values = new Map([['aevora:cache:library', '{bad json']]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
      key: () => null,
      length: 1,
    } as Storage;

    const cache = createLocalCacheStore(storage, () => 1000);
    await expect(cache.get('library')).resolves.toBeNull();
  });
});
