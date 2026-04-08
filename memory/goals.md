# Goals & Focus

*Last updated: 2026-04-08*

---

## This Week

1. Stabilize Charades after the shared UI extraction
2. Run a real browser smoke test across setup, host, presenter, and results
3. Fix the highest-risk runtime and reconnect issues before pushing further
4. Move Phase 4 deploy work back onto the critical path

## Charades - MVP hardening

### Ship blockers
- [x] Run a real browser smoke test for the full Charades flow
  Scope: setup modal, pairing, presenter reconnect, reroll flow, hints visibility, verdict flow, and results/podium
- [x] Harden page refresh / back / reconnect behavior across host and presenter
  Scope: mid-round refresh, reconnect after disconnect, and stale session recovery
- [x] Add graceful error handling for WebSocket / Partykit failures
  Scope: user-facing fallback instead of page-level crash or silent broken state

### Important quality work
- [x] Safe in-game settings / exit flow
- [x] Presenter-side "Zmień hasło" with limits, weighted reroll, and browser word history
- [x] Presenter disconnect handling with pause + reconnect modal
- [x] Host hints settings wired into actual gameplay UI
- [x] 2-player podium variant

### Code quality / cleanup
- [x] Review `useGameState` callback/effect dependencies around `send` after socket reconnects
- [ ] Remove dead presenter/runtime leftovers
  Scope: `PresenterTimerBar`, ignored timer props, stale refs after recent UI refactors
- [ ] Split oversized Charades files that are still hard to maintain
  Targets: `ResultsGroups.module.css`, `PlayBoard.tsx`, `PlayBoard.module.css`

### Menu and settings polish
- [ ] Finish Charades host-side menu/settings/runtime controller polish
  Scope: remaining runtime pause/verdict feel issues, final manual validation after simplifying gameplay bindings to `Potwierdz`, and any last keyboard/controller edge cases

## Shared UI follow-up

### Done
- [x] Shared shell in `@party/ui`
- [x] Shared setup framework with custom game sections
- [x] Shared runtime top bar
- [x] Shared avatar layer
- [x] Shared settings modal primitives

### Next
- [ ] Decide whether to extract more shared runtime/setup primitives now or pause extraction and return to deploy hardening

## This Month

- [x] Phase 0 - working monorepo base
- [x] Phase 1 - hub shell and game list
- [x] Phase 2 - `game-sdk` contract
- [x] Phase 3 - first playable Charades MVP
- [x] `charades` ownership for menu, setup, results, and runtime
- [x] Shared UI extraction for topbar, avatars, and settings modal primitives
- [ ] Phase 4 - deploy hub and Partykit

## This Quarter

- Working deployed Charades prototype
- Real-time multiplayer with room codes
- Architecture validated on at least one more game module
- Optional accounts via Clerk after multiplayer base is stable
