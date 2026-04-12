# Project Party - Project Context

*Last updated: 2026-04-12*

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

> Phase 5 - optional auth (Clerk, guest + account)

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
- [ ] Finish the live UX polish pass for Charades runtime host controls now that the shared host-navigation framework is in place

---

<!-- handoff:start -->
## Session Handoff
- Last: 2026-04-12 by Claude (Sonnet 4.6)
- Task: Phase 5 auth — próba integracji Clerk z static export na CF Pages.
- Did: Próbowano wdrożyć Clerk w 3 podejściach: (1) OpenNext + CF Workers — bloker: Next.js 16 middleware niezgodne z OpenNext; (2) @clerk/nextjs z static export — bloker: Server Actions niekompatybilne z `output: 'export'`; (3) clerk-js z CDN — bloker: clerk.browser.js v6 ładuje się w trybie headless bez UI components. Ostatecznie zdecydowano porzucić Clerk i napisać własny system auth. Hub wrócił do static export na CF Pages z działającym buildem. Plik `providers.tsx` i `AuthButton.tsx` są w stanie przejściowym (niekompletnym).
- Next: Zbudować własny system auth: email+hasło+Google OAuth, D1 jako baza, CF Workers jako API, httpOnly cookie sesja. Zacząć od schematu D1 i Worker API.
- Blocker: Brak — decyzja architektoniczna podjęta, gotowe do implementacji.

## Previous Handoff
- Last: 2026-04-12 by Codex (GPT-5.4)
- Task: Charades presenter autoscaling + mobile device viewport polish.
- Did: Nowy autoscaling oparty o układ całych słów, mobile viewport hardening dla `/present`, UTF-8 fixes w content/charades. Commity `dac3b68`–`12b8575`.
- Next: Smoke test na telefonie po `12b8575`.
- Blocker: Brak.
<!-- handoff:end -->
