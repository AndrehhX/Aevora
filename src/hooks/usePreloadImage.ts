const resolved = new Map<string, string>();

// Resolve to a usable src: primary candidate, falling back through subsequent sources on error.
// Results are cached so rapid game switching never refetches.
export function preloadImage(primary: string, fallback?: string, ...additionalFallbacks: (string | undefined)[]): Promise<string> {
  const candidates = [primary, fallback, ...additionalFallbacks]
    .map((s) => s?.trim() ?? '')
    .filter((s) => s.length > 0);

  if (candidates.length === 0) {
    return Promise.reject(new Error('no candidates'));
  }

  const key = candidates.join('|');
  const hit = resolved.get(key);
  if (hit) return Promise.resolve(hit);

  const load = (src: string) =>
    new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`failed: ${src}`));
      img.src = src;
    });

  let promise = load(candidates[0]);
  for (let i = 1; i < candidates.length; i++) {
    const next = candidates[i];
    promise = promise.catch(() => load(next));
  }

  return promise.then((src) => {
    resolved.set(key, src);
    return src;
  });
}

