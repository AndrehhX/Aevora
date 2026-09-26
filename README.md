# Neo Aura — Premium Desktop Game Launcher (Visual Prototype)

Visual-only prototype matching the provided reference. React + TypeScript + Vite + Tailwind + Framer Motion + Lucide.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Build

```bash
npm run build
npm run preview
```

## Notes

- All data is mocked in `src/data/mock.ts`.
- No auth / backend / store / downloads. Visual + motion only.
- Game art loads from Steam CDN with Unsplash fallbacks.
- Target: 1920x1080, also handles 2560x1440 / 1600x900 / 1366x768. Desktop-first, 100vw x 100vh, no page scroll.
