# Projects Overview

*Last updated: 2026-04-19*

---

## Active Projects

| Project | Status | Phase | Last Updated |
|---------|--------|-------|--------------|
| Project Party | Active | Phase 5 done; current follow-up is Codenames runtime validation/polish, browser coverage, and repo cleanup before the next deploy-focused pass | 2026-04-19 |

---

## Project Party

**Description**: Polish browser-based party game portal for hangouts. Hub as platform shell, games as separate modules.

**Current product model**:
- hub = platform shell and registry,
- each game = module in `packages/games/<game>`,
- menu/setup/results should belong to the game module,
- setup shell is shared, gameplay remains custom per game.

**Current implementation truth**:
- `charades` owns config, menu, setup, results, and its runtime hooks/components,
- charades now has presenter word change, weighted reroll logic, browser-side word history, prompt-pool management/reset UI, low-pool start warning, and a custom avatar asset system,
- `codenames` now has live menu/setup/runtime polish work, fresh Playwright coverage for smoke/setup flows, and a cleaned-up local repo/tooling baseline,
- the next product milestone is still deploy/runtime validation hardening before moving deeper into Phase 6 work.

**Stack**: Next.js + Turborepo + Cloudflare Pages + Partykit + D1 + Clerk later + Stripe stub

| Resource | URL |
|----------|-----|
| Repo | https://github.com/CiuTheDEV/Party |
| Prod | [Cloudflare URL - TBD] |
| Docs | `PROJECT_CONTEXT.md` |
