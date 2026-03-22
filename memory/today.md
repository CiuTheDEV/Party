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
