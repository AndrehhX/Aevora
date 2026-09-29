import { DesktopUnavailableError, getDesktopBridge, type DesktopBridge } from '../desktop/bridge';

export interface SteamCredentialsInput {
  account: string;
  apiKey: string;
}

export type SteamCredentialsValidation =
  | { ok: true; value: SteamCredentialsInput }
  | { ok: false; message: string };

export interface SteamCredentialClient {
  save(credentials: SteamCredentialsInput): Promise<void>;
  has(): Promise<boolean>;
  clear(): Promise<void>;
}

export function validateSteamCredentials(input: SteamCredentialsInput): SteamCredentialsValidation {
  const account = input.account.trim();
  const apiKey = input.apiKey.trim();
  if (!account) return { ok: false, message: 'Enter a SteamID64 or vanity identifier.' };
  if (!apiKey) return { ok: false, message: 'Enter a Steam Web API key.' };
  return { ok: true, value: { account, apiKey } };
}

function requireNative(bridge: DesktopBridge): void {
  if (!bridge.isNative) throw new DesktopUnavailableError('Steam setup requires the Aevora desktop runtime.');
}

export function createSteamCredentialClient(bridge: DesktopBridge = getDesktopBridge()): SteamCredentialClient {
  return {
    async save(credentials) {
      const validated = validateSteamCredentials(credentials);
      if (!validated.ok) throw new Error(validated.message);
      requireNative(bridge);
      await bridge.invoke<void>('steam_save_credentials', { credentials: validated.value });
    },
    async has() {
      requireNative(bridge);
      return bridge.invoke<boolean>('steam_has_credentials');
    },
    async clear() {
      requireNative(bridge);
      await bridge.invoke<void>('steam_clear_credentials');
    },
  };
}
