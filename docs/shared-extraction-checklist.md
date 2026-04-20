# Shared Extraction Checklist

Use this before moving any component, modal, overlay, or UI flow into `@party/ui`.

Goal:
- keep `@party/ui` useful,
- prevent it from becoming a dumping ground,
- stop game logic from leaking into shared UI.

---

## Default Bias

The default answer is `keep it local`.

Extraction is something to earn, not something to do preemptively.
Only extract when the shared shape is real and the boundary is clear.

---

## Extraction Gate

Move something into `@party/ui` only if the answer is **yes** to all of these:

1. Is it already used by at least two games, or clearly planned for that?
2. Is the structure shared, not just the palette or surface styling?
3. Can game-specific behavior be injected through props/data/callbacks?
4. Does moving it reduce drift more than it increases abstraction?
5. Can the shared component stay understandable without knowing one specific game's rules?

If any answer is **no**, keep it local for now.

---

## Red Flags

Do **not** extract when:

- the component encodes one game's business rules,
- the shared API would need many conditional props,
- action IDs or navigation target IDs would leak into `@party/ui`,
- only the visuals match but the interaction contract differs,
- the second use case is still hypothetical and not concrete.

---

## Safe Shared Candidates

Usually good candidates:

- modal shells,
- generic confirm/alert patterns,
- settings shells and cards,
- action-hint presentation,
- pairing shells,
- settings overlays with injected data,
- host-navigation engine-level infra,
- presentation-only runtime chrome.

---

## Keep Local Candidates

Usually bad candidates for `@party/ui`:

- round or match logic screens,
- verdict or assassin-specific flows,
- presenter/captain game logic,
- game-specific board logic,
- command handlers,
- profile-specific navigation targets and action maps.

---

## Extraction Review Questions

Before extracting, answer these in the PR/session:

- What exactly is duplicated today?
- Which part is structure, and which part is game logic?
- What will remain inside each game after extraction?
- How will the shared API stay small and readable?
- What future drift does this extraction prevent?

If those answers are fuzzy, the extraction is early.

---

## After Extraction

When something moves to `@party/ui`, update the docs that define reuse:

- `docs/ui-map.md`
- `docs/runtime-map.md` if runtime-related
- `docs/new-game-checklist.md` if it changes scaffold expectations

Do this in the same session, not later.
