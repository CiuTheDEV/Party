# Projects Overview

*Last updated: 2026-04-25*

---

## Active Projects

| Project | Status | Phase | Last Updated |
|---------|--------|-------|--------------|
| Project Party | Active | Phase 5 done; current follow-up is Charades runtime cleanup plus narrower Codenames runtime/pairing edge-case polish before the next deploy-focused pass | 2026-04-25 |

---

## Project Party

**Description**: Polish browser-based party game portal for hangouts. Hub as platform shell, games as separate modules.

**Current product model**:
- hub = platform shell and registry,
- each game = module in `packages/games/<game>`,
- menu/setup/results should belong to the game module,
- setup shell is shared, gameplay remains custom per game.

**Current implementation truth**:
- `charades` owns config, menu, setup, results, and its runtime hooks/components; the latest pass also closed the mixed-verdict browser flow, presenter pairing reset path, and second-presenter slot takeover, so follow-up work is now cleanup-sized rather than feature-sized,
- charades now has presenter word change, weighted reroll logic, browser-side word history, prompt-pool management/reset UI, low-pool start warning, and a custom avatar asset system,
- `codenames` now has live menu/setup/runtime polish work, persistent non-repeating word history with shared pool-manager UI and per-category resets, captain/host reconnect hardening, a fixed avatar picker, URL-backed setup/pairing state that keeps host setup and pairing modal stable during captain join flows, a denser host status rail, and dedicated portrait/landscape card-back assets in runtime,
- the next product milestone is still deploy/runtime validation hardening before moving deeper into Phase 6 work.

**Stack**: Next.js + Turborepo + Cloudflare Pages + Partykit + D1 + Clerk later + Stripe stub

| Resource | URL |
|----------|-----|
| Repo | https://github.com/CiuTheDEV/Party |
| Prod | [Cloudflare URL - TBD] |
| Docs | `PROJECT_CONTEXT.md` |
