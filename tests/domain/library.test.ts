import { describe, expect, it } from 'vitest';
import {
  formatLastPlayed,
  formatPlaytime,
  getPreferredProvider,
  getRecentlyPlayedGames,
  isInstalled,
  isOwned,
  getOwnedGames,
} from '../../src/domain/library';
import type { UnifiedGame } from '../../src/domain/game';

function game(overrides: Partial<UnifiedGame> = {}): UnifiedGame {
  return {
    id: 'game-1',
    title: 'Game One',
    artwork: { cover: '', coverFallback: '', hero: '', heroFallback: '' },
    providers: [{ provider: 'steam', externalId: '10', owned: true, installed: true, playtimeMinutes: 90 }],
    ...overrides,
  };
}

describe('library selectors', () => {
  it('derives ownership and installation from provider entries', () => {
    expect(isOwned(game())).toBe(true);
    expect(isInstalled(game())).toBe(true);
    expect(isOwned(game({ providers: [{ provider: 'steam', externalId: '10', owned: false, installed: false }] }))).toBe(false);
  });

  it('keeps owned but not installed games visible in the full library', () => {
    const installed = game({ id: 'installed' });
    const ownedOnly = game({
      id: 'owned-only',
      providers: [{ provider: 'steam', externalId: '20', owned: true, installed: false }],
    });

    expect(getOwnedGames([installed, ownedOnly]).map((item) => item.id)).toEqual(['installed', 'owned-only']);
  });

  it('prefers the requested installed provider and falls back safely', () => {
    const current = game({
      providers: [
        { provider: 'steam', externalId: '10', owned: true, installed: true },
        { provider: 'epic', externalId: 'epic-10', owned: true, installed: true },
      ],
    });
    expect(getPreferredProvider(current, 'epic')?.provider).toBe('epic');
    expect(getPreferredProvider(current, 'gog')?.provider).toBe('steam');
  });

  it('sorts recently played games by the newest provider or session timestamp', () => {
    const older = game({ id: 'older', providers: [{ provider: 'steam', externalId: '1', owned: true, installed: true, lastPlayed: '2026-09-20T10:00:00Z' }] });
    const newer = game({ id: 'newer', providers: [{ provider: 'steam', externalId: '2', owned: true, installed: true, lastPlayed: '2026-09-21T10:00:00Z' }] });
    expect(getRecentlyPlayedGames([older, newer], { older: 0, newer: Date.parse('2026-09-22T10:00:00Z') }).map((item) => item.id)).toEqual(['newer', 'older']);
  });

  it('formats playtime and missing dates without fake values', () => {
    expect(formatPlaytime(90)).toBe('1h 30m');
    expect(formatLastPlayed(undefined)).toBe('Never');
  });
});
