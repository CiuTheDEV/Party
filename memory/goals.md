# Goals & Focus

*Last updated: 2026-03-27*

---

## This Week

1. ~~Close architecture cleanup for the first game module~~ ✅
2. ~~Re-align documentation with the new module/setup vision~~ ✅
3. ~~Charades pre-MVP polish~~ — polskie znaki ✅, pozostałe issues poniżej
4. Move forward with Phase 4 deploy path

## Charades - przed MVP

### Krytyczne (blokują grę)
- [ ] PlayTopBar - dodać przycisk wyjścia z gry (teraz host nie może wyjść bez resetu)
- [ ] "Zmień hasło" na telefonie prezentera - zaimplementować lub usunąć przycisk
- [ ] Obsługa rozłączenia prezentera - fallback gdy telefon zgubi sieć podczas gry

### Ważne (obniżają jakość)
- [ ] Error boundaries dla WebSocket/Partykit - crash strony zamiast graceful error
- [ ] Odporność na page refresh - teraz refresh w trakcie gry niszczy sesję

## This Month

- [x] Phase 0 - working monorepo base
- [x] Phase 1 - hub shell and game list
- [x] Phase 2 - `game-sdk` contract
- [x] Phase 3 - first playable Charades MVP
- [x] Shared shell in `@party/ui`
- [x] Shared setup framework with custom game sections
- [x] `charades` ownership for menu, setup and results
- [x] Gameplay cleanup in host-side runtime (`useGameState`, `PlayBoard`, `HostGameScreen`)
- [ ] Phase 4 - deploy hub and Partykit

## This Quarter

- Working deployed Charades prototype
- Real-time multiplayer with room codes
- Architecture validated on at least one more game module
- Optional accounts via Clerk after multiplayer base is stable
