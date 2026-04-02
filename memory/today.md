# Today - 2026-03-26

<!--
  Daily working memory. Each session appends a section.
-->

### S1 (~daytime) [Project Party] Phases 0-2 foundation

- Initialized the Turborepo monorepo, built the hub shell, and defined the initial `@party/game-sdk` contract.
- Disabled Clerk until Phase 5 because placeholder keys crashed runtime. At that point `@party/charades` still emitted only declarations, so runtime config imports had to stay out of the package.
- Next: build the first Charades module.
- Experience recorded: yes

### S18 (11:51~) [Project Party] Charades warning modal and long-word UI hardening

- Reworked the low-pool warning modal into a clearer hero-plus-stats layout and cleaned the menu page file back to proper UTF-8 text.
- Hardened long-word handling by splitting normal short-word display from autoscale and by forwarding visibility state through the shared autoscale wrapper, instead of relying on autoscale for every word.
- Next: run a real browser smoke test for the host `verdict` panel with a very long developer prompt, because the verdict card still appears wrong in user screenshots even after the code-side fixes.
- Experience recorded: yes

### S19 (2026-04-01 ~) [Project Party] Charades settings modal polish + hints tab

- Rebuilt the settings modal slider UI into a custom discrete control so the thumb and labels finally share the same geometry, then polished the right column hierarchy and simplified the left tab list to show details only on the active item.
- Added a new `Podpowiedzi` settings tab with persisted setup state for `enabled`, `showCategory`, and `showWordCount`, plus surfaced the hints state in the compact settings panel.
- Next: wire the new hints settings into actual Charades runtime/presenter surfaces and do a real browser pass on the final settings modal proportions and interaction polish.
- Experience recorded: yes

### S2 (~daytime) [Project Party] Phase 3 - Charades MVP

- Implemented the first playable Charades module with content, PartyKit server, gameplay hooks, and all core routes.
- Added presenter pairing, host-side timer authority, and content loading from `content/charades`.
- Next: move toward Phase 4 deploy and multiplayer hardening.
- Experience recorded: yes

### S3 (~evening) [Project Party] Shared shell and early bug fixes

- Fixed hydration mismatch in QR pairing, fixed a game freeze in the `between` phase, and added PartyKit startup to local dev flow.
- Built `@party/ui` as the shared shell layer with topbar, sidebar, game shell, and game cards.
- Next: improve Charades-specific screens and continue toward deploy.
- Experience recorded: yes

### S4 (~2026-03-23) [Project Party] UI alignment work

- Matched the Charades menu to the reference design more closely and replaced hardcoded colors with proper tokens.
- Key lesson: open the actual reference source first instead of guessing from memory.
- Next: continue product work and deploy path.
- Experience recorded: yes

### S5 (~2026-03-23) [Project Party] Setup modal redesign

- Moved setup from a separate route into an in-page modal flow and introduced the now-approved setup pattern.
- Added dedicated components for players, categories, settings, and QR pairing.
- Next: continue toward Phase 4 and eventually generalize the setup pattern.
- Experience recorded: yes

### S7 (~16:48) [Project Party] VS Code workspace cleanup + agent rule sync

- Synchronized `AGENTS.md` and `CLAUDE.md` and reduced workspace noise from Markdown and local editor configuration.
- Split the warning problem into repo-level Markdown issues and separate Copilot/extension-level issues.
- Next: verify the local editor state after reload, but do not treat editor cleanup as product work.
- Experience recorded: yes

### S9 (~2026-03-27) [Project Party] Pre-MVP cleanup - Polish characters + refactors

- Removed dead duplicate `Podium` from `apps/hub/src/components/charades/Podium/` (zero imports)
- Extracted `CLEARED_WORD` constant in `game-state-transitions.ts` — eliminated 6 repetitions
- Fixed 80+ missing Polish diacritic characters across 13 UI files
- Fixed HTML entities in `CharadesMenuContent.tsx` — React was rendering them as literal text
- Fixed Unicode escapes in `PairingPanel.tsx` — replaced with direct characters
- Identified and recorded pre-MVP issues list in `memory/goals.md`
- Experience recorded: no (mechanical changes, no reusable patterns)

### S8 (~23:40) [Project Party] Module architecture cleanup + docs realignment

- Completed a major architecture cleanup: `charades` now owns menu, setup, and results, while host gameplay was reduced through smaller hooks and components.
- Confirmed the key product direction: shared shell and setup skeleton, custom setup sections per game, and fully game-specific gameplay.
- Updated project documentation to reflect the real architecture instead of the older interim state.
- Next: return to product work - Phase 4 deploy and PartyKit.
- Experience recorded: yes

### S10 (~late) [Project Party] Charades review notes for next session

- Recorded tomorrow's cleanup targets in `memory/goals.md`.
- Main review items: stale `send` dependencies in `useGameState`, dead presenter leftovers, and oversized files in results/playboard.
- Next: start from cleanup before new feature work.
- Experience recorded: no (review/handoff only)

### S11 (~late) [Project Party] Results polish + session wrap

