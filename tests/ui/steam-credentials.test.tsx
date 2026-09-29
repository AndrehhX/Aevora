// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProviderConnectPanel from '../../src/components/ProviderConnectPanel';

describe('Steam setup panel', () => {
  afterEach(() => cleanup());

  it('keeps the API key masked and saves the local setup values', async () => {
    const onSaveCredentials = vi.fn().mockResolvedValue(undefined);
    render(
      <ProviderConnectPanel
        connection={{ status: 'disconnected' }}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        onSaveCredentials={onSaveCredentials}
        nativeAvailable
      />
    );

    const key = screen.getByLabelText('Steam Web API key');
    expect(key.getAttribute('type')).toBe('password');
    fireEvent.change(screen.getByLabelText('SteamID64 or vanity URL'), { target: { value: 'andreh' } });
    fireEvent.change(key, { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Steam setup' }));

    await waitFor(() => expect(onSaveCredentials).toHaveBeenCalledWith({ account: 'andreh', apiKey: 'secret' }));
  });

  it('does not pretend browser preview can save a Steam setup', () => {
    render(
      <ProviderConnectPanel
        connection={{ status: 'disconnected' }}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        onSaveCredentials={vi.fn()}
        nativeAvailable={false}
      />
    );

    expect(screen.getByText('Open the Tauri desktop app to configure Steam locally.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save Steam setup' })).toHaveProperty('disabled', true);
  });
});
