# Project Party - Agent Global Memory

> Auto-loaded: `rules/` (`behaviors.md`, `skill-triggers.md`, `memory-flush.md`)
> On-demand: `docs/` (`agents.md`, `content-safety.md`, `behaviors-extended.md`, `scaffolding-checkpoint.md`, `task-routing.md`, `behaviors-reference.md`)
> Hot data layer: `memory/today.md` + `memory/active-tasks.json`

---

## Project Info

- **Name**: Mati
- **Project dir**: `C:\Users\Mateo\Desktop\Party`
- **Identity**: The product owner is not a developer - AI agents write the code
- **Philosophy**: Build simply, verify always, never over-engineer

### Platform Accounts

| Platform | Account |
|----------|---------|
| Cloudflare | [account] |
| GitHub | [account] |

---

## Agents & Models

Documentation must stay readable for all agents so session handoff remains seamless.

| Agent | Model | When |
|-------|-------|------|
| **Claude Code** | Sonnet | Primary - daily sessions |
| **Claude Code** | Haiku | Lightweight tasks - quick lookups, simple Q&A |
| **Codex** | GPT-5.4 | Token limit fallback + cross-verification |
| **Codex** | GPT-5.4-mini | Lightweight fallback tasks at token limit |
| **Antigravity** | - | Alternative fallback |

### Token & Session Rules

- Claude Pro workflow: use Sonnet, not Opus
- Split work into small sessions to avoid burning context
- At token limit or handoff point, update project memory and hand off cleanly
- Every agent starts from the same project memory and the same repo rules

### Starting a Session (mandatory)

1. Read `PROJECT_CONTEXT.md` - architecture, current phase, latest handoff
2. Read `memory/today.md` - what happened today, current task
3. Read `memory/active-tasks.json` - in-flight tasks
4. Read `memory/MEMORY.md` - technical pitfalls (if present)
5. Read `memory/patterns.md` - reusable solutions (if present)
6. Only then start working

### MCP Defaults

- Use `playwright` MCP for browser flows, UI verification, and stateful interaction in the real app
- Use `context7` MCP for current framework and library docs instead of stale model memory
- Use `github` MCP for issues, PRs, and repo context when `GITHUB_MCP_PAT` or IDE auth is configured

---

## About the Project

**Project Party** is a Polish browser-based party game portal for hangouts and friend gatherings.

### Concept

- **Hub** - landing page, game list, game selection, redirect into a game module
- **Modules** - each game is an independent module in `packages/games/[game]`
- The hub redirects into a game, and the game owns its own menu, setup, and gameplay
- Adding a new game should mean adding a new package, not rewriting the hub

### Players

- **Guest** - plays without registration, joins by room code or link
- **Account** - optional, unlocks leaderboards, game history, and future paid content
- **Host** - creates a room, picks the game and settings, starts the session

### Join Modes

- **Room code** - host on the big screen, others on phones (Jackbox-style)
- **Link** - everyone joins from their own device

### Monetization - design now, wire later

This is a hobby project with **no budget for paid services at launch**. Only free tiers are allowed.

Even so, the architecture must be monetization-ready from day one:
- payment gateway slots exist as stubs,
- premium labels can exist in UI now,
- Stripe is not connected yet,
- future payment work should fill stubs, not force a rewrite.

---

## Technical Architecture

```text
project-party/
|- apps/
|  `- hub/                  # Next.js platform shell
|- packages/
|  |- ui/                   # Shared UI and shell components
|  |- game-sdk/             # Game module contract
|  `- games/
|     `- charades/          # First game module
`- content/
   `- charades/             # Word lists and categories
