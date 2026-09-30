// Central motion tokens. Do not invent ad-hoc durations elsewhere.

export const DURATION = {
  micro: 0.14,
  fast: 0.2,
  normal: 0.26,
  cinematic: 0.45,
} as const;

export const EASE = {
  out: [0.22, 1, 0.36, 1] as const,
  soft: [0.32, 0.72, 0.35, 1] as const,
};

export const SPRING = {
  snappy: { type: 'spring', stiffness: 550, damping: 38 },
  soft: { type: 'spring', stiffness: 380, damping: 28 },
  cinematic: { type: 'spring', stiffness: 160, damping: 26 },
} as const;

export const HERO_CROSSFADE = 0.45;
export const CARD_STAGGER = 0.035;

export function reducedMotionTransition(reduced: boolean) {
  return reduced ? { duration: 0 } : { duration: DURATION.fast, ease: EASE.out };
}
