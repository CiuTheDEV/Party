# Codex Repo Guide

> On-demand only. This file extends `AGENTS.md`. It does not replace the mandatory session-start files.

---

## Purpose

This repo is **Codex-only**.

That means:
- Codex is the only agent expected to work directly in this repository.
- There is no normal multi-agent routing layer inside repo docs.
- Any old references to Claude, Haiku, Antigravity, or cross-model handoff should be treated as historical unless a user explicitly asks for external review.

Use this file when you need:
- the repo doc hierarchy,
- session continuity conventions,
- or a quick map of which `/docs` files matter for which scenario.

---

## Working Model

### Mandatory layer

These are the always-on sources:
1. `AGENTS.md`
2. `PROJECT_CONTEXT.md`
3. `memory/today.md`
4. `memory/active-tasks.json`
5. `memory/MEMORY.md` if present
6. `memory/patterns.md` if present

These files drive day-to-day execution.

### On-demand layer

Everything in `/docs` is reference material loaded only when relevant.

Use `/docs` to answer:
- how this repo wants Codex to collaborate with the owner,
- which process applies to a special task,
- what a past design or implementation plan decided.

### Active historical reference layer

`docs/superpowers/specs/` and `docs/superpowers/plans/` are active historical references.

Use them when:
- touching a subsystem with prior design work,
- checking why a feature was built a certain way,
- or continuing an unfinished implementation stream.

Do not treat them as mandatory startup docs, but do treat them as live reference material when continuing an area that already has a spec or plan.

---

## Session Continuity

When finishing a meaningful work block:
1. update `PROJECT_CONTEXT.md` handoff block,
2. update `memory/today.md` if real progress happened,
3. update `memory/active-tasks.json` if task state changed,
4. update `memory/MEMORY.md` or `memory/patterns.md` if a reusable lesson was learned,
5. commit only when the owner asked for it.

When resuming work after interruption:
1. read the mandatory layer from `AGENTS.md`,
2. load only the relevant `/docs` files for the current task,
3. continue from the handoff and active task state rather than reconstructing from old chat context.

---

## `/docs` Map

| File | Use when | Role |
|------|----------|------|
| `docs/agents.md` | repo workflow / doc hierarchy | Codex-specific reference guide |
| `docs/task-routing.md` | deciding which repo playbook applies | task-type routing inside this repo |
| `docs/content-safety.md` | external sources, extraction, attribution | safety + quality rules |
| `docs/scaffolding-checkpoint.md` | new service or stack choice | infra decision gate |
| `docs/new-game-checklist.md` | adding a new game module | implementation checklist |
| `docs/project-setup.md` | checking original bootstrap assumptions | historical setup reference |
| `docs/behaviors-reference.md` | memory/code search details | reference rules |
| `docs/behaviors-extended.md` | knowledge-base and lower-frequency process rules | extended rules |
| `docs/superpowers/specs/*` | subsystem design history | active historical reference |
| `docs/superpowers/plans/*` | implementation sequencing history | active historical reference |

---

## Practical Rule

If a task can be solved correctly using:
- `AGENTS.md`,
- `PROJECT_CONTEXT.md`,
- `memory/*`,
- and local code inspection,

then do **not** load extra docs just because they exist.

Load `/docs` only when it materially improves correctness or decision quality.
