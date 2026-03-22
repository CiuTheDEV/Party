# Today — 2026-03-22 (Sunday)

<!--
  Daily working memory. Each session appends a section.
  At end of day, key items are archived and this file resets.

  Format per session:
  ### SN (~HH:MM) [Project/Topic] Brief description
  - What was done (1-2 sentences)
  - Key decisions/discoveries
  - Next steps
  - Experience recorded: yes/no
-->

### S1 (~dziś) [Project Party] Phase 0, 1, 2 — monorepo, hub, game SDK

- Zainicjalizowano Turborepo monorepo, zbudowano hub (Next.js 16) z Topbarem, GameCard, GamesGrid, PremiumModal. Zdefiniowano i zaimplementowano `@party/game-sdk` (typy GameConfig, GameModule). Zaktualizowano wszystkie zależności do najnowszych wersji.
- Clerk wyłączony do Phase 5 (placeholder key crashował dev server). `@party/charades` kompiluje tylko `.d.ts` (emitDeclarationOnly) — runtime import z tej paczki nie działa w Next.js, config Kalambury tymczasowo inline w `games.ts`. Wrócimy gdy charades będzie miało pełny build. Next.js 16 automatycznie zmienia `tsconfig.json` przy pierwszym uruchomieniu (jsx → react-jsx, dodaje .next/dev/types).
- Next: Phase 3 — moduł Kalambury (GameMenu, GameConfigModal, GameResults, GameScreen)
- Experience recorded: yes

### S2 (~dziś) [Project Party] Phase 3 — Kalambury MVP

- Zaimplementowano pełny moduł Kalambury: content (zwierzęta/filmy/sport), Partykit server, hooks (useWordPool, useGameState, usePresenter), komponenty (PlayerForm, PlayerList, CategoryPicker, SettingsModal, QRPairing, DeviceListener, Podium), wszystkie 5 tras Next.js (GameMenu, SetupPage /config, GameScreen host /play, GameScreen prezenter /present, GameResults /results).
- Partykit server z eventami TURN_START/TIMER_TICK/TURN_END/BETWEEN_TURNS/GAME_END/GAME_RESET. QR parowanie obowiązkowe (bez telefonu przycisk "Rozpocznij grę" nieaktywny). Timer autorytatywny po stronie hosta. Hasło widoczne wyłącznie na telefonie prezentera.
- `@content/*` path alias w tsconfig huba rozwiązuje cross-workspace import z `content/charades/`. `@party/ui` ma pusty package.json bez tsconfig — build całego monorepo failuje na tym, ale hub builduje się w pełni (`npx turbo build --filter="@party/hub"` — wszystkie 6 tras OK).
- Next: Phase 4 — Cloudflare Pages deploy + Partykit deploy
- Experience recorded: tak

### S3 (~wieczór) [Project Party] Bugfixy + Shared Shell @party/ui

- Naprawiono 3 bugi: hydration mismatch w QRPairing (useState+useEffect zamiast typeof window), game freeze w fazie 'between' (brak przycisku "Następna tura →"), Partykit nie startował automatycznie (dodany do dev.bat jako osobne okno).
- Zaprojektowano i zaimplementowano `@party/ui` — shared shell z Neon Dark brand identity. Komponenty: Topbar, GameSidebar (desktop sidebar + mobile tab bar via CSS media query), GameShell, GameCard (gradient hero). Dwupoziomowy token system: globalne `tokens.css` + per-game `theme.css`. Hub home page i charades layout zmigrowane do @party/ui. Stare komponenty (Topbar, GameCard, GamesGrid z huba) usunięte.
- Phase 3 ✅ ukończona. Shared shell ✅ ukończony. Next: Phase 4 — Cloudflare Pages deploy + Partykit deploy. Do rozważenia: redesign charades-specific screens (GameMenu, SetupPage, GameResults, GameScreen) — UI jest "bardzo ubogie".
- Experience recorded: yes
