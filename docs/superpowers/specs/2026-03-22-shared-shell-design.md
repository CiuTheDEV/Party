# Design: Shared Shell & Brand Identity — Party

*Data: 2026-03-22*
*Status: Zatwierdzony przez product ownera*

---

## Cel

Zbudować wspólny shell UI dla wszystkich gier w projekcie Party: token system CSS, komponenty nawigacyjne (Topbar, GameSidebar, GameShell) i karty gier (GameCard). Shell zapewnia spójny wygląd i brand identity, podczas gdy każda gra definiuje własną kolorystykę przez CSS custom properties.

---

## Brand Identity

### Kierunek wizualny — Neon Dark

- Czarne tło (`#0a0a0a`), wysoki kontrast
- Gradient per gra: fiolet→magenta dla Kalambury, inne kolory dla kolejnych gier
- Typografia: Inter 900, nagłówki z kluczowym słowem/akcentem w kolorze gry
- Karty gier: gradient hero (kolorowy gradient u góry karty + emoji)

### Kolory akcentu per gra

Każda gra definiuje nasycony, wyrazisty kolor. Przykłady:
- Kalambury → fiolet (`#7c3aed`)
- Gra 2 → różowy (`#ec4899`)
- Gra 3 → błękit (`#0ea5e9`)

---

## Architektura

### `@party/ui` — paczka shared UI

Naprawiony build (TypeScript `emitDeclarationOnly`), importowana przez hub i przyszłe aplikacje.

**`packages/ui/tsconfig.json`** — nowy, z `emitDeclarationOnly: true`, `jsx: react-jsx`, `moduleResolution: bundler`. Rozszerza root tsconfig.

**`packages/ui/package.json`** — skrypt `build: tsc`, `main: src/index.ts`, `types: src/index.ts`. Hub importuje przez workspace `@party/ui`.

**`apps/hub/tsconfig.json`** — dodaje path alias `"@party/ui": ["../../packages/ui/src"]` żeby TypeScript rozwiązał importy.

```
packages/ui/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── tokens.css
│   ├── Topbar/
│   │   ├── Topbar.tsx
│   │   └── Topbar.module.css
│   ├── GameSidebar/
│   │   ├── GameSidebar.tsx
│   │   └── GameSidebar.module.css
│   ├── GameShell/
│   │   ├── GameShell.tsx
│   │   └── GameShell.module.css
│   └── GameCard/
│       ├── GameCard.tsx
│       └── GameCard.module.css
```

---

## Token System

### Poziom 1 — Globalne (`packages/ui/src/tokens.css`)

Niezmienne, ładowane przez root layout huba. Zastępują zmienne z `globals.css`.

```css
:root {
  /* Tło i powierzchnie */
  --color-bg: #0a0a0a;
  --color-surface: rgba(255, 255, 255, 0.04);
  --color-surface-hover: rgba(255, 255, 255, 0.08);
  --color-surface-elevated: #141414;

  /* Obramowania */
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.16);

  /* Tekst */
  --color-text: #f0f0f0;
  --color-text-muted: rgba(240, 240, 240, 0.5);

  /* Interakcja */
  --color-focus-outline: rgba(255, 255, 255, 0.4);
  --color-overlay: rgba(0, 0, 0, 0.7);
  --color-topbar-bg: rgba(10, 10, 10, 0.9);

  /* Layout */
  --topbar-height: 52px;   /* zmiana z 60px — tokens.css jest importowany po globals.css i nadpisuje */
  --sidebar-width: 200px;

  /* Typografia */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}
```

### Poziom 2 — Per gra (`apps/hub/src/app/games/[game]/theme.css`)

Każda gra definiuje swój plik `theme.css` ładowany w layout.tsx trasy gry.

```css
/* Przykład: charades/theme.css */
:root {
  --game-color-primary: #7c3aed;
  --game-color-primary-light: #a78bfa;
  --game-color-primary-glow: rgba(124, 58, 237, 0.15);
  --game-gradient: linear-gradient(135deg, #3b1f7a, #7c3aed, #a78bfa);
}
```

Komponenty shared używają **wyłącznie** `--game-color-*` — nigdy hardcoded kolorów gry.

---

## Komponenty

### `Topbar`

Belka górna, wysokość `--topbar-height` (52px).

```ts
type TopbarProps = {
  gameName?: string   // opcjonalne — brak gdy jesteśmy w hub
}
```

Zawartość (lewa → prawa):
- Logo „Project Party" jako link do `/`
- Separator `/` + `gameName` w kolorze `--game-color-primary-light` (tylko gdy podane)
- Slot prawy: avatar lub przycisk „Zaloguj" (placeholder na Phase 5 — Clerk)

### `GameSidebar`

Boczna nawigacja, szerokość `--sidebar-width` (200px).

```ts
type NavLink = {
  label: string
  href: string
  icon?: string   // emoji opcjonalne
}

type GameSidebarProps = {
  gameName: string
  gameEmoji: string
  links: NavLink[]
}
```

Zawartość:
- Nagłówek: `gameEmoji` + `gameName`
- Lista linków — aktywny wyróżniony lewym paskiem `--game-color-primary` + tło `--game-color-primary-glow`
- Na dole zawsze: „← Wróć do lobby" (link do `/`)

### `GameSidebar` — mobile tab bar

Na mobile (<768px) `GameSidebar` renderuje dolny tab bar zamiast bocznej nawigacji. Ten sam komponent, inna prezentacja CSS. Wysokość 56px, przyklejony do dołu. `GameShell` dodaje `padding-bottom: 56px` do main content na mobile.

