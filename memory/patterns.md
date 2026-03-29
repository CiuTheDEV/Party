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
