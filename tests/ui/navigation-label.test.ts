import { describe, expect, it } from 'vitest';
import { navItems } from '../../src/data/navigation';

describe('navigation labels', () => {
  it('uses Release without a stale year in the main navigation', () => {
    expect(navItems).toContain('Release');
    expect(navItems).not.toContain('Early2025');
  });
});
