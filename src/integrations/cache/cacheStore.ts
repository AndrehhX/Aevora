export interface CacheEntry<T> {
  value: T;
  savedAt: number;
  expiresAt: number;
  stale: boolean;
}

export interface CacheStore {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  remove(key: string): Promise<void>;
}

interface SerializedEntry<T> {
  value: T;
  savedAt: number;
  expiresAt: number;
}

function readEntry<T>(raw: string | null, now: () => number): CacheEntry<T> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SerializedEntry<T>>;
    if (typeof parsed.savedAt !== 'number' || typeof parsed.expiresAt !== 'number' || !('value' in parsed)) return null;
    return { value: parsed.value as T, savedAt: parsed.savedAt, expiresAt: parsed.expiresAt, stale: now() >= parsed.expiresAt };
  } catch {
    return null;
  }
}

export function createMemoryCacheStore(now: () => number = Date.now): CacheStore {
  const entries = new Map<string, string>();
  return {
    async get<T>(key: string): Promise<CacheEntry<T> | null> {
      return readEntry<T>(entries.get(key) ?? null, now);
    },
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      const savedAt = now();
      entries.set(key, JSON.stringify({ value, savedAt, expiresAt: savedAt + Math.max(0, ttlMs) } satisfies SerializedEntry<T>));
    },
    async remove(key: string): Promise<void> {
      entries.delete(key);
    },
  };
}

export function createLocalCacheStore(
  storage: Storage | undefined = typeof localStorage === 'undefined' ? undefined : localStorage,
  now: () => number = Date.now,
  prefix = 'aevora:cache:'
): CacheStore {
  const keyFor = (key: string) => `${prefix}${key}`;
  return {
    async get<T>(key: string): Promise<CacheEntry<T> | null> {
      if (!storage) return null;
      return readEntry<T>(storage.getItem(keyFor(key)), now);
    },
    async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
      if (!storage) return;
      const savedAt = now();
      storage.setItem(keyFor(key), JSON.stringify({ value, savedAt, expiresAt: savedAt + Math.max(0, ttlMs) } satisfies SerializedEntry<T>));
    },
    async remove(key: string): Promise<void> {
      storage?.removeItem(keyFor(key));
    },
  };
}
