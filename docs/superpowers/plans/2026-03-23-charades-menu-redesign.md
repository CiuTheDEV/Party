# Charades Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Przeprojektować stronę menu Kalamburów zgodnie z zatwierdzonym mockupem — dodać GameIcon do @party/ui, obsługę disabled linków w GameSidebar, oraz pełny redesign page.tsx z kartą trybu i stopką.

**Architecture:** Zmiany w dwóch miejscach: (1) `packages/ui` — nowy komponent GameIcon + rozszerzenie NavLink o `disabled`, (2) `apps/hub/src/app/games/charades` — redesign page.tsx i layout.tsx. Brak nowych tras ani logiki backendowej.

**Tech Stack:** Next.js 16, TypeScript, CSS Modules, `@party/ui` (workspace package importowany przez path alias)

---

## File Map

| Plik | Akcja | Odpowiedzialność |
|------|-------|-----------------|
| `packages/ui/src/GameIcon/GameIcon.tsx` | Utwórz | Komponent: zaokrąglony kwadrat z gradientem + emoji |
| `packages/ui/src/GameIcon/GameIcon.module.css` | Utwórz | Style GameIcon |
| `packages/ui/src/GameSidebar/GameSidebar.tsx` | Modyfikuj | Dodaj `disabled` do NavLink type + renderowanie jako `<span>` |
| `packages/ui/src/GameSidebar/GameSidebar.module.css` | Modyfikuj | Dodaj `.navLinkDisabled` i `.tabDisabled` |
| `packages/ui/src/index.ts` | Modyfikuj | Eksportuj GameIcon |
| `apps/hub/src/app/games/charades/page.tsx` | Modyfikuj | Hero + ModeCard + Footer |
| `apps/hub/src/app/games/charades/page.module.css` | Modyfikuj | Nowe style dla wszystkich sekcji |
| `apps/hub/src/app/games/charades/layout.tsx` | Modyfikuj | Dodaj disabled linki Ustawienia + Rankingi |

---

## Task 1: Komponent GameIcon w @party/ui

**Files:**
- Create: `packages/ui/src/GameIcon/GameIcon.tsx`
- Create: `packages/ui/src/GameIcon/GameIcon.module.css`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Utwórz `GameIcon.module.css`**

```css
/* packages/ui/src/GameIcon/GameIcon.module.css */
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: var(--game-gradient);
  flex-shrink: 0;
}

.sm { width: 48px; height: 48px; font-size: 24px; border-radius: 12px; }
.md { width: 72px; height: 72px; font-size: 36px; border-radius: 16px; }
.lg { width: 96px; height: 96px; font-size: 48px; border-radius: 20px; }
```

- [ ] **Step 2: Utwórz `GameIcon.tsx`**

```tsx
// packages/ui/src/GameIcon/GameIcon.tsx
import styles from './GameIcon.module.css'

type Props = {
  emoji: string
  size?: 'sm' | 'md' | 'lg'
}

export function GameIcon({ emoji, size = 'md' }: Props) {
  return (
    <div className={`${styles.icon} ${styles[size]}`} aria-hidden="true">
      {emoji}
    </div>
  )
}
```

- [ ] **Step 3: Dodaj eksport do `packages/ui/src/index.ts`**

Dopisz na końcu pliku:
```ts
export { GameIcon } from './GameIcon/GameIcon'
```

- [ ] **Step 4: Sprawdź czy TypeScript kompiluje bez błędów**

```bash
cd C:/Users/Mateo/Desktop/Party
npx turbo build --filter="@party/hub"
```

