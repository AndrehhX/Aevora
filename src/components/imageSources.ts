export function getImageCandidates(src: string, fallback: string, fallback2?: string): string[] {
  const seen = new Set<string>();
  return [src, fallback, fallback2]
    .map((candidate) => candidate?.trim() ?? '')
    .filter((candidate) => {
      if (!candidate || seen.has(candidate)) return false;
      seen.add(candidate);
      return true;
    });
}
