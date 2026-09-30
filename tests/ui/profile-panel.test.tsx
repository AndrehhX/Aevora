// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProfilePanel from '../../src/components/ProfilePanel';
import { PROFILE_ITEMS, createDefaultProfile } from '../../src/domain/profile';

describe('ProfilePanel', () => {
  it('shows editable local identity, points and the profile shop', () => {
    const profile = { ...createDefaultProfile(), points: 100 };
    const onChange = vi.fn();
    const onPurchase = vi.fn();
    const item = PROFILE_ITEMS.find((candidate) => candidate.id === 'frame-lilac');
    if (!item) throw new Error('test item missing');

    render(
      <ProfilePanel
        open
        profile={profile}
        achievements={[{ appId: 570, apiName: 'first', name: 'First Blood', description: 'One', unlockedAt: 1700000000 }]}
        items={PROFILE_ITEMS}
        syncing={false}
        syncError={null}
        onChange={onChange}
        onPurchase={onPurchase}
        onEquip={vi.fn()}
        onSelectGame={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Andreh')).toBeTruthy();
    expect(screen.getByText('100 pts')).toBeTruthy();
    expect(screen.getByText('First Blood')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: `Buy ${item.name}` }));
    expect(onPurchase).toHaveBeenCalledWith(item.id);
  });
});
