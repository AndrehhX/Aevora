// Central motion tokens. Do not invent ad-hoc durations elsewhere.

export const DURATION = {
  micro: 0.14,
  fast: 0.2,
  normal: 0.26,
  cinematic: 0.45,
} as const;

export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  soft: [0.25, 0.8, 0.25, 1] as const,
  premium: [0.16, 1, 0.3, 1] as const,
};

export const SPRING = {
  snappy: { type: 'spring', stiffness: 450, damping: 32 },
  soft: { type: 'spring', stiffness: 320, damping: 26 },
  cinematic: { type: 'spring', stiffness: 180, damping: 24 },
} as const;

export const HERO_CROSSFADE = 0.38;
export const CARD_STAGGER = 0.03;

export function reducedMotionTransition(reduced: boolean) {
  return reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE.out };
}
