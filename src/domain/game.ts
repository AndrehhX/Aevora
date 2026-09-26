import type { GameProviderEntry, ProviderId } from './provider';

// ONE canonical game model. The UI consumes UnifiedGame — never
// provider-specific variants. Provider data lives under `providers`.
export interface UnifiedGame {
  /** Aevora canonical id. Never a provider external id. */
  id: string;
  title: string;
  /** Hero fallback wordmark, e.g. "ELDEN RING". Defaults to title. */
  displayTitle?: string;
  /** Small status line (sidebar subtitle, hero subline). */
  subtitle?: string;
  /** CTA pill text. Defaults to "Available now". */
  highlight?: string;
  description?: string;
  artwork: {
    cover: string;
    coverFallback: string;
    hero: string;
    heroFallback: string;
    /** Transparent logo/wordmark. Preferred over title in hero. */
    logo?: string;
  };
  branding?: {
    logoMaxWidth?: number;
    logoScale?: number;
    logoPosition?: 'left' | 'center';
  };
  providers: GameProviderEntry[];
  metadata?: {
    developer?: string;
    publisher?: string;
    releaseDate?: string;
    genres?: string[];
  };
  /** subtle "r,g,b" ambience tint */
  ambient?: string;
}

export type { ProviderId };
