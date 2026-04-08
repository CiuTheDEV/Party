# Projects Overview

*Last updated: 2026-04-08*

---

## Active Projects

| Project | Status | Phase | Last Updated |
|---------|--------|-------|--------------|
| Project Party | Active | Phase 4 in progress, with final Charades runtime control polish still active before returning fully to deploy work | 2026-04-08 |

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
- Phase 4 deploy/multiplayer is still the next product milestone, but there is still an active multi-session Charades task around final runtime control polish after simplifying gameplay bindings to a single `confirm` semantic.

**Stack**: Next.js + Turborepo + Cloudflare Pages + Partykit + D1 + Clerk later + Stripe stub

| Resource | URL |
|----------|-----|
| Repo | https://github.com/CiuTheDEV/Party |
| Prod | [Cloudflare URL - TBD] |
| Docs | `PROJECT_CONTEXT.md` |
