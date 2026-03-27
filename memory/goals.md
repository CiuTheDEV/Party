# Goals & Focus

*Last updated: 2026-03-27*

---

## This Week

1. ~~Close architecture cleanup for the first game module~~ ✅
2. ~~Re-align documentation with the new module/setup vision~~ ✅
3. ~~Charades pre-MVP polish~~ — Polish characters ✅, remaining issues below
4. Move forward with Phase 4 deploy path

## Charades - pre-MVP blockers

### Critical (game is broken without these)
- [ ] PlayTopBar — add exit button (host currently cannot leave without a page reset)
- [ ] "Zmień hasło" on presenter phone — implement or remove the disabled button
- [ ] Presenter disconnect handling — fallback when phone loses connection during play

### Important (quality degraders)
- [ ] Error boundaries for WebSocket/Partykit — unhandled errors crash the page
- [ ] Page refresh resilience — refresh during gameplay destroys the session

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
