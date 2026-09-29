import { describe, expect, it } from 'vitest';
import type { SteamClient, SteamConnectionResponse, SteamOwnedGame } from '../../src/integrations/steam/steamClient';
import { createMemoryCacheStore } from '../../src/integrations/cache/cacheStore';
import { createSteamAdapter, SteamAdapterError } from '../../src/integrations/steam/steamAdapter';

const ownedGame: SteamOwnedGame = {
  appid: 570,
  name: 'Dota 2',
  playtime_forever: 120,
  img_icon_url: 'icon-hash',
  img_logo_url: 'logo-hash',
};

function clientWith(overrides: Partial<SteamClient> = {}): SteamClient {
  return {
    connect: async (): Promise<SteamConnectionResponse> => ({ status: 'connected', steamId: '76561198000000000', displayName: 'Andreh' }),
    getOwnedGames: async () => [ownedGame],
    getAppDetails: async () => ({ appid: 570, name: 'Dota 2', type: 'game', is_free: true }),
    disconnect: async () => undefined,
    ...overrides,
  };
}

describe('SteamAdapter', () => {
  it('normalizes a connected account and its owned games', async () => {
    const adapter = createSteamAdapter({ client: clientWith(), cache: createMemoryCacheStore() });

    await expect(adapter.connect()).resolves.toMatchObject({ status: 'connected', steamId: '76561198000000000' });
    await expect(adapter.getLibrary()).resolves.toMatchObject([
      {
        id: 'steam:570',
        title: 'Dota 2',
        providers: [{ provider: 'steam', externalId: '570', owned: true, installed: false, playtimeMinutes: 120 }],
      },
    ]);
  });

  it('preserves a canceled connection without treating it as an error', async () => {
    const adapter = createSteamAdapter({
      client: clientWith({ connect: async () => ({ status: 'canceled' }) }),
      cache: createMemoryCacheStore(),
    });

    await expect(adapter.connect()).resolves.toEqual({ status: 'canceled' });
  });

  it('maps expired and rate-limited provider responses to actionable errors', async () => {
    const expired = createSteamAdapter({
      client: clientWith({ connect: async () => ({ status: 'expired' }) }),
      cache: createMemoryCacheStore(),
    });
    const limited = createSteamAdapter({
      client: clientWith({ connect: async () => ({ status: 'rate-limited' }) }),
      cache: createMemoryCacheStore(),
    });

    await expect(expired.connect()).rejects.toMatchObject({ code: 'expired' });
    await expect(limited.connect()).rejects.toMatchObject({ code: 'rate-limited' });
  });

  it('uses a stale cached library when Steam is temporarily offline', async () => {
    let now = 1000;
    const cache = createMemoryCacheStore(() => now);
    const first = createSteamAdapter({ client: clientWith(), cache, now: () => now, libraryTtlMs: 5000 });
    await first.connect();
    await expect(first.getLibrary()).resolves.toHaveLength(1);

    now = 7000;
    const offline = createSteamAdapter({
      client: clientWith({ getOwnedGames: async () => { throw new Error('network unavailable'); } }),
      cache,
      now: () => now,
      libraryTtlMs: 5000,
    });
    await offline.connect();
    await expect(offline.getLibrary()).resolves.toHaveLength(1);
  });

  it('requires an active Steam connection before loading private library data', async () => {
    const adapter = createSteamAdapter({ client: clientWith(), cache: createMemoryCacheStore() });

    await expect(adapter.getLibrary()).rejects.toBeInstanceOf(SteamAdapterError);
    await expect(adapter.getLibrary()).rejects.toMatchObject({ code: 'not-connected' });
  });
});
