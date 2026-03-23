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
- Last: 2026-03-23 23:50 by Codex (GPT-5.4)
- Task: Iteracyjny redesign `games/charades` - fullscreen GameScreen, pairing persistence i flow losowania kolejnosci z animowanymi kartami.
- Did: Dodano persistence setupu i sesji prezentera w przegladarce (`charades-storage`, restore graczy/kategorii/ustawien, reconnect aktywnego prezentera), naprawiono runtime host/presenter dla PartyKit (`charades-runtime`, QR warning), uproszczono fullscreen host screen bez sidebara i score, przebudowano top/bottom bar, oraz przepieto etap `round-order` na wieloetapowa animacje kart z GSAP. W trakcie sesji wielokrotnie retuszowano viewport, uklad boardu, talie kart i motion reveal. `C:\Users\Mateo\Desktop\Party\node_modules\.bin\tsc.cmd --noEmit` dla `apps/hub` przechodzi.
- Next: Dopracowac finalny wyglad i geometrie talii kart w fazie `round-order` na podstawie ostatniego feedbacku usera, a potem przejsc do kolejnych ekranow flow (`przygotowanie`, `timer`, `werdykt`) juz bez rozbijania viewportu.
- Blocker: Brak twardego blockera technicznego; zostal otwarty temat UX/visual polish animacji kart i stagingu talii, ktory jest jeszcze niedomkniety.
<!-- handoff:end -->
