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

### S22 (2026-04-02 ~) [Project Party] Session wrap + hub topbar consistency

- Fixed the missing login-button outline in the Hub topbar by patching the actual Hub layout styles instead of the already-correct shared runtime topbar.
- Added an encoding pre-commit guardrail earlier in the session, then confirmed the repo still builds cleanly after the final UI touch-up.
- Next: start Phase 4 work from deploy/Partykit production hardening, with Charades treated as smoke-tested and MVP-hardened.
- Experience recorded: yes

### S23 (2026-04-02 ~) [Project Party] Phase 4 readiness hardening

- Promoted the Hub chrome into shared `@party/ui`, so the Hub homepage and Charades main menu now use the same topbar and rail/tab navigation shell, then polished the shared `Zaloguj` button to better fit the visual weight of the page.
- Added PartyKit authority protection in `packages/partykit/charades/server.ts`: the first host sender now owns host-authoritative events, presenter-only events are locked to the active presenter connection, and host authority is released on disconnect. Added a dedicated authority regression harness and verified it passes.
- Added a production-safe PartyKit host resolver for Charades: localhost still falls back to `:1999`, but production-like hostnames now throw unless `NEXT_PUBLIC_PARTYKIT_HOST` is explicitly configured. Added a dedicated resolver test and verified it passes.
- Cleaned visible UTF-8/mojibake regressions in Hub and Charades presenter/pairing flows, removed the unused Clerk dependency from `@party/hub`, refreshed the lockfile, and reduced npm audit findings from 5 to 4 by eliminating the Clerk SSRF advisory entirely.
- Remaining risk before deploy: upstream PartyKit currently still carries `undici`/`miniflare`/`esbuild` advisories with no simple newer npm release available than `0.0.115`.
- Verification run this session: `npm run test:authority --workspace @party/partykit`, `npm run test:runtime-host --workspace @party/charades`, `npm run verify:encoding`, and `npm run build`.
- Next: start Phase 4 deployment wiring for Cloudflare Pages + PartyKit with explicit environment setup and deployment path decisions.
- Experience recorded: yes

### S24 (2026-04-03 ~) [Project Party] Charades settings overlay, real rebinding, and controller selection

- Turned the Charades main-menu `Ustawienia` overlay into a real controls surface: equal binding boxes, click-to-listen only on the binding chip, hover `x` to clear, local persistence in `localStorage`, keyboard rebinding, controller rebinding via Gamepad API, and automatic swap on conflicts.
- Debugged controller detection end-to-end: changed gamepad capture from static baseline logic to edge-based polling, discovered the browser was exposing HyperX headphones as the first HID/gamepad entry, then added preferred-controller ranking plus manual device selection for pad mode.
- Iterated the right column several times toward a more compact inspector: moved debug into a draggable `DEV` popup, moved controller tools into the detail panel, stabilized the device slot to reduce layout jumps, and replaced placeholder action names with a smaller contextual control model (`left/right/up/down`, confirm/back, settings, primary/secondary action, rail toggle).
- Fresh verification during this session repeatedly passed on `npm run build --workspace @party/hub`.
- Next: visually inspect the latest compact right-column layout in a real browser and do one final polish pass if the keyboard/pad switch still shows any residual UI shift.
- Experience recorded: yes

### S25 (2026-04-06 ~) [Project Party] Shared settings UI extraction and docs refresh

- Moved the Charades main-menu settings chrome toward reusable `@party/ui` primitives: added shared alert dialogs plus shared settings shell/footer/tabs/status/placeholder/header/hero components while keeping game-specific bindings logic local to `@party/charades`.
- Reworked unsaved-changes and reset-to-default flows around the new shared alert primitive, then cleaned dead local CSS left after the extraction.
- Documented the new `@party/ui` scope in `packages/ui/README.md` and updated project context so the architecture notes now mention shared settings-screen primitives explicitly.
- Verification passing after the extraction: `npm run build --workspace @party/ui` and `npm run build --workspace @party/hub`.
- Next: decide whether to keep the controls bindings table local to Charades or generalize it only after a second game proves the same pattern.
- Experience recorded: yes

### S26 (2026-04-06 ~) [Project Party] Gemini asset prompts, hub video cards, and Charades alert cleanup

