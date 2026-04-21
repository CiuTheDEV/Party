# Patterns & Reusable Solutions

> Cross-session reusable solutions discovered during development.

---

## How to Use This File

- Add entries when a solution took meaningful effort and is likely to recur
- Use this file for positive patterns, not pitfalls
- Put pitfalls into `memory/MEMORY.md`

---

## Entries

## Config modal as local state, not routing

**Scenario:** Game setup before starting gameplay.

**Solution:** Keep setup modal state in `page.tsx` with `useState`, not as a separate `/config` route.

**Why:** It preserves menu state, keeps the flow simpler, and avoids dead routing.

---

## `SelectedCategories` as a `Record`, not a `Set`

**Scenario:** Passing selected categories and difficulty levels through `sessionStorage`.

**Solution:** Use `Record<string, ('easy' | 'hard')[]>` instead of `Record<string, Set<...>>`.

**Why:** `Set` does not serialize to JSON correctly, while arrays inside a record do.

---

## Resetting shake animation with a key

**Scenario:** The shake animation should replay every time the user clicks `Start` while setup requirements are not met.

**Solution:** Keep a `shakeKey` counter in state and use `key={`err-${shakeKey}`}` on the animated element.

**Why:** Remounting the element restarts the CSS animation reliably.

---

## Shared setup skeleton + custom game sections

**Scenario:** Multiple games should share the same menu/setup look and flow, but expose different fields, sections, and validation rules.

**Solution:** Keep the shared shell and setup template outside the game module, while each game provides:
- one `setupState` object,
- its own `setupSections`,
- its own `validateSetup(state)`.

**Why:** This lets setup UI evolve once for all games without forcing every game into the same rigid form builder. Gameplay after `Start` still stays fully game-specific.

---

## Single-page hub navigation should own scroll and active-section state

**Scenario:** A landing-style hub uses section navigation (`hero`, `library`, `showcase`, `footer`) with a fixed header and highlighted rail state.

**Solution:** Keep section navigation app-controlled:
- use a shared section-link primitive for local section jumps,
- use a dedicated scroll helper that applies the correct top offset,
- use a small hook to derive the active section from scroll position.

**Why:** Raw `#hash` anchors are too brittle for polished app shells because they can fight fixed headers, leak hash state into the URL, and make active navigation styling harder to keep in sync.

---

## Module availability should be explicit in the SDK

**Scenario:** The hub needs to register future games before their gameplay and routes are ready.

**Solution:** Put an explicit `status` on `GameConfig` and let the hub treat modules as either `live` or `coming-soon`.

**Why:** This keeps rollout logic out of ad hoc UI checks and lets the repo expose a second game in the catalog without pretending it is already playable.

---

## Host menu controls must be separate from rebindable gameplay controls

**Scenario:** Host-side menu, settings, and setup navigation started inheriting odd behavior from gameplay rebinding, especially on controller bumpers.

**Solution:** Keep menu navigation on a fixed, pre-defined input map and reserve saved user bindings only for actual gameplay runtime actions.

**Why:** Shared semantic bindings seem convenient, but they let gameplay remaps leak into menu affordances and create hard-to-debug conflicts like `LB/RB` acting both as tab shortcuts and as rebound gameplay actions.

---

## Shared host navigation should be engine-plus-profile, not per-screen local state

**Scenario:** A game needs host-side keyboard/controller navigation across menu, settings, setup, and runtime overlays without rebuilding the same focus logic every time.

**Solution:** Keep a shared host navigation engine in `@party/ui` and define per-game navigation profiles in `packages/games/<game>/src/navigation/`.

**Why:** This keeps sleep/wake, modal ownership, focus visibility, and fixed menu input consistent across games, while each game still controls its own targets and commands declaratively instead of scattering focus rules through local `useEffect` state.

---

## Renaming persisted bindings needs an explicit migration map

**Scenario:** A gameplay input semantic is renamed, such as moving from `Akcja glowna` to `Potwierdz`, while old user bindings already exist in `localStorage`.

**Solution:** Keep a small legacy-to-current key map in the bindings loader and copy old saved values into the new keys before merging with defaults.

**Why:** Without an explicit migration step, the UI and runtime may look correct in a fresh session but existing users silently lose custom bindings or appear to revert to defaults after the rename.

---

## Repo docs should be layered into mandatory, on-demand, and active historical reference

**Scenario:** The repo keeps growing process docs, rules, specs, and plans, and not all of them should be loaded at session start.

**Solution:** Keep `AGENTS.md` plus `PROJECT_CONTEXT.md` and `memory/*` as the mandatory startup layer, treat `/docs` and `/rules` as on-demand by default, and treat `docs/superpowers/specs/*` and `docs/superpowers/plans/*` as active historical references that should be loaded when continuing or modifying an area with prior design history.

**Why:** This keeps startup context small without losing important implementation history. `docs/superpowers` are not dead archives in this repo; they are living references for follow-up work.

---

## Session wrap-up should include a documentation sync pass

**Scenario:** The repo relies on docs like `ui-map`, `runtime-map`, templates, and checklists as active working references, not passive archives.

**Solution:** Treat session wrap-up as `today.md + tasks + handoff + documentation sync`. After meaningful code or workflow changes, explicitly check whether shared inventory, runtime ownership, module template, extraction rules, code-organization rules, or routing docs became stale, and update them in the same session.

**Why:** In an agent-first repo, stale documentation is not a cosmetic issue. It directly degrades future decision quality. The docs should move with the code, not a week later.

---

## Memory working set should optimize for scan speed, not aggressive pruning

**Scenario:** `today.md`, `MEMORY.md`, and the rest of `memory/*` start growing, and there is pressure to compress them too early.

**Solution:** Keep `today.md` as the rolling log for the current week, add topic indexes or navigation aids to heavyweight files like `MEMORY.md`, and archive/compress at clear boundaries instead of pruning active working context in the middle of the week.

**Why:** Fast resume matters more than small file size. In an agent-first repo, the working memory layer should stay quick to scan without throwing away useful history.

---

## Tie-aware ranking should carry previous ordering keys explicitly

**Scenario:** A scoreboard needs competition-style places (`1, 1, 1, 4`) and later adds a secondary tiebreaker such as total guess time.

**Solution:** Sort first by the full ordered key set, then compute `rank` with explicit rolling state such as `previousScore`, `previousTieBreaker`, and `previousRank` instead of trying to recover rank from the previous array item inside the same `.map()`.

**Why:** Reading a partially-built `rank` from the previous list item is brittle and breaks on longer tie sequences. Carrying the previous ordering keys explicitly keeps ties and secondary tiebreakers consistent across runtime and results screens.
