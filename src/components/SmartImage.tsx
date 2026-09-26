import { useState } from 'react';

export function SmartImage({
  src,
  fallback,
  alt,
  className,
  style,
}: {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!src) {
    return (
      <div
        className={className}
        style={{
          ...style,
          background: 'linear-gradient(135deg,#b565ff 0%,#e5489b 50%,#5b21b6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.1em',
          color: 'white',
        }}
      >
        P
      </div>
    );
  }
  return (
    <img
      src={err || !src ? fallback : src}
      alt={alt}
      draggable={false}
      onError={() => setErr(true)}
      onLoad={() => setLoaded(true)}
      className={className}
      style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 400ms ease' }}
    />
  );
}
