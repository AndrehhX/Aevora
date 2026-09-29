import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDesktopBridge } from '../../src/integrations/desktop/bridge';

describe('desktop bridge', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('detects the Tauri 2 runtime and forwards commands', async () => {
    const invoke = vi.fn().mockResolvedValue('ok');
    vi.stubGlobal('window', { __TAURI_INTERNALS__: { invoke } });

    const bridge = getDesktopBridge();

    expect(bridge.isNative).toBe(true);
    await expect(bridge.invoke('steam_has_credentials')).resolves.toBe('ok');
    expect(invoke).toHaveBeenCalledWith('steam_has_credentials', undefined);
  });
});
