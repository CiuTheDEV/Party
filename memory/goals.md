# Goals & Focus

*Last updated: 2026-03-30*

---

## This Week

1. ~~Close architecture cleanup for the first game module~~
2. ~~Re-align documentation with the new module/setup vision~~
3. ~~Charades pre-MVP polish~~ - Polish characters fixed, remaining cleanup below
4. Move forward with Phase 4 deploy path

## Charades - pre-MVP blockers

### Critical (game is broken without these)
- [x] PlayTopBar - safe in-game settings/exit flow
- [x] "Zmień hasło" on presenter phone - implemented with limits, weighted reroll, and browser word history
- [x] Presenter disconnect handling - pause + reconnect modal when phone drops during play

### Important (quality degraders)
- [ ] Error boundaries for WebSocket/Partykit - unhandled errors crash the page
- [ ] Page refresh/back resilience - gameplay still needs broader hardening
- [ ] Manual smoke test for prompt-history flow - reroll, pool resets, start warning, and repeated-game behavior still need real browser verification

### Cleanup / code quality (next pass)
- [ ] Review `useGameState` callback/effect dependencies around `send` after socket reconnects
- [ ] Remove dead presenter/runtime leftovers: `PresenterTimerBar`, ignored timer props, stale refs after recent UI refactors
- [ ] Split oversized Charades files back under repo limits (`ResultsGroups.module.css`, `PlayBoard.tsx`, `PlayBoard.module.css`)

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
