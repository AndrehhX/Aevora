export interface InstalledGame {
  id: string;
  title: string;
  displayTitle: string;
  subtitle?: string;
  status?: string;
  cover: string;
  fallback: string;
  hero: string;
  heroFallback: string;
  /** subtle "r,g,b" ambience tint, 5-15% perceptual use only */
  ambient: string;
  active?: boolean;
}

export interface PopularGame {
  id: string;
  title: string;
  shortTitle: string;
  displayTitle: string;
  status?: string;
  cover: string;
  fallback: string;
  hero: string;
  heroFallback: string;
  /** subtle "r,g,b" ambience tint, 5-15% perceptual use only */
  ambient: string;
}

/** Unified resolved game: single source of truth for hero + selection. */
export interface ResolvedGame {
  id: string;
  title: string;
  displayTitle: string;
  subtitle?: string;
  status?: string;
  cover: string;
  fallback: string;
  hero: string;
  heroFallback: string;
  ambient: string;
}

export interface CommunityItem {
  id: string;
  text: string;
  headline: string;
  excerpt: string;
  time: string;
  source: string;
  thumb: string;
  fallback: string;
}

export interface FeaturedGame {
  id: string;
  logoTop: string;
  logoMain: string;
  logoAccent: string;
  image: string;
  fallback: string;
  cta: string;
}

