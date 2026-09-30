import { useEffect, useRef } from 'react';

export function useProfileSyncGate(open: boolean, sync: () => void | Promise<void>): void {
  const attempted = useRef(false);
  useEffect(() => {
    if (!open) {
      attempted.current = false;
      return;
    }
    if (attempted.current) return;
    attempted.current = true;
    void sync();
  }, [open, sync]);
}
