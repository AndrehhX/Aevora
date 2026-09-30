export type ProfileItemKind = 'frame' | 'background' | 'badge' | 'title';

export interface ProfileItem {
  id: string;
  kind: ProfileItemKind;
  name: string;
  description: string;
  price: number;
}

export interface ProfileAchievement {
  appId: number;
  apiName: string;
  name: string;
  description?: string;
  unlockedAt?: number;
}

export interface ProfileState {
  name: string;
  bio: string;
  avatarUrl: string;
  points: number;
  totalEarned: number;
  achievements: ProfileAchievement[];
  unlockedItems: string[];
  equipped: Partial<Record<ProfileItemKind, string>>;
}

export const PROFILE_ITEMS: ProfileItem[] = [
  { id: 'frame-lilac', kind: 'frame', name: 'Lilac frame', description: 'A quiet Aevora outline.', price: 75 },
  { id: 'background-nebula', kind: 'background', name: 'Nebula background', description: 'Deep violet space for the profile.', price: 250 },
  { id: 'badge-builder', kind: 'badge', name: 'Builder badge', description: 'For shipping things that work.', price: 125 },
  { id: 'title-shipper', kind: 'title', name: 'The shipper', description: 'A local profile title.', price: 60 },
];

export const DEFAULT_PROFILE: ProfileState = {
  name: 'Andreh',
  bio: 'Computer science student building interfaces and useful systems.',
  avatarUrl: '',
  points: 0,
  totalEarned: 0,
  achievements: [],
  unlockedItems: [],
  equipped: {},
};

export function createDefaultProfile(): ProfileState {
  return {
    ...DEFAULT_PROFILE,
    achievements: [],
    unlockedItems: [],
    equipped: {},
  };
}

function achievementKey(achievement: Pick<ProfileAchievement, 'appId' | 'apiName'>): string {
  return `${achievement.appId}:${achievement.apiName}`;
}

export function mergeAchievements(profile: ProfileState, achievements: ProfileAchievement[]): { profile: ProfileState; newlyUnlocked: ProfileAchievement[] } {
  const existing = new Set(profile.achievements.map(achievementKey));
  const newlyUnlocked = achievements.filter((achievement) => !existing.has(achievementKey(achievement)));
  if (newlyUnlocked.length === 0) return { profile, newlyUnlocked: [] };
  const earned = newlyUnlocked.length * 25;
  return {
    newlyUnlocked,
    profile: {
      ...profile,
      points: profile.points + earned,
      totalEarned: profile.totalEarned + earned,
      achievements: [...profile.achievements, ...newlyUnlocked],
    },
  };
}

export function purchaseProfileItem(profile: ProfileState, itemId: string): { ok: boolean; profile: ProfileState; message: string } {
  const item = PROFILE_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) return { ok: false, profile, message: 'That profile item does not exist.' };
  if (profile.unlockedItems.includes(item.id)) return { ok: true, profile, message: 'Item already unlocked.' };
  if (profile.points < item.price) return { ok: false, profile, message: 'Not enough points.' };
  return {
    ok: true,
    message: `${item.name} unlocked.`,
    profile: { ...profile, points: profile.points - item.price, unlockedItems: [...profile.unlockedItems, item.id] },
  };
}

export function equipProfileItem(profile: ProfileState, itemId: string): ProfileState {
  const item = PROFILE_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item || !profile.unlockedItems.includes(item.id)) return profile;
  return { ...profile, equipped: { ...profile.equipped, [item.kind]: item.id } };
}

export function normalizeProfile(value: unknown): ProfileState {
  if (typeof value !== 'object' || value === null) return createDefaultProfile();
  const input = value as Partial<ProfileState>;
  const achievements = Array.isArray(input.achievements)
    ? input.achievements.filter((item): item is ProfileAchievement => typeof item === 'object' && item !== null && Number.isInteger((item as ProfileAchievement).appId) && typeof (item as ProfileAchievement).apiName === 'string' && typeof (item as ProfileAchievement).name === 'string')
    : [];
  const unlockedItems = Array.isArray(input.unlockedItems) ? input.unlockedItems.filter((id): id is string => typeof id === 'string' && PROFILE_ITEMS.some((item) => item.id === id)) : [];
  return {
    name: typeof input.name === 'string' && input.name.trim() ? input.name.trim().slice(0, 32) : DEFAULT_PROFILE.name,
    bio: typeof input.bio === 'string' ? input.bio.slice(0, 160) : DEFAULT_PROFILE.bio,
    avatarUrl: typeof input.avatarUrl === 'string' ? input.avatarUrl.slice(0, 500) : '',
    points: typeof input.points === 'number' && Number.isFinite(input.points) && input.points >= 0 ? Math.floor(input.points) : 0,
    totalEarned: typeof input.totalEarned === 'number' && Number.isFinite(input.totalEarned) && input.totalEarned >= 0 ? Math.floor(input.totalEarned) : 0,
    achievements,
    unlockedItems: [...new Set(unlockedItems)],
    equipped: typeof input.equipped === 'object' && input.equipped !== null ? input.equipped : {},
  };
}
