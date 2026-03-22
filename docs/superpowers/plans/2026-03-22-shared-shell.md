# Shared Shell & Brand Identity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zbudować shared UI shell (`@party/ui`) z token systemem CSS, komponentami nawigacyjnymi (Topbar, GameSidebar, GameShell) i nową kartą gry (GameCard z gradient hero), zintegrować z hubem i Kalambury.

**Architecture:** `packages/ui` zostaje naprawiona jako paczka TypeScript z `emitDeclarationOnly`. Hub importuje z `@party/ui` przez path alias w tsconfig. Każda gra definiuje swoje `--game-color-*` w lokalnym `theme.css`. GameShell opakowuje trasy gry (oprócz `/play` i `/present` które są pełnoekranowe).

**Tech Stack:** Next.js 16 App Router, TypeScript strict, CSS Modules, Turborepo workspace.

---

## Mapa plików

### Nowe pliki — `@party/ui`
```
packages/ui/tsconfig.json
packages/ui/src/index.ts
packages/ui/src/tokens.css
packages/ui/src/Topbar/Topbar.tsx
packages/ui/src/Topbar/Topbar.module.css
packages/ui/src/GameSidebar/GameSidebar.tsx
packages/ui/src/GameSidebar/GameSidebar.module.css
packages/ui/src/GameShell/GameShell.tsx
packages/ui/src/GameShell/GameShell.module.css
packages/ui/src/GameCard/GameCard.tsx
packages/ui/src/GameCard/GameCard.module.css
```

### Nowe pliki — hub
```
apps/hub/src/app/games/charades/theme.css
apps/hub/src/app/games/charades/layout.tsx
apps/hub/src/app/games/charades/play/layout.tsx
apps/hub/src/app/games/charades/present/layout.tsx
```

### Modyfikacje
```
packages/ui/package.json                          — dodaj main, types, exports
packages/game-sdk/src/types/GameConfig.ts         — dodaj gradient?: string
packages/game-sdk/src/index.ts                    — bez zmian (reeksport)
apps/hub/tsconfig.json                            — dodaj path alias @party/ui
apps/hub/src/app/globals.css                      — usuń CSS variables (przeniesione do tokens.css)
apps/hub/src/app/layout.tsx                       — importuj tokens.css z @party/ui
apps/hub/src/app/page.tsx                         — użyj GameCard z @party/ui, usuń GamesGrid
apps/hub/src/data/games.ts                        — dodaj gradient do każdej gry
```

### Usuwane pliki — hub
```
apps/hub/src/components/Topbar/Topbar.tsx
apps/hub/src/components/Topbar/Topbar.module.css
apps/hub/src/components/GameCard/GameCard.tsx
apps/hub/src/components/GameCard/GameCard.module.css
apps/hub/src/components/GamesGrid/GamesGrid.tsx
apps/hub/src/components/GamesGrid/GamesGrid.module.css
```

---

## Task 1: Konfiguracja `@party/ui` — tsconfig i package.json

**Files:**
- Modify: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`

- [ ] Zaktualizuj `packages/ui/package.json`:

```json
{
  "name": "@party/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./tokens.css": "./src/tokens.css"
  },
  "scripts": {
    "build": "tsc --noEmit",
    "lint": "eslint ."
  }
}
```

**Uwaga:** Next.js bundluje TypeScript z workspace packages bezpośrednio (tak jak `@party/game-sdk` jest używany w tym projekcie). Nie potrzebujemy kompilacji do `dist/` — Next.js sam transpiluje przez ścieżkę `src/index.ts`.

- [ ] Utwórz `packages/ui/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- [ ] Dodaj path alias do `apps/hub/tsconfig.json` — w sekcji `"paths"`:

```json
"@party/ui": ["../../packages/ui/src"],
"@party/ui/*": ["../../packages/ui/src/*"]
```

I dodaj do `"include"`:
```json
"../../packages/ui/src/**/*.ts",
"../../packages/ui/src/**/*.tsx"
```

- [ ] Weryfikacja — sprawdź że hub nie ma błędów TypeScript:
```bash
cd C:\Users\Mateo\Desktop\Party && npx turbo build --filter="@party/hub" 2>&1 | tail -10
```
Oczekiwane: build przechodzi (jeszcze nie ma src/index.ts w ui, ale tsconfig powinien być poprawny).

- [ ] Commit:
```bash
git add packages/ui/package.json packages/ui/tsconfig.json apps/hub/tsconfig.json
git commit -m "chore: configure @party/ui package with tsconfig and path alias in hub"
```

---

## Task 2: Token system CSS

