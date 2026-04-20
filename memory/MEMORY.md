# Technical Pitfalls & Lessons Learned

> Written by agents during sessions.
> This is the SSOT for technical gotchas - never store these in `today.md`.

---

## How to Use This File

- Add entries when you hit a non-obvious technical issue
- Format: date, symptom, root cause, fix, prevention
- Never delete entries - they represent real pain already paid for

---

## Entries

### 2026-04-20 - `localhost` i `127.0.0.1` nie są równoważne dla lokalnego HMR huba

**Symptom:** Ten sam lokalny hub pod `http://127.0.0.1:3000` zachowywał się jak częściowo martwy build: klik `Zagraj teraz` nie otwierał modala, a w konsoli pojawiał się błąd HMR `ERR_INVALID_HTTP_RESPONSE`. Pod `http://localhost:3000` ten sam ekran hydratuje się poprawnie i modal otwiera się normalnie.

**Root cause:** W tym środowisku lokalny webpackowy dev server Next.js zestawia poprawny HMR przez `localhost`, ale nie przez `127.0.0.1`. To daje fałszywy sygnał regresji UI, mimo że problem siedzi w warstwie lokalnego serwera / websocketu HMR.

**Fix:** Do browserowej weryfikacji huba na lokalnym dev serverze używaj najpierw `http://localhost:3000`, a nie `http://127.0.0.1:3000`. Jeśli `127.0.0.1` pokazuje martwy UI albo nie otwiera modalów, sprawdź konsolę pod kątem błędów HMR zanim uznasz to za bug aplikacji.

**How to prevent it:** W lokalnych Playwright passach dla `apps/hub` traktuj `localhost` jako domyślny host dla dev servera. `127.0.0.1` jest OK dla statycznych serwerów, ale nie musi być wiarygodny dla dev runtime z HMR.

### 2026-04-20 - `dev-hub-dev.mjs` może być zablokowany przez obcy błąd typów poza aktualnym taskiem

**Symptom:** Próba uruchomienia zalecanego lokalnego stacku huba (`npm run dev --workspace @party/hub`) nie podnosiła serwera pod `:3000`, mimo że wcześniejsze buildy pakietów gry przechodziły.

**Root cause:** `scripts/dev-hub-dev.mjs` robi pełny `next build` przed startem statycznego serwera i auth API. W tej sesji zatrzymywał się na niezależnym błędzie typów w `apps/hub/src/app/auth/page.tsx`, więc blokował lokalny pass runtime dla gier, mimo że sam task dotyczył modalów i host controls.

**Fix:** Gdy `dev-hub-dev.mjs` nie wstaje, sprawdź jego stdout/stderr zamiast zakładać problem z bieżącym featurem. Jeśli blocker siedzi w obcym obszarze, nie mieszaj go do aktualnego tasku bez wyraźnej decyzji właściciela; użyj alternatywnego lokalnego serwera tylko do zawężonej weryfikacji.

**How to prevent it:** Traktuj `dev-hub-dev.mjs` jako cały lokalny stack, nie tylko „serwer dla bieżącej gry”. Każdy obcy błąd builda może zablokować weryfikację gry, więc czytaj logi startowe zanim zaczniesz poprawiać feature, który akurat testujesz.

### 2026-04-20 - Hostowy Windows PowerShell 5.1 może fałszywie wyglądać jak zepsuty UTF-8, mimo że pliki są poprawne

**Symptom:** Odczyt tych samych plików z polską treścią wyglądał różnie zależnie od narzędzia: `Get-Content` w hostowym Windows PowerShell 5.1 pokazywał klasyczne ciągi mojibake, podczas gdy Node i `pwsh` 7.6 czytały ten sam plik poprawnie.

**Root cause:** Problem nie był w bajtach pliku, tylko w warstwie shell/renderingu hostowego PowerShell 5.1 w tym środowisku Codex na Windows. To dawało fałszywy sygnał mojibake i mogło prowokować niepotrzebne „naprawy” encodingu.

