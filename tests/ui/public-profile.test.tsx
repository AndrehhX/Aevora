// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PublicProfileView from '../../src/components/PublicProfileView';
import { PROFILE_ITEMS, createDefaultProfile } from '../../src/domain/profile';

const baseProps = {
  profile: {
    ...createDefaultProfile(),
    name: 'Andreh',
    bio: 'Building useful interfaces.',
    points: 120,
    unlockedItems: ['frame-lilac', 'badge-builder'],
    equipped: { frame: 'frame-lilac' as const, badge: 'badge-builder' as const },
  },
  achievements: [{ appId: 570, apiName: 'first', name: 'First Blood', description: 'First win', unlockedAt: 1700000000 }],
  library: [],
  favorites: [],
  items: PROFILE_ITEMS,
  syncing: false,
  syncError: null,
  onChange: vi.fn(),
  onSelectGame: vi.fn(),
  onOpenStore: vi.fn(),
  onModeChange: vi.fn(),
};

describe('PublicProfileView', () => {
  afterEach(cleanup);

  it('shows equipped cosmetics and hides editing in visitor mode', () => {
    render(<PublicProfileView {...baseProps} mode="visitor" />);

    expect(screen.getByRole('heading', { name: 'Andreh' })).toBeTruthy();
    expect(screen.getByText('120 pts')).toBeTruthy();
    expect(screen.getByText('Builder badge')).toBeTruthy();
    expect(screen.getByText('First Blood')).toBeTruthy();
    expect(screen.queryByLabelText('Display name')).toBeNull();
  });

  it('shows owner editing and opens the separate Aevora shop', () => {
    const onOpenStore = vi.fn();
    render(<PublicProfileView {...baseProps} mode="owner" onOpenStore={onOpenStore} />);

    expect(screen.getByLabelText('Display name')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open Aevora Shop' }));
    expect(onOpenStore).toHaveBeenCalledTimes(1);
  });
});
