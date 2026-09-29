import { describe, expect, it } from 'vitest';
import {
  createSteamCredentialClient,
  validateSteamCredentials,
  type SteamCredentialsInput,
} from '../../src/integrations/steam/steamCredentials';

describe('Steam credentials', () => {
  it('rejects blank account or API key before calling the native boundary', () => {
    expect(validateSteamCredentials({ account: '', apiKey: 'key' })).toEqual({
      ok: false,
      message: 'Enter a SteamID64 or vanity identifier.',
    });
    expect(validateSteamCredentials({ account: '76561198000000000', apiKey: ' ' })).toEqual({
      ok: false,
      message: 'Enter a Steam Web API key.',
    });
  });

  it('accepts a SteamID64 or vanity identifier and trims account whitespace', () => {
    const result = validateSteamCredentials({ account: '  andreh  ', apiKey: 'secret' });
    expect(result).toEqual({ ok: true, value: { account: 'andreh', apiKey: 'secret' } });
  });

  it('sends the key only to the local save command and never to status/clear commands', async () => {
    const calls: Array<{ command: string; payload?: Record<string, unknown> }> = [];
    const bridge = {
      isNative: true,
      invoke: async <T>(command: string, payload?: Record<string, unknown>) => {
        calls.push({ command, payload });
        return (command === 'steam_has_credentials' ? false : undefined) as T;
      },
    };
    const client = createSteamCredentialClient(bridge);
    const credentials: SteamCredentialsInput = { account: '76561198000000000', apiKey: 'secret' };

    await client.save(credentials);
    await client.has();
    await client.clear();

    expect(calls).toEqual([
      { command: 'steam_save_credentials', payload: { credentials } },
      { command: 'steam_has_credentials', payload: undefined },
      { command: 'steam_clear_credentials', payload: undefined },
    ]);
  });

  it('reports that browser preview cannot save credentials', async () => {
    const client = createSteamCredentialClient({ isNative: false, invoke: async () => undefined });
    await expect(client.save({ account: 'andreh', apiKey: 'secret' })).rejects.toThrow('desktop runtime');
  });
});