Oczekiwane: build OK, 0 błędów TS. Jeśli są błędy — napraw je przed przejściem dalej.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/GameIcon/GameIcon.tsx packages/ui/src/GameIcon/GameIcon.module.css packages/ui/src/index.ts
git commit -m "feat: add GameIcon component to @party/ui"
```

---

## Task 2: Disabled linki w GameSidebar

**Files:**
- Modify: `packages/ui/src/GameSidebar/GameSidebar.tsx`
- Modify: `packages/ui/src/GameSidebar/GameSidebar.module.css`

Kontekst: `NavLink` jest zdefiniowany inline w `GameSidebar.tsx` (linia 7-11). Dodajemy `disabled?: boolean`. Gdy `disabled: true`, renderujemy `<span>` zamiast `<Link>` — zarówno w sidebar jak i w mobile tab bar.

- [ ] **Step 1: Rozszerz typ NavLink i logikę renderowania w `GameSidebar.tsx`**

Zmień plik na:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './GameSidebar.module.css'

export type NavLink = {
  label: string
  href: string
  icon?: string
  disabled?: boolean
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
          {links.map((link) =>
            link.disabled ? (
              <span
                key={link.href}
                className={`${styles.navLink} ${styles.navLinkDisabled}`}
              >
                {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
                {link.label}
              </span>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.icon && <span className={styles.navIcon}>{link.icon}</span>}
                {link.label}
              </Link>
            )
          )}
        </nav>
        <div className={styles.bottom}>
          <Link href="/" className={styles.backLink}>← Wróć do lobby</Link>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <nav className={styles.tabBar}>
        {links.map((link) =>
          link.disabled ? (
            <span
              key={link.href}
              className={`${styles.tabItem} ${styles.tabDisabled}`}
            >
              {link.icon && <span>{link.icon}</span>}
              <span className={styles.tabLabel}>{link.label}</span>
            </span>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.tabItem} ${pathname === link.href ? styles.tabActive : ''}`}
            >
              {link.icon && <span>{link.icon}</span>}
              <span className={styles.tabLabel}>{link.label}</span>
            </Link>
          )
        )}
        <Link href="/" className={styles.tabItem}>
          <span>🏠</span>
          <span className={styles.tabLabel}>Lobby</span>
        </Link>
      </nav>
    </>
  )
}
```

- [ ] **Step 2: Dodaj style disabled do `GameSidebar.module.css`**

Dopisz po linii `.navLink.active { ... }`:
```css
.navLinkDisabled {
  opacity: 0.35;
  cursor: default;
  pointer-events: none;
}

.tabDisabled {
  opacity: 0.35;
  cursor: default;
}
```

- [ ] **Step 3: Sprawdź build**

```bash
cd C:/Users/Mateo/Desktop/Party
npx turbo build --filter="@party/hub"
```

Oczekiwane: build OK, 0 błędów TS.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/GameSidebar/GameSidebar.tsx packages/ui/src/GameSidebar/GameSidebar.module.css
git commit -m "feat: support disabled NavLink in GameSidebar"
```

---

## Task 3: Redesign charades/layout.tsx

**Files:**
- Modify: `apps/hub/src/app/games/charades/layout.tsx`

Dodajemy dwa disabled linki do listy nawigacji. Plik jest krótki (17 linii) — zmieniamy tylko tablicę `links`.

- [ ] **Step 1: Zaktualizuj `layout.tsx`**

```tsx
import { GameShell } from '@party/ui'
import type { NavLink } from '@party/ui'
import './theme.css'

const links: NavLink[] = [
  { label: 'Menu gry', href: '/games/charades' },
  { label: 'Konfiguracja', href: '/games/charades/config' },
  { label: 'Ustawienia', href: '/games/charades/settings', disabled: true },
  { label: 'Rankingi', href: '/games/charades/rankings', disabled: true },
]

export default function CharadesLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameShell gameName="Kalambury" gameEmoji="🎭" links={links}>
      {children}
    </GameShell>
  )
}
```

- [ ] **Step 2: Sprawdź build**

```bash
cd C:/Users/Mateo/Desktop/Party
npx turbo build --filter="@party/hub"
```

Oczekiwane: build OK.

- [ ] **Step 3: Commit**

```bash
git add apps/hub/src/app/games/charades/layout.tsx
git commit -m "feat: add disabled Ustawienia and Rankingi links to charades sidebar"
```

---

## Task 4: Redesign charades/page.tsx i page.module.css

**Files:**
- Modify: `apps/hub/src/app/games/charades/page.tsx`
- Modify: `apps/hub/src/app/games/charades/page.module.css`

To jest główna zmiana wizualna. Trzy sekcje: Hero (GameIcon + tytuł + podtytuł), ModeCard (karta trybu z badge i przyciskiem), Footer (nieaktywne linki + pasek info).

- [ ] **Step 1: Zastąp `page.tsx`**

