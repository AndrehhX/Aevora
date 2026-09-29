import { describe, expect, it } from 'vitest';
import type { DesktopBridge } from '../../src/integrations/desktop/bridge';
import type { GameProviderEntry } from '../../src/domain/provider';
import { launchGame, openStore } from '../../src/integrations/steam/steamLaunch';

const steamEntry: GameProviderEntry = {
  provider: 'steam',
  externalId: '570',
  owned: true,
  installed: true,
};

function bridgeWith(response: unknown = { status: 'started' }): DesktopBridge {
  return {
    isNative: true,
    invoke: async () => response,
  };
}

describe('Steam launch adapter', () => {
  it('launches a valid Steam AppID through the native bridge', async () => {
    const bridge = bridgeWith();

    await expect(launchGame(steamEntry, bridge)).resolves.toMatchObject({ status: 'started', appId: '570' });
  });

  it('rejects a missing AppID as unsupported', async () => {
    await expect(launchGame({ ...steamEntry, externalId: '' }, bridgeWith())).resolves.toMatchObject({ status: 'unsupported' });
  });

  it('reports a missing native client without claiming the game started', async () => {
    await expect(launchGame(steamEntry, { isNative: false, invoke: async () => ({ status: 'started' }) })).resolves.toMatchObject({ status: 'missing-client' });
  });

  it('reports rejected shell opens as failed', async () => {
    await expect(launchGame(steamEntry, { isNative: true, invoke: async () => { throw new Error('blocked'); } })).resolves.toMatchObject({ status: 'failed' });
  });

  it('keeps store navigation distinct from game launch', async () => {
    const calls: string[] = [];
    const bridge: DesktopBridge = {
      isNative: true,
      invoke: async (command) => {
        calls.push(command);
        return { status: 'started' };
      },
    };

    await expect(openStore(steamEntry, bridge)).resolves.toMatchObject({ status: 'started', appId: '570' });
    expect(calls).toEqual(['steam_open_store']);
  });
});
