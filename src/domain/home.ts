import type { UnifiedGame } from './game';
import { getInstalledGames, getTotalPlaytimeMinutes } from './library';

export interface HomeStats {
  totalGames: number;
  installedGames: number;
  playtimeMinutes: number;
}

export function getHomeStats(library: UnifiedGame[]): HomeStats {
  return {
    totalGames: library.length,
    installedGames: getInstalledGames(library).length,
    playtimeMinutes: library.reduce((total, game) => total + getTotalPlaytimeMinutes(game), 0),
  };
}