**Fix:** Do pracy shellowej na Windows w tym repo preferuj `pwsh` 7.6+ zamiast hostowego `powershell` 5.1. Gdy pojawia się podejrzenie UTF-8, weryfikuj plik surowym odczytem UTF-8 w `pwsh` lub Node przed jakąkolwiek edycją.

**How to prevent it:** Traktuj hostowy PowerShell 5.1 jako potencjalnie niewiarygodny dla polskich znaków. Najpierw potwierdź problem drugim odczytem (`pwsh`, Node, albo decoder UTF-8 z `fatal`) i dopiero potem oceniaj, czy plik jest naprawdę uszkodzony.

### 2026-04-19 - Parallel Playwright install can fetch the wrong browser build

**Symptom:** `npm run test:e2e` and headed Playwright runs failed right after a "clean reinstall", even though `npx playwright install chromium` had just completed successfully.

**Root cause:** `npm install -D @playwright/test` and `npx playwright install chromium` were started in parallel. The browser download used an older Playwright CLI/build while the final `node_modules` ended up on `@playwright/test` / `playwright` 1.59.1, which expected Chromium revision `1217`, not the earlier downloaded revision `1208`.

**Fix:** Install the npm dependency first, then run `npx playwright install chromium` sequentially from the repo root so the downloaded browser revision matches the installed Playwright package.

**How to prevent it:** Do not parallelize Playwright package install and browser install in the same workspace. Treat them as an ordered pair: package first, browsers second.

### 2026-04-19 - Button-based board cards can silently drop the runtime font

**Symptom:** The Codenames card back and/or front stopped matching the runtime typography even though the surrounding host/captain screen still used `Space Grotesk`.

**Root cause:** The host board uses `button` elements for cards, and the board styles did not explicitly inherit typography. At the same time, the shared card-back CSS overrode part of the typography with `font-family: monospace` for corner labels. That combination made the card surfaces drift away from the intended runtime font stack.

**Fix:** Set `font: inherit` on the host board button, set `font-family: inherit` on both host and captain card faces, and avoid hardcoding `monospace` inside the shared card-back component.

**How to prevent it:** Any shared runtime surface rendered inside native form controls should explicitly inherit typography. For game cards, treat font inheritance as part of the component contract, not an accident of the parent screen.

### 2026-04-19 - Per-category pool reset requires per-category history, not combined selection keys

**Symptom:** The Codenames pool manager could show selected categories in the modal, but a "reset this category" action could not be made truthful while history was stored only under one combined key like `adult|standard`.

**Root cause:** Combined-pool history works for blocking board generation across the current selection, but it destroys ownership of used words at the category level. Once history is stored only for the whole combination, resetting one category has no precise state to clear.

**Fix:** Store Codenames word history per category ID, then derive active-pool totals by aggregating fresh words across the currently selected categories. Runtime board generation and setup validation must use that same per-category aggregation logic.

**How to prevent it:** If the UX needs row-level management or reset for individual categories, model persistence at the same granularity from the start. Do not choose a coarser storage key than the smallest user-visible management unit.

### 2026-04-18 - Cloudflare Pages push does not deploy PartyKit server changes

**Symptom:** The Codenames captain screen stayed on "Sprawdzam dostepnosc druzyn..." in production even though the frontend deploy succeeded and local multiplayer worked.

**Root cause:** The hub was redeployed on Cloudflare Pages, but the realtime server under `packages/partykit/codenames/server.ts` was not deployed separately. The frontend kept trying to open `wss://project-party.ciuthedev.partykit.dev/parties/codenames/...`, but the production PartyKit worker was still stale or unavailable for that named party.

**Fix:** Verify the PartyKit endpoint directly, then deploy the realtime server explicitly with `npx partykit deploy` from the repo root. After deploy, confirm the `codenames` WebSocket opens and sends the initial `ROOM_STATE`.

**How to prevent it:** Treat Cloudflare Pages deploys and PartyKit deploys as two separate release steps. Any change under `packages/partykit/**` requires its own PartyKit deployment even if the frontend is already live.