- Added Gemini resource files in `prompts/` for separate image and short-video generators, based on the existing Project Party visual prompt system instead of a generic Gem instruction.
- Swapped hub library cards to support looped video assets with image fallback posters, and wired the current Charades and Codenames cards to `.mp4` loops from `apps/hub/public/videos/game-cards/`.
- Replaced remaining native `window.confirm` flows in Charades setup pool management with shared `AlertDialog`, replaced browser-back confirmation during active Charades play with a custom in-app alert, and then did a cleanup pass removing dead settings helpers.
- Key lesson: older mojibake/encoding history in some files makes targeted patching unreliable; when that happens, a controlled full-file rewrite is safer than forcing brittle partial edits.
- Verification passing this session: `npm run test:library-card-media --workspace @party/hub`, `npm run build --workspace @party/hub`, `npm run build --workspace @party/charades`, and `npm run test:controls-bindings --workspace @party/charades`.
- Next: either continue Phase 4 deployment work, or do a browser-only polish/smoke pass over the new alert flows and looped hub cards.
- Experience recorded: yes

### S27 (22:19~) [Project Party] Charades host navigation and settings input split

- Added host-side keyboard/controller navigation through Charades menu, setup modal, rail, and settings overlay, then iterated heavily on focus handoff between content and sidebar.
- Split host menu input from gameplay rebinding by introducing fixed predefined menu controls, while leaving saved bindings only for runtime gameplay actions. Also wired top settings tabs to fixed `Q/E` and `LB/RB` shortcuts and continued polishing wake/sleep behavior after mouse input.
- Next: continue the manual polish pass for Charades settings navigation, especially entry focus for `Sterowanie`, rail handoff edge cases, and any remaining controller-only hover bugs that still show up in real usage.
- Experience recorded: yes

### S28 (2026-04-08 ~) [Project Party] Shared host navigation framework + Charades reference rollout

- Built the shared host navigation framework across `@party/game-sdk` and `@party/ui`, then migrated Charades onto it as the first reference consumer instead of keeping menu/setup/settings/runtime navigation as separate ad hoc systems.
- Completed the main rollout slices for Charades menu, settings, setup, and runtime overlays, including fixed host-side input mapping, sleep/wake handling, rail handoff, runtime pause focus, pause exit confirm, and a controlled verdict picker with one active focus path at a time.
- Documented the adoption path for future games in `packages/game-sdk/README.md` and recorded the reusable framework pattern in `memory/patterns.md`.
- Next: do a manual runtime polish pass on Charades host controls, especially the pause/settings feel during live play, before declaring the framework product-ready for broader game adoption.
- Experience recorded: yes

### S29 (2026-04-08 21:02) [Project Party] `/games` catalog polish to match hub

- Rebuilt the full `/games` catalog page so it now matches the hub's cinematic direction instead of looking like a plain utility index: stronger hero, summary stats, layered glass panels, and grouped sections for live vs coming-soon games.
- Refined the game cards with clearer metadata, stronger hover/focus treatment, better copy hierarchy, and a more intentional empty state. Also wrote `.impeccable.md` to persist the project's design context for future UI work.
- Verification passing in this session: `npm run build --workspace @party/hub`.
- Next: run a real browser visual pass on `/games` across desktop and mobile, then continue either deployment work or the remaining Charades runtime polish.
- Experience recorded: yes

### S31 (2026-04-08 ~) [Project Party] Charades navigation code review + dead code cleanup

- Reviewed the full host navigation system (shared framework + Charades profiles) for consistency, logic, and dead code.
- Removed `predefined-menu-controls.ts` (entire file was dead — no callers since `useMenuControls` migrated to `resolveFixedHostNavigationAction`).
- Removed dead `getNextMenuModeFocus` function and its public export from `@party/charades` index.
- Simplified `CharadesMenuContent`: removed always-`'play'` `focusedModeAction` state, simplified `onAction` handler, simplified button onClick.
- Extracted shared `isTypingTarget` into `charades-controls-bindings.ts` — removes the duplicate that existed in `useMenuControls` and `useHostControls`.
- Fixed indentation bug in `resolveSettingsCommand` inside `host-controls.ts`.
- Added comment explaining intentional separation of `HostControlAction` vs `HostNavigationAction`.
- Build passing: `@party/charades` + `@party/hub`. Controls bindings tests passing.
- Next: run a manual UX polish pass on Charades runtime pause/verdict flow before closing T002.
- Experience recorded: no (mechanical cleanup, no new reusable patterns)

