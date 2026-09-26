import type { UnifiedGame } from '../domain/game';

// Mock output of the future normalization layer: ONE entry per game,
// provider relationships nested inside. Canonical Aevora ids are stable.

const steam = (appId: number, file: string) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/${file}`;

const logo = (appId: number) => steam(appId, 'logo.png');

const isoDaysAgo = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 3600000).toISOString();

const U = (id: string, f: string) => `https://images.unsplash.com/${id}?w=${f}`;

export const libraryGames: UnifiedGame[] = [
  {
    id: 'it-takes-two',
    title: 'It takes two',
    displayTitle: 'IT TAKES TWO',
    description: 'A genre-bending co-op adventure built purely for two players.',
    artwork: {
      cover: steam(1426210, 'library_600x900.jpg'),
      coverFallback: U('photo-1614294148960-9aa740632a87', '100&q=60&auto=format&fit=crop'),
      hero: steam(1426210, 'library_hero.jpg'),
      heroFallback: U('photo-1614294148960-9aa740632a87', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1426210),
    },
    providers: [{ provider: 'steam', externalId: '1426210', owned: true, installed: true, playtimeMinutes: 720, lastPlayed: isoDaysAgo(4) }],
    metadata: { developer: 'Hazelight', publisher: 'EA Originals', releaseDate: '2021', genres: ['Co-op', 'Adventure'] },
    ambient: '190,150,90',
  },
  {
    id: 'ori',
    title: 'Ori & will of wisps',
    displayTitle: 'ORI AND THE WILL OF THE WISPS',
    description: 'A hand-painted action-platformer about hope, loss and new beginnings.',
    artwork: {
      cover: steam(1057090, 'library_600x900.jpg'),
      coverFallback: U('photo-1518709268805-4e9042af9f23', '100&q=60&auto=format&fit=crop'),
      hero: steam(1057090, 'library_hero.jpg'),
      heroFallback: U('photo-1518709268805-4e9042af9f23', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1057090),
    },
    providers: [{ provider: 'steam', externalId: '1057090', owned: true, installed: true, playtimeMinutes: 480 }],
    metadata: { developer: 'Moon Studios', publisher: 'Xbox Game Studios', releaseDate: '2020', genres: ['Metroidvania', 'Platformer'] },
    ambient: '120,180,220',
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk 2079',
    displayTitle: 'CYBERPUNK 2079',
    subtitle: 'Update Available',
    highlight: 'Update Available',
    description: 'A neon open-world RPG in Night City. Upgrade your body, bend the streets to your will.',
    artwork: {
      cover: steam(1091500, 'library_600x900.jpg'),
      coverFallback: U('photo-1533709752211-118fcaf03312', '100&q=60&auto=format&fit=crop'),
      hero: steam(1091500, 'library_hero.jpg'),
      heroFallback: U('photo-1533709752211-118fcaf03312', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1091500),
    },
    providers: [
      { provider: 'steam', externalId: '1091500', owned: true, installed: true, playtimeMinutes: 4980, lastPlayed: isoDaysAgo(0, 5), version: '2.1' },
      { provider: 'gog', externalId: '1423045681', owned: true, installed: true, playtimeMinutes: 840, lastPlayed: isoDaysAgo(9) },
    ],
    metadata: { developer: 'CD PROJEKT RED', publisher: 'CD PROJEKT', releaseDate: '2020', genres: ['Open World', 'RPG'] },
    ambient: '220,180,60',
  },
  {
    id: 'stardew',
    title: 'Stardew Valley',
    displayTitle: 'STARDEW VALLEY',
    description: 'Build the farm of your dreams, befriend the valley and uncover its quiet mysteries.',
    artwork: {
      cover: steam(413150, 'library_600x900.jpg'),
      coverFallback: U('photo-1500382017468-9049fed747ef', '100&q=60&auto=format&fit=crop'),
      hero: steam(413150, 'library_hero.jpg'),
      heroFallback: U('photo-1500382017468-9049fed747ef', '1600&q=70&auto=format&fit=crop'),
      logo: logo(413150),
    },
    providers: [
      { provider: 'steam', externalId: '413150', owned: true, installed: true, playtimeMinutes: 3600, lastPlayed: isoDaysAgo(6) },
      { provider: 'gog', externalId: 'stardew-gog', owned: true, installed: false },
    ],
    metadata: { developer: 'ConcernedApe', publisher: 'ConcernedApe', releaseDate: '2016', genres: ['Farming Sim', 'RPG'] },
    ambient: '120,190,130',
  },
  {
    id: 'spiderman',
    title: 'Spiderman',
    displayTitle: 'SPIDER-MAN',
    description: 'Swing through the city as Spider-Man in a blockbuster original story with fluid traversal.',
    artwork: {
      cover: steam(1817070, 'library_600x900.jpg'),
      coverFallback: U('photo-1635805737707-575885ab0820', '100&q=60&auto=format&fit=crop'),
      hero: steam(1817070, 'library_hero.jpg'),
      heroFallback: U('photo-1635805737707-575885ab0820', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1817070),
    },
    providers: [{ provider: 'steam', externalId: '1817070', owned: true, installed: true, playtimeMinutes: 1500, lastPlayed: isoDaysAgo(2) }],
    metadata: { developer: 'Insomniac Games', publisher: 'PlayStation Publishing', releaseDate: '2022', genres: ['Action', 'Open World'] },
    ambient: '200,70,70',
  },
  {
    id: 'neo-aura',
    title: 'Neo Aura',
    displayTitle: 'NEO AURA',
    description: 'A native Aevora showcase experience. No providers, no launchers — just play.',
    artwork: {
      cover: '',
      coverFallback: '',
      hero: U('photo-1518709268805-4e9042af9f23', '1600&q=70&auto=format&fit=crop'),
      heroFallback: U('photo-1533709752211-118fcaf03312', '1600&q=70&auto=format&fit=crop'),
    },
    providers: [{ provider: 'local', externalId: 'neo-aura', owned: true, installed: true, playtimeMinutes: 300, lastPlayed: isoDaysAgo(1) }],
    metadata: { developer: 'Aevora Labs', publisher: 'Aevora', releaseDate: '2025', genres: ['Showcase'] },
    ambient: '160,124,193',
  },
  {
    id: 'elden',
    title: 'Elden Ring',
    displayTitle: 'ELDEN RING',
    description: 'An epic action RPG through the Lands Between. Forge your path, conquer demigods, become Elden Lord.',
    artwork: {
      cover: steam(1245620, 'library_600x900.jpg'),
      coverFallback: U('photo-1518709268805-4e9042af9f23', '400&q=70&auto=format&fit=crop'),
      hero: steam(1245620, 'library_hero.jpg'),
      heroFallback: U('photo-1518709268805-4e9042af9f23', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1245620),
    },
    providers: [{ provider: 'steam', externalId: '1245620', owned: true, installed: true, playtimeMinutes: 5400, lastPlayed: isoDaysAgo(0, 3) }],
    metadata: { developer: 'FromSoftware', publisher: 'Bandai Namco', releaseDate: '2022', genres: ['Action RPG', 'Souls-like'] },
    ambient: '190,160,90',
  },
  {
    id: 'rdr',
    title: 'Red Dead',
    displayTitle: 'RED DEAD',
    description: 'An outlaw saga across a vanishing frontier. Explore, hunt and survive in a living open world.',
    artwork: {
      cover: steam(1174180, 'library_600x900.jpg'),
      coverFallback: U('photo-1533106418989-88406c7cc8ca', '400&q=70&auto=format&fit=crop'),
      hero: steam(1174180, 'library_hero.jpg'),
      heroFallback: U('photo-1533106418989-88406c7cc8ca', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1174180),
    },
    providers: [
      { provider: 'steam', externalId: '1174180', owned: true, installed: true, playtimeMinutes: 3120, lastPlayed: isoDaysAgo(2, 4) },
      { provider: 'epic', externalId: 'rdr2-epic', owned: true, installed: false },
    ],
    metadata: { developer: 'Rockstar Games', publisher: 'Rockstar Games', releaseDate: '2019', genres: ['Action', 'Adventure'] },
    ambient: '190,80,60',
  },
  {
    id: 'forza',
    title: 'Forza Horizon',
    displayTitle: 'FORZA HORIZON',
    description: 'Open-world racing across changing seasons. Tune, paint and push hundreds of cars to their limit.',
    artwork: {
      cover: steam(1551360, 'library_600x900.jpg'),
      coverFallback: U('photo-1503376780353-7e6692767b70', '400&q=70&auto=format&fit=crop'),
      hero: steam(1293830, 'library_hero.jpg'),
      heroFallback: U('photo-1583121274602-3e2820c69888', '1600&q=80&auto=format&fit=crop'),
      logo: logo(1293830),
    },
    providers: [
      { provider: 'xbox', externalId: 'fh5-xbox', owned: true, installed: false, playtimeMinutes: 2400, lastPlayed: isoDaysAgo(1, 2) },
      { provider: 'steam', externalId: '1551360', owned: true, installed: false, playtimeMinutes: 600 },
    ],
    metadata: { developer: 'Playground Games', publisher: 'Xbox Game Studios', releaseDate: '2021', genres: ['Racing', 'Open World'] },
    ambient: '96,165,250',
  },
  {
    id: 'sot',
    title: 'Sea Of Thieves',
    displayTitle: 'SEA OF THIEVES',
    description: 'Sail together into a shared pirate world of voyage, plunder and tall tales.',
    artwork: {
      cover: steam(1172620, 'library_600x900.jpg'),
      coverFallback: U('photo-1518709268805-4e9042af9f23', '400&q=70&auto=format&fit=crop'),
      hero: steam(1172620, 'library_hero.jpg'),
      heroFallback: U('photo-1518709268805-4e9042af9f23', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1172620),
    },
    providers: [{ provider: 'steam', externalId: '1172620', owned: true, installed: false, playtimeMinutes: 900 }],
    metadata: { developer: 'Rare', publisher: 'Xbox Game Studios', releaseDate: '2018', genres: ['Adventure', 'Co-op'] },
    ambient: '60,170,160',
  },
  {
    id: 'among',
    title: 'Among Us',
    displayTitle: 'AMONG US',
    description: 'Work together aboard the ship — while impostors sabotage and deceive the crew.',
    artwork: {
      cover: steam(945360, 'library_600x900.jpg'),
      coverFallback: U('photo-1614294148960-9aa740632a87', '400&q=70&auto=format&fit=crop'),
      hero: steam(945360, 'library_hero.jpg'),
      heroFallback: U('photo-1614294148960-9aa740632a87', '1600&q=70&auto=format&fit=crop'),
      logo: logo(945360),
    },
    providers: [
      { provider: 'steam', externalId: '945360', owned: true, installed: false, playtimeMinutes: 300 },
      { provider: 'epic', externalId: 'among-epic', owned: true, installed: false },
    ],
    metadata: { developer: 'Innersloth', publisher: 'Innersloth', releaseDate: '2018', genres: ['Social Deduction', 'Party'] },
    ambient: '200,60,60',
  },
  {
    id: 'hades',
    title: 'Hades II',
    displayTitle: 'HADES II',
    description: 'Battle beyond the Underworld as the Princess of the Dead in this bewitching roguelike sequel.',
    artwork: {
      cover: steam(1145350, 'library_600x900.jpg'),
      coverFallback: U('photo-1511512578047-dfb367046420', '400&q=70&auto=format&fit=crop'),
      hero: steam(1145350, 'library_hero.jpg'),
      heroFallback: U('photo-1511512578047-dfb367046420', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1145350),
    },
    providers: [{ provider: 'steam', externalId: '1145350', owned: true, installed: false }],
    metadata: { developer: 'Supergiant Games', publisher: 'Supergiant Games', releaseDate: '2024', genres: ['Roguelike', 'Action'] },
    ambient: '190,70,70',
  },
  {
    id: 'cod',
    title: 'Call Of Duty',
    displayTitle: 'CALL OF DUTY',
    highlight: 'New Season',
    description: 'Squad up for cinematic campaigns and large-scale multiplayer combat.',
    artwork: {
      cover: steam(1938090, 'library_600x900.jpg'),
      coverFallback: U('photo-1552820728-8b83bb6b773f', '400&q=70&auto=format&fit=crop'),
      hero: steam(1938090, 'library_hero.jpg'),
      heroFallback: U('photo-1552820728-8b83bb6b773f', '1600&q=70&auto=format&fit=crop'),
      logo: logo(1938090),
    },
    providers: [
      { provider: 'battle-net', externalId: 'cod-hq', owned: true, installed: false, playtimeMinutes: 700 },
      { provider: 'steam', externalId: '1938090', owned: true, installed: false, playtimeMinutes: 200 },
    ],
    metadata: { developer: 'Infinity Ward', publisher: 'Activision', releaseDate: '2023', genres: ['FPS', 'Multiplayer'] },
    ambient: '130,140,160',
  },
  {
    id: 'fc25',
    title: 'Fc 25',
    displayTitle: 'FC 25',
    description: 'The world’s game, rebuilt for the club — licenced leagues, clubs and Ultimate Team.',
    artwork: {
      cover: steam(2195250, 'library_600x900.jpg'),
      coverFallback: U('photo-1579952363873-27f3bade9f55', '400&q=70&auto=format&fit=crop'),
      hero: steam(2195250, 'library_hero.jpg'),
      heroFallback: U('photo-1579952363873-27f3bade9f55', '1600&q=70&auto=format&fit=crop'),
    },
    providers: [
      { provider: 'ea', externalId: 'fc25-ea', owned: true, installed: false, playtimeMinutes: 1500, lastPlayed: isoDaysAgo(1, 6) },
      { provider: 'steam', externalId: '2195250', owned: true, installed: false, playtimeMinutes: 120 },
    ],
    metadata: { developer: 'EA Sports', publisher: 'EA', releaseDate: '2024', genres: ['Sports', 'Football'] },
    ambient: '90,170,120',
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    displayTitle: 'HOLLOW KNIGHT',
    description: 'Descend into Hallownest in an acclaimed hand-drawn metroidvania.',
    artwork: {
      cover: steam(367520, 'library_600x900.jpg'),
      coverFallback: U('photo-1511512578047-dfb367046420', '400&q=70&auto=format&fit=crop'),
      hero: steam(367520, 'library_hero.jpg'),
      heroFallback: U('photo-1511512578047-dfb367046420', '1600&q=70&auto=format&fit=crop'),
      logo: logo(367520),
    },
    providers: [{ provider: 'steam', externalId: '367520', owned: true, installed: false, playtimeMinutes: 240 }],
    metadata: { developer: 'Team Cherry', publisher: 'Team Cherry', releaseDate: '2017', genres: ['Metroidvania', 'Indie'] },
    ambient: '120,140,200',
  },
  {
    id: 'celeste',
    title: 'Celeste',
    displayTitle: 'CELESTE',
    description: 'Climb a haunted mountain in a tight, heartfelt precision platformer.',
    artwork: {
      cover: steam(504230, 'library_600x900.jpg'),
      coverFallback: U('photo-1552820728-8b83bb6b773f', '400&q=70&auto=format&fit=crop'),
      hero: steam(504230, 'library_hero.jpg'),
      heroFallback: U('photo-1552820728-8b83bb6b773f', '1600&q=70&auto=format&fit=crop'),
      logo: logo(504230),
    },
    providers: [{ provider: 'steam', externalId: '504230', owned: true, installed: false, playtimeMinutes: 180 }],
    metadata: { developer: 'Maddy Makes Games', publisher: 'Maddy Makes Games', releaseDate: '2018', genres: ['Platformer', 'Indie'] },
    ambient: '200,120,140',
  },
  {
    id: 'dead-cells',
    title: 'Dead Cells',
    displayTitle: 'DEAD CELLS',
    description: 'A fast, brutal roguelike with fluid combat and an ever-shifting castle.',
    artwork: {
      cover: steam(588650, 'library_600x900.jpg'),
      coverFallback: U('photo-1533106418989-88406c7cc8ca', '400&q=70&auto=format&fit=crop'),
      hero: steam(588650, 'library_hero.jpg'),
      heroFallback: U('photo-1533106418989-88406c7cc8ca', '1600&q=70&auto=format&fit=crop'),
      logo: logo(588650),
    },
    providers: [{ provider: 'steam', externalId: '588650', owned: true, installed: false, playtimeMinutes: 420 }],
    metadata: { developer: 'Motion Twin', publisher: 'Motion Twin', releaseDate: '2018', genres: ['Roguelike', 'Indie'] },
    ambient: '160,90,90',
  },
  {
    id: 'cuphead',
    title: 'Cuphead',
    displayTitle: 'CUPHEAD',
    description: 'A 1930s cartoon boss-rush with hand-drawn animation and a killer soundtrack.',
    artwork: {
      cover: steam(268910, 'library_600x900.jpg'),
      coverFallback: U('photo-1614294148960-9aa740632a87', '400&q=70&auto=format&fit=crop'),
      hero: steam(268910, 'library_hero.jpg'),
      heroFallback: U('photo-1614294148960-9aa740632a87', '1600&q=70&auto=format&fit=crop'),
      logo: logo(268910),
    },
    providers: [{ provider: 'steam', externalId: '268910', owned: true, installed: false, playtimeMinutes: 150 }],
    metadata: { developer: 'Studio MDHR', publisher: 'Studio MDHR', releaseDate: '2017', genres: ['Run and Gun', 'Indie'] },
    ambient: '210,170,100',
  },
  {
    id: 'mh-wilds',
    title: 'Monster Hunter Wilds',
    displayTitle: 'MONSTER HUNTER WILDS',
    description: 'Track colossal beasts across a seamless, ever-changing wilderness.',
    artwork: {
      cover: steam(2246340, 'library_600x900.jpg'),
      coverFallback: U('photo-1533106418989-88406c7cc8ca', '400&q=70&auto=format&fit=crop'),
      hero: steam(2246340, 'library_hero.jpg'),
      heroFallback: U('photo-1533106418989-88406c7cc8ca', '1600&q=70&auto=format&fit=crop'),
      logo: logo(2246340),
    },
    providers: [{ provider: 'steam', externalId: '2246340', owned: true, installed: false }],
    metadata: { developer: 'Capcom', publisher: 'Capcom', releaseDate: '2025', genres: ['Action RPG', 'Co-op'] },
    ambient: '190,150,90',
  },
  {
    id: 'civ7',
    title: 'Civilization VII',
    displayTitle: 'CIVILIZATION VII',
    description: 'Guide your empire through the ages in the next chapter of the strategy classic.',
    artwork: {
      cover: steam(1295660, 'library_600x900.jpg'),
      coverFallback: U('photo-1500382017468-9049fed747ef', '400&q=70&auto=format&fit=crop'),
      hero: steam(1295660, 'library_hero.jpg'),
      heroFallback: U('photo-1500382017468-9049fed747ef', '1600&q=70&auto=format&fit=crop'),
    },
    providers: [{ provider: 'steam', externalId: '1295660', owned: true, installed: false }],
    metadata: { developer: 'Firaxis', publisher: '2K', releaseDate: '2025', genres: ['Strategy', 'Turn-Based'] },
    ambient: '150,170,200',
  },
  {
    id: 'nightreign',
    title: 'Elden Ring Nightreign',
    displayTitle: 'NIGHTREIGN',
    description: 'A standalone co-op descent into a night-shrouded Lands Between.',
    artwork: {
      cover: steam(2622380, 'library_600x900.jpg'),
      coverFallback: U('photo-1518709268805-4e9042af9f23', '400&q=70&auto=format&fit=crop'),
      hero: steam(2622380, 'library_hero.jpg'),
      heroFallback: U('photo-1518709268805-4e9042af9f23', '1600&q=70&auto=format&fit=crop'),
      logo: logo(2622380),
    },
    providers: [{ provider: 'steam', externalId: '2622380', owned: true, installed: false }],
    metadata: { developer: 'FromSoftware', publisher: 'Bandai Namco', releaseDate: '2025', genres: ['Action', 'Co-op'] },
    ambient: '150,110,190',
  },
];

/** Canonical lookup. External provider ids must never be used as keys. */
export function getLibraryGame(id: string) {
  return libraryGames.find((g) => g.id === id);
}

/* ---------------- store catalog (separate from owned library) ---------------- */

export const carouselIds = ['sot', 'elden', 'cod', 'among', 'rdr', 'fc25', 'forza', 'hades'];
export const storeFeaturedIds = ['forza', 'elden', 'cod'];
export const storeDealIds: Array<{ id: string; discount: string }> = [
  { id: 'rdr', discount: '-50%' },
  { id: 'sot', discount: '-30%' },
  { id: 'cyberpunk', discount: '-40%' },
  { id: 'fc25', discount: '-25%' },
];
export const indieIds = ['hollow-knight', 'celeste', 'dead-cells', 'cuphead'];
export const earlyIds = ['mh-wilds', 'civ7', 'nightreign', 'hades'];
