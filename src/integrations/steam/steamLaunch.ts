import type { GameProviderEntry } from '../../domain/provider';
import { DesktopUnavailableError, getDesktopBridge, type DesktopBridge } from '../desktop/bridge';

export type LaunchStatus = 'started' | 'missing-client' | 'unsupported' | 'failed';

export interface LaunchResult {
  status: LaunchStatus;
  appId?: string;
  message: string;
}

interface NativeLaunchResponse {
  status?: LaunchStatus;
  message?: string;
}

function appIdFor(entry: GameProviderEntry): string | null {
  if (entry.provider !== 'steam' || !/^\d+$/.test(entry.externalId)) return null;
  return entry.externalId;
}

async function openSteamCommand(entry: GameProviderEntry, command: 'steam_launch_game' | 'steam_open_store', bridge: DesktopBridge): Promise<LaunchResult> {
  const appId = appIdFor(entry);
  if (!appId) return { status: 'unsupported', message: 'This provider entry does not have a valid Steam AppID.' };
  if (!bridge.isNative) return { status: 'missing-client', appId, message: 'The desktop launcher runtime is required to open Steam.' };

  try {
    const response = await bridge.invoke<NativeLaunchResponse>(command, { appId });
    const status = response.status === 'started' || response.status === 'missing-client' || response.status === 'unsupported' || response.status === 'failed' ? response.status : 'failed';
    return { status, appId, message: response.message ?? (status === 'started' ? 'Steam opened successfully.' : 'Steam could not open the requested action.') };
  } catch (error) {
    if (error instanceof DesktopUnavailableError) return { status: 'missing-client', appId, message: 'The desktop launcher runtime is required to open Steam.' };
    return { status: 'failed', appId, message: 'Steam rejected the requested action.' };
  }
}

export function launchGame(entry: GameProviderEntry, bridge: DesktopBridge = getDesktopBridge()): Promise<LaunchResult> {
  return openSteamCommand(entry, 'steam_launch_game', bridge);
}

export function openStore(entry: GameProviderEntry, bridge: DesktopBridge = getDesktopBridge()): Promise<LaunchResult> {
  return openSteamCommand(entry, 'steam_open_store', bridge);
}
