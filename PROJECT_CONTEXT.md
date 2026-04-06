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
  - shared platform modal primitives,
  - shared settings-screen primitives (`AlertDialog`, settings shell/footer/tabs/status/placeholder/header/hero).
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
- Last: 2026-04-06 by Codex (GPT-5.4)
- Task: Asset-generation prompt packaging for Gemini, hub card loop support, and finishing alert cleanup around Charades.
- Did: Added two Gemini-ready resource files in `prompts/` for image and short-video generation, derived from the existing Project Party prompt system. Wired the hub library cards to support video loops with poster fallback and connected the current Charades/Codenames cards to `.mp4` assets. Replaced remaining native confirm dialogs in Charades pool management with shared `AlertDialog`, replaced browser-back confirmation during active play with an in-app alert, reviewed the settings code for dead/duplicate logic, and removed two unused helpers from the bindings/settings layer. Verification passing in this session: `npm run test:library-card-media --workspace @party/hub`, `npm run build --workspace @party/hub`, `npm run build --workspace @party/charades`, and `npm run test:controls-bindings --workspace @party/charades`.
- Next: Return to Phase 4 deployment work or run a manual browser polish pass on the new hub video cards and Charades alert flows.
- Blocker: No code blocker. Remaining risk is UX-only: the new alert flows and video cards were build-verified but not manually smoke-tested in browser during this session.
## Previous Handoff
- Last: 2026-04-06 by Codex (GPT-5.4)
- Task: Charades settings overlay polish, shared settings UI extraction, and documentation refresh.
- Did: Finished the main-menu settings overlay flow around manual save/reset and unsaved-changes alerts, then extracted the reusable settings chrome into `@party/ui`: alert dialog, settings shell/footer/tabs/status pill/placeholder/list header/detail hero. Kept Charades-specific binding logic and the controls mapping table local to the game package. Added `packages/ui/README.md` to document the shared UI boundary and updated project docs/memory to reflect the new shared settings primitives. Verification passing in this session: `npm run build --workspace @party/ui` and `npm run build --workspace @party/hub`.
- Next: Decide whether the controls bindings table should stay game-local until a second game needs it, or whether the next task should return to real settings/runtime work or Phase 4 deployment.
- Blocker: No code blocker. The main open decision is product/architecture scope: stop the shared extraction here, or generalize more of the settings screen only if reuse is proven.
<!-- handoff:end -->


