# Goals & Focus

*Last updated: 2026-04-21*

---

## This Week

1. Re-test Charades presenter flow on a stable local/live stack after the reveal-word sizing fix
2. Keep pairing/device flows stable in both Tajniacy and Kalambury after the new URL-backed setup/modal hardening
3. Close the remaining Charades runtime cleanup after the new verdict/summary/results polish, then continue without widening scope beyond real pain points
4. Keep the new agent-first docs/playbooks synced with code while they are still fresh

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
  Scope: final visible validation after the latest runtime/summary/results polish, plus any last keyboard/controller edge cases
- [ ] Keep Codenames runtime reconnect and captain-device edge cases polished after the pairing hardening
  Scope: follow-up only on narrower runtime issues such as disconnect/session-code-change behavior during an already active match

## Shared UI and Repo Workflow

### Done
- [x] Shared shell in `@party/ui`
- [x] Shared setup framework with custom game sections
- [x] Shared runtime top bar
- [x] Shared avatar layer
- [x] Shared settings modal primitives
- [x] Agent-first repo playbooks for shared UI, runtime ownership, module template, maturity, extraction, and code organization

### Next
- [ ] Use the new playbooks to police future shared extraction and new-game work instead of letting the repo drift back into copy-paste and implicit rules
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

- Working deployed Charades prototype with honest browser/runtime validation
- Real-time multiplayer with room codes
- Architecture validated on at least one more game module
- Agent-first repo workflow that stays aligned with code instead of lagging behind it
- Optional accounts via Clerk after multiplayer base is stable
