import type { CacheStore } from '../cache/cacheStore';
import type { SteamClient } from './steamClient';

export type SteamStoreCategory = 'featured' | 'top-sellers' | 'specials';

export interface SteamStoreRawItem {
  id?: number;
  name?: string;
  header_image?: string;
  large_capsule_image?: string;
  small_capsule_image?: string;
  discount_percent?: number;
  original_price?: number;
  final_price?: number;
  currency?: string;
}

export interface SteamStoreCategoriesPayload {
  featured_win?: { items?: SteamStoreRawItem[] };
  top_sellers?: { items?: SteamStoreRawItem[] };
  specials?: { items?: SteamStoreRawItem[] };
}

export interface SteamStoreOffer {
  appId: number;
  name: string;
  headerImage?: string;
  capsuleImage?: string;
  price?: string;
  originalPrice?: string;
  discountPercent?: number;
  storeUrl: string;
  category: SteamStoreCategory;
}

export interface SteamStoreCategories {
  featured: SteamStoreOffer[];
  topSellers: SteamStoreOffer[];
  specials: SteamStoreOffer[];
  stale: boolean;
  fetchedAt?: number;
}

const STORE_TTL_MS = 15 * 60 * 1000;

function priceLabel(cents: unknown, currency: unknown): string | undefined {
  if (typeof cents !== 'number' || !Number.isFinite(cents) || cents < 0) return undefined;
  if (cents === 0) return 'Free';
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'GTQ' ? 'Q' : '$';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

function normalizeOffer(raw: SteamStoreRawItem, category: SteamStoreCategory): SteamStoreOffer | null {
  if (!Number.isInteger(raw.id) || (raw.id ?? 0) <= 0 || typeof raw.name !== 'string' || !raw.name.trim()) return null;
  const discount = typeof raw.discount_percent === 'number' && Number.isFinite(raw.discount_percent)
    ? Math.max(0, Math.min(100, Math.round(raw.discount_percent)))
    : undefined;
  return {
    appId: raw.id as number,
    name: raw.name.trim(),
    headerImage: typeof raw.header_image === 'string' && raw.header_image.trim() ? raw.header_image : undefined,
    capsuleImage: (typeof raw.large_capsule_image === 'string' && raw.large_capsule_image.trim() ? raw.large_capsule_image : undefined)
      ?? (typeof raw.small_capsule_image === 'string' && raw.small_capsule_image.trim() ? raw.small_capsule_image : undefined),
    price: priceLabel(raw.final_price, raw.currency),
    originalPrice: priceLabel(raw.original_price, raw.currency),
    discountPercent: discount && discount > 0 ? discount : undefined,
    storeUrl: `https://store.steampowered.com/app/${raw.id}/`,
    category,
  };
}

function normalizeSection(section: { items?: SteamStoreRawItem[] } | undefined, category: SteamStoreCategory): SteamStoreOffer[] {
  return (section?.items ?? []).flatMap((item) => {
    const normalized = normalizeOffer(item, category);
    return normalized ? [normalized] : [];
  });
}

export function normalizeSteamStoreCategories(payload: SteamStoreCategoriesPayload, stale = false, fetchedAt?: number): SteamStoreCategories {
  return {
    featured: normalizeSection(payload.featured_win, 'featured'),
    topSellers: normalizeSection(payload.top_sellers, 'top-sellers'),
    specials: normalizeSection(payload.specials, 'specials'),
    stale,
    fetchedAt,
  };
}

export function createSteamStoreLoader(options: {
  client: Pick<SteamClient, 'getStoreCategories'>;
  cache: CacheStore;
  now?: () => number;
  ttlMs?: number;
}) {
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? STORE_TTL_MS;
  return {
    async load(): Promise<SteamStoreCategories> {
      const cacheKey = 'steam:store:categories';
      try {
        const payload = await options.client.getStoreCategories();
        const result = normalizeSteamStoreCategories(payload, false, now());
        await options.cache.set(cacheKey, result, ttlMs);
        return result;
      } catch {
        const cached = await options.cache.get<SteamStoreCategories>(cacheKey);
        if (cached?.value) return { ...cached.value, stale: true };
        throw new Error('Steam store offers are unavailable right now.');
      }
    },
  };
}
