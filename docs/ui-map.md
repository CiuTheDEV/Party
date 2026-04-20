# `@party/ui` Map

Practical map of the current shared UI layer in Project Party.

Use this document when:
- adding a new game module,
- deciding whether a UI element belongs in `@party/ui` or inside a game package,
- checking which shared building blocks already exist before creating a local component.

Also read:
- `docs/runtime-map.md` for runtime ownership,
- `docs/shared-extraction-checklist.md` before moving something into `@party/ui`,
- `docs/game-module-template.md` when scaffolding a new game.

This file is intentionally more detailed than `PROJECT_CONTEXT.md`.
`PROJECT_CONTEXT.md` stays architectural; this file is the working inventory and ownership map for shared UI.

---

## Quick Use Order

When making a UI decision for a game module:

1. Read this file to see whether the shared building block already exists.
2. Read `docs/runtime-map.md` if the surface is runtime-related.
3. Read `docs/shared-extraction-checklist.md` before moving anything into `@party/ui`.
4. Default to keeping the component local if the boundary is still unclear.

---

## Purpose

`@party/ui` is the shared UI and interaction layer for all games.

It should own:
- reusable shell/layout,
- reusable setup chrome,
- reusable modal and settings primitives,
- shared runtime UI surfaces,
- shared host-navigation infrastructure,
- shared avatar assets/helpers.

It should **not** own:
- game-specific setup state,
- game-specific validation,
- game-specific menu copy and options,
- game-specific runtime business logic,
- game-specific navigation targets/actions/profiles,
- game-specific content categories or word logic.

---

## Ownership Boundary

### `apps/hub` owns

- platform routing,
- module registry,
- route-level shell mounting,
- app/bootstrap glue,
- per-game route themes in `apps/hub/src/app/games/[game]/theme.css`.

### `@party/ui` owns

- shared shell and layout primitives,
- shared setup/settings/modal chrome,
- shared runtime UI primitives,
- shared host-navigation engine/provider/helpers,
- shared visual assets and avatar helpers.

### `packages/games/<game>` owns

- `config`,
- menu content,
- setup sections,
- setup state and validation,
- runtime screens and runtime logic,
- results,
- navigation targets/actions/profiles,
- game-specific controller bindings and command handlers.

---

## Current `@party/ui` Inventory

This section reflects the real exports from `packages/ui/src/index.ts`.

### Shell and Layout

Use these for the shared game shell and outer app chrome:

- `GameShell`
- `Topbar`
- `GameSidebar`
- `GameCard`
- `GameIcon`

Use from `@party/ui` when:
- the surface is platform-level,
- the component should look and behave the same across games,
- the component is not tied to one game's runtime rules.

Keep inside the game module when:
- the content or interaction model is game-specific,
- the surface is part of one game's menu/runtime flow.

### Setup and Settings Chrome

Use these for shared setup/settings structure:

- `GameSetupTemplate`
- `GameSettingsModalShell`
- `GameSettingsTabs`
- `GameSettingsSection`
- `GameSettingsCard`
- `SettingsPanelShell`
- `SettingsPanelFooter`
- `SettingsPanelTabs`
- `SettingsStatusPill`
- `SettingsPlaceholderCard`
- `SettingsListHeader`
- `SettingsDetailHero`

Use from `@party/ui` when:
- the game needs shared setup/settings framing,
- only section content or labels differ per game,
- the visual language should stay aligned across modules.

Keep inside the game module when:
- the card/section represents game-specific state,
- the section needs game-specific layout or copy,
- the section contains game-specific validation rules.

### Shared Modal and Popup Primitives

Use these for shared dialog/popup patterns:

- `AlertDialog`
- `PremiumModal`
- `WordPoolManagerModal`
- `DevicePairingModal`
- `RuntimeSettingsModal`
- `ControlHintBadge`

Use from `@party/ui` when:
- the modal pattern already exists across multiple games,
- the modal is structurally shared and only labels/actions differ,
- the button-hint/focus behavior should stay consistent across games.

Keep inside the game module when:
- the modal is tied to unique gameplay rules,
- the modal's body structure is specific to one game,
- the modal owns game-specific command handling.

### Runtime UI

Use these for shared runtime-level visual surfaces:

- `RuntimeTopBar`
- `AvatarAsset`

Use from `@party/ui` when:
- the runtime surface is presentation-only or shared chrome,
- avatar rendering should stay globally consistent.

Keep inside the game module when:
- the runtime layout or game state mapping is unique to the game,
- the surface needs game-specific rules or transitions.

### Form and Settings Controls

Use these for shared control widgets:

