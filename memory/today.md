# Today - 2026-03-26

<!--
  Daily working memory. Each session appends a section.
-->

### S1 (~daytime) [Project Party] Phases 0-2 foundation

- Initialized the Turborepo monorepo, built the hub shell, and defined the initial `@party/game-sdk` contract.
- Disabled Clerk until Phase 5 because placeholder keys crashed runtime. At that point `@party/charades` still emitted only declarations, so runtime config imports had to stay out of the package.
- Next: build the first Charades module.
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
