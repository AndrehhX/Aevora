import type { UnifiedGame } from '../domain/game';

/**
 * Production library state. It starts empty and is populated by provider
 * adapters; fixtures live under `data/fixtures` and are never shown by
 * default.
 */
export let libraryGames: UnifiedGame[] = [];

export function setLibraryGames(games: UnifiedGame[]): void {
  libraryGames = games;
}

export function getLibraryGame(id: string): UnifiedGame | undefined {
  return libraryGames.find((game) => game.id === id);
}

export const carouselIds: string[] = [];
export const storeFeaturedIds: string[] = [];
export const storeDealIds: Array<{ id: string; discount: string }> = [];
export const indieIds: string[] = [];
export const earlyIds: string[] = [];
