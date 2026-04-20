# Task Routing

> On-demand only. This file does not route work between models. It routes work between repo playbooks.

---

## Purpose

This repo is operated by **Codex only**.

So "task routing" here means:
- which local rules matter,
- which docs to load,
- and which verification style to prefer

for a given task type.

---

## Routing Table

| Task type | Load / use | Verification default |
|-----------|------------|----------------------|
| Regular bug fix or feature in `apps/` / `packages/` | `AGENTS.md` + mandatory start files only | focused build/lint/test |
| Browser-facing UI or runtime change | add Playwright-based inspection workflow from `AGENTS.md` | visible browser pass + screenshots |
| Runtime ownership or shared-vs-local runtime decision | `docs/runtime-map.md` | compare ownership boundary with current code |
| External source processing / extraction / citation | `docs/content-safety.md` | source attribution and verification |
| New service, infra, or stack decision | `docs/scaffolding-checkpoint.md` | explicit decision check against defaults |
| Adding a new game module | `docs/new-game-checklist.md` | package/build integration checks |
| Adding a new game module with boundary questions | `docs/game-module-template.md` + `docs/ui-map.md` | module ownership + shared reuse check |
| Shared extraction into `@party/ui` | `docs/shared-extraction-checklist.md` + `docs/ui-map.md` | shared-structure review |
| Internal readiness / maturity discussion for a game module | `docs/module-maturity.md` | maturity checklist, not just `config.status` |
| Refactor / split / cleanup decision | `docs/code-organization.md` | decide whether structural change is justified |
| Memory search or scoped code search details | `docs/behaviors-reference.md` | evidence from targeted search |
| Knowledge-base write rules or lower-frequency process rules | `docs/behaviors-extended.md` | consistency with memory SSOT |
| Continuing or revisiting a subsystem with prior design work | relevant `docs/superpowers/specs/*` and `plans/*` | compare with current code + handoff |

---

## Repo Defaults

### Use local inspection first

Prefer:
- local code inspection,
- current repo docs,
- local verification,

before inventing process or relying on stale assumptions.

### Use docs only when relevant

Do not bulk-load `/docs`.

If a task is straightforward and current code plus mandatory context are enough, stay there.

### Verification follows task surface

- code logic change -> focused checks
- UI/runtime change -> browser pass
- doc/process change -> consistency review of affected docs

---

## Not Part of This File

This file is **not** for:
- model cost decisions,
- multi-agent delegation,
- token-limit handoff between different agents.

Those older concerns are no longer active for this repo.
