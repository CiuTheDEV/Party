# Project Party - Project Context

*Last updated: 2026-04-20*

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

> Phase 5 - custom auth (email/password, guest + account) - done

Secondary focus completed in this session block:
- architecture cleanup for game modules,
- shared setup framework,
- ownership cleanup for `charades`,
- runtime move from `apps/hub` into `packages/games/charades`,
- hub and shared UI cleanup,
- `codenames` scaffold + module registration,
- shared host-navigation framework rollout with `charades` as the reference consumer.

---

## MVP Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Monorepo (Turborepo) setup, CI/CD base, Cloudflare-ready structure | Done |
| 1 | Hub - landing page, game list, shared shell | Done |
| 2 | Game SDK - module contract and shared interfaces | Done |
| 3 | First game: Charades / Kalambury MVP | Done |
| 3.5 | Module architecture cleanup: shared setup + module ownership | Done |
| 3.6 | Second module scaffold + module registry hardening | Done |
| 4 | Real-time multiplayer / deploy (Partykit, rooms, Cloudflare) | Done |
| 5 | Custom auth (email/password, guest + account) | Done |
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
|  |- ui/                   # Shared shell, shared setup chrome, shared primitives
|  |- game-sdk/             # Module contract (config, status, setup, menu, results)
|  `- games/
|     |- charades/          # First live game module
|     `- codenames/         # Live game module (menu + setup + full runtime)
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
  - setup modal/template chrome,
  - shared platform modal primitives,
  - shared settings-screen primitives (`AlertDialog`, settings shell/footer/tabs/status/placeholder/header/hero),
  - shared host-navigation engine/provider and controlled focus surfaces.
- `@party/game-sdk` owns the module contract and host-navigation profile contract.
- each game module owns:
  - `config`,
  - `config.status` (`live` or `coming-soon`),
  - menu content,
  - setup sections,
  - setup validation/state model,
  - results UI,
  - gameplay entrypoints/runtime,
  - navigation profiles and delegated host-navigation commands for its own surfaces.

### Important Nuance

Current repo now matches the intended split much more closely:
- `apps/hub` is platform routing + registry + hub feature code,
- `@party/ui` owns shared shell/setup primitives,
- `charades` owns menu, setup, results, and runtime,
- `codenames` is live with full menu, setup, captain/host runtime, and full host keyboard/controller controls verified in browser.

### Shared Setup Model

The approved direction is:
- every game uses the same setup skeleton/chrome,
- each game injects its own setup sections,
- setup state is one shared object per game,
- gameplay after clicking `Start` stays fully custom.

This means:
- UI updates to setup shell propagate to all games,
- games keep flexibility in section content and order,
- hub does not hardcode per-game setup structure.

For the current shared UI inventory and the practical ownership map of `@party/ui` vs game modules, see `docs/ui-map.md`.
For runtime ownership and shared-vs-local runtime rules, see `docs/runtime-map.md`.
For new game module scaffolding and maturity expectations, see `docs/game-module-template.md` and `docs/module-maturity.md`.

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Structure | Monorepo (Turborepo) | Hub + independent game packages |
| Hosting | Cloudflare Pages + Workers | Free tier + aligned with owner account |
| Real-time | Partykit | Fastest path to multiplayer on CF stack |
| Database | Cloudflare D1 | Native CF, zero ops |
| Auth | Custom email/password auth | Same-origin Pages Functions + D1 keep the stack free-tier and future-proof |
| Payments | Stripe stub only | Monetization-ready, no live payments now |
| Shared setup | One shell, custom game sections | Common UX without losing game flexibility |
| Module rollout | Explicit `config.status` | Register future games before gameplay is ready |

---

## Open Questions / Remaining Tech Debt

- [ ] Finalize Phase 4 deploy path for hub + Partykit
- [ ] Decide whether Hub library cards should become fully data-driven from module registry
- [ ] Decide long-term room architecture details before production multiplayer
- [ ] Finish the live UX polish pass for Charades runtime host controls now that the shared host-navigation framework is in place

---

<!-- handoff:start -->
- Last: 2026-04-25 19:25 by Codex
- Task: Final party-polish pass for Tajniacy and Kalambury: pairing/device edge cases, Codenames runtime polish, and card-back assets.
- Did: Finished the remaining narrow device-flow fixes in both games: confirm alerts for session-code changes and disconnects, distinct mobile messaging for `SESSION_CODE_CHANGED` vs `DEVICES_DISCONNECTED`, persistent pairing controls, and authority-side rejection of a second presenter in Charades with `PRESENTER_SLOT_TAKEN`. On Codenames, added a denser non-scrolling host status rail, win-screen polish, assassin-count settings separation, portrait/landscape card-back assets wired into host/captain grids, and restored `MATCH_RESET` room-state sync so replay starts from `0:0`. Also recovered a corrupted `packages/partykit/codenames/server.ts` after it contained `\x00` bytes and revalidated the PartyKit compile path.
- Next: Stay in narrow polish/debug mode only. New work should target concrete UX/runtime reports, not another broad pairing refactor, unless a fresh root-cause investigation proves a new cross-cutting bug.
- Blocker: No active blocker. Current builds and PartyKit authority checks are green after the final reset-sync fix.
<!-- handoff:end -->

