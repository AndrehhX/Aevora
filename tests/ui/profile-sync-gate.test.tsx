// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProfileSyncGate } from '../../src/hooks/useProfileSyncGate';

function Harness({ open, sync }: { open: boolean; sync: () => void }) {
  useProfileSyncGate(open, sync);
  return null;
}

describe('profile sync gate', () => {
  it('starts once per profile opening even when the callback identity changes', () => {
    const sync = vi.fn();
    const { rerender } = render(<Harness open sync={sync} />);

    expect(sync).toHaveBeenCalledTimes(1);
    rerender(<Harness open sync={() => sync()} />);
    expect(sync).toHaveBeenCalledTimes(1);
    rerender(<Harness open={false} sync={sync} />);
    rerender(<Harness open sync={sync} />);
    expect(sync).toHaveBeenCalledTimes(2);
  });
});
