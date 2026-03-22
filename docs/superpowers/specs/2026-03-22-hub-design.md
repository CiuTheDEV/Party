# Hub Design Spec

*Date: 2026-03-22*
*Status: Approved*

---

## Goal

Landing page (`apps/hub`) — user sees game list immediately and wants to click. Zero unnecessary elements, premium feel, "wow" effect.

---

## Visual Direction

- Dark background: `#0a0a0a`
- Cards: glassmorphism (semi-transparent, `border: 1px solid rgba(255,255,255,0.08)`, `backdrop-filter: blur`)
- Card hover: subtle glow in the game's assigned color
- Premium cards: overlay with lock icon
- Typography: modern, large headings, minimum text

---

## Layout

```
┌─────────────────────────────────────┐
│  🎉 Party            [Sign in]      │  ← sticky topbar
├─────────────────────────────────────┤
│                                     │
│  Choose a game                      │  ← heading
│                                     │
│  ┌──────────┐  ┌──────────┐         │
│  │ 🎭       │  │ 🔒       │         │
│  │ Kalambury│  │ Name     │         │
│  │ Pantomime│  │ Premium  │         │
│  │ 2-8 pl.  │  │ 2-6 pl.  │         │
│  └──────────┘  └──────────┘         │
│                                     │
└─────────────────────────────────────┘
```

**Responsiveness:**
- Desktop (≥768px): 3 columns
- Mobile (<768px): 1 column

**Topbar responsiveness:**
- Desktop (≥768px): full button text "Sign in"
- Mobile (<768px): icon-only button (avatar placeholder)
- Sticky: yes, fixed top on scroll

Note: UI text displayed to users is in Polish (e.g. "Kalambury", "Zagraj"). Code identifiers, comments, and spec are in English.

---

## Architecture

- **Framework**: Next.js App Router, `/` page is static
- **Routing**: card click → `href` from `Game` type (e.g. `/games/charades`)
- **Auth**: Clerk provider wraps entire app in `layout.tsx` — visual only at this phase (Phase 5 wires logic)

---

## Clerk Integration

- `layout.tsx`: Wrap app with `<ClerkProvider>`
- `Topbar`: Use Clerk's `<SignInButton />` + `<UserButton />` — no custom auth logic
- Phase 1 only adds UI placeholders, no auth flows

---

## Components

| Component | Description |
|-----------|-------------|
| `Topbar` | Logo "Party" + "Sign in" button (Clerk stub) |
| `GameCard` | Icon, name, description (1 sentence), players badge, Premium badge |
| `GamesGrid` | Responsive card grid |
| `PremiumModal` | "Unlock" modal — stub, not connected to payments |

One component per file. Styles in `.module.css` next to the component.

---

## Accessibility

- Game cards: `<a>` tag (not `<div>`), keyboard-navigable
- Icons: always paired with visible text or `aria-label`
- Premium modal: focus trap (Tab loops within modal)
- Topbar buttons: `aria-label="Sign in"`, `aria-label="User menu"`

---

## Edge Cases

- Empty games list: show "No games available" message
- Clerk load failure: show login button as disabled
- Premium card click: open `PremiumModal` with "Coming soon" message (Stripe stub, Phase 7)

---

## Data

Static file `apps/hub/src/data/games.ts`:

```typescript
type Game = {
  id: string
  name: string           // "Kalambury" — display name in Polish
  description: string    // 1 sentence, in Polish
  icon: string           // emoji
  minPlayers: number
  maxPlayers: number
  isPremium: boolean
  color: string          // hover glow color, e.g. "#7c3aed"
  href: string           // "/games/charades"
}
```

Adding a new game = one new object in the array. No database at this phase.

---

## File Structure

```
apps/hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx        ← root layout, ClerkProvider
│   │   ├── page.tsx          ← main page
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
- Search / filtering games
- Page transition animations
