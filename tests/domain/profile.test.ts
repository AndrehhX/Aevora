import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROFILE,
  PROFILE_ITEMS,
  createDefaultProfile,
  mergeAchievements,
  normalizeProfile,
  purchaseProfileItem,
  type ProfileAchievement,
} from '../../src/domain/profile';

const firstAchievement: ProfileAchievement = {
  appId: 570,
  apiName: 'first_blood',
  name: 'First Blood',
  description: 'Unlock the first achievement.',
  unlockedAt: 1700000000,
};

describe('local profile economy', () => {
  it('awards points once for a newly unlocked Steam achievement', () => {
    const first = mergeAchievements(createDefaultProfile(), [firstAchievement]);
    const second = mergeAchievements(first.profile, [firstAchievement]);

    expect(first.newlyUnlocked).toHaveLength(1);
    expect(first.profile.points).toBe(DEFAULT_PROFILE.points + 25);
    expect(second.newlyUnlocked).toHaveLength(0);
    expect(second.profile.points).toBe(first.profile.points);
  });

  it('purchases an item once and never allows a repeated purchase to charge again', () => {
    const item = PROFILE_ITEMS.find((candidate) => candidate.id === 'frame-lilac');
    if (!item) throw new Error('test item missing');
    const profile = { ...createDefaultProfile(), points: item.price + 25 };

    const first = purchaseProfileItem(profile, item.id);
    const second = purchaseProfileItem(first.profile, item.id);

    expect(first.ok).toBe(true);
    expect(first.profile.points).toBe(25);
    expect(first.profile.unlockedItems).toEqual([item.id]);
    expect(second.ok).toBe(true);
    expect(second.profile.points).toBe(25);
    expect(second.profile.unlockedItems).toEqual([item.id]);
  });

  it('rejects an unaffordable item without changing the profile', () => {
    const item = PROFILE_ITEMS.find((candidate) => candidate.id === 'background-nebula');
    if (!item) throw new Error('test item missing');
    const profile = createDefaultProfile();
    const result = purchaseProfileItem(profile, item.id);

    expect(result.ok).toBe(false);
    expect(result.profile).toEqual(profile);
  });

  it('drops invalid equipped item ids when loading an older local profile', () => {
    const normalized = normalizeProfile({
      ...createDefaultProfile(),
      unlockedItems: ['frame-lilac'],
      equipped: { frame: 'removed-item', badge: 'frame-lilac' },
    });

    expect(normalized.equipped).toEqual({});
  });
});
