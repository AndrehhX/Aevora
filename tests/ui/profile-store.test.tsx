// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProfileStoreView from '../../src/views/ProfileStoreView';
import { PROFILE_ITEMS, createDefaultProfile } from '../../src/domain/profile';

describe('ProfileStoreView', () => {
  it('keeps the cosmetics shop separate and routes purchase/equip actions', () => {
    const onPurchase = vi.fn();
    const onEquip = vi.fn();
    const profile = {
      ...createDefaultProfile(),
      points: 150,
      unlockedItems: ['frame-lilac'],
      equipped: {},
    };

    render(<ProfileStoreView profile={profile} items={PROFILE_ITEMS} onPurchase={onPurchase} onEquip={onEquip} onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Aevora Shop' })).toBeTruthy();
    expect(screen.getByText('150 pts')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Buy Nebula background' }));
    fireEvent.click(screen.getByRole('button', { name: 'Equip Lilac frame' }));
    expect(onPurchase).toHaveBeenCalledWith('background-nebula');
    expect(onEquip).toHaveBeenCalledWith('frame-lilac');
  });
});