- `DiscreteSlider`
- `SwitchField`
- `SegmentedChoice`

These belong in `@party/ui` because they are reusable interaction controls, not game logic.

### Controls Overlay

Use these for shared controller/keyboard settings screens:

- `ControlsSettingsOverlay`
- `useControlsSettingsOverlay`
- related exported overlay types

Use from `@party/ui` when:
- the game needs the shared settings-overlay skeleton,
- tab structure and binding-list behavior are shared,
- only data sources, labels, and game navigation targets differ.

Keep inside the game module when:
- binding semantics,
- device mappings,
- saved binding persistence,
- navigation targets/actions,
- runtime command execution
are game-specific.

### Host Navigation Infrastructure

Use these as the shared infra for host keyboard/controller navigation:

- `HostNavigationProvider`
- `useHostNavigation`
- `createHostNavigationState`
- `sleepHostNavigation`
- `wakeHostNavigation`
- `updateControllerWakeGuard`
- `applyHostNavigationAction`
- `applyHostNavigationTransition`
- `openHostNavigationModal`
- `closeHostNavigationModal`
- `DEFAULT_FIXED_HOST_NAVIGATION_INPUTS`
- `resolveFixedHostNavigationAction`
- `useHostNavigationInput`
- related host-navigation types

This layer belongs in `@party/ui` because it is engine-level infrastructure.

What stays inside the game module:
- navigation target IDs,
- zone/screen maps,
- action IDs,
- profile resolution,
- delegated runtime/menu/setup commands.

### Avatar Registry and Helpers

Use these shared avatar exports:

- `getPartyAvatarAssetSrc`
- `getPartyAvatarById`
- `getPartyAvatarCategories`
- `getPartyAvatarsByCategory`
- `normalizePartyAvatarId`
- `normalizePartyPlayers`
- `DEFAULT_PARTY_AVATAR_ID`
- `PARTY_AVATARS`
- `PARTY_AVATAR_CATEGORY_LABELS`

These belong in `@party/ui` because avatars are a shared asset system, not game logic.

---

## New Game: What To Reuse

For a new game module, prefer this split.

### Reuse from `@party/ui`

- `GameShell` via the hub route layout
- `GameSetupTemplate`
- shared settings shell primitives
- `ControlsSettingsOverlay`
- `DevicePairingModal` if the device-pairing pattern matches
- `RuntimeSettingsModal` if runtime settings/exit flow matches
- `AlertDialog` for generic confirms/alerts
- `ControlHintBadge` for controller/keyboard action hints
- `RuntimeTopBar` when the runtime top chrome is compatible
- host-navigation engine/provider/helpers
- avatar assets/helpers

### Define inside the game module

- game `config`
- setup state
- setup validation
- setup sections
- menu content
- settings-overlay data and bindings
- navigation targets/actions/profiles
- runtime screen layout
- runtime business logic
- results UI
- any gameplay-specific modal body or action semantics

---

## Decision Rule: Should This Move To `@party/ui`?

Move something into `@party/ui` only when all of these are true:

- it is already used by at least two games, or is clearly intended to be,
- the structure is shared, not just the color palette,
- game-specific behavior can be injected via props/data/callbacks,
- moving it reduces drift instead of hiding game rules.

Keep it local when any of these are true:

- the component encodes one game's rules,
- the layout only looks similar but the interaction contract differs,
- sharing it would add many conditional props,
- it depends on game-specific state shape or action IDs.

When in doubt, keep it local first and extract later after the second real use case exists.

---

## Practical Flow For A New Game

1. Define the game module contract in `packages/games/<game>`.
2. Use `GameSetupTemplate` and shared settings primitives for setup chrome.
3. Keep sections, state, and validation inside the game package.
4. Use shared controls overlay and host-navigation infra if the game supports host keyboard/controller flow.
5. Use shared modal primitives only when the structure matches; keep gameplay-specific logic local.
6. Add the game route theme in `apps/hub/src/app/games/<game>/theme.css`.
7. Verify the game is still module-owned, with `hub` acting only as platform shell.

For the operational scaffold, also read:
- `docs/new-game-checklist.md`
- `packages/game-sdk/README.md`

---

## Anti-Patterns

Avoid these mistakes:

- putting game-specific colors into `@party/ui`,
- moving one-off gameplay screens into `@party/ui` just because they look polished,
- letting shared modal primitives own game business logic,
- duplicating host-navigation infrastructure inside a game,
- rebuilding a shared settings or pairing shell locally when `@party/ui` already has the right primitive.

---

## Maintenance Rule

When `packages/ui/src/index.ts` gains or loses major exports that affect game scaffolding or ownership decisions, update this file in the same session.
