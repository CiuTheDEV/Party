# New Game Checklist

Operational checklist for adding a new game module to Project Party. Follow steps in order. Each step has concrete requirements — do not substitute "follow Charades" for actual verification.

Reference implementation: `packages/games/charades/` (live) and `packages/games/codenames/` (menu + setup, no runtime).

CSS rules are in `packages/game-sdk/README.md` under "CSS Contract for Game Modules".

Before starting, also read:
- `docs/game-module-template.md`
- `docs/ui-map.md`
- `docs/runtime-map.md` if the new game will have real runtime flow
- `docs/module-maturity.md`

---

## Step 1 — Content

Create `content/[game]/index.ts` with the word category list.

Requirements:
- Export `[Game]WordCategory` type with fields: `id`, `name`, `description`, `words`
- `description` is a single sentence explaining who the category is for, displayed in the setup UI
- Export a `[game]Categories: [Game]WordCategory[]` array
- Every category must have at least one word

Example:
```ts
export type MyGameWordCategory = {
  id: string
  name: string
  description: string
  words: string[]
}

export const myGameCategories: MyGameWordCategory[] = [
  {
    id: 'standard',
    name: 'Standardowe',
    description: 'Ogólne hasła odpowiednie dla każdego. Bez treści dla dorosłych.',
    words: [...],
  },
]
```

Add the content directory to hub's `tsconfig.json` under `include` if not already covered by `../../content/**/*.ts`.

---

## Step 2 — Package scaffold

Create `packages/games/[game]/` with:
- `package.json` — name: `@party/[game]`, with dependencies on `@party/game-sdk` and `@party/ui`
- `tsconfig.json` — extends root tsconfig
- `src/index.ts` — main export file

Use `docs/game-module-template.md` as the baseline ownership and file-shape reference.

Register in:
- `turbo.json` — add workspace
- Root `package.json` workspaces — add `packages/games/[game]`
- Hub `tsconfig.json` paths — add `@party/[game]` → `../../packages/games/[game]/src`
- Hub `tsconfig.json` include — add `../../packages/games/[game]/src/**/*.ts` and `.tsx`

---

## Step 3 — Config

Create `packages/games/[game]/src/config.ts`:

```ts
import type { GameConfig } from '@party/game-sdk'

export const config: GameConfig = {
  id: '[game]',
  name: '[Name]',
  description: '...',
  icon: '🎮',
  status: 'coming-soon',  // change to 'live' only when gameplay is complete
  isPremium: false,
  color: '#xxxxxx',       // the ONLY place this hex is hardcoded
  href: '/games/[game]',
  modes: ['classic'],
}
```

---

## Step 4 — Setup state and helpers

Create `packages/games/[game]/src/setup/state.ts`:
- Export setup state type
- Export `createInitial[Game]SetupState()` function with sensible defaults
- Export `validate[Game]Setup(state)` returning `GameSetupValidation`
- `canStart: false` for every blocking condition with a human-readable error message

Create `packages/games/[game]/src/setup/helpers.ts`:
- Import `GameWordCategory` from `@party/game-sdk`
- Export `[Game]WordCategory = GameWordCategory` (alias, not redefinition)
- Export `[Game]SetupHelpers` type with `categories: [Game]WordCategory[]`

---

## Step 5 — Setup sections

Each section component (`[Name]Section.tsx`) must:

**CSS rules (non-negotiable):**
- Use only `var(--game-color-primary)` and `var(--game-color-primary-glow)` for game colors
- Use `color-mix(in srgb, var(--game-color-primary) X%, transparent)` for any transparency on game colors
- Never use `rgba(r, g, b, a)` with hardcoded game color values

**Section title** (in `[Name]Section.module.css`):
```css
.sectionTitle {
  margin: 0;
  font-size: 24px;
  line-height: 1;
  letter-spacing: -0.03em;
  font-weight: 800;
  color: var(--color-text);
}

@media (max-width: 767px) {
  .sectionTitle {
    font-size: 22px;
  }
}
```