### S30 (23:15~) [Project Party] Charades runtime controls simplification + binding cleanup

- Simplified Charades runtime controls so gameplay-facing accept actions now consistently use `Potwierdz` instead of the older `Akcja glowna`, and removed `Akcja glowna` from the settings bindings list entirely.
- Added binding migration logic so old persisted `keyboard-primary` / `controller-primary` values are loaded into the new `confirm` slots instead of silently resetting custom controls after the rename.
- Next: run a focused manual pass on Charades runtime pause/verdict flow and any remaining controller/keyboard rough edges now that `confirm` is the only acceptance semantic in gameplay.
- Experience recorded: yes

### S32 (2026-04-10 ~) [Project Party] Repo cleanup and local artifact filtering

- Reduced repo noise by restoring `apps/hub/next-env.d.ts` to the stable tracked import path after a local Next.js dev-only rewrite changed it to `./.next/dev/types/routes.d.ts`.
- Added targeted `.gitignore` entries for local-only `.codex/skills/gsap-*` directories instead of ignoring the whole `.codex/skills/` tree, because part of that tree is intentionally versioned in this repo.
- Verification: `git status --short` now shows only the intentional `.gitignore` change from this cleanup.
- Next: resume product work from T002/T001 without local skill installs polluting the worktree.
- Experience recorded: no (repo hygiene only)

### S33 (2026-04-10 ~) [Project Party] Charades Batch 1 runtime/presenter motion

- Implemented a local shared motion layer for Charades runtime (`charades-motion.ts`) with game-show timing tokens, timer-pressure tiers, and a reduced-motion guard.
- Animated Batch 1 runtime phase entries in `PlayBoardPhases`: `prepare`, `buffer`, `timer-running`, and `verdict`, including staged intros plus per-second countdown/timer pulse behavior.
- Animated presenter flow for Batch 1: light stage phase transition in `PresenterScreen`, a stronger intro in `PresenterPhaseYourTurn`, and timer-driven motion pressure in `PresenterPhaseTimer`.
- Added host-side verdict picker animation polish: overlay/card entry, staggered player option reveal, and quick focus snap feedback on selected/focused controls.
- Verification passing in this session: `npm run build` in `packages/games/charades`, `charades-motion.check.cjs`, and `npm run build` in `apps/hub`.
- Next: run a real browser feel pass and trim any over-animated moments before extending motion beyond Batch 1.
- Experience recorded: yes

### S34 (2026-04-10 ~) [Project Party] Charades motion polish, presenter pass, and reverted setup-modal batch

- Continued Batch 1 polish after user feedback that early motion was effectively invisible: strengthened timer pressure, improved verdict word reveal, aligned `buffer -> timer -> verdict` rhythm, and upgraded presenter-side stage/your-turn/timer motion.
- Added a stronger host verdict picker handoff between player selection and action confirmation, then verified all Charades and hub builds after each motion slice.
- Attempted a broader animation batch for setup modals, but it regressed modal UI/layout; reverted the whole setup-modal batch back to the last stable state instead of patching over a broken shell.
- Next: do a browser-only validation pass on the current Charades motion set, and if setup-modal motion returns later, re-enter with a much smaller scope limited to one local surface at a time.
- Experience recorded: yes

### S35 (2026-04-11 ~) [Project Party] Runtime motion merge + UTF-8 workflow hardening

- Finalized the current Charades runtime/presenter motion work on `main`, including the existing Batch 1 runtime polish, helper checks, and current repo state from the motion/navigation branch, then pushed and cleaned up the merged worktree branch so the workspace now stays on `main`.
- Tried to re-enter setup/category animation work one element at a time, but the category expand/collapse change did not land in a user-acceptable state and was intentionally not kept as session output.
- Added an explicit agent rule in `AGENTS.md` to treat files with Polish UI copy as UTF-8-sensitive: stop partial edits on mojibake, prefer minimal non-text patches or deliberate full-file rewrites, and verify text after editing.
- Next: resume from `main`, keep setup animation paused for now, and continue only with narrow, user-validated UI changes or a browser-first manual pass on the stable Charades runtime motion.
- Experience recorded: yes
