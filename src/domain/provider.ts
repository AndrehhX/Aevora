// Canonical provider identities. The UI must not branch on raw provider
// strings elsewhere — use providerDefinitions + library selectors instead.

export type ProviderId =
  | 'steam'
  | 'epic'
  | 'gog'
  | 'ea'
  | 'ubisoft'
  | 'xbox'
  | 'battle-net'
  | 'riot'
  | 'local';

export interface GameProviderEntry {
  provider: ProviderId;
  /** Provider-side identifier (e.g. Steam AppID). Never the Aevora game id. */
  externalId: string;
  owned: boolean;
  installed: boolean;
  installPath?: string;
  launchUri?: string;
  installUri?: string;
  /** Minutes played on this provider. */
  playtimeMinutes?: number;
  /** ISO timestamp of last session on this provider. */
  lastPlayed?: string;
  version?: string;
}

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  short: string;
}

export const providerDefinitions: Record<ProviderId, ProviderDefinition> = {
  steam: { id: 'steam', name: 'Steam', short: 'Steam' },
  epic: { id: 'epic', name: 'Epic Games', short: 'Epic' },
  gog: { id: 'gog', name: 'GOG', short: 'GOG' },
  ea: { id: 'ea', name: 'EA App', short: 'EA' },
  ubisoft: { id: 'ubisoft', name: 'Ubisoft Connect', short: 'Ubisoft' },
  xbox: { id: 'xbox', name: 'Xbox', short: 'Xbox' },
  'battle-net': { id: 'battle-net', name: 'Battle.net', short: 'BNet' },
  riot: { id: 'riot', name: 'Riot Client', short: 'Riot' },
  local: { id: 'local', name: 'Local', short: 'Local' },
};

export function providerName(id: ProviderId): string {
  return providerDefinitions[id]?.name ?? id;
}