Nie ma osobnego komponentu `MobileTabBar` — to CSS media query w `GameSidebar.module.css`.

### `GameShell`

Wrapper kompozytowy łączący Topbar + GameSidebar + slot treści.

```ts
type GameShellProps = {
  gameName: string
  gameEmoji: string
  links: NavLink[]
  children: React.ReactNode
}
```

Layout CSS Grid:
- Desktop (≥768px): `grid-template-columns: var(--sidebar-width) 1fr`
- Mobile (<768px): sidebar ukryty, dolny tab bar z tymi samymi linkami

**GameScreen (`/play`, `/present`) nie używa GameShell** — renderuje się pełnoekranowo poza nim, przez własny `layout.tsx` w podfolderze.

### `GameCard`

Karta gry dla hub — styl „gradient hero".

```ts
type GameCardProps = {
  game: GameConfig   // z @party/game-sdk
  href: string
  locked?: boolean
}
```

Budowa karty:
- Górna część: gradient z `--game-gradient` (lub fallback z `GameConfig`), emoji na środku, wysokość 120px
- Dolna część: nazwa gry (Inter 800), opis (muted), liczba graczy, przycisk „Zagraj"
- Stan `locked`: cała karta przyciemniona (opacity 0.4), emoji 🔒, przycisk „Premium"

`GameConfig` zostaje rozszerzony o pole `gradient: string` (CSS gradient string).

---

## Integracja z istniejącym kodem

### Nowe pliki w hubie

**`apps/hub/src/app/games/charades/theme.css`**
Definiuje `--game-color-*` dla Kalambury.

**`apps/hub/src/app/games/charades/layout.tsx`**
Opakowuje trasy Kalambury w `GameShell`, importuje `theme.css`.

```tsx
import { GameShell } from '@party/ui'
import './theme.css'

const links = [
  { label: 'Menu gry', href: '/games/charades' },
  { label: 'Konfiguracja', href: '/games/charades/config' },
]

export default function CharadesLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameShell gameName="Kalambury" gameEmoji="🎭" links={links}>
      {children}
    </GameShell>
  )
}
```

**`apps/hub/src/app/games/charades/play/layout.tsx`**
Pusty layout bez GameShell — gwarantuje pełnoekranowy GameScreen.

```tsx
export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

**`apps/hub/src/app/games/charades/present/layout.tsx`**
Identyczny jak `play/layout.tsx`.

### Modyfikacje istniejących plików

**`apps/hub/src/app/globals.css`**
Usuwa definicje CSS custom properties (przeniesione do `tokens.css`). Zostaje: CSS reset, base typography, base link styling.

**`apps/hub/src/app/layout.tsx`**
Importuje `@party/ui/tokens.css` zamiast definiować zmienne lokalnie.

**`apps/hub/src/app/page.tsx`**
Używa `GameCard` z `@party/ui` zamiast lokalnego `GameCard`. Grid kart renderowany bezpośrednio w `page.tsx` przez CSS grid — `GamesGrid` komponent usunięty, zastąpiony prostym `<div className={styles.grid}>`.

**`apps/hub/src/data/games.ts`**
Dodaje pole `gradient` do każdej gry. Przykład dla Kalambury: `gradient: 'linear-gradient(135deg, #3b1f7a, #7c3aed, #a78bfa)'`.

**`packages/game-sdk/src/types/GameConfig.ts`**
Dodaje opcjonalne pole `gradient?: string` (CSS gradient string używany przez `GameCard`).

### Trasy per gra — layout files

Każda gra ma własny `layout.tsx` bezpośrednio w swoim folderze (nie parametryczny `[game]`). Dla Kalambury: `apps/hub/src/app/games/charades/layout.tsx`. Przy dodaniu nowej gry: analogiczny plik w jej folderze.

### Usuwane pliki z huba

- `apps/hub/src/components/Topbar/` → przeniesiony do `@party/ui`
- `apps/hub/src/components/GameCard/` → przeniesiony do `@party/ui`
- `apps/hub/src/components/GamesGrid/` → logika zostaje w `page.tsx`, komponent usunięty

---

## Responsywność

### Desktop (≥768px)
- Sidebar widoczny, `grid-template-columns: var(--sidebar-width) 1fr`
- Topbar na pełną szerokość ponad gridem

### Mobile (<768px)
- Sidebar ukryty
- Dolny tab bar z tymi samymi linkami co sidebar
- Tab bar ma wysokość 56px, przyklejony do dołu ekranu
- GameShell dodaje `padding-bottom: 56px` do main content na mobile

---

## Czego NIE ma w tym spec

- Animacje i przejścia między stronami (osobna decyzja)
- Dark/light mode toggle (projekt jest dark-only)
- Internationalizacja
- Redesign GameScreen (`/play`, `/present`) — osobny spec
- Redesign komponentów charades-specific (PlayerForm, CategoryPicker itd.) — osobny spec

---

## Kryteria ukończenia

- [ ] `@party/ui` buduje się bez błędów (`tsc`)
- [ ] Hub importuje komponenty z `@party/ui` bez błędów TypeScript
- [ ] `GameShell` widoczny na wszystkich trasach Kalambury oprócz `/play` i `/present`
- [ ] Token system działa — zmiana `--game-color-primary` zmienia kolor akcentu w całym shellu
- [ ] Responsywność: sidebar na desktop, tab bar na mobile
- [ ] `GameCard` w hub używa gradient hero z `GameConfig`
