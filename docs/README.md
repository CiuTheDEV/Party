# Docs Index

Practical map of the `/docs` folder for Project Party.

`/docs` is on-demand by default.
Do not load the whole folder at session start.

Use `AGENTS.md` first, then come here only when the current task needs a more specific playbook.

---

## Core Playbooks

- [ui-map.md](C:/Users/Mateo/Desktop/Party/docs/ui-map.md)
  - shared UI inventory
  - `@party/ui` vs game-module ownership
  - what to reuse before building locally

- [runtime-map.md](C:/Users/Mateo/Desktop/Party/docs/runtime-map.md)
  - runtime ownership
  - shared-vs-local runtime rules
  - host/presenter/captain boundary
  - runtime verification expectations

- [game-module-template.md](C:/Users/Mateo/Desktop/Party/docs/game-module-template.md)
  - baseline shape of a new game module
  - what a game must own
  - what to reuse first

- [module-maturity.md](C:/Users/Mateo/Desktop/Party/docs/module-maturity.md)
  - internal readiness model beyond `live` / `coming-soon`
  - how to talk about module quality more precisely

- [shared-extraction-checklist.md](C:/Users/Mateo/Desktop/Party/docs/shared-extraction-checklist.md)
  - gate for moving things into `@party/ui`
  - default bias: keep local unless sharing is clearly earned

- [code-organization.md](C:/Users/Mateo/Desktop/Party/docs/code-organization.md)
  - when to keep code in one file
  - when to split
  - when refactor is justified
  - practical KISS/DRY rules for this repo

- [new-game-checklist.md](C:/Users/Mateo/Desktop/Party/docs/new-game-checklist.md)
  - operational checklist for adding a new game
  - scaffold and verification sequence

---

## Repo Workflow

- [agents.md](C:/Users/Mateo/Desktop/Party/docs/agents.md)
  - Codex repo guide
  - doc hierarchy
  - when to load which playbook

- [task-routing.md](C:/Users/Mateo/Desktop/Party/docs/task-routing.md)
  - which playbook fits which task type

- [behaviors-reference.md](C:/Users/Mateo/Desktop/Party/docs/behaviors-reference.md)
  - scoped search and memory/code lookup details

- [behaviors-extended.md](C:/Users/Mateo/Desktop/Party/docs/behaviors-extended.md)
  - lower-frequency workflow rules
  - knowledge-base handling

---

## Special-Case Docs

- [content-safety.md](C:/Users/Mateo/Desktop/Party/docs/content-safety.md)
  - external source safety
  - attribution and extraction rules

- [scaffolding-checkpoint.md](C:/Users/Mateo/Desktop/Party/docs/scaffolding-checkpoint.md)
  - new service / infra / stack decision gate

- [project-setup.md](C:/Users/Mateo/Desktop/Party/docs/project-setup.md)
  - original bootstrap assumptions
  - historical setup reference

---

## Active Historical Reference

- `docs/superpowers/specs/*`
  - prior design decisions

- `docs/superpowers/plans/*`
  - prior implementation plans

These are not mandatory startup docs, but they are active references whenever work continues in an area that already has a spec or plan.