**Files:**
- Create: `packages/ui/src/tokens.css`
- Create: `packages/ui/src/index.ts` (skeleton)
- Modify: `apps/hub/src/app/globals.css`
- Modify: `apps/hub/src/app/layout.tsx`

- [ ] Utwórz `packages/ui/src/tokens.css`:

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
  --topbar-height: 52px;
  --sidebar-width: 200px;

  /* Typografia */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;

  /* Domyślne wartości game theme (nadpisywane przez theme.css każdej gry) */
  --game-color-primary: #7c3aed;
  --game-color-primary-light: #a78bfa;
  --game-color-primary-glow: rgba(124, 58, 237, 0.15);
  --game-gradient: linear-gradient(135deg, #3b1f7a, #7c3aed, #a78bfa);
}
```

- [ ] Utwórz skeleton `packages/ui/src/index.ts` (będzie rozszerzany w kolejnych taskach):

```ts
export {}
```

- [ ] Zastąp zmienne w `apps/hub/src/app/globals.css` (usuń `:root { ... }` blok, zostaw tylko reset i base styles):

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] Zaktualizuj `apps/hub/src/app/layout.tsx` — importuj tokens.css PRZED globals.css.

**Uwaga:** CSS z workspace package importujemy przez ścieżkę relative do path alias `@party/ui` — Next.js bundluje CSS z pakietów workspace automatycznie. Użyj `@party/ui/tokens.css` (mapuje na `../../packages/ui/src/tokens.css` przez alias `@party/ui/*`).

```tsx
import type { Metadata } from 'next'
import '@party/ui/tokens.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Party — gry przeglądarkowe',
  description: 'Portal gier imprezowych dla znajomych.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
```

**Uwaga:** Next.js pozwala importować CSS z node_modules / workspace packages w layout. Import `@party/ui/tokens.css` zadziała przez path alias w tsconfig i Next.js bundler.

- [ ] Weryfikacja — sprawdź build:
```bash
cd C:\Users\Mateo\Desktop\Party && npx turbo build --filter="@party/hub" 2>&1 | tail -15
```
Oczekiwane: build przechodzi bez błędów.

- [ ] Commit:
```bash
git add packages/ui/src/ apps/hub/src/app/globals.css apps/hub/src/app/layout.tsx
git commit -m "feat: add @party/ui token system CSS, migrate vars from globals.css"
```

---

## Task 3: Komponent `Topbar`

**Files:**
- Create: `packages/ui/src/Topbar/Topbar.tsx`
- Create: `packages/ui/src/Topbar/Topbar.module.css`
- Modify: `packages/ui/src/index.ts`

- [ ] Utwórz `packages/ui/src/Topbar/Topbar.tsx`:

```tsx
import Link from 'next/link'
import styles from './Topbar.module.css'

type TopbarProps = {
  gameName?: string
}

export function Topbar({ gameName }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>Project Party</Link>
        {gameName && (
          <>
            <span className={styles.separator}>/</span>
            <span className={styles.gameName}>{gameName}</span>
          </>
        )}
      </div>
      <button className={styles.authBtn} aria-label="Zaloguj się">
        <span className={styles.authBtnText}>Zaloguj się</span>
        <span aria-hidden="true">👤</span>
      </button>
    </header>
  )
}
```

- [ ] Utwórz `packages/ui/src/Topbar/Topbar.module.css`:

```css
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: var(--color-topbar-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text);
  text-decoration: none;
}

.separator {
  color: var(--color-border-hover);
  font-size: 0.9rem;
}

.gameName {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--game-color-primary-light, #a78bfa);
}

.authBtn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.authBtn:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-hover);
}

.authBtn:focus-visible {
  outline: 2px solid var(--color-focus-outline);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .authBtnText {
    display: none;
  }
}
```

- [ ] Zaktualizuj `packages/ui/src/index.ts`:

```ts
export { Topbar } from './Topbar/Topbar'
```

- [ ] Commit:
```bash
git add packages/ui/src/Topbar/ packages/ui/src/index.ts
git commit -m "feat: add Topbar component to @party/ui"
```

---

## Task 4: Komponent `GameSidebar`

**Files:**
- Create: `packages/ui/src/GameSidebar/GameSidebar.tsx`
- Create: `packages/ui/src/GameSidebar/GameSidebar.module.css`
- Modify: `packages/ui/src/index.ts`

- [ ] Utwórz `packages/ui/src/GameSidebar/GameSidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './GameSidebar.module.css'

export type NavLink = {
  label: string
  href: string
  icon?: string
}

type GameSidebarProps = {
  gameName: string
  gameEmoji: string
  links: NavLink[]
}

export function GameSidebar({ gameName, gameEmoji, links }: GameSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.gameHeader}>
          <span className={styles.gameEmoji}>{gameEmoji}</span>
          <span className={styles.gameName}>{gameName}</span>
        </div>
        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.bottom}>
          <Link href="/" className={styles.backLink}>← Wróć do lobby</Link>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <nav className={styles.tabBar}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.tabItem} ${pathname === link.href ? styles.tabActive : ''}`}
          >
            {link.icon && <span>{link.icon}</span>}
            <span className={styles.tabLabel}>{link.label}</span>
          </Link>
        ))}
        <Link href="/" className={styles.tabItem}>
          <span>🏠</span>
          <span className={styles.tabLabel}>Lobby</span>
        </Link>
      </nav>
    </>
  )
}
```

- [ ] Utwórz `packages/ui/src/GameSidebar/GameSidebar.module.css`:

```css
/* ===== Desktop sidebar ===== */
.sidebar {
  width: var(--sidebar-width);
  min-height: calc(100vh - var(--topbar-height));
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  flex-shrink: 0;
}

.gameHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 16px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 8px;
}

.gameEmoji {
  font-size: 20px;
}

.gameName {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-text);
}

.nav {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.navLink {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
  border-right: 2px solid transparent;
}

.navLink:hover {
  color: var(--color-text);
  background: var(--color-surface);
}

.navLink.active {
  color: var(--game-color-primary-light);
  background: var(--game-color-primary-glow);
  border-right-color: var(--game-color-primary);
  font-weight: 600;
}

.navIcon {
  font-size: 15px;
}

.bottom {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.backLink {
  font-size: 12px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.backLink:hover {
  color: var(--color-text);
}

/* ===== Mobile tab bar ===== */
.tabBar {
  display: none;
}

@media (max-width: 767px) {
  .sidebar {
    display: none;
  }

  .tabBar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: var(--color-topbar-bg);
    backdrop-filter: blur(12px);
    border-top: 1px solid var(--color-border);
    z-index: 100;
  }

  .tabItem {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 11px;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.15s;
  }

  .tabItem.tabActive {
    color: var(--game-color-primary-light);
  }

  .tabLabel {
    font-size: 10px;
  }
}
```

- [ ] Zaktualizuj `packages/ui/src/index.ts`:

```ts
export { Topbar } from './Topbar/Topbar'
export { GameSidebar } from './GameSidebar/GameSidebar'
export type { NavLink } from './GameSidebar/GameSidebar'
```

- [ ] Commit:
```bash
git add packages/ui/src/GameSidebar/ packages/ui/src/index.ts
git commit -m "feat: add GameSidebar component to @party/ui (desktop + mobile tab bar)"
```

---

## Task 5: Komponent `GameShell`

**Files:**
- Create: `packages/ui/src/GameShell/GameShell.tsx`
- Create: `packages/ui/src/GameShell/GameShell.module.css`
- Modify: `packages/ui/src/index.ts`

- [ ] Utwórz `packages/ui/src/GameShell/GameShell.tsx`:

```tsx
import { Topbar } from '../Topbar/Topbar'
import { GameSidebar } from '../GameSidebar/GameSidebar'
import type { NavLink } from '../GameSidebar/GameSidebar'
import styles from './GameShell.module.css'

type GameShellProps = {
  gameName: string
  gameEmoji: string
  links: NavLink[]
  children: React.ReactNode
}

export function GameShell({ gameName, gameEmoji, links, children }: GameShellProps) {
  return (
    <div className={styles.root}>
      <Topbar gameName={gameName} />
      <div className={styles.body}>
        <GameSidebar gameName={gameName} gameEmoji={gameEmoji} links={links} />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] Utwórz `packages/ui/src/GameShell/GameShell.module.css`:

```css
.root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.body {
  display: flex;
  flex: 1;
  margin-top: var(--topbar-height);
}

.main {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
}

@media (max-width: 767px) {
  .main {
    padding-bottom: 56px;
  }
}
```

- [ ] Zaktualizuj `packages/ui/src/index.ts`:

```ts
export { Topbar } from './Topbar/Topbar'
export { GameSidebar } from './GameSidebar/GameSidebar'
export type { NavLink } from './GameSidebar/GameSidebar'
export { GameShell } from './GameShell/GameShell'
```

- [ ] Commit:
```bash
git add packages/ui/src/GameShell/ packages/ui/src/index.ts
git commit -m "feat: add GameShell component to @party/ui"
```

---

## Task 6: Komponent `GameCard` (gradient hero)

**Files:**
- Create: `packages/ui/src/GameCard/GameCard.tsx`
- Create: `packages/ui/src/GameCard/GameCard.module.css`
- Modify: `packages/game-sdk/src/types/GameConfig.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] Dodaj `gradient?: string` do `packages/game-sdk/src/types/GameConfig.ts`:

```ts
export type GameConfig = {
  id: string
  name: string
  description: string
  icon: string
  minPlayers: number
  maxPlayers: number
  isPremium: boolean
  color: string
  href: string
  modes: string[]
  categories: string[]
  gradient?: string
}
```

- [ ] Utwórz `packages/ui/src/GameCard/GameCard.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { GameConfig } from '@party/game-sdk'
import styles from './GameCard.module.css'

type GameCardProps = {
  game: GameConfig
  onPremiumClick?: () => void
}

export function GameCard({ game, onPremiumClick }: GameCardProps) {
  const gradient = game.gradient ?? `linear-gradient(135deg, ${game.color}88, ${game.color})`

  if (game.isPremium) {
    return (
      <button className={styles.card} onClick={onPremiumClick} aria-label={`${game.name} — Premium`}>
        <div className={styles.hero} style={{ background: gradient, opacity: 0.4 }}>
          <span className={styles.heroIcon}>🔒</span>
        </div>
        <div className={styles.body}>
          <div className={styles.name}>{game.name}</div>
          <div className={styles.description}>{game.description}</div>
          <div className={styles.meta}>
            <span className={styles.players}>{game.minPlayers}–{game.maxPlayers} graczy</span>
            <span className={styles.premiumBadge}>Premium</span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <Link href={game.href} className={styles.card}>
      <div className={styles.hero} style={{ background: gradient }}>
        <span className={styles.heroIcon}>{game.icon}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{game.name}</div>
        <div className={styles.description}>{game.description}</div>
        <div className={styles.meta}>
          <span className={styles.players}>{game.minPlayers}–{game.maxPlayers} graczy</span>
          <span className={styles.playBtn}>Zagraj →</span>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] Utwórz `packages/ui/src/GameCard/GameCard.module.css`:

```css
.card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  text-align: left;
  width: 100%;
}

.card:hover {
  transform: translateY(-3px);
  border-color: var(--color-border-hover);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.card:focus-visible {
  outline: 2px solid var(--color-focus-outline);
  outline-offset: 2px;
}

.hero {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.heroIcon {
  font-size: 48px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
}

.body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.name {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.description {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.players {
  font-size: 11px;
  color: var(--color-text-muted);
}

.playBtn {
  font-size: 12px;
  font-weight: 700;
  color: var(--game-color-primary-light, #a78bfa);
}

.premiumBadge {
  font-size: 11px;
  font-weight: 700;
  color: rgb(250, 204, 21);
  background: rgba(250, 204, 21, 0.08);
  border: 1px solid rgba(250, 204, 21, 0.3);
  padding: 2px 8px;
  border-radius: 999px;
}
```

- [ ] Zaktualizuj `packages/ui/src/index.ts`:

```ts
export { Topbar } from './Topbar/Topbar'
export { GameSidebar } from './GameSidebar/GameSidebar'
export type { NavLink } from './GameSidebar/GameSidebar'
export { GameShell } from './GameShell/GameShell'
export { GameCard } from './GameCard/GameCard'
```

- [ ] Commit:
```bash
git add packages/ui/src/GameCard/ packages/ui/src/index.ts packages/game-sdk/src/types/GameConfig.ts
git commit -m "feat: add GameCard (gradient hero) to @party/ui, add gradient field to GameConfig"
```

---

## Task 7: Integracja hub — strona główna

**Files:**
- Modify: `apps/hub/src/data/games.ts`
- Modify: `apps/hub/src/app/page.tsx`
- Delete: `apps/hub/src/components/Topbar/`
- Delete: `apps/hub/src/components/GameCard/`
- Delete: `apps/hub/src/components/GamesGrid/`

- [ ] Dodaj `gradient` do `apps/hub/src/data/games.ts`:

```ts
import type { GameConfig } from '@party/game-sdk'

export const games: GameConfig[] = [
  {
    id: 'charades',
    name: 'Kalambury',
    description: 'Pokazuj hasła bez słów — tylko gestem i mimiką.',
    icon: '🎭',
    minPlayers: 2,
    maxPlayers: 8,
    isPremium: false,
    color: '#7c3aed',
    href: '/games/charades',
    modes: ['classic'],
    categories: ['animals', 'movies', 'sport'],
    gradient: 'linear-gradient(135deg, #3b1f7a, #7c3aed, #a78bfa)',
  },
]
```

- [ ] Zastąp `apps/hub/src/app/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Topbar, GameCard } from '@party/ui'
import { PremiumModal } from '@/components/PremiumModal/PremiumModal'
import { games } from '@/data/games'
import styles from './page.module.css'

export default function HomePage() {
  const [showPremium, setShowPremium] = useState(false)

  return (
    <>
      <Topbar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Wybierz grę</h1>
        <div className={styles.grid}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPremiumClick={() => setShowPremium(true)}
            />
          ))}
        </div>
      </main>
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </>
  )
}
```

- [ ] Sprawdź czy istnieje `apps/hub/src/app/page.module.css`. Jeśli nie — utwórz:

```css
.main {
  padding: calc(var(--topbar-height) + 32px) 24px 32px;
  max-width: 960px;
  margin: 0 auto;
}

.heading {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
```

- [ ] Usuń stare komponenty z huba (przez git rm żeby usunięcie trafiło do stage):
```bash
git rm -r apps/hub/src/components/Topbar
git rm -r apps/hub/src/components/GameCard
git rm -r apps/hub/src/components/GamesGrid
```

- [ ] Weryfikacja:
```bash
cd C:\Users\Mateo\Desktop\Party && npx turbo build --filter="@party/hub" 2>&1 | tail -15
```
Oczekiwane: build przechodzi, wszystkie trasy OK.

- [ ] Commit:
```bash
git add apps/hub/src/ apps/hub/src/data/games.ts
git commit -m "feat: migrate hub home page to @party/ui Topbar and GameCard"
```

---

## Task 8: Integracja Kalambury — theme.css i layout

**Files:**
- Create: `apps/hub/src/app/games/charades/theme.css`
- Create: `apps/hub/src/app/games/charades/layout.tsx`
- Create: `apps/hub/src/app/games/charades/play/layout.tsx`
- Create: `apps/hub/src/app/games/charades/present/layout.tsx`

- [ ] Utwórz `apps/hub/src/app/games/charades/theme.css`:

```css
:root {
  --game-color-primary: #7c3aed;
  --game-color-primary-light: #a78bfa;
  --game-color-primary-glow: rgba(124, 58, 237, 0.15);
  --game-gradient: linear-gradient(135deg, #3b1f7a, #7c3aed, #a78bfa);
}
```

- [ ] Utwórz `apps/hub/src/app/games/charades/layout.tsx`:

```tsx
import { GameShell } from '@party/ui'
import type { NavLink } from '@party/ui'
import './theme.css'

const links: NavLink[] = [
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

- [ ] Utwórz `apps/hub/src/app/games/charades/play/layout.tsx`:

```tsx
export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] Utwórz `apps/hub/src/app/games/charades/present/layout.tsx`:

```tsx
export default function PresentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] Weryfikacja build:
```bash
cd C:\Users\Mateo\Desktop\Party && npx turbo build --filter="@party/hub" 2>&1 | tail -15
```
Oczekiwane: wszystkie trasy OK.

- [ ] Commit:
```bash
git add apps/hub/src/app/games/charades/theme.css apps/hub/src/app/games/charades/layout.tsx apps/hub/src/app/games/charades/play/layout.tsx apps/hub/src/app/games/charades/present/layout.tsx
git commit -m "feat: add GameShell layout and theme to Kalambury routes"
```

---

## Task 9: Weryfikacja końcowa

- [ ] Pełny build:
```bash
cd C:\Users\Mateo\Desktop\Party && npx turbo build --filter="@party/hub" 2>&1 | tail -20
```
Oczekiwane: `Tasks: N successful` bez błędów TypeScript.

- [ ] Uruchom dev server:
```bash
cd C:\Users\Mateo\Desktop\Party && npm run dev
```

- [ ] Sprawdź ręcznie:
  1. `http://localhost:3000` — strona główna z nowym GameCard (gradient hero), Topbar bez nazwy gry
  2. `http://localhost:3000/games/charades` — GameShell widoczny: Topbar z "Project Party / Kalambury", sidebar z linkami
  3. `http://localhost:3000/games/charades/config` — GameShell widoczny, aktywny link "Konfiguracja"
  4. `http://localhost:3000/games/charades/play` — pełny ekran BEZ GameShell
  5. `http://localhost:3000/games/charades/present` — pełny ekran BEZ GameShell
  6. Mobile (DevTools → responsive): sidebar ukryty, tab bar u dołu

- [ ] Commit końcowy jeśli były drobne poprawki:
```bash
git add -A
git commit -m "chore: final tweaks after shared shell integration"
```
