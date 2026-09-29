import { describe, expect, it } from 'vitest';
import { libraryGames } from '../../src/data/library';

describe('production library boundary', () => {
  it('starts empty until a real provider supplies games', () => {
    expect(libraryGames).toEqual([]);
  });
});
