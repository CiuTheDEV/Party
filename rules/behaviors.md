# Behavior Rules

> Repo-level behavior contract for Codex. `AGENTS.md` remains the primary mandatory startup file.

## Operating Model

This repo is **Codex-only**.

- No normal multi-agent routing inside repo docs
- No built-in Claude/Haiku/Antigravity workflow
- No default cross-model verification protocol

If the owner explicitly asks for an outside review or second opinion, treat that as an exception, not the default workflow.

## Documentation Structure

- Mandatory operational layer: `AGENTS.md` + `PROJECT_CONTEXT.md` + `memory/*`
- On-demand reference layer: `docs/*`
- Active historical reference layer: `docs/superpowers/specs/*` and `docs/superpowers/plans/*`

Do not load `/docs` wholesale at session start.

## Debugging Protocol

No blind fixes. Four phases:
1. **Root Cause** — read errors, reproduce, trace data flow
2. **Pattern Analysis** — find working example, compare
3. **Hypothesis Testing** — change one variable at a time
4. **Fix & Verify** — test before fix, verify no regression

3 consecutive failures -> stop and reassess.

## Documentation Rules

- Project status SSOT stays in `PROJECT_CONTEXT.md` and `memory/*`
- Do not spread task state across random markdown files
- All `.md` docs in repo should stay in English unless a file has a clear reason not to

## Code Quality Rules

- **300 lines is a review threshold, not an automatic split rule**
- If a file grows past ~300 lines, review cohesion first:
  - keep it whole if it still has one clear responsibility and stays easy to reason about,
  - split it only when responsibilities are mixed, navigation becomes harder, or real module boundaries appear
- Component styles live next to the component (`Button.module.css` beside `Button.tsx`)
- `globals.css` only for reset, custom properties, and true global base styles
- Comments explain *why*, not *what*
- No commented-out code blocks
- No `TODO` without an open task in `memory/active-tasks.json`

## Quality Control + Safety

> Detailed rules -> `docs/content-safety.md`

Core triggers:
- processing external URLs or citing others -> attribute source and warn if unverifiable
- critical code -> think about abuse/risk paths explicitly
- long, high-tool-count sessions -> consider recommending a fresh session
- discovered error or hallucination -> isolate it and do not write it into memory

## Memory Search Rules

- Scoped search should stay targeted; avoid unscoped full-project fishing
- Use local directory narrowing before deeper text search when possible

> Details -> `docs/behaviors-reference.md`

## Session Continuity

- Save meaningful progress to `memory/today.md`
- Keep `memory/active-tasks.json` aligned with real task state
- Keep `PROJECT_CONTEXT.md` handoff block current when wrapping a meaningful work block

> Extended rules -> `docs/behaviors-extended.md`
