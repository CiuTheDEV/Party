# Hub Design Spec

*Date: 2026-03-22*
*Status: Approved*

---

## Goal

Landing page (`apps/hub`) — użytkownik widzi listę gier i natychmiast chce w nie kliknąć. Zero zbędnych elementów, premium feel, efekt "wow".

---

## Visual Direction

- Ciemne tło: `#0a0a0a`
- Karty: glassmorphism (półprzezroczyste, `border: 1px solid rgba(255,255,255,0.08)`, `backdrop-filter: blur`)
- Hover na karcie: delikatny glow w kolorze przypisanym do gry
- Karty Premium: overlay z ikoną kłódki
- Typografia: nowoczesna, duże nagłówki, minimum tekstu

---

## Layout

```
┌─────────────────────────────────────┐
│  🎉 Party          [Zaloguj się]    │  ← topbar sticky
├─────────────────────────────────────┤
│                                     │
│  Wybierz grę                        │  ← heading
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │ 🎭       │  │ 🔒       │         │
│  │ Kalambury│  │ Nazwa    │         │
│  │ Pantomima│  │ Premium  │         │
│  │ 2-8 gr.  │  │ 2-6 gr.  │         │
│  └──────────┘  └──────────┘         │
│                                     │
└─────────────────────────────────────┘
```

**Responsywność:**
- Desktop (≥768px): 3 kolumny
- Mobile (<768px): 1 kolumna

---

## Architecture

- **Framework**: Next.js App Router, strona `/` statyczna
- **Routing**: kliknięcie karty → `href` z `GameConfig` (np. `/games/charades`)
- **Auth**: Clerk jako provider na całej aplikacji — tylko wizualnie na tym etapie (Phase 5 podłącza logikę)

---

## Components

| Komponent | Opis |
|-----------|------|
| `Topbar` | Logo "Party" + przycisk "Zaloguj się" (Clerk stub) |
| `GameCard` | Ikona, nazwa, opis (1 zdanie), badge graczy, badge Premium |
| `GamesGrid` | Responsywny grid kart |
| `PremiumModal` | Modal "odblokuj" — stub, nie podłączony do płatności |

Każdy komponent w osobnym pliku. Style w `.module.css` obok komponentu.

---

## Data

Statyczny plik `apps/hub/src/data/games.ts`:

```typescript
type Game = {
  id: string
  name: string           // "Kalambury"
  description: string    // 1 zdanie
  icon: string           // emoji
  minPlayers: number
  maxPlayers: number
  isPremium: boolean
  color: string          // kolor glow na hover, np. "#7c3aed"
  href: string           // "/games/charades"
}
```

Dodanie nowej gry = jeden nowy obiekt w tablicy. Brak bazy danych na tym etapie.

---

## File Structure

```
apps/hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx        ← root layout, Clerk provider
│   │   ├── page.tsx          ← strona główna
│   │   └── globals.css       ← reset, custom properties, base typography
│   ├── components/
│   │   ├── Topbar/
│   │   │   ├── Topbar.tsx
│   │   │   └── Topbar.module.css
│   │   ├── GameCard/
│   │   │   ├── GameCard.tsx
│   │   │   └── GameCard.module.css
│   │   ├── GamesGrid/
│   │   │   ├── GamesGrid.tsx
│   │   │   └── GamesGrid.module.css
│   │   └── PremiumModal/
│   │       ├── PremiumModal.tsx
│   │       └── PremiumModal.module.css
│   └── data/
│       └── games.ts
└── package.json
```

---

## Out of Scope (this phase)

- Clerk auth wired up (Phase 5)
- Room creation (Phase 1b)
- Search / filtering gier
- Animacje między stronami