```

**Stack - free tiers only**

| Layer | Technology | Tier |
|-------|------------|------|
| Frontend / Hub | Next.js (React) | Free |
| Monorepo | Turborepo | Free |
| Real-time | Partykit | Free tier |
| Database | Cloudflare D1 | Free |
| Auth | Clerk | Free |
| Hosting | Cloudflare Pages | Free |
| Payments | Stripe | Stub only |
| Language | TypeScript | - |

> Before adding any new service, verify that it has a free tier. If it does not, stop and ask the product owner.

---

## Game Modules

| Module | Status | Description |
|--------|--------|-------------|
| `charades` | MVP | Pantomime - gestures, expressions, body language. No drawing, no words. |
| `[next-game]` | TBD | To be defined with the product owner |

### Module Contract

Each module should own:
- `GameConfig`
- menu content
- setup sections and validation
- results UI
- eventually gameplay entrypoints and runtime

Details live in `packages/game-sdk/README.md`.

---

## Design System

### Theme

- Each game defines its own theme through CSS custom properties
- Never hardcode colors in shared components
- Shared layout should stay reusable while colors remain game-specific

### Responsiveness

- **Desktop** (`>= 768px`): left sidebar + main content
- **Mobile** (`< 768px`): bottom tab bar instead of sidebar
- Every new component must work on both breakpoints before merging

### Sidebar Navigation

- Always present: `Play now`, `Settings`
- Optional per game: `Stats`, `Leaderboard`, `How to play`
- Bottom action: `Back to lobby`
- Topbar: game logo + login button or avatar

### Navigation Flow

1. Hub -> click game -> **game menu**
2. Click `Play` -> **config modal**
3. Modal handles players, settings, deck, devices, and `Start`
4. -> **Gameplay**
5. -> **Results** -> back to menu

### Config Modal

- Closing it returns to the menu while preserving mode selection
- Each game decides which sections and options it exposes
- `Start` stays disabled until the minimum requirements are met

---

## Code Rules - No Exceptions

### File Structure

- **300 lines is a review threshold, not an automatic split rule**
- If a CSS/TS/TSX file grows past ~300 lines, first assess cohesion:
  - keep it as one file if it still has one clear responsibility and is easy to reason about,
  - split it only when responsibilities are mixed, the file becomes hard to navigate, or extracted parts have a natural boundary
- Component styles live next to the component
- One component = one file
- `globals.css` only for reset, custom properties, and base typography

### Quality

- No AI slop - comments explain *why*, never *what*
- No commented-out code in the repo
- No `TODO` without an active task in `memory/active-tasks.json`
- Every function should do one thing

### Commits

- Atomic: one commit = one change
- Types: `fix`, `feat`, `refactor`, `docs`, `test`, `chore`
- Avoid mixed commits and oversized commits without justification

---

## Delivery Standards

- **Truth > Speed**: never claim something works without running it
- **Small Batch**: prefer small, reviewable changes
- **No Secrets**: never commit keys or tokens
- **Self-verify**: run lint/build/test and read the output
- **Banned phrases**: `Should be fine`, `Probably passes`, `I think it works`

---

## Collaboration Preferences

- The product owner is not a developer - explain technical decisions in plain language
- When choosing between options, always recommend one and explain why
- **Auto-execute**: bug fixes, small UI changes, very small code changes
- **Ask before**:
  - adding any new external service,
  - changing database schema,
  - creating a new game module,
  - making real-time architecture decisions,
  - anything that could cost money
- **Never self-decide**: deleting data or deploying to production

---

## SSOT Ownership

| Info Type | SSOT File | Never write to |
|-----------|-----------|----------------|
| Infrastructure / CF config | `memory/infra.md` | Code comments |
| Project status | `PROJECT_CONTEXT.md` | `today.md` |
| Project overview | `memory/projects.md` | Other files |
| Technical pitfalls | `memory/MEMORY.md` | `today.md` |
| Daily progress | `memory/today.md` | Other files |
| In-flight tasks | `memory/active-tasks.json` | Other files |
| Game content | `content/[game]/` | Source code |
| SDK contract | `packages/game-sdk/README.md` | Other files |

---

## What You Can Touch

| Allowed | Never touch |
|---------|-------------|
| `apps/` - all code files | `rules/` |
| `packages/` - all code files | Secrets / credentials |
| `content/` - word lists | Production data without explicit request |
| `docs/` - only when the task concerns docs/process/rules |  |
| `memory/` - read freely, update when required by workflow |  |
| `PROJECT_CONTEXT.md` handoff block |  |
| `AGENTS.md` and `CLAUDE.md` - only when explicitly synchronizing agent rules |  |

---

## On-Demand Loading Index

| Scenario | Load file |
|----------|-----------|
| Project setup / Phase 0 init | `docs/project-setup.md` |
| Project overview | `memory/projects.md` |
| New service / architecture decision | `docs/scaffolding-checkpoint.md` |
| Handing off to another agent | `docs/agents.md` |
| Agent routing / model costs | `docs/task-routing.md` |
| Goals and priorities | `memory/goals.md` |
| Patterns and reusable solutions | `memory/patterns.md` |
| Technical pitfalls | `memory/MEMORY.md` |
| AI content safety | `docs/content-safety.md` |
| Extended behavior rules | `docs/behaviors-extended.md` |
| Memory search / reference details | `docs/behaviors-reference.md` |

---

## Completing a Session

When wrapping or handing off a session:
1. Update the handoff block in `PROJECT_CONTEXT.md`
2. Update `memory/today.md` when the session produced meaningful progress
3. Update `memory/active-tasks.json` when a multi-session task changed state
4. Update `memory/MEMORY.md` or `memory/patterns.md` when a reusable lesson was discovered
5. Commit only when the user asked for it or when the task explicitly includes a commit

Handoff block format:

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

*Last updated: 2026-03-26*

