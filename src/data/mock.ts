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
    thumb: steam(1817070, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'c2',
    text: 'Fans raise awareness of new virus found in Early2025 games.',
    thumb: steam(1091500, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'c3',
    text: 'Explore New Witcher3 Builds in This Weeks Community Spotlight.',
    thumb: steam(292030, 'header.jpg'),
    fallback: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&q=60&auto=format&fit=crop',
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

/** Single lookup across carousel + library. Carousel wins on id conflict. */
export function getGame(id: string): ResolvedGame | undefined {
  const pop = popularGames.find((g) => g.id === id);
  if (pop) {
    return {
      id: pop.id,
      title: pop.title,
      displayTitle: pop.displayTitle,
      status: pop.status,
      cover: pop.cover,
      fallback: pop.fallback,
      hero: pop.hero,
      heroFallback: pop.heroFallback,
      ambient: pop.ambient,
    };
  }
  const inst = installedGames.find((g) => g.id === id);
  if (inst) {
    return {
      id: inst.id,
      title: inst.title,
      displayTitle: inst.displayTitle,
      subtitle: inst.subtitle,
      status: inst.status,
      cover: inst.cover,
      fallback: inst.fallback,
      hero: inst.hero,
      heroFallback: inst.heroFallback,
      ambient: inst.ambient,
    };
  }
  return undefined;
}

export interface SearchEntry {
  id: string;
  title: string;
  cover: string;
  fallback: string;
  status?: string;
}

/** Deduped index across library + carousel for global search. */
export const searchIndex: SearchEntry[] = (() => {
  const seen = new Set<string>();
  const out: SearchEntry[] = [];
  for (const g of [...installedGames, ...popularGames]) {
    if (seen.has(g.id)) continue;
    seen.add(g.id);
    out.push({ id: g.id, title: g.title, cover: g.cover, fallback: g.fallback, status: g.status });
  }
  return out;
})();
