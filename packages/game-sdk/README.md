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
