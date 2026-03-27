# Project Party - Project Context

*Last updated: 2026-03-26*

---

## What Is This

Polish browser-based party game portal for hangouts and friend gatherings.
Inspiration: Jackbox Party Pack, but browser-first, Polish-first, no installation.

Core product model:
- `hub` is the platform shell,
- each game is its own module in `packages/games/<game>`,
- shared menu and setup chrome live in shared layers,
- gameplay stays per game.

---

## Current Focus

> Phase 4 - deploy and multiplayer foundation (Cloudflare Pages + Partykit)

Secondary focus completed in this session block:
- architecture cleanup for game modules,
- shared setup framework,
- ownership cleanup for `charades`,
- gameplay refactor in host-side code.

---

## MVP Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Monorepo (Turborepo) setup, CI/CD base, Cloudflare-ready structure | Done |
| 1 | Hub - landing page, game list, shared shell | Done |
| 2 | Game SDK - module contract and shared interfaces | Done |
| 3 | First game: Charades / Kalambury MVP | Done |
| 3.5 | Module architecture cleanup: shared setup + module ownership | Done |
| 4 | Real-time multiplayer / deploy (Partykit, rooms, Cloudflare) | In progress |
| 5 | Optional auth (Clerk, guest + account) | TODO |
| 6 | Leaderboards and game history | TODO |
| 7 | Monetization stubs (Stripe-ready, not connected) | TODO |
| 8 | Launch | TODO |

---

## Architecture

```text
project-party/
|- apps/
|  `- hub/                  # Next.js platform shell
|- packages/
|  |- ui/                   # Shared shell + shared setup template
|  |- game-sdk/             # Module contract (config, setup, menu, results)
|  `- games/
|     `- charades/          # First game module
`- content/
   `- charades/             # Word lists and categories
```

### Current Architectural Direction

- `hub` owns platform concerns:
  - routing,
  - game registry,
  - shared shell mounting,
  - session/bootstrap glue.
- `@party/ui` owns shared presentation patterns:
  - topbar,
  - sidebar,
  - shell layout,
  - setup modal/template chrome.
- `@party/game-sdk` owns the module contract.
- each game module owns:
  - `config`,
  - menu content,
  - setup sections,
  - setup validation/state model,
  - results UI,
  - eventually gameplay entrypoints.

### Important Nuance

Current repo is closer to the target architecture, but not fully there yet:
- `charades` already owns menu, setup and results,
- host gameplay runtime still lives mainly in `apps/hub/src/components/charades/play` and `apps/hub/src/hooks/charades`,
- next architectural step for full module ownership would be moving gameplay/runtime deeper into the game module.

### Shared Setup Model

The approved direction is:
- every game uses the same setup skeleton/chrome,
- each game injects its own setup sections,
- setup state is one shared object per game,
- gameplay after clicking `Start` stays fully custom per game.

This means:
- UI updates to setup shell propagate to all games,
- games keep flexibility in section content and order,
- hub does not hardcode per-game setup structure.

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Structure | Monorepo (Turborepo) | Hub + independent game packages |
| Hosting | Cloudflare Pages + Workers | Free tier + aligned with owner account |
| Real-time | Partykit | Fastest path to multiplayer on CF stack |
| Database | Cloudflare D1 | Native CF, zero ops |
| Auth | Clerk later | Good guest/account split, deferred to later phase |
| Payments | Stripe stub only | Monetization-ready, no live payments now |
| Shared setup | One shell, custom game sections | Common UX without losing game flexibility |

---

## Open Questions / Remaining Tech Debt

- [ ] Decide how far gameplay ownership should move from `apps/hub` into `packages/games/charades`
- [ ] Finalize Phase 4 deploy path for hub + Partykit
- [ ] Verify module contract on a second game, not only `charades`
- [ ] Decide long-term room architecture details before production multiplayer

---

<!-- handoff:start -->
## Session Handoff
- Last: 2026-03-27 by Claude (Sonnet)
- Task: Pre-MVP cleanup — refactors and Polish character fixes.
- Did: Removed dead Podium duplicate from hub, extracted CLEARED_WORD constant, fixed 80+ missing Polish diacritics across 13 files (including HTML entities and Unicode escapes). Identified and saved pre-MVP issues list to goals.md.
- Next: Implement pre-MVP issues — empty PlayTopBar (no exit button), disabled "Zmień hasło" on presenter phone, presenter disconnect handling. Then Phase 4 deploy.
- Blocker: None.
<!-- handoff:end -->
