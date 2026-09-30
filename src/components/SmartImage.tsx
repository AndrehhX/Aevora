import { useEffect, useMemo, useState } from 'react';
import { getImageCandidates } from './imageSources';

export function SmartImage({
  src,
  fallback,
  fallback2,
  alt,
  className,
  style,
  loading = 'lazy',
}: {
  src: string;
  fallback: string;
  fallback2?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
}) {
  const candidates = useMemo(() => getImageCandidates(src, fallback, fallback2), [src, fallback, fallback2]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setCandidateIndex(0);
    setLoaded(false);
  }, [candidates]);

  if (candidateIndex >= candidates.length) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{
          ...style,
          background: 'linear-gradient(135deg,#4A3560 0%,#8263A1 50%,#17101F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.1em',
          color: 'rgba(241,234,248,0.82)',
        }}
      >
        {alt.trim().charAt(0).toUpperCase() || '?'}
      </div>
    );
  }
  const activeSrc = candidates[candidateIndex];
  return (
    <img
      src={activeSrc}
      alt={alt}
      draggable={false}
      loading={loading}
      decoding="async"
      onError={() => {
        setLoaded(false);
        setCandidateIndex((current) => current + 1);
      }}
      onLoad={() => setLoaded(true)}
      className={className}
      style={{ ...style, opacity: loaded ? 1 : 0.82, transition: 'opacity 400ms ease' }}
    />
  );
}
