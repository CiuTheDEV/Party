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

- Last: 2026-03-23 16:05 by Codex (GPT-5.4)
- Task: Zintegrowany follow-up Task 2 + Task 3 dla host GameScreen + naprawy z review Task 1
- Did: Dodano nowy host UI dla `/games/charades/play` (`HostGameScreen`, `PlayTopBar`, `PlayBoard`, `PlayBottomBar`) i przepieto `page.tsx` na flow `round-order -> prepare -> waiting-ready -> timer-running -> verdict`. Naprawiono soft-lock po zmianie hooka oraz zablokowano drugie klikniecie werdyktu po `isGameOver` przez wczesny exit renderu przed redirectem.
- Next: Zweryfikowac ekran hosta w runtime po naprawie lokalnego srodowiska Next.js/worktree i rozwazyc czy event `BETWEEN_TURNS` jest dalej potrzebny po stronie prezentera.
- Blocker: `npm run build` i `npx turbo build --filter="@party/hub"` w tym worktree nadal wykladaja sie na bledach `Module not found` wewnatrz lokalnego `node_modules/next/dist/...`, wiec pelny build nie potwierdza zmian aplikacyjnych.
<!-- handoff:end -->
