import { useEffect, useState } from 'react';

function getReducedMotionQuery() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)');
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => getReducedMotionQuery()?.matches ?? false);
  useEffect(() => {
    const mq = getReducedMotionQuery();
    if (!mq) return;

    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}
