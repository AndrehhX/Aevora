import { useEffect, useState } from 'react';

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
  const [failed, setFailed] = useState<'primary' | 'fallback' | 'fallback2' | 'placeholder'>('primary');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setFailed(src ? 'primary' : fallback ? 'fallback' : fallback2 ? 'fallback2' : 'placeholder');
    setLoaded(false);
  }, [src, fallback]);

  if (failed === 'placeholder' || (!src && !fallback)) {
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
  const activeSrc = failed === 'fallback' ? fallback : failed === 'fallback2' ? fallback2 : src;
  return (
    <img
      src={activeSrc}
      alt={alt}
      draggable={false}
      loading={loading}
      decoding="async"
      onError={() => {
        if (failed === 'primary' && fallback && fallback !== src) setFailed('fallback');
        else if (fallback2 && fallback2 !== src && fallback2 !== fallback) setFailed('fallback2');
        else setFailed('placeholder');
      }}
      onLoad={() => setLoaded(true)}
      className={className}
      style={{ ...style, opacity: loaded ? 1 : 0.82, transition: 'opacity 400ms ease' }}
    />
  );
}