### 2026-04-12 - Cloudflare Pages Git deploys need root-level build config and root-level Functions shims

**Symptom:** A Pages deployment built from the repo root could not find the Hub export output, and root Functions bundling failed to resolve imports that pointed into `apps/hub`.

**Root cause:** Cloudflare Pages was using the repository root as the build root, while the app-specific `wrangler.toml` and Functions lived under `apps/hub`. Git deploys only see the repo-root Pages config and root-level `functions/` directory.

**Fix:** Added a root `wrangler.toml` with `pages_build_output_dir = "apps/hub/out"` and moved the Pages Functions entrypoints to repo-root `functions/api/auth/*`, pointing them back to the shared auth code.

**How to prevent it:** For Pages Git deployments in a monorepo, keep the deployment-visible config at the repo root or make sure the project root in Cloudflare matches the app directory exactly. Do not rely on a nested app `wrangler.toml` alone.

### 2026-04-12 - PBKDF2 iteration cost must fit Pages Functions CPU budget

**Symptom:** Email/password registration and login returned Cloudflare 1101 errors on Pages, while validation-only auth paths still worked.

**Root cause:** The initial PBKDF2 cost of 150k iterations was too heavy for the Pages runtime used by the hub.

**Fix:** Lowered the PBKDF2 cost to 20k iterations and verified register/login on the live Pages deployment.

**How to prevent it:** When auth runs on edge functions, benchmark the password hash cost against the actual runtime instead of copying a desktop-server default.

### 2026-03-22 - `emitDeclarationOnly` breaks runtime imports in Next.js

**Symptom:** `Module not found: Can't resolve '@party/charades'` after importing runtime config from the workspace package into the hub.

**Root cause:** `@party/charades` was configured with `emitDeclarationOnly: true`, so TypeScript emitted only `.d.ts` files and no runtime `.js`. Next.js expected `dist/index.js` for a value import, but the file did not exist.

**Fix:** Temporarily moved the Charades config inline into `apps/hub/src/data/games.ts` until the package had a real JS build.

**How to prevent it:** Type-only packages can only be imported with `import type`. Any runtime value import must come from a package that actually builds JS output.

---

### 2026-03-22 - Clerk crashes the dev server with a placeholder key

**Symptom:** `@clerk/clerk-react: The publishableKey passed to Clerk is invalid` and a blank runtime error screen.

**Root cause:** Clerk validates `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` at render time, even if the key is just a placeholder.

**Fix:** Removed `<ClerkProvider>` and Clerk UI from the app until real keys are available.

**How to prevent it:** Do not wire Clerk into runtime until you have a real test key.

---

### 2026-03-22 - Hydration mismatch from `typeof window !== 'undefined'` in Next.js

**Symptom:** `Hydration failed because the server rendered HTML didn't match the client`.

**Root cause:** Client components still render on the server for SSR HTML. `typeof window !== 'undefined'` returned `false` on the server, so SSR and hydration rendered different markup.

**Fix:** Use `useState` + `useEffect` for client-only values instead of rendering directly behind a `typeof window` check.

**How to prevent it:** Never use `typeof window !== 'undefined'` to guard rendered values. Use a post-mount state update instead.

---

### 2026-03-22 - CSS imports from workspace packages work in Next.js without extra config

**Symptom:** Uncertainty about whether `import '@party/ui/tokens.css'` would work from a workspace package.

**Root cause:** Next.js/Turbopack resolves workspace packages through path aliases and treats their CSS like local CSS.

**Fix:** Add the package source path alias in the consuming app and import normally.

**How to prevent it:** For workspace packages with CSS, set a proper path alias in the app TS config and let Next handle the rest.

---

### 2026-03-23 - Open the design reference before touching UI tokens

**Symptom:** Multiple rounds of UI tweaks missed the target design.

**Root cause:** The implementation guessed token values from memory instead of comparing directly against the source reference.

**Fix:** Open the reference first and compare token-by-token before editing.

**How to prevent it:** For any “match the mockup” task, start by reading the reference source, not by guessing from screenshots or memory.