```tsx
import Link from 'next/link'
import { GameIcon } from '@party/ui'
import styles from './page.module.css'

export default function CharadesMenuPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <GameIcon emoji="🎭" size="lg" />
        <h1 className={styles.title}>Kalambury</h1>
        <p className={styles.subtitle}>
          Pokazuj hasła bez słów — tylko gestem i mimiką.<br />
          Sprawdź, czy Twoi znajomi Cię zrozumieją!
        </p>
      </section>

      <section className={styles.modeCard}>
        <div className={styles.modeHeader}>
          <h2 className={styles.modeName}>Tryb Klasyczny</h2>
          <span className={styles.badge}>ZALECANY</span>
        </div>
        <p className={styles.modeDesc}>
          Każdy gracz prezentuje hasło po kolei. Gra do wybranej liczby rund.
          Potrzebujesz drugiego urządzenia dla prezentera.
        </p>
        <ul className={styles.details}>
          <li>👥 2–8 graczy</li>
          <li>📱 Jedno urządzenie dla prezentera (telefon)</li>
          <li>🎯 Wybierasz kategorie słów i liczbę rund</li>
        </ul>
        <Link href="/games/charades/config" className={styles.playBtn}>
          Zagraj Teraz ▶
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <span className={styles.footerLink}>Jak grać?</span>
          <span className={styles.footerLink}>Zasady</span>
          <span className={styles.footerLink}>Wsparcie</span>
        </div>
        <p className={styles.infoBar}>ℹ️ Pamiętaj o bezpiecznej zabawie w grupie!</p>
      </footer>
    </main>
  )
}
```

- [ ] **Step 2: Zastąp `page.module.css`**

```css
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 40px 24px;
}

/* Hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.title {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--color-text);
}

.subtitle {
  font-size: 16px;
  color: var(--color-text-muted);
  max-width: 420px;
  line-height: 1.6;
}

/* Mode card */
.modeCard {
  width: min(480px, 100%);
  padding: 28px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modeHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modeName {
  font-size: 20px;
  font-weight: 700;
}

.badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--game-color-primary-light);
  background: var(--game-color-primary-glow);
  border: 1px solid var(--game-color-primary);
  border-radius: 6px;
  padding: 3px 8px;
  white-space: nowrap;
}

.modeDesc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.details {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.playBtn {
  display: block;
  text-align: center;
  padding: 16px;
  background: var(--game-color-primary);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border-radius: 10px;
  transition: opacity 0.2s;
  text-decoration: none;
}

.playBtn:hover {
  opacity: 0.85;
}

/* Footer */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: min(480px, 100%);
}

.footerLinks {
  display: flex;
  gap: 24px;
}

.footerLink {
  font-size: 13px;
  color: var(--color-text-muted);
  opacity: 0.5;
  cursor: default;
}

.infoBar {
  font-size: 12px;
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* Mobile */
@media (max-width: 767px) {
  .title {
    font-size: 28px;
  }
}
```

- [ ] **Step 3: Sprawdź build**

```bash
cd C:/Users/Mateo/Desktop/Party
npx turbo build --filter="@party/hub"
```

Oczekiwane: build OK, 0 błędów TS, 7 tras zbudowanych.

- [ ] **Step 4: Uruchom dev server i sprawdź wizualnie**

```bash
cd C:/Users/Mateo/Desktop/Party
npm run dev
```

Otwórz `http://localhost:3000/games/charades` i sprawdź:
- [ ] Ikona gry w zaokrąglonym kwadracie z gradientem
- [ ] Tytuł "Kalambury" duży i bold
- [ ] Karta trybu z badge "ZALECANY" po prawej
- [ ] Przycisk "Zagraj Teraz ▶" fioletowy, pełna szerokość
- [ ] Linki w stopce są nieaktywne (nie są klikalne)
- [ ] Sidebar ma "Ustawienia" i "Rankingi" wyszarzone
- [ ] Mobile (< 768px): tab bar działa, wyszarzone pozycje widoczne

- [ ] **Step 5: Commit**

```bash
git add apps/hub/src/app/games/charades/page.tsx apps/hub/src/app/games/charades/page.module.css
git commit -m "feat: redesign charades game menu page"
```
