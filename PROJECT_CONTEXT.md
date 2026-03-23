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

> 🎯 Phase 4 — Deploy (Cloudflare Pages + Partykit)

---

## MVP Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Monorepo (Turborepo) setup, Cloudflare Pages, CI/CD | ✅ Done (CF deploy pending) |
| 1 | Hub — landing page, game list, room creation | ✅ Done |
| 2 | Game SDK — module contract, interfaces | ✅ Done |
| 3 | Module: Charades (no multiplayer, single screen) | ✅ Done |
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
- Last: 2026-03-23 16:42 by Codex (GPT-5.4)
- Task: Task 1 planu cinema-layout dla `/games/charades/play` - odpiecie gameplay route od GameShell
- Did: `apps/hub/src/app/games/charades/layout.tsx` renderuje teraz `GameShell` dla tras modulu poza segmentem `play`, dzieki czemu `/games/charades/play` nie dziedziczy sidebara ani chrome menu. `apps/hub/src/app/games/charades/play/page.module.css` zostal zredukowany do minimalnego wrappera z pelna wysokoscia viewportu.
- Next: Zweryfikowac runtime fullscreen stage po ustabilizowaniu lokalnego Next.js/HMR i przejsc do kolejnego taska planu cinema-layout.
- Blocker: Pelna weryfikacja runtime/build nadal moze byc ograniczona przez lokalne problemy `.next`/HMR opisane wczesniej; w tej sesji potwierdzono tylko `npx tsc --noEmit` dla `apps/hub`.
<!-- handoff:end -->