---

### 2026-03-22 - Next.js 16 rewrites `tsconfig.json` on first run

**Symptom:** Running `npm run dev` changed `tsconfig.json` automatically.

**Root cause:** Next.js 16 enforces its own TypeScript defaults during startup.

**Fix:** Accept and commit the framework-generated `tsconfig.json` changes.

**How to prevent it:** Run the dev server before treating the initial `tsconfig.json` as final.

---

### 2026-03-26 - VS Code warnings can come from multiple independent sources at once

**Symptom:** Markdown files looked globally broken because the editor showed many warnings in parallel.

**Root cause:** The noise came from separate systems: `markdownlint` and GitHub Copilot Chat diagnostics.

**Fix:** Split the problem by source and fix each tool independently.

**How to prevent it:** When VS Code “lights up”, identify which extension or language service is actually reporting each warning before looking for one shared root cause.

---

### 2026-03-26 - Duplicating game ownership between the hub and the module creates drift

**Symptom:** The repo looked like a game was modular, but parts of config, menu, setup, or results still lived in the hub.

**Root cause:** The architecture claimed `hub = shell, game = module`, but implementation kept duplicate knowledge in both places.

**Fix:** If a game is meant to be a real module, the module should own at least config, menu, setup, and results. The hub should stick to routing, registry, and platform glue.

**How to prevent it:** For every new screen, ask whether it belongs to the platform or to a specific game. If it belongs to the game, do not keep a second copy in the hub.

---

### 2026-03-30 - Persistent game history must be written only after host-side validation

**Symptom:** Weighted reroll logic started poisoning future selections even when a reroll request should have been rejected.

**Root cause:** Rejected-prompt history was being written from the selection helper before the host finished validating the action, so failed or disallowed rerolls still mutated persistent browser state.

**Fix:** Move persistent history writes behind the host-authoritative success path. Compute candidate prompts first, but record rejected or used prompts only after business validation succeeds and the host commits the state transition.

**How to prevent it:** For any feature that writes durable game state, preferences, or history, do not persist from low-level helpers before the authoritative layer accepts the action. Selection can be speculative; persistence cannot.

---

### 2026-03-31 - Stale worktree metadata can look like huge local diffs in the IDE

**Symptom:** The IDE kept showing very large `+/-` diff counts even though `git status` on the main repo was nearly clean.

**Root cause:** Old Git worktree entries were still registered as `prunable`, so the editor UI was surfacing branch/worktree comparison noise instead of actual working-tree changes.

**Fix:** Run `git worktree prune`, then verify `git worktree list` only shows the active workspace. Also check `.gitignore` for accidentally unignored local editor files like `.vscode/mcp.json`.

**How to prevent it:** When the IDE shows huge diff counts that don't match `git status`, check worktree metadata before assuming the repo is dirty.

---

### 2026-04-11 - Cloudflare Pages Workers (new UI) does not expose env vars to build

**Symptom:** `NEXT_PUBLIC_PARTYKIT_HOST` set in CF Pages dashboard had no effect — `process.env.NEXT_PUBLIC_PARTYKIT_HOST` was undefined at build time.

**Root cause:** The new "Workers & Pages" UI in Cloudflare does not have a "Expose during build" toggle. Variables set there are runtime variables for Workers, not build-time variables for static Next.js exports. `NEXT_PUBLIC_*` vars must be baked in during `next build`.

**Fix:** Hardcode the production PartyKit host as a fallback constant in `charades-runtime.ts` for non-localhost environments.

**How to prevent it:** For CF Pages static exports, do not rely on dashboard env vars for `NEXT_PUBLIC_*` values. Either hardcode production values in code or use a `.env.production` file committed to the repo (without secrets).

---

### 2026-04-11 - CF Pages project created via Workers UI gets unpredictable subdomain

**Symptom:** Created project named `party` but got URL `party-9pe.pages.dev` instead of `party.pages.dev`.

**Root cause:** Name `party` was taken at the CF Pages DNS level. CF assigns a unique suffix automatically.

