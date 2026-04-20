# Game Module Template

Practical template for adding a new game module to Project Party.

This is not a copy-paste folder dump. It is the minimum shape and responsibility map for a new game.

Use together with:
- `docs/new-game-checklist.md`
- `docs/ui-map.md`
- `docs/runtime-map.md`
- `packages/game-sdk/README.md`

---

## Before You Start

Answer these first:

1. Is this game only menu/setup for now, or does it already need real runtime?
2. Which existing `@party/ui` pieces already cover the shell, settings, pairing, or alerts?
3. Will the game need host keyboard/controller flow?
4. What absolutely must stay game-local because it encodes this game's rules?

If these answers are still vague, do not start by copying another game module wholesale.

---

## Goal

Every new game should be added as a module, not as hub-specific feature code.

That means:
- `hub` mounts it,
- `@party/ui` gives reusable chrome and infra,
- the game package owns its own behavior and content.

---

## Minimum Package Shape

```text
packages/games/<game>/
|- package.json
|- tsconfig.json
`- src/
   |- index.ts
   |- config.ts
   |- menu/
   |- setup/
   |- navigation/
   |- results/           # if implemented
   `- runtime/           # if implemented
```

Use this as the baseline shape. Add folders only when the game really needs them.

---

## Required Responsibilities

### Always required

Every game module should define:

- `config.ts`
- `menu/`
- `setup/state.ts`
- `setup/helpers.ts`
- setup sections
- setup validation
- `index.ts` exports

### Required when host keyboard/controller flow exists

Add:
- `navigation/<game>-navigation-targets.ts`
- `navigation/<game>-navigation-actions.ts`
- menu/settings/setup profiles
- runtime profiles if runtime exists

### Required when runtime exists

Add:
- `runtime/`
- runtime entrypoints/screens
- game-specific runtime logic
- runtime checks/smokes as applicable

---

## What To Reuse First

Before writing local components, check `docs/ui-map.md`.

Default reuse candidates:
- `GameSetupTemplate`
- shared settings primitives
- `ControlsSettingsOverlay`
- `AlertDialog`
- `RuntimeSettingsModal`
- `DevicePairingModal`
- host-navigation infrastructure
- avatar assets/helpers

Do not rebuild these locally unless the game's structure genuinely differs.

---

## What Must Stay Local

Keep these inside `packages/games/<game>`:

- setup state,
- setup validation,
- menu content and copy,
- controller binding semantics,
- navigation targets/actions/profiles,
- runtime business rules,
- game-specific modals and overlays,
- results UI.

---

## Route Integration Shape

The route integration in `apps/hub/src/app/games/<game>/` should stay thin:

- `theme.css`
- `layout.tsx`
- `page.tsx`

The hub route should:
- mount the theme,
- wire categories/helpers/state,
- render the module.

The hub route should not own game rules.

---

## Suggested Implementation Order

1. Content
2. Package scaffold
3. `config.ts`
4. setup state/helpers
5. setup sections
6. menu
7. settings overlay
8. navigation profiles
9. hub route
10. runtime
11. results polish and verification

This keeps the game module stable before runtime complexity begins.

If runtime is not real yet, stop cleanly after menu/setup integration and keep the module truthful as `coming-soon`.

---

## “Done Enough” for Each Stage

### Menu/setup-only module

Acceptable for `coming-soon`:
- route exists,
- menu exists,
- setup works,
- validation works,
- shared shell integration works,
- game is registered cleanly,
- no fake runtime is exposed.

### Runtime-capable module

Acceptable for `live` only when:
- runtime exists,
- runtime checks/build pass,
- browser flow is verified,
- destructive/blocking flows are validated,
- the module no longer depends on hub-owned game logic.

---

## New Game Review Checklist

Before calling a new module structurally correct, check:

- Is the hub only mounting and wiring, not owning game behavior?
- Is setup state local to the game?
- Are settings cards real for this game, not copied blindly?
- Are game colors scoped to route theme, not hardcoded in shared UI?
- Are navigation targets/actions/profiles local to the game?
- Is shared UI reused where structure matches?
- Is gameplay/runtime logic still local?

---

## Anti-Patterns

Avoid:

- cloning Charades or Codenames wholesale and cleaning later,
- keeping half the game in `apps/hub`,
- putting one-off game logic into `@party/ui`,
- exposing `status: 'live'` before runtime is actually verified,
- copying shared modal/settings/pairing code that already exists in `@party/ui`.
