// Non-game mock data: community, social, navigation.
// Game data lives in src/data/library.ts as UnifiedGame entries.

export interface CommunityItem {
  id: string;
  text: string;
  headline: string;
  excerpt: string;
  time: string;
  source: string;
  thumb: string;
  fallback: string;
  url?: string;
}

const steam = (appId: number, file: string) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/${file}`;

export const communityItems: CommunityItem[] = [
  {
    id: 'c1',
    text: 'Player Discovers Hidden Easter Egg After 50 Hours of Play in Spiderman.',
    headline: 'Hidden Easter Egg Found After 50 Hours in Spiderman',
    excerpt: 'A player documented a rooftop mural sequence that only appears after completing every side objective. The thread already has 2.4k replies.',
    time: '2h ago',
    source: 'Spiderman Hub',
    thumb: steam(1817070, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'c2',
    text: 'Fans raise awareness of new virus found in Early2025 games.',
    headline: 'Community Flags Suspicious Early2025 Mod Files',
    excerpt: 'Moderators compiled a safety checklist for early-access downloads. Stick to verified publishers until the review finishes.',
    time: '6h ago',
    source: 'Safety Board',
    thumb: steam(1091500, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'c3',
    text: 'Explore New Witcher3 Builds in This Weeks Community Spotlight.',
    headline: 'Community Spotlight: New Witcher3 Builds',
    excerpt: 'Three experimental builds go head-to-head in this weeks spotlight, including a signs-only run through the expansion.',
    time: '1d ago',
    source: 'Spotlight',
    thumb: steam(292030, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&q=60&auto=format&fit=crop',
  },
];

export const communityFeed: CommunityItem[] = [
  ...communityItems,
  {
    id: 'c4',
    text: 'Speedrunners shatter previous Elden Ring world record by 41 seconds.',
    headline: 'New Elden Ring Speedrun World Record',
    excerpt: 'A risky skip through the capital saved 41 seconds and reset a record that stood for eight months. Full run breakdown inside.',
    time: '1d ago',
    source: 'Elden Ring Hub',
    thumb: steam(1245620, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'c5',
    text: 'Sea of Thieves crew finder event returns this weekend with bonus gold.',
    headline: 'Crew Finder Weekend With Bonus Gold',
    excerpt: 'Solo sailors can matchmake into galleons all weekend. Bonus gold applies to every emissary voyage completed in a crew.',
    time: '2d ago',
    source: 'Events',
    thumb: steam(1172620, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'c6',
    text: 'Stardew Valley 1.6 modding guide tops community bookmarks this month.',
    headline: 'Stardew 1.6 Modding Guide Tops Bookmarks',
    excerpt: 'The updated starter guide covers load order, save safety and the ten most downloaded quality-of-life mods.',
    time: '3d ago',
    source: 'Guides',
    thumb: steam(413150, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&q=60&auto=format&fit=crop',
  },
];

export const navItems = ['Home', 'Store', 'Community', 'Indies', 'Early2025'];

export interface FriendEntry {
  id: string;
  name: string;
  game: string;
  online: boolean;
}

export const friends: FriendEntry[] = [
  { id: 'f1', name: 'Nova', game: 'Elden Ring', online: true },
  { id: 'f2', name: 'Kaito', game: 'Sea Of Thieves', online: true },
  { id: 'f3', name: 'Mira', game: 'Stardew Valley', online: true },
  { id: 'f4', name: 'Drex', game: 'Offline', online: false },
  { id: 'f5', name: 'Luna', game: 'Offline', online: false },
];

export interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  time: string;
}

export const recentActivity: ActivityEntry[] = [
  { id: 'a1', user: 'Nova', action: 'earned “Shardbearer” in Elden Ring', time: '12m ago' },
  { id: 'a2', user: 'Kaito', action: 'completed a galleon voyage', time: '1h ago' },
  { id: 'a3', user: 'Mira', action: 'reached 100% in Stardew Valley', time: '3h ago' },
];
