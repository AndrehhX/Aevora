import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_STATE, loadState } from '../../src/domain/storage';

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
  removeItem: (key: string) => values.delete(key),
  clear: () => values.clear(),
  key: (_index: number) => null,
  length: 0,
} as Storage;

beforeEach(() => {
  values.clear();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
});

describe('versioned local state', () => {
  it('returns safe defaults when persisted JSON is malformed', () => {
    values.set('aevora:state:v1', '{bad json');
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it('merges valid versioned preferences with defaults', () => {
    values.set('aevora:state:v1', JSON.stringify({ version: 1, prefs: { reduceMotion: true }, favorites: ['cyberpunk'] }));
    const state = loadState();
    expect(state.prefs.reduceMotion).toBe(true);
    expect(state.prefs.cursor).toBe(DEFAULT_STATE.prefs.cursor);
    expect(state.favorites).toEqual(['cyberpunk']);
  });
});