- Finished the Charades results polish pass: cleaner podium flow, expandable full ranking, animated reveal, and smoother in-view scrolling.
- Promoted the next cleanup pass into `memory/active-tasks.json` so the next session can start from code quality work instead of rediscovery.
- Next: begin with Charades cleanup before new feature work.
- Experience recorded: no

### S12 (14:15~) [Project Party] Hub redesign, navigation polish, and rule sync

- Reworked the Hub toward the target reference: cinematic hero, refined rail behavior, hero carousel, section navigation without URL hash pollution, and scroll-synced active rail state.
- Refactored Hub structure so page composition, scroll behavior, section activity tracking, and content definitions are separated into focused files instead of living inside one growing page component.
- Updated project rules so the 300-line limit is treated as a cohesion review threshold rather than an automatic instruction to split files.
- Next: continue visual/content polish on the Hub instead of more navigation plumbing.
- Experience recorded: yes

### S13 (~2026-03-29) [Project Party] Repo architecture cleanup + docs sync

- Moved Charades runtime ownership out of `apps/hub` into `packages/games/charades/src/runtime`, leaving Hub routes as thin platform wrappers.
- Moved Hub homepage feature code into `apps/hub/src/features/hub` and moved `PremiumModal` into `@party/ui`, so `apps/hub/src` now reads as `app + data + features`.
- Added `@party/codenames` scaffold, registered it in the module registry, and introduced explicit `GameConfig.status` (`live` / `coming-soon`) in `@party/game-sdk`.
- Updated architecture docs so they describe the current split instead of the older interim state.
- Next: either add a teaser route for `codenames` or return to Phase 4 multiplayer/deploy work.
- Experience recorded: yes

### S14 (~2026-03-29) [Project Party] Session wrap + push

- Committed the architecture/docs batch and pushed it to `origin/main`.
- Added a separate cleanup commit removing tracked local artifacts from `.codex/skills` and `apps/hub/tsconfig.tsbuildinfo`.
- Left only local `.vscode/mcp.json` outside git, intentionally.
- Next: resume product work from the refreshed architecture, not from repo cleanup.
- Experience recorded: no

### S15 (~2026-03-30) [Project Party] Charades presenter word-change protocol

- Added per-player remaining word-change counters to Charades runtime state.
- Threaded `remainingWordChanges` through `TURN_START`, room state, and presenter view state.
- Added presenter `CHANGE_WORD` event type to the shared protocol.
- Next: implement the actual reroll flow using the new counters.
- Experience recorded: yes

### S16 (13:27~) [Project Party] Charades weighted reroll, browser word history, and setup polish

- Implemented presenter word change end-to-end with candidate-on-commit prompt flow, same-turn reroll exclusion, and softer future reuse for previously rejected prompts.
- Added host-browser word history for used and rejected prompts, plus history-aware `remaining/all` counters in setup categories and a first session lifecycle with refresh on fresh setup/disconnect and TTL expiry.
- Key lesson: persistent preference/history writes must happen only after host-side business validation passes, otherwise rejected actions silently poison future state.
- Next: run a manual browser smoke test for reroll limits, reveal reconnects, repeated games in one browser session, and category counter shrinkage.
- Experience recorded: yes

### S17 (13:23~) [Project Party] Charades pool management, start warning, and repo cleanup

- Added `Zarządzaj pulą` in Charades categories with reset-all and per-category reset actions, plus immediate refresh of real `pozostałe / wszystkie` pool state in the management modal.
- Simplified the main category accordion by removing remaining-count pills from `Łatwe / Trudne`, added confirmation before resets, and added a start-time warning when the active pool is smaller than `gracze × rundy`.
- Cleaned Git noise by pruning stale worktree metadata, ignoring local `.vscode/mcp.json`, and merging the active charades branch safely into `main`.
- Next: run a manual browser smoke test for pool management, start warning flow, and weighted reroll/session history behavior in real UI.
- Experience recorded: yes
### S20 (2026-04-02 ~) [Project Party] Shared UI extraction for Charades runtime and settings
- Wired Podpowiedzi into the actual host gameplay flow and added a 2-player podium variant.
- Extracted more shared UI into @party/ui: RuntimeTopBar, avatar renderer plus avatar catalog/helpers, settings modal scaffold primitives, and SegmentedChoice.
- Rebuilt the Charades settings modal on top of shared primitives, fixed broken Polish strings after the refactor, and removed dead local avatar files plus stale modal CSS.
- Next: run a real browser smoke test across host/setup/results after the shared extraction, then decide whether to continue shared UI extraction or return to Phase 4 deploy work.
- Experience recorded: yes

### S21 (2026-04-02 ~) [Project Party] Charades runtime hardening + end-to-end smoke test

- Added explicit connection-state handling for host and presenter, including a blocking host fallback when the room connection drops and a presenter reconnect/error overlay that preserves the last known runtime screen.
- Reworked the presenter reveal card word fitting so short words stay readable while longer phrases still scale down to fit without scroll or overflow.
- User completed a manual end-to-end smoke test across setup, hints, reroll, reconnect, verdict, and results with no reported regressions.
- Next: move Charades into Phase 4 work and return either to deploy/Partykit production hardening or the remaining runtime cleanup pass.
- Experience recorded: yes