**Fix:** Accept the assigned URL. Check actual URL with `npx wrangler pages project list`.

**How to prevent it:** Check URL immediately after project creation before configuring env vars or sharing links.

---

### 2026-04-11 - DeviceListener WebSocket reconnect loop caused by unstable callback refs

**Symptom:** Pairing panel in Charades setup modal flickered continuously. Host could not detect presenter connection.

**Root cause:** `useEffect` in `DeviceListener` listed `onConnect`/`onDisconnect` as dependencies. These callbacks were inline arrow functions recreated on every render, causing effect to re-run → new WebSocket → `ROOM_STATE` received → `onConnect` called → state update → re-render → new callbacks → loop.

**Fix:** Store callbacks in refs and remove them from `useEffect` dependencies. Effect only restarts on `roomId` change.

**How to prevent it:** Any `useEffect` that creates a WebSocket or long-lived subscription must not list callbacks as dependencies. Use refs to hold the latest callback values.

---

### 2026-04-11 - DeviceListener localStorage check does not work cross-device

**Symptom:** `isPresenterSessionFresh()` always returned false on host — presenter connection never detected via polling.

**Root cause:** `localStorage` is per-browser. The presenter writes their session to their own phone's localStorage. The host's browser cannot read it.

**Fix:** Use WebSocket messages exclusively (`ROOM_STATE` on connect, `DEVICE_CONNECTED` on new join, `PRESENTER_DISCONNECTED` on leave) instead of polling localStorage.

**How to prevent it:** Never use localStorage for cross-device state. It is local to one browser.

---

### 2026-04-11 - Turbo build required for CF Pages to resolve workspace package types

**Symptom:** `@party/ui` TypeScript build failed on CF with "Cannot find module '@party/game-sdk'". Locally `tsc --noEmit` passed clean.

**Root cause:** Locally `@party/ui` resolved `@party/game-sdk` through root `node_modules` symlinks. On CF, packages are built in isolation without cross-package path resolution. `@party/ui/tsconfig.json` had no `paths` entry for `@party/game-sdk`.

**Fix:** Added `paths: { "@party/game-sdk": ["../game-sdk/src"] }` to `packages/ui/tsconfig.json`. Also changed CF Pages build command from `npm run build --workspace @party/hub` to `npm run build` (turbo) so packages are built in dependency order.

**How to prevent it:** Each package's `tsconfig.json` must be self-contained with explicit `paths` for all workspace dependencies it imports. Never rely on root-level module resolution in isolated CI environments.

---

### 2026-04-01 - Autoscale is a fallback, not the default display mode

**Symptom:** Short words became visually tiny after adding a shared autoscale component meant to protect only very long phrases.

**Root cause:** The UI treated every displayed word as an autoscale candidate, so the defensive layout logic degraded the normal case instead of activating only when a word actually threatened the card layout.

**Fix:** Split rendering into two modes: a large static display for normal short words and autoscale only for genuinely long words.

**How to prevent it:** For adaptive typography, design the common case first and treat autoscaling as an exception path. Never let a safety mechanism lower the baseline quality of ordinary content.

---

### 2026-04-12 - DevTools mobile emulation can hide real-phone presenter viewport bugs

**Symptom:** The Charades presenter looked correct in Chrome DevTools mobile mode, but on a real phone the route still allowed residual scroll and stale post-rotation offsets that only corrected after manual interaction.

**Root cause:** Presenter layout quality depended on browser viewport behavior that DevTools emulation smooths over: dynamic mobile browser chrome, `visualViewport` updates, orientation transitions, and leftover document scroll offset. A CSS-only `vh/svh/dvh` setup was not enough.

**Fix:** Move the presenter route toward a viewport-locked shell, sync height from `window.visualViewport` / `window.innerHeight`, and validate on an actual phone before treating the layout as done.

**How to prevent it:** For mobile fullscreen surfaces, treat DevTools emulation as a first-pass filter only. Final validation must happen on a real device before closing viewport or orientation bugs.
