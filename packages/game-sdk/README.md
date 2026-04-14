# `@party/game-sdk`

Shared contract for game modules in Project Party.

## Purpose

`@party/game-sdk` defines what a game module must expose so the hub can treat games as pluggable modules instead of hardcoded app sections.

The current direction is:
- `hub` is the platform shell,
- games provide their own content and logic,
- shared chrome lives outside the game module,
- gameplay remains game-specific.

## Current Module Contract

Each game module should expose:

- `config`
  - game identity and metadata,
  - labels, description, player limits, theme-level info,
  - explicit availability via `status`:
    - `live` = playable now,
    - `coming-soon` = visible in the hub, but not yet playable.
- `shell`
  - navigation links and shell-level labels for the game area.
- `createInitialSetupState`
  - one setup state object for the whole game.
- `setupSections`
  - ordered custom sections rendered inside the shared setup template.
- `validateSetup`
  - game-specific setup validation.
- `GameMenuContent`
  - module-owned menu content rendered inside shared game shell.
- `GameResults`
  - module-owned results screen.

Type source of truth:
- `packages/game-sdk/src/types/GameModule.ts`
- `packages/game-sdk/src/types/GameSetup.ts`
- `packages/game-sdk/src/types/GameConfig.ts`

## Setup Philosophy

Approved direction for all games:

- setup uses one shared shell/template,
- each game injects custom sections,
- each game owns one setup state object,
- each game validates its own state,
- clicking `Start` hands control to fully custom gameplay.

This gives:
- shared UX across games,
- easier future updates to setup chrome,
- less drift between modules,
- no rigid JSON-only form builder.

## Architectural Boundary

What belongs outside the module:
- platform routing,
- global hub navigation,
- registry of available modules,
- shared shell components,
- shared setup chrome.

What belongs in the module:
- game metadata,
- menu content,
- setup sections,
- setup state/validation,
- results,
- eventually gameplay entrypoints/runtime.

## Availability Rule

The hub should not guess whether a module is ready by checking missing routes or placeholder components.

Every game declares `config.status`:
- `live` means the hub may route into the game now,
- `coming-soon` means the hub may list or promote the game, but should gate entry with platform UI such as a modal, disabled card, or teaser state.

## Current Repo Status

`charades` is currently the reference live implementation.

Today it already owns:
- config,
- menu,
- setup,
- results,
- runtime/gameplay.

`codenames` is scaffolded as the second module and registered as `coming-soon`.

So the module system is now credible end-to-end for one live game and ready to host additional games before their gameplay is implemented.

## CSS Contract for Game Modules

Every game module has its own CSS files for menu, setup sections, and overlays. These rules apply to all per-game CSS — violations cause color leaks when navigating between games.

### No hardcoded game colors

Every use of the game's color (background, shadow, border, gradient) must use CSS custom properties:

```css
/* correct */
background: var(--game-color-primary-glow);
border-color: color-mix(in srgb, var(--game-color-primary) 35%, transparent);
box-shadow: 0 0 20px var(--game-color-primary-glow);

/* forbidden */
background: rgba(220, 38, 38, 0.14);
border-color: rgba(124, 58, 237, 0.35);
```

The only place a hardcoded hex for the game color is allowed is in `apps/hub/src/app/games/[game]/theme.css`, scoped under the game's theme class.

### Transparency via `color-mix()`, not `rgba()` with a hardcoded color

```css
/* correct */
color-mix(in srgb, var(--game-color-primary) 30%, transparent)

/* forbidden */
rgba(220, 38, 38, 0.3)
```

### `theme.css` must scope to a class, never `:root`

```css
/* correct */
.theme-codenames {
  --game-color-primary: #dc2626;
  --game-color-primary-glow: rgba(220, 38, 38, 0.15);
  --game-color-primary-light: #b91c1c;
}

/* forbidden — leaks globally after SPA navigation */
:root {
  --game-color-primary: #dc2626;
}
```

### All game-specific CSS custom properties must be defined in `theme.css`

This includes `--game-color-primary`, `--game-color-primary-glow`, `--game-color-primary-light`, `--game-gradient`, and any other property whose value differs between games. Per-game CSS files may *use* these properties but must never *define* them.

### Section title font size

All setup section headings must use:
- Desktop: `font-size: 24px`, `font-weight: 800`, `letter-spacing: -0.03em`, `line-height: 1`
- Mobile (`max-width: 767px`): `font-size: 22px`

### SettingsPanel kafelki

Show only the kafelki that reflect actual settings for this game. Do not copy kafelki from another game blindly. A game with one setting (rounds) shows one kafelek.

### Verification

Before opening a PR for a new game, run:

```bash
grep -r "rgba(" packages/games/[game]/src --include="*.css"
```

Any match containing a hardcoded game color is a violation.

---

## Host Navigation Adoption

Shared host-side navigation now has a reusable framework split across:
- `@party/game-sdk`
  - host navigation contract and profile types,
- `@party/ui`
  - shared engine, provider, fixed input mapping, and controlled focus surfaces,
- `packages/games/<game>/src/navigation/`
  - game-specific profiles and command mapping.

### What a game should provide

For a new game module, add:
- `navigation/<game>-navigation-targets.ts`
  - shared target, zone, and screen IDs for that game,
- `navigation/<game>-navigation-actions.ts`
  - semantic commands delegated back into the game,
- one profile per host surface, for example:
  - menu,
  - settings,
  - setup,
  - runtime overlays.

### Required profile rules

Every host navigation profile must define:
- an explicit `screenId`,
- an explicit `getEntryTarget(context)`,
- a `resolveAction(...)` function for semantic host actions.

Every screen or modal must have a meaningful entry target. Do not rely on DOM focus guessing.

### Fixed vs rebindable controls

Always keep these separate:
- fixed host navigation:
  - menu,
  - rail/sidebar,
  - setup,
  - settings,
  - runtime overlays such as pause or confirm dialogs,
- rebindable gameplay controls:
  - only actions that affect live gameplay.

Do not let saved gameplay bindings drive menu or overlay navigation.

### Recommended coverage

Minimum checks for a new game:
- profile tests for entry targets and zone transitions,
- input tests for fixed host navigation behavior,
- runtime overlay tests for modal ownership and focus restore,
- workspace builds for:
  - `@party/game-sdk`,
  - `@party/ui`,
  - the game package,
  - `@party/hub`.

### Reference implementation

`charades` is the current reference consumer of the shared host navigation framework.
