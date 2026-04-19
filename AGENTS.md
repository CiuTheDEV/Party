# Project Party - Agent Operating Rules

Keep this file short, practical, and safe for all agents.

---

## Project Snapshot

- **Product**: Polish browser-based party game portal for hangouts and friend gatherings
- **Owner**: not a developer; explain decisions in plain language
- **Philosophy**: build simply, verify always, avoid over-engineering
- **Budget rule**: free tiers only unless the owner explicitly approves otherwise

### Current repo direction

```text
project-party/
|- apps/
|  `- hub/                  # Next.js platform shell
|- packages/
|  |- ui/                   # Shared shell, setup chrome, modal primitives
|  |- game-sdk/             # Module contract + shared interfaces
|  `- games/
|     |- charades/          # First live game module
|     `- codenames/         # Live menu/setup module, runtime still evolving
`- content/
   `- charades/             # Word lists and categories
```

### Product model

- `hub` owns routing, registry, and platform shell concerns
- each game module owns its own config, menu, setup sections, validation, results, and gameplay runtime
- shared setup shell lives in shared layers; games inject their own sections
- adding a game should mean adding a module, not rewriting the platform

---

## Mandatory Session Start

Read these before making changes:

1. `PROJECT_CONTEXT.md`
2. `memory/today.md`
3. `memory/active-tasks.json`
4. `memory/MEMORY.md` if present
5. `memory/patterns.md` if present

Use `PROJECT_CONTEXT.md` as the source of truth for current architecture and current phase.
If this file and `PROJECT_CONTEXT.md` ever disagree, follow `PROJECT_CONTEXT.md`.

---

## Core Editing Rules

### Minimal diff only

- Make the smallest possible change that solves the task.
- Do **not** rewrite entire files unless the owner explicitly asks for it.
- Do **not** mix bug fixes, copy rewrites, formatting, and refactors in one patch unless required.
- Do **not** reorder imports, rename symbols, or reformat unrelated code just because it looks cleaner.
- Prefer patch-style edits over full-file replacement.

### Encoding / mojibake safety

- Treat files with Polish UI copy as UTF-8-sensitive.
- Preserve existing encoding, BOM behavior, and line endings.
- If you detect mojibake, broken Polish diacritics, or encoding ambiguity, **stop and report it before editing**.
- Do not use encoding cleanup as an excuse to rewrite the whole file.
- After editing a UTF-8-sensitive file, verify the resulting text in the file before continuing.

### Scope discipline

- Touch only files required for the task.
- Keep changes reviewable and easy to diff.
- Prefer local fixes over broad architectural churn.
- 300 lines is a **review threshold**, not an automatic split rule.
- Split files only when responsibilities are clearly mixed or navigation becomes hard.

---

## Code Quality Rules

- No commented-out code.
- No `TODO` unless it maps to an active task in `memory/active-tasks.json`.
- Comments should explain **why**, not **what**.
- Every function should have one clear responsibility.
- Never claim something works without checking it.
- Banned phrases: `Should be fine`, `Probably passes`, `I think it works`.

### Verification

When a task changes behavior, run the smallest relevant verification available:
- lint
- typecheck
- build
- focused test

For browser-facing changes, default to Playwright verification with a visible browser so the agent can inspect the real UI flow instead of relying only on static reasoning.
Capture screenshots when they help diagnose, compare, or present UI behavior; use them for self-review first, and show them to the owner when useful.

Read the output and report what actually happened.
If verification cannot be run, say so clearly.

### Sandbox-aware verification

- On Windows/Codex sandbox, local verification can fail with `spawn EPERM` due to process spawning restrictions.
- Treat `spawn EPERM` as a possible environment limitation first, not automatic proof of broken code.
- If `spawn EPERM` appears, report:
  - which command failed,
  - whether the failure looks environmental or code-related,
  - what was still verified successfully.
- Do not claim the app is broken solely because a sandboxed build hit `spawn EPERM`.
- Prefer secondary checks such as lint, typecheck, narrower package-level commands, targeted inspection, or non-sandbox verification when full build is blocked by the environment.

---

## UX / Product Guardrails

- The UI must stay readable on desktop and mobile.
- Shared components must stay reusable across games.
- Never hardcode game-specific colors in shared UI.
- Closing setup should preserve mode selection where applicable.
- Do not add paid services, schema changes, new game modules, or production-destructive actions without asking first.

### Current modules

- `charades` - live reference game module
- `codenames` - live game module; runtime is implemented and still needs ongoing end-to-end validation/polish

---

## MCP / Tooling Defaults

- Prefer `context7` for current framework and library docs when available.
- Prefer GitHub tooling for repo, PR, and issue context when available.
- Do not rely on stale model memory for changing APIs.
- Prefer local Playwright verification (`npm run test:e2e`, `npm run test:e2e:live`) for browser flows in this project.
- For UI/runtime changes, treat Playwright plus screenshots as the default inspection workflow.
- Avoid `playwright` MCP by default unless the task specifically needs MCP-only browser automation.

---

## Ownership / SSOT

Use these as the main ownership rules:

| Info Type | Source of truth |
|-----------|-----------------|
| Current architecture / current phase | `PROJECT_CONTEXT.md` |
| Daily progress | `memory/today.md` |
| In-flight tasks | `memory/active-tasks.json` |
| Technical pitfalls | `memory/MEMORY.md` |
| Reusable patterns | `memory/patterns.md` |
| Game content | `content/[game]/` |
| SDK contract | `packages/game-sdk/README.md` |

Do not spread project state across random files or code comments.

---

## What Can Be Changed

Allowed when needed:
- `apps/`
- `packages/`
- `content/`
- `docs/` when the task is about docs/process/rules
- `memory/` when the workflow requires an update
- `PROJECT_CONTEXT.md` handoff block when wrapping a session

Never touch without explicit request:
- secrets or credentials
- production data
- destructive deploy actions
- agent-rule files only for stylistic rewrites with no clear reason

---

## Session Wrap-up

When a meaningful session ends:

1. Update the handoff block in `PROJECT_CONTEXT.md`
2. Update `memory/today.md` if meaningful progress happened
3. Update `memory/active-tasks.json` if task state changed
4. Update `memory/MEMORY.md` or `memory/patterns.md` if a reusable lesson was learned
5. Commit only when the owner asked for it or the task explicitly includes it

Handoff format:

```md
<!-- handoff:start -->
## Session Handoff
- Last: [time] by [agent]
- Task: [description]
- Did: [what was done]
- Next: [next steps]
- Blocker: [if any]
<!-- handoff:end -->
```

---

*Last updated: 2026-04-19*