**Category section specifically:**
- Render a card per category with `name`, `description`, and word count
- Active state uses `var(--game-color-primary)` for border and background via `color-mix()`
- At least one category must be selected for `canStart: true`

**SettingsPanel:**
- Show only kafelki that reflect actual settings for this game
- Do not copy kafelki from another game — if this game has one setting, show one kafelek

---

## Step 6 — Menu

Create `packages/games/[game]/src/menu/`:
- `[Game]MenuContent.tsx` — one mode card + "Zagraj teraz" button, settings overlay integration
- `[Game]MenuContent.module.css` — game colors via `var()`, no hardcoded hex
- `[Game]SettingsOverlay.tsx` — three tabs: Ogólne, Dźwięk, Sterowanie (Sterowanie has real bindings, Ogólne and Dźwięk are placeholders)
- `[Game]SettingsOverlay.module.css` — game colors via `var()` and `color-mix()`
- `menu-view.ts`, `menu-controls.ts`, `useMenuControls.ts` — copied and renamed from Charades

Before copying any local shell-like UI from another game, check `docs/ui-map.md` to confirm the pattern does not already exist in `@party/ui`.

---

## Step 7 — Navigation profiles

Create `packages/games/[game]/src/navigation/`:
- `[game]-navigation-targets.ts`
- `[game]-navigation-actions.ts`
- `[game]-menu-navigation-profile.ts`
- `[game]-settings-navigation-profile.ts`
- `[game]-setup-navigation-profile.ts`

Each profile must define `screenId`, `getEntryTarget(context)`, and `resolveAction(...)`. See `packages/game-sdk/README.md` under "Host Navigation Adoption" for full requirements.

If the game will have real runtime host flow, also follow `docs/runtime-map.md` so engine-level infra stays shared and game command semantics stay local.

---

## Step 8 — Hub route

Create `apps/hub/src/app/games/[game]/`:

**`theme.css`** — scoped to `.theme-[game]`, never `:root`:
```css
.theme-[game] {
  --game-color-primary: #xxxxxx;
  --game-color-primary-glow: rgba(r, g, b, 0.15);
  --game-color-primary-light: #yyyyyy;
  --game-gradient: linear-gradient(...);
}
```

**`layout.tsx`** — passes `rootClassName="theme-[game]"` to `GameShell`.

**`page.tsx`** — wires module, helpers (with categories from `@content/[game]`), and setup state.

---

## Step 9 — Module export

In `packages/games/[game]/src/index.ts` export:
- `[game]Module: GameModule<[Game]SetupState, [Game]SetupHelpers>`
- `[Game]MenuContent`
- All navigation constants and helpers
- `useMenuControls`
- All types: state, helpers, setup, navigation

---

## Step 10 — Verification

Run both of these before declaring done:

```bash
npm run build
```

Build must pass with zero TypeScript errors.

```bash
grep -r "rgba(" packages/games/[game]/src --include="*.css"
```

Inspect every match. Any `rgba()` with hardcoded game color values is a violation. Neutral shadows like `rgba(0, 0, 0, 0.4)` are fine.

Check module maturity with `docs/module-maturity.md` before calling the module ready for broader use.

---

## Common mistakes

| Mistake | Correct approach |
|---------|-----------------|
| Copying CSS from another game and keeping hardcoded colors | Replace all game-color `rgba()` with `var()` and `color-mix()` |
| Defining `--game-color-primary` inside per-game CSS | Define only in `theme.css` scoped to `.theme-[game]` |
| Using `:root` in `theme.css` | Use `.theme-[game]` class — `:root` leaks after SPA navigation |
| Copying SettingsPanel kafelki from another game | Show only kafelki for settings this game actually has |
| Setting `status: 'live'` before gameplay is implemented | Keep `status: 'coming-soon'` until gameplay is complete |
| Omitting `description` from word categories | Every category must have a `description` — it is displayed in the UI |
