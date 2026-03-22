# Project Party — Codex Global Memory

> Auto-loaded on startup: rules/ (behaviors.md, skill-triggers.md, memory-flush.md)
> On-demand: docs/ (agents.md, content-safety.md, behaviors-extended.md, scaffolding-checkpoint.md, task-routing.md, behaviors-reference.md)
> Hot data layer: memory/today.md + memory/active-tasks.json

---

## Project Info

- **Name**: Mati
- **Project dir**: C:\Users\Mateo\Desktop\Party
- **Identity**: Product Owner is not a developer — AI agents write the code
- **Philosophy**: Build simple, verify always, never over-engineer

### Platform Accounts
| Platform | Account |
|----------|---------|
| Cloudflare | [account] |
| GitHub | [account] |

---

## Agents & Models

Documentation must be readable by all agents — session handoff must be seamless.

| Agent | Model | When |
|-------|-------|------|
| **Claude Code** | Sonnet | Primary — daily sessions |
| **Claude Code** | Haiku | Lightweight tasks — quick lookups, simple Q&A |
| **Codex** | GPT-5.4 | Token limit fallback + cross-verification |
| **Codex** | GPT-5.4-mini | Lightweight fallback tasks at token limit |
| **Antigravity** | — | Alternative fallback |

### Starting a session (mandatory)
1. Read `PROJECT_CONTEXT.md` — architecture, current phase, last handoff
2. Read `memory/today.md` — what happened today, current task
3. Read `memory/active-tasks.json` — in-flight tasks
4. Read `memory/MEMORY.md` — technical pitfalls (if exists)
5. Read `memory/patterns.md` — reusable solutions (if exists)
6. Only then start working

---

## About the Project

**Project Party** — Polish browser-based party game portal for hangouts and friend gatherings.

### Concept
- **Hub** — landing page: game list, game selection, redirect to game module
- **Modules** — each game is an independent module (`packages/games/[game]`)
- Hub redirects to game → game has its own menu, config, and gameplay
- Adding a new game = adding a new package, hub stays untouched

### Players
- **Guest** — plays without registration, joins via room code or link
- **Account** — optional, unlocks leaderboards, game history, future paid content
- **Host** — creates room, picks game and settings, starts the session

### Join Modes
- **Room code** — host on big screen, others on phones (Jackbox-style)
- **Link** — click to join, everyone on their own device

### Monetization — design now, wire up later
Project is hobbyist — **no budget for paid services at launch**.
Free tiers only (Cloudflare Free, etc.).

Despite this: **architecture must be monetization-ready from day 1.**
- Payment gateway slots = stubs, not wired code
- "Premium" labels in UI exist now — unlock logic comes later
- Stripe is **not connected**, but interfaces are designed for it
- When the time comes, adding payments = filling stubs, not rewriting architecture

---

## Technical Architecture

```
project-party/                     # Monorepo (Turborepo)
├── apps/
│   └── hub/                       # Next.js — landing page, game list
├── packages/
│   ├── ui/                        # Shared UI components
│   │   └── game-template/         # Shared layout for every game's menu
│   ├── game-sdk/                  # Game module contract (types, interfaces)
│   └── games/
│       └── charades/              # Module: Charades ← first game (MVP)
└── content/
    └── charades/                  # Word lists and categories (not in code)
```

**Stack — free tiers only:**
| Layer | Technology | Tier |
|-------|------------|------|
| Frontend / Hub | Next.js (React) | Free |
| Monorepo | Turborepo | Free |
| Real-time | Partykit | Free tier |
| Database | Cloudflare D1 | Free (5GB) |
| Auth | Clerk | Free (10k MAU) |
| Hosting | Cloudflare Pages | Free |
| Payments | Stripe | Stub — not connected |
| Language | TypeScript everywhere | — |

> ⚠️ Before adding any new service — verify it has a free tier. If not — stop and ask the product owner.

---

## Game Modules

| Module | Status | Description |
|--------|--------|-------------|
| `charades` | 🎯 MVP | Pantomime — gestures, expressions, body language. No drawing, no words. |
| `[next-game]` | 💡 TBD | To be defined with product owner |

### Module Contract (game-sdk)
Every module must export:
- `GameConfig` — name, description, color, icon, min/max players, modes list, categories list
- `GameMenu` — mode selection screen (uses shared `game-template`)
- `GameScreen` — main gameplay screen (per module)
- `GameResults` — round results screen

> Details → `packages/game-sdk/README.md`

---

## Design System

### Theme
- Each game defines its own theme (dark/light) in `GameConfig` via CSS custom properties
- Never hardcode colors in components — always use variables
- Shared layout, swappable colors → `packages/ui/game-template/`

