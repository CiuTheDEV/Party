# Project Party — Project Context

*Last updated: 2026-03-22*

---

## What is this

Polish browser-based party game portal for hangouts and friend gatherings.
Inspiration: Jackbox Party Pack — Polish, no installation, runs in browser.

**Architecture**: Hub + module system. Hub is the shell, each game is an independent module.
Adding a new game = new package. Games don't know about each other.

---

## Current Focus

> 🎯 Phase 0 — Monorepo setup and infrastructure

---

## MVP Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Monorepo (Turborepo) setup, Cloudflare Pages, CI/CD | ⬜ TODO |
| 1 | Hub — landing page, game list, room creation | ⬜ TODO |
| 2 | Game SDK — module contract, interfaces | ⬜ TODO |
| 3 | Module: Charades (no multiplayer, single screen) | ⬜ TODO |
| 4 | Real-time multiplayer (Partykit, rooms, codes) | ⬜ TODO |
| 5 | Optional auth (Clerk, guest + account) | ⬜ TODO |
| 6 | Leaderboards and game history (for accounts) | ⬜ TODO |
| 7 | Monetization stubs (Stripe, premium categories) | ⬜ TODO |
| 8 | Launch | ⬜ TODO |

---

## Architecture

```
project-party/                     # Monorepo (Turborepo)
├── apps/
│   └── hub/                       # Next.js — landing page, game list
├── packages/
│   ├── ui/                        # Shared UI components
│   │   └── game-template/         # Shared layout used by every game menu
│   ├── game-sdk/                  # Module contract (types, interfaces)
│   └── games/
│       └── charades/              # Module: Charades ← first game
└── content/
    └── charades/                  # Word lists and categories
```

## Key Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Structure | Monorepo (Turborepo) | Games as independent packages |
| Hosting | Cloudflare Pages + Workers | Owner has account, free tier |
| Real-time | Partykit | Easier than Durable Objects, built on CF |
| Auth | Clerk | Guest + account support, simplest DX |
| Database | Cloudflare D1 | Native CF, zero ops, SQLite |
| Payments | Stripe (stub) | Designed in, not connected yet |

---

## Open Questions / Tech Debt

- [ ] Partykit vs Cloudflare Durable Objects — check costs at scale
- [ ] Payment model: one-time packs vs hub subscription — decide before Phase 7
- [ ] Content moderation if player-generated content is ever added

---

<!-- handoff:start -->
## Session Handoff

- Last: 2026-03-22 — Claude Code workflow setup
- Task: Project interview + documentation files preparation
- Did: Defined hub + module architecture, stack, MVP phases. Generated CLAUDE.md, PROJECT_CONTEXT.md, projects.md, goals.md
- Next: Fill in CLAUDE.md personal info (name, accounts), create GitHub repo, init Turborepo monorepo
- Blocker: None

<!-- handoff:end -->