const steam = (appId: number, file: string) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/${file}`;

export const installedGames: InstalledGame[] = [
  {
    id: 'it-takes-two',
    title: 'It takes two',
    displayTitle: 'IT TAKES TWO',
    status: 'Available now',
    cover: steam(1426210, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=100&q=60&auto=format&fit=crop',
    hero: steam(1426210, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1600&q=70&auto=format&fit=crop',
    ambient: '190,150,90',
  },
  {
    id: 'ori',
    title: 'Ori & will of wisps',
    displayTitle: 'ORI AND THE WILL OF THE WISPS',
    status: 'Available now',
    cover: steam(1057090, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&q=60&auto=format&fit=crop',
    hero: steam(1057090, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=70&auto=format&fit=crop',
    ambient: '120,180,220',
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk 2079',
    displayTitle: 'CYBERPUNK 2079',
    subtitle: 'Update Available',
    status: 'Update Available',
    cover: steam(1091500, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1533709752211-118fcaf03312?w=100&q=60&auto=format&fit=crop',
    hero: steam(1091500, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1533709752211-118fcaf03312?w=1600&q=70&auto=format&fit=crop',
    ambient: '220,180,60',
  },
  {
    id: 'stardew',
    title: 'Stardew Valley',
    displayTitle: 'STARDEW VALLEY',
    status: 'Available now',
    cover: steam(413150, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&q=60&auto=format&fit=crop',
    hero: steam(413150, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=70&auto=format&fit=crop',
    ambient: '120,190,130',
  },
  {
    id: 'spiderman',
    title: 'Spiderman',
    displayTitle: 'SPIDER-MAN',
    status: 'Available now',
    cover: steam(1817070, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&q=60&auto=format&fit=crop',
    hero: steam(1817070, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1600&q=70&auto=format&fit=crop',
    ambient: '200,70,70',
  },
  {
    id: 'neo-aura',
    title: 'Neo Aura',
    displayTitle: 'NEO AURA',
    status: 'Available now',
    cover: '',
    fallback: '',
    hero: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=70&auto=format&fit=crop',
    heroFallback: 'https://images.unsplash.com/photo-1533709752211-118fcaf03312?w=1600&q=70&auto=format&fit=crop',
    ambient: '160,124,193',
  },
];

export const popularGames: PopularGame[] = [
  {
    id: 'sot',
    title: 'Sea Of Thieves',
    shortTitle: 'Sea Of Thieves',
    displayTitle: 'SEA OF THIEVES',
    status: 'Available now',
    cover: steam(1172620, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70&auto=format&fit=crop',
    hero: steam(1172620, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=70&auto=format&fit=crop',
    ambient: '60,170,160',
  },
  {
    id: 'elden',
    title: 'Elden Ring',
    shortTitle: 'Elden Ring',
    displayTitle: 'ELDEN RING',
    status: 'Available now',
    cover: steam(1245620, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70&auto=format&fit=crop',
    hero: steam(1245620, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=70&auto=format&fit=crop',
    ambient: '190,160,90',
  },
  {
    id: 'cod',
    title: 'Call Of Duty',
    shortTitle: 'Call Of Duty',
    displayTitle: 'CALL OF DUTY',
    status: 'New Season',
    cover: steam(1938090, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=70&auto=format&fit=crop',
    hero: steam(1938090, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1600&q=70&auto=format&fit=crop',
    ambient: '130,140,160',
  },
  {
    id: 'among',
    title: 'Among Us',
    shortTitle: 'Among Us',
    displayTitle: 'AMONG US',
    status: 'Available now',
    cover: steam(945360, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&q=70&auto=format&fit=crop',
    hero: steam(945360, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1600&q=70&auto=format&fit=crop',
    ambient: '200,60,60',
  },
  {
    id: 'rdr',
    title: 'Red Dead',
    shortTitle: 'Red Dead',
    displayTitle: 'RED DEAD',
    status: 'Available now',
    cover: steam(1174180, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=400&q=70&auto=format&fit=crop',
    hero: steam(1174180, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=1600&q=70&auto=format&fit=crop',
    ambient: '190,80,60',
  },
  {
    id: 'fc25',
    title: 'Fc 25',
    shortTitle: 'Fc 25',
    displayTitle: 'FC 25',
    status: 'Available now',
    cover: steam(2195250, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=70&auto=format&fit=crop',
    hero: steam(2195250, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1600&q=70&auto=format&fit=crop',
    ambient: '90,170,120',
  },
  {
    id: 'forza',
    title: 'Forza Horizon',
    shortTitle: 'Forza Horizon',
    displayTitle: 'FORZA HORIZON',
    status: 'Available now',
    cover: steam(1551360, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=70&auto=format&fit=crop',
    hero: steam(1293830, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600&q=80&auto=format&fit=crop',
    ambient: '96,165,250',
  },
  {
    id: 'hades',
    title: 'Hades II',
    shortTitle: 'Hades II',
    displayTitle: 'HADES II',
    status: 'Available now',
    cover: steam(1145350, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=70&auto=format&fit=crop',
    hero: steam(1145350, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=70&auto=format&fit=crop',
    ambient: '190,70,70',
  },
];

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

export const featured: FeaturedGame = {
  id: 'forza-horizon',
  logoTop: 'FORZA',
  logoMain: 'HORIZON',
  logoAccent: 'HORIZON',
  image: steam(1293830, 'library_hero.jpg'),
  fallback: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600&q=80&auto=format&fit=crop',
  cta: 'Available now',
};

export const navItems = ['Home', 'Store', 'Community', 'Indies', 'Early2025'];

/* ---------------- collections, details, social (mock) ---------------- */

export const indieGames: PopularGame[] = [
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    shortTitle: 'Hollow Knight',
    displayTitle: 'HOLLOW KNIGHT',
    status: 'Available now',
    cover: steam(367520, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=70&auto=format&fit=crop',
    hero: steam(367520, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=70&auto=format&fit=crop',
    ambient: '120,140,200',
  },
  {
    id: 'celeste',
    title: 'Celeste',
    shortTitle: 'Celeste',
    displayTitle: 'CELESTE',
    status: 'Available now',
    cover: steam(504230, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=70&auto=format&fit=crop',
    hero: steam(504230, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1600&q=70&auto=format&fit=crop',
    ambient: '200,120,140',
  },
  {
    id: 'dead-cells',
    title: 'Dead Cells',
    shortTitle: 'Dead Cells',
    displayTitle: 'DEAD CELLS',
    status: 'Available now',
    cover: steam(588650, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=400&q=70&auto=format&fit=crop',
    hero: steam(588650, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=1600&q=70&auto=format&fit=crop',
    ambient: '160,90,90',
  },
  {
    id: 'cuphead',
    title: 'Cuphead',
    shortTitle: 'Cuphead',
    displayTitle: 'CUPHEAD',
    status: 'Available now',
    cover: steam(268910, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&q=70&auto=format&fit=crop',
    hero: steam(268910, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=1600&q=70&auto=format&fit=crop',
    ambient: '210,170,100',
  },
];

export const earlyGames: PopularGame[] = [
  {
    id: 'mh-wilds',
    title: 'Monster Hunter Wilds',
    shortTitle: 'MH Wilds',
    displayTitle: 'MONSTER HUNTER WILDS',
    status: 'Available now',
    cover: steam(2246340, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=400&q=70&auto=format&fit=crop',
    hero: steam(2246340, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=1600&q=70&auto=format&fit=crop',
    ambient: '190,150,90',
  },
  {
    id: 'civ7',
    title: 'Civilization VII',
    shortTitle: 'Civ VII',
    displayTitle: 'CIVILIZATION VII',
    status: 'Available now',
    cover: steam(1295660, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70&auto=format&fit=crop',
    hero: steam(1295660, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=70&auto=format&fit=crop',
    ambient: '150,170,200',
  },
  {
    id: 'nightreign',
    title: 'Elden Ring Nightreign',
    shortTitle: 'Nightreign',
    displayTitle: 'NIGHTREIGN',
    status: 'Available now',
    cover: steam(2622380, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70&auto=format&fit=crop',
    hero: steam(2622380, 'library_hero.jpg'),
    heroFallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=70&auto=format&fit=crop',
    ambient: '150,110,190',
  },
];

export const storeFeaturedIds = ['forza', 'elden', 'cod'];
export const storeDealIds: Array<{ id: string; discount: string }> = [
  { id: 'rdr', discount: '-50%' },
  { id: 'sot', discount: '-30%' },
  { id: 'cyberpunk', discount: '-40%' },
  { id: 'fc25', discount: '-25%' },
];

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

export interface GameFacts {
  platform: string;
  playtime: string;
  developer: string;
  publisher: string;
  release: string;
  description: string;
  specs: string;
}

/** Deterministic mock facts so every game has a complete details page. */
export function getFacts(game: ResolvedGame): GameFacts {
  let h = 0;
  for (let i = 0; i < game.id.length; i++) h = (h * 31 + game.id.charCodeAt(i)) >>> 0;
  const hours = 12 + (h % 220);
  const installed = installedGames.some((g) => g.id === game.id);
  const blurbs: Record<string, string> = {
    forza: 'Open-world racing across changing seasons. Tune, paint and push hundreds of cars to their limit.',
    elden: 'An epic action RPG through the Lands Between. Forge your path, conquer demigods, become Elden Lord.',
    rdr: 'An outlaw saga across a vanishing frontier. Explore, hunt and survive in a living open world.',
    cyberpunk: 'A neon open-world RPG in Night City. Upgrade your body, bend the streets to your will.',
    spiderman: 'Swing through the city as Spider-Man in a blockbuster original story with fluid traversal.',
    stardew: 'Build the farm of your dreams, befriend the valley and uncover its quiet mysteries.',
  };
  return {
    platform: 'Aevora PC',
    playtime: `${hours}h played`,
    developer: 'Aevora Partner Studio',
    publisher: 'Aevora Games',
    release: '2025',
    description: blurbs[game.id] ?? `Experience ${game.title} on Aevora with cloud saves, achievements and seamless updates.`,
    specs: installed ? 'Installed · Ready to play' : 'Not installed · Available in Store',
  };
}

/** Deduped index across library + carousel + collections for global search. */
export const searchIndex: SearchEntry[] = (() => {
  const seen = new Set<string>();
  const out: SearchEntry[] = [];
  const push = (g: PopularGame | InstalledGame, category: SearchCategory, label: string) => {
    if (seen.has(g.id)) return;
    seen.add(g.id);
    out.push({ id: g.id, title: g.title, cover: g.cover, fallback: g.fallback, status: g.status, category, categoryLabel: label });
  };
  installedGames.forEach((g) => push(g, 'installed', 'Installed'));
  popularGames.forEach((g) => push(g, 'popular', 'Popular'));
  indieGames.forEach((g) => push(g, 'indie', 'Indie'));
  earlyGames.forEach((g) => push(g, 'early', 'Early2025'));
  return out;
})();

/** Single lookup across carousel + library + collections. Carousel wins on id conflict. */
export function getGame(id: string): ResolvedGame | undefined {
  const all: Array<PopularGame | InstalledGame> = [...popularGames, ...installedGames, ...indieGames, ...earlyGames];
  const g = all.find((x) => x.id === id);
  if (!g) return undefined;
  return {
    id: g.id,
    title: g.title,
    displayTitle: g.displayTitle,
    subtitle: (g as InstalledGame).subtitle,
    status: g.status,
    cover: g.cover,
    fallback: g.fallback,
    hero: g.hero,
    heroFallback: g.heroFallback,
    ambient: g.ambient,
  };
}

export type SearchCategory = 'installed' | 'popular' | 'indie' | 'early';

export interface SearchEntry {
  id: string;
  title: string;
  cover: string;
  fallback: string;
  status?: string;
  category: SearchCategory;
  categoryLabel: string;
}
