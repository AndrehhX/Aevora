export interface InstalledGame {
  id: string;
  title: string;
  subtitle?: string;
  cover: string;
  fallback: string;
  active?: boolean;
}

export interface PopularGame {
  id: string;
  title: string;
  shortTitle: string;
  cover: string;
  fallback: string;
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
    cover: steam(1426210, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'ori',
    title: 'Ori & will of wisps',
    cover: steam(1057090, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk 2079',
    subtitle: 'Update Available',
    cover: steam(1091500, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1533709752211-118fcaf03312?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'stardew',
    title: 'Stardew Valley',
    cover: steam(413150, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'spiderman',
    title: 'Spiderman',
    cover: steam(1817070, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=100&q=60&auto=format&fit=crop',
  },
  {
    id: 'neo-aura',
    title: 'Neo Aura',
    cover: '',
    fallback: '',
  },
];

export const popularGames: PopularGame[] = [
  {
    id: 'sot',
    title: 'Sea Of Thieves',
    shortTitle: 'Sea Of Thieves',
    cover: steam(1172620, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70&auto=format&fit=crop',
  },
  {
    id: 'elden',
    title: 'Elden Ring',
    shortTitle: 'Elden Ring',
    cover: steam(1245620, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70&auto=format&fit=crop',
  },
  {
    id: 'cod',
    title: 'Call Of Duty',
    shortTitle: 'Call Of Duty',
    cover: steam(1938090, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=70&auto=format&fit=crop',
  },
  {
    id: 'among',
    title: 'Among Us',
    shortTitle: 'Among Us',
    cover: steam(945360, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&q=70&auto=format&fit=crop',
  },
  {
    id: 'rdr',
    title: 'Red Dead',
    shortTitle: 'Red Dead',
    cover: steam(1174180, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=400&q=70&auto=format&fit=crop',
  },
  {
    id: 'fc25',
    title: 'Fc 25',
    shortTitle: 'Fc 25',
    cover: steam(2195250, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=70&auto=format&fit=crop',
  },
  {
    id: 'forza',
    title: 'Forza Horizon',
    shortTitle: 'Forza Horizon',
    cover: steam(1551360, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=70&auto=format&fit=crop',
  },
  {
    id: 'hades',
    title: 'Hades II',
    shortTitle: 'Hades II',
    cover: steam(1145350, 'library_600x900.jpg'),
    fallback: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=70&auto=format&fit=crop',
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