### Responsiveness — from day 0, no exceptions
- **Desktop** (≥768px): left sidebar (200px) + main content
- **Mobile** (<768px): sidebar hidden → bottom tab bar
- Every new component must work on both breakpoints before merging

### Sidebar navigation (every game)
- Always present: "Play now", "Settings"
- Optional per game: "Stats", "Leaderboard", "How to play"
- Bottom always: "Back to lobby" (returns to hub)
- Topbar: game logo + Login button / User avatar

### Navigation flow
1. Hub → click game → **game menu** (mode selection)
2. Click "Play" → **config modal** (overlay, not a new page)
3. Modal: players/teams, mode settings, word deck, devices, "Start"
4. → **Gameplay**
5. → **Results** → back to menu

### Config modal
- Closing (X or click outside) = back to menu, mode selection preserved
- Each game defines which sections and options to show
- "Start" disabled until minimum requirements are met (e.g. no deck selected)

---

## Code Rules — no exceptions

### File structure
- No CSS/TS/TSX file exceeds **300 lines** — if it grows, split into modules
- Component styles live next to the component (`Button.module.css` beside `Button.tsx`)
- One component = one file. Never pack 5 components into one file because "they're small"
- `globals.css` only for: CSS reset, custom properties, base typography — nothing else

### Quality
- No AI slop — comments only when explaining *why*, never *what*
- No commented-out code blocks in the repo
- No `TODO` without an open task in `memory/active-tasks.json`
- Every function does one thing

### Commits
- Atomic: one commit = one change
- Types: `fix / feat / refactor / docs / test / chore`
- Forbidden: mixed changes, commit >100 lines without justification

---

## Delivery Standards

- **Truth > Speed**: Never claim something works without running it
- **Small Batch**: ≤15 files or ≤400 lines net change per commit
- **No Secrets**: Never commit API keys or tokens
- **Self-verify**: Run lint/build/test, read the output before declaring done
- **Banned phrases**: "Should be fine" / "Probably passes" / "I think it works"

---

## Collaboration Preferences

- Product owner is not a developer — **explain technical decisions in plain language**
- When choosing between options — always give a recommendation with reasoning
- **Auto-execute**: bug fixes, small UI changes, ≤100 lines
- **Ask before:**
  * Any new external service (check free tier first!)
  * Database schema changes
  * Creating a new game module
  * Real-time / Partykit architecture decisions
  * Anything that could cost money
- **Never self-decide**: deleting data, production deploys

---

## SSOT Ownership

| Info Type | SSOT File | Never write to |
|-----------|-----------|----------------|
| Infrastructure / CF config | `memory/infra.md` | Code comments |
| Project status | `PROJECT_CONTEXT.md` | today.md |
| Project overview | `memory/projects.md` | Other files |
| Technical pitfalls | `memory/MEMORY.md` | today.md |
| Daily progress | `memory/today.md` | Other files |
| In-flight tasks | `memory/active-tasks.json` | Other files |
| Game content (words, categories) | `content/[game]/` | Source code |
| SDK contract | `packages/game-sdk/README.md` | Other files |

---

## What you can touch

| Allowed | Never touch |
|---------|-------------|
| `apps/` — all code files | `rules/` |
| `packages/` — all code files | `docs/` |
| `content/` — word lists | `memory/` (except handoff block) |
| `PROJECT_CONTEXT.md` handoff block | `CLAUDE.md` |

---

## On-demand Loading Index

| Scenario | Load file |
|----------|-----------|
| Project setup / Phase 0 init | `Read docs/project-setup.md` |
| Project overview | `Read memory/projects.md` |
| New service / architecture decision | `Read docs/scaffolding-checkpoint.md` |
| Handing off to another agent | `Read docs/agents.md` |
| Agent routing / model costs | `Read docs/task-routing.md` |
| Goals and priorities | `Read memory/goals.md` |
| Patterns and reusable solutions | `Read memory/patterns.md` |
| Technical pitfalls | `Read memory/MEMORY.md` |
| AI content safety | `Read docs/content-safety.md` |
| Extended behavior rules | `Read docs/behaviors-extended.md` |
| Memory search / reference details | `Read docs/behaviors-reference.md` |

---

## Completing a session

Update the handoff block in `PROJECT_CONTEXT.md`:

```
<!-- handoff:start -->
## Session Handoff
- Last: [time] by Codex (GPT-5.4)
- Task: [description]
- Did: [what was done]
- Next: [next steps]
- Blocker: [if any]
<!-- handoff:end -->
```

Then commit:
```bash
git add [specific files]  # Never git add .
git commit -m "[type]: [description]"
```

---

*Last updated: 2026-03-22*
