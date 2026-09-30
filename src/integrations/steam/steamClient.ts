import { getDesktopBridge, type DesktopBridge } from '../desktop/bridge';
import type { SteamNewsResponse } from './steamNews';

export type SteamConnectionStatus = 'connected' | 'canceled' | 'expired' | 'rate-limited' | 'offline';

export interface SteamConnectionResponse {
  status: SteamConnectionStatus;
  steamId?: string;
  displayName?: string;
  expiresAt?: string;
}

export interface SteamOwnedGame {
  appid: number;
  name: string;
  playtime_forever?: number;
  rtime_last_played?: number;
  img_icon_url?: string;
  img_logo_url?: string;
  installed?: boolean;
  installPath?: string;
}

export interface SteamAppDetails {
  appid: number;
  name: string;
  type?: string;
  is_free?: boolean;
  short_description?: string;
  header_image?: string;
  background?: string;
  background_raw?: string;
  capsule_image?: string;
  logo?: string;
  developers?: string[];
  publishers?: string[];
  release_date?: { coming_soon?: boolean; date?: string };
  genres?: Array<{ id?: string; description?: string }>;
}

export interface SteamClient {
  connect(): Promise<SteamConnectionResponse>;
  getOwnedGames(): Promise<SteamOwnedGame[]>;
  getAppDetails(appId: number): Promise<SteamAppDetails>;
  getNews(appId: number): Promise<SteamNewsResponse>;
  disconnect(): Promise<void>;
}

export function createSteamClient(bridge: DesktopBridge = getDesktopBridge()): SteamClient {
  return {
    connect: () => bridge.invoke<SteamConnectionResponse>('steam_connect'),
    getOwnedGames: () => bridge.invoke<SteamOwnedGame[]>('steam_get_owned_games'),
    getAppDetails: (appId) => bridge.invoke<SteamAppDetails>('steam_get_app_details', { appId }),
    getNews: (appId) => bridge.invoke<SteamNewsResponse>('steam_get_news', { appId }),
    disconnect: () => bridge.invoke<void>('steam_disconnect'),
  };
}
