import { check } from '@tauri-apps/plugin-updater';
import { getDesktopBridge } from './bridge';

export interface UpdateCheckResult {
  available: boolean;
  version?: string;
  body?: string;
  error?: string;
}

export async function checkForAppUpdates(): Promise<UpdateCheckResult> {
  if (!getDesktopBridge().isNative) {
    return { available: false };
  }
  try {
    const update = await check();
    if (update?.available) {
      return {
        available: true,
        version: update.version,
        body: update.body,
      };
    }
    return { available: false };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { available: false, error: msg };
  }
}

export async function installAppUpdate(): Promise<void> {
  if (!getDesktopBridge().isNative) return;
  const update = await check();
  if (update?.available) {
    await update.downloadAndInstall();
  }
}
