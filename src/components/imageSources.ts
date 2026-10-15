export function getImageCandidates(src: string, fallback: string, fallback2?: string, ...extras: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  return [src, fallback, fallback2, ...extras]
    .map((candidate) => candidate?.trim() ?? '')
    .filter((candidate) => {
      if (!candidate || seen.has(candidate)) return false;
      seen.add(candidate);
      return true;
    });
}
