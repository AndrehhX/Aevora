import { describe, expect, it } from 'vitest';
import type { UnifiedGame } from '../../src/domain/game';
import { getHomeStats } from '../../src/domain/home';

function game(id: string, installed: boolean, playtimeMinutes: number): UnifiedGame {
  return {
    id,
    title: id,
    artwork: { cover: '', coverFallback: '', hero: '', heroFallback: '' },
    providers: [{ provider: 'steam', externalId: id, owned: true, installed, playtimeMinutes }],
  };
}

describe('home summary', () => {
  it('summarizes the connected library without inventing catalog entries', () => {
    expect(getHomeStats([
      game('550', true, 120),
      game('322170', false, 45),
    ])).toEqual({
      totalGames: 2,
      installedGames: 1,
      playtimeMinutes: 165,
    });
  });
});
