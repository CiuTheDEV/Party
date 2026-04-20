# Code Organization

Practical rules for keeping the repo readable while it grows.

Use this document when deciding:
- whether to keep work in one file,
- whether to split code into smaller modules,
- whether a refactor is justified,
- how to avoid “cleanup for cleanup’s sake”.

This is a repo playbook, not a style manifesto.

---

## Core Principles

### KISS

Prefer the simplest solution that solves the real problem.

Do not:
- add abstraction before the second real use case exists,
- invent framework-like layers because they might be useful later,
- split code only because the current file looks large.

### DRY

Reuse structure when it is truly shared.

Do not:
- force code into shared layers only to avoid a small amount of duplication,
- extract a helper or component if the second use case is still hypothetical,
- create generic APIs that are harder to read than the duplicated code.

### Local-first by default

If the boundary is unclear, keep code local first.

Extract later when:
- the repeated shape is real,
- the boundary is clear,
- and sharing reduces drift more than it increases complexity.

---

## One File vs Several Files

### Keep code in one file when

- the file still has one clear responsibility,
- most of the code is read together to understand the feature,
- splitting would create thin wrapper files with little value,
- the local context is more important than reuse,
- the file is large but still cohesive.

### Split into multiple files when

- the file mixes multiple responsibilities,
- a sub-part can be named as its own concept,
- a chunk is reused or clearly reusable,
- navigation becomes genuinely hard,
- testing or reasoning becomes easier after separation,
- part of the file is infrastructure while another part is feature logic.

### Review threshold, not split threshold

`~300 lines` is a review threshold, not an automatic split rule.

If a file crosses that size, ask:
- Is it still cohesive?
- Does it still have one job?
- Would splitting reduce cognitive load or only create more jumping between files?

If the answers still favor cohesion, keep it whole.

---

## Good Reasons To Split

Split when you can clearly name the new unit.

Good examples:
- `HostSettingsModal` -> shared shell + game-local action wiring
- large settings overlay -> shared renderer + game-local data adapter
- mixed file with view model + screen rendering + helpers -> separate by responsibility

If the new file can only be called:
- `helpers`,
- `misc`,
- `utils2`,
- `temp`,

then the split is probably too early or poorly scoped.

---

## Bad Reasons To Split

Do not split code:
- just because it is long,
- just because another repo does it differently,
- just to create more “clean-looking” folders,
- when the result is many tiny files with no meaningful boundary,
- when understanding the feature would require opening five files instead of one.

Small files are not automatically better files.

---

## When To Refactor

Refactor when at least one of these is true:

- the current task is hard to implement safely without cleanup,
- responsibilities are clearly tangled,
- duplication is already creating drift,
- naming or structure is actively misleading,
- the existing code makes verification harder,
- the same pain has already appeared more than once.

### Safe refactor pattern

Prefer this order:

1. understand the existing code,
2. make the smallest structural change that reduces risk,
3. implement the actual task,
4. verify behavior.

---

## When Not To Refactor

Do not refactor:
- only because the code could be prettier,
- when the current task does not benefit from it,
- when it would significantly widen the diff without reducing risk,
- when it mixes many unrelated improvements,
- when the new structure is still speculative.

If a refactor needs its own explanation to be justified, it is probably its own task.

---

## Practical Heuristics

### A file is probably too mixed when

- UI rendering, business rules, persistence, and navigation logic all sit together,
- one part changes for design reasons while another changes for runtime reasons,
- you keep scrolling between unrelated sections to understand a single change,
- function names inside the file sound like they belong to different modules.

### A refactor is probably worth it when

- you can point to a real risk it removes,
- you can describe the new boundary in one sentence,
- the new shape makes future edits more predictable,
- verification becomes easier, not harder.

### A refactor is probably premature when

- the abstraction is justified by “maybe later”,
- the new shared API needs many flags or branches,
- the new structure is harder to explain than the old one,
- local duplication is still small and harmless.

---

## Repo-Specific Guidance

### For `@party/ui`

Be stricter than usual.

Move code into `@party/ui` only when:
- the structure is genuinely shared,
- the game logic stays outside,
- the shared API stays small and readable.

Also use:
- `docs/ui-map.md`
- `docs/runtime-map.md`
- `docs/shared-extraction-checklist.md`

### For game modules

Prefer keeping code inside the game module when:
- it encodes game rules,
- it defines navigation targets/actions/profiles,
- it is only used by one game,
- the reuse case is not yet real.

### For `apps/hub`

Keep it thin.

If feature logic starts accumulating in the hub for one game, that is usually a smell that the code belongs in the game module.

---

## Review Questions

Before splitting or refactoring, ask:

1. What exact problem does this structural change solve?
2. What boundary am I introducing?
3. Will this reduce future drift or just move code around?
4. Does the new structure make the current task safer?
5. If I leave it local for now, what breaks?

If the answers are weak, keep the code simpler.

---

## Anti-Patterns

Avoid:
- cleanup commits that mix formatting, renames, logic, and architectural moves,
- extracting speculative shared helpers,
- splitting files into many tiny pieces without stronger naming,
- using refactor as a way to avoid making a small local fix,
- rewriting a whole file when a patch would solve the problem.

---

## Maintenance Rule

When a session produces a strong new repo pattern for splitting, extraction, or refactoring, update this file in the same session.
