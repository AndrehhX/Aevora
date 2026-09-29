import { describe, expect, it } from 'vitest';
import { createSteamClient, type SteamConnectionResponse } from '../../src/integrations/steam/steamClient';

describe('Steam live-data client', () => {
  it('keeps API credentials out of every read command', async () => {
    const calls: Array<{ command: string; payload?: Record<string, unknown> }> = [];
    const bridge = {
      isNative: true,
      invoke: async <T>(command: string, payload?: Record<string, unknown>) => {
        calls.push({ command, payload });
        if (command === 'steam_connect') return { status: 'connected', steamId: '76561198000000000' } as T;
        if (command === 'steam_get_owned_games') return [] as T;
        if (command === 'steam_get_app_details') return { appid: 570, name: 'Dota 2' } as T;
        if (command === 'steam_get_news') return { appnews: { newsitems: [] } } as T;
        return undefined as T;
      },
    };
    const client = createSteamClient(bridge);

    await expect(client.connect()).resolves.toMatchObject<SteamConnectionResponse>({ status: 'connected' });
    await client.getOwnedGames();
    await client.getAppDetails(570);
    await client.getNews(570);

    expect(calls).toEqual([
      { command: 'steam_connect', payload: undefined },
      { command: 'steam_get_owned_games', payload: undefined },
      { command: 'steam_get_app_details', payload: { appId: 570 } },
      { command: 'steam_get_news', payload: { appId: 570 } },
    ]);
  });
});
