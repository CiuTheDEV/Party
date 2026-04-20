# Runtime Ownership Map

Practical ownership map for gameplay runtime in Project Party.

Use this document when:
- building or extending runtime for a game,
- deciding whether a runtime surface belongs in `@party/ui` or in a game module,
- reviewing host/presenter/captain ownership,
- checking whether a modal or overlay should be shared.

This file complements:
- `PROJECT_CONTEXT.md` for architecture,
- `docs/ui-map.md` for shared UI inventory,
- `packages/game-sdk/README.md` for module and host-navigation contract details.

---

## Quick Rule

For runtime work, default to `game-local` unless the surface is clearly:
- structurally shared,
- presentation-only or shell-like,
- and reusable without encoding game rules.

Runtime is the most dangerous place to over-share. If the answer is fuzzy, keep it in the game module.

---

## Runtime Boundary

### `apps/hub` owns

- route mounting,
- route theme application,
- bootstrap/session glue required to enter a game runtime,
- app-level wrappers only.

`apps/hub` should not own game runtime rules.

### `@party/ui` owns

- runtime presentation primitives that are structurally shared,
- shared modal shells and shared confirm/alert patterns,
- shared action-hint presentation,
- shared runtime top chrome if it is presentation-only,
- shared host-navigation engine/provider/helpers.

`@party/ui` should not own:
- runtime business rules,
- authority/state machine transitions,
- game-specific command semantics,
- per-game navigation targets/actions/profiles.

### `packages/games/<game>` owns

- runtime screen layout,
- authority/state transitions,
- gameplay commands,
- presenter/captain/host-specific logic,
- per-game overlays and modals that encode game rules,
- runtime navigation targets/actions/profiles,
- controller binding semantics and command execution.

---

## Shared Runtime vs Local Runtime

### Belongs in `@party/ui`

Move runtime UI into `@party/ui` when all of these are true:

- it is used or clearly planned for at least two games,
- its structure is shared,
- game-specific labels or callbacks can be injected through props,
- the component does not need to know game rules to render correctly.

Good examples:
- `RuntimeTopBar`
- `RuntimeSettingsModal`
- `AlertDialog`
- `ControlHintBadge`
- host-navigation provider/engine/helpers

### Belongs in the game module

Keep runtime UI local when any of these are true:

- the component encodes win/lose/round rules,
- it depends on game-specific state shape,
- it drives game-specific commands or event sequencing,
- it only looks similar to another game's runtime surface but behaves differently.

Good examples:
- board screens,
- presenter reveal screens,
- captain state screens,
- round/match summaries,
- assassin or verdict flows,
- game-specific reconnect behavior.

---

## Runtime Roles

### Host

The host runtime usually owns:
- round control,
- runtime settings,
- confirms and destructive actions,
- authority-driven transitions,
- host keyboard/controller navigation.

Shared pieces for host:
- host-navigation infra,
- shared confirms/alerts,
- shared runtime settings shell,
- shared action-hint UI.

Local host pieces:
- command handlers,
- runtime target IDs and profiles,
- host-specific screens/modals,
- authority/state transition logic.

### Presenter / Captain / Phone Device

Mobile or secondary-device runtime should stay mostly local to the game module.

Reason:
- presenter/captain flow is usually tightly coupled to that game's business logic,
- even when the shell looks similar, the state model often is not.

What can still be shared:
- pairing modal chrome,
- alert/confirm patterns,
- avatars and small presentation primitives.

What should stay local:
- mobile runtime layout,
- reveal/waiting/ready states,
- device-specific transition logic,
- role-specific copy and actions.

---

## Runtime Modal Classification

Use this rule before sharing a modal:

### Shared modal candidate

A runtime modal can move to `@party/ui` when:
- the structure is the same across games,
- actions can be expressed as callbacks,
- button ordering rules are generic,
- controller/keyboard hint behavior is generic.

Examples:
- generic confirm dialog,
- runtime settings shell,
- pairing shell,
- simple reconnect/continue/exit shell.

### Local modal

Keep it local when:
- body content depends on game rules,
- action semantics are specific to the game,
- the modal needs game-specific transitions or navigation maps,
- sharing it would create many conditional branches.

Examples:
- assassin result modal,
- presenter reveal state,
- game-specific verdict modal,
- board-specific blocking modals.

---

## Host Navigation in Runtime

### Shared responsibility

`@party/ui` should provide:
- state container,
- wake/sleep behavior,
- controller wake guard,
- modal ownership helpers,
- fixed host-navigation input mapping.

### Game responsibility

Each game should provide:
- navigation target IDs,
- action IDs,
- screen and zone maps,
- profiles per runtime surface,
- delegated command resolution.

If a runtime feature needs new targets or actions, add them to the game module first, not to `@party/ui`.

---

## Runtime Verification Standard

For every game runtime, aim to keep three layers:

### 1. Logic checks

Focused checks for:
- command handlers,
- navigation profiles,
- state transitions,
- layout or autoscale heuristics when applicable.

### 2. Browser smoke

At least one repeatable browser flow for:
- entering runtime,
- touching one core interaction path,
- opening runtime settings,
- confirming one destructive or blocking action.

### 3. Manual/visual pass

For browser-facing runtime work, inspect:
- desktop layout,
- mobile layout when applicable,
- keyboard/controller hints and focus behavior,
- blocking overlays/modals,
- critical role-specific screens.

---

## Runtime Anti-Patterns

Avoid these:

- putting runtime business rules into `@party/ui`,
- sharing runtime screens only because the colors and borders look similar,
- defining host navigation targets/actions in shared UI,
- building a generic runtime framework that is smarter than the current games need,
- skipping browser validation for runtime changes because focused checks passed.

---

## Maintenance Rule

When a new shared runtime primitive, runtime verification standard, or role pattern becomes real in the repo, update this file in the same session.
