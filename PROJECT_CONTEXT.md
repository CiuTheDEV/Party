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

### Previous: 2026-03-22 — Phase 3 ✅ + Shared Shell @party/ui ✅
- Bugfixy (hydration QRPairing, game freeze 'between', Partykit w dev.bat). @party/ui: Topbar, GameSidebar, GameShell, GameCard, token system. Hub + charades layout zmigrowane.

### Latest: 2026-03-23 — Setup modal + UI redesign ✅
- Did: Pełny redesign setup flow dla Kalamburów. Config przepięty z trasy `/config` na lokalny modal w `page.tsx`. Nowe komponenty: `PlayerGrid`, `AddPlayerModal` (modal dodania gracza z walidacją + shake animation), `CategoryPicker` (accordion, easy/hard per kategoria, `SelectedCategories = Record<string, ('easy'|'hard')[]>`), `SettingsModal` (sidebar + slider + quick buttons), `QRPairing` (sekcja + modal QR z kodem sesji). Walidacja "Rozpocznij grę" z podświetlaniem błędnych sekcji. Stara trasa `/config`, `PlayerForm`, `PlayerList` usunięte. `WordCategory` zmieniona na `wordsEasy[]` + `wordsHard[]`, `useWordPool` obsługuje osobne pule.
- Pattern: ten układ (menu + setup modal) to zatwierdzony wzorzec dla każdej kolejnej gry — zmienia się tylko `--game-color-primary` i zawartość sekcji.
- Next: Phase 4 — Cloudflare Pages deploy + Partykit deploy
- Blocker: Clerk wyłączony (Phase 5).

- Last: 2026-03-23 15:49 by Codex (GPT-5.4)
- Task: Przebudowa modelu stanu hosta w `useGameState.ts` dla nowego flow GameScreen
- Did: Zmieniono fazy hosta na `round-order -> prepare -> waiting-ready -> timer-running -> verdict`, dodano `startRound`, rozdzielono start rundy od `sendWord`, przepisano `giveVerdict` na 3 jawne galezie z reshuffle po pelnej rundzie i koncem gry przez `GAME_END`.
- Next: Zaktualizowac host/presenter UI do nowych faz (`round-order`, `prepare`) i usunac tymczasowa zaleznosc od `BETWEEN_TURNS`, jesli nie bedzie juz potrzebna.
- Blocker: `npx turbo build --filter="@party/hub"` blokuje srodowisko worktree przez bledy `Module not found` w lokalnym `next/dist/...`, wiec nie zweryfikowano pelnego buildu aplikacji.
<!-- handoff:end -->
