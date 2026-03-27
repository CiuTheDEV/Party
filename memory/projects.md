# Projects Overview

*Last updated: 2026-03-26*

---

## Active Projects

| Project | Status | Phase | Last Updated |
|---------|--------|-------|--------------|
| Project Party | Active | Phase 4 in progress, architecture cleanup done | 2026-03-26 |

---

## Project Party

**Description**: Polish browser-based party game portal for hangouts. Hub as platform shell, games as separate modules.

**Current product model**:
- hub = platform shell and registry,
- each game = module in `packages/games/<game>`,
- menu/setup/results should belong to the game module,
- setup shell is shared, gameplay remains custom per game.

**Current implementation truth**:
- `charades` owns config, menu, setup and results,
- gameplay host runtime is still partly in hub,
- Phase 4 deploy/multiplayer is the next product milestone.

**Stack**: Next.js + Turborepo + Cloudflare Pages + Partykit + D1 + Clerk later + Stripe stub

| Resource | URL |
|----------|-----|
| Repo | https://github.com/CiuTheDEV/Party |
| Prod | [Cloudflare URL - TBD] |
| Docs | `PROJECT_CONTEXT.md` |
