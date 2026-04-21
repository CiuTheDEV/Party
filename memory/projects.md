# Projects Overview

*Last updated: 2026-04-21*

---

## Active Projects

| Project | Status | Phase | Last Updated |
|---------|--------|-------|--------------|
| Project Party | Active | Phase 5 done; current follow-up is Charades runtime/results hardening plus Codenames browser validation before the next deploy-focused pass | 2026-04-21 |

---

## Project Party

**Description**: Polish browser-based party game portal for hangouts. Hub as platform shell, games as separate modules.

**Current product model**:
- hub = platform shell and registry,
- each game = module in `packages/games/<game>`,
- menu/setup/results should belong to the game module,
- setup shell is shared, gameplay remains custom per game.

**Current implementation truth**:
- `charades` owns config, menu, setup, results, and its runtime hooks/components; the latest pass expanded host/setup polish to 16 players, rebuilt the round-order intro for larger groups, and added tie-aware ranking with guess-time tiebreakers,
- charades now has presenter word change, weighted reroll logic, browser-side word history, prompt-pool management/reset UI, low-pool start warning, and a custom avatar asset system,
- `codenames` now has live menu/setup/runtime polish work, persistent non-repeating word history with shared pool-manager UI and per-category resets, fresh Playwright coverage for smoke/setup flows, and a cleaned-up local repo/tooling baseline,
- the next product milestone is still deploy/runtime validation hardening before moving deeper into Phase 6 work.

**Stack**: Next.js + Turborepo + Cloudflare Pages + Partykit + D1 + Clerk later + Stripe stub

| Resource | URL |
|----------|-----|
| Repo | https://github.com/CiuTheDEV/Party |
| Prod | [Cloudflare URL - TBD] |
| Docs | `PROJECT_CONTEXT.md` |
