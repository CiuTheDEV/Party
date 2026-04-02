# Project Party - Project Context

*Last updated: 2026-04-02*

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
- runtime move from `apps/hub` into `packages/games/charades`,
- hub and shared UI cleanup,
- `codenames` scaffold + module registration.

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
|  |- ui/                   # Shared shell, shared setup chrome, shared primitives
|  |- game-sdk/             # Module contract (config, status, setup, menu, results)
|  `- games/
|     |- charades/          # First live game module
|     `- codenames/         # Coming-soon game scaffold
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
  - shared platform modal primitives.
- `@party/game-sdk` owns the module contract.
- each game module owns:
  - `config`,
  - `config.status` (`live` or `coming-soon`),
  - menu content,
  - setup sections,
  - setup validation/state model,
  - results UI,
  - gameplay entrypoints/runtime.

### Important Nuance

Current repo now matches the intended split much more closely:
- `apps/hub` is platform routing + registry + hub feature code,
- `@party/ui` owns shared shell/setup primitives,
- `charades` owns menu, setup, results, and runtime,
- `codenames` is scaffolded and registered as `coming-soon`.

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
| Module rollout | Explicit `config.status` | Register future games before gameplay is ready |

---

## Open Questions / Remaining Tech Debt

- [ ] Finalize Phase 4 deploy path for hub + Partykit
- [ ] Start defining the real gameplay/runtime shape for `codenames`
- [ ] Decide whether Hub library cards should become fully data-driven from module registry
- [ ] Decide long-term room architecture details before production multiplayer

---

<!-- handoff:start -->
## Session Handoff
- Last: 2026-04-02 23:10 by Codex (GPT-5.4)
- Task: Phase 4 readiness pass across shared chrome, PartyKit authority/config, encoding, and dependency risk.
- Did: Migrated Hub-derived chrome into shared `@party/ui` so Hub and game menus now use the same topbar/rail shell, then polished the shared login button. Closed the biggest multiplayer blocker by adding server-side PartyKit authority rules and a regression harness, then added a production-safe PartyKit host resolver with a dedicated test so non-local deploys fail fast unless `NEXT_PUBLIC_PARTYKIT_HOST` is configured. Cleaned visible UTF-8/mojibake issues in Hub and Charades presenter/pairing surfaces, removed unused Clerk from `@party/hub`, refreshed the lockfile, and cleaned Turbo build warnings except for the remaining upstream PartyKit advisory chain. Fresh checks passing: `npm run test:authority --workspace @party/partykit`, `npm run test:runtime-host --workspace @party/charades`, `npm run verify:encoding`, and `npm run build`.
- Next: Start actual Phase 4 deploy work. First recommended slice is Cloudflare/Partykit deployment wiring and env setup, with one explicit known risk carried forward: upstream `partykit` still brings `undici`/`miniflare`/`esbuild` advisories and currently has no simple npm upgrade path beyond `0.0.115`.
- Blocker: No code-level blocker in repo. Remaining blocker is external/upstream dependency risk in the current PartyKit toolchain.
## Previous Handoff
- Last: 2026-04-01 11:51 by Codex (GPT-5.4)
- Task: Charades warning modal polish and long-word handling across reveal and verdict screens.
- Did: Reworked the low-pool warning modal into a more spacious hero-plus-stats layout, cleaned several touched files back to UTF-8, and split word rendering into normal static display for short words plus autoscale for long phrases. Also fixed the shared autoscale wrapper so visibility state reaches the outer shell. Build verification passes for @party/charades and @party/hub.
- Next: Run a real browser smoke test for the host verdict panel with a very long developer prompt. User screenshots still show the right-hand verdict card as visually broken, so the next session should inspect the live DOM/CSS/state instead of making more blind code-only adjustments.
- Blocker: None.
<!-- handoff:end -->


