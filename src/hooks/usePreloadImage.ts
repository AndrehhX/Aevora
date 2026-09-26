const resolved = new Map<string, string>();

// Resolve to a usable src: primary hero, falling back on error.
// Results are cached so rapid game switching never refetches.
export function preloadImage(primary: string, fallback: string): Promise<string> {
  const key = `${primary}|${fallback}`;
  const hit = resolved.get(key);
  if (hit) return Promise.resolve(hit);
  const load = (src: string) =>
    new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`failed: ${src}`));
      img.src = src;
    });
  return load(primary)
    .catch(() => load(fallback))
    .then((src) => {
      resolved.set(key, src);
      return src;
    });
}
