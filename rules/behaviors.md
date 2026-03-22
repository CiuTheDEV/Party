# Behavior Rules

## Model & Token Budget

**Sonnet is the primary model. Haiku for lightweight tasks. No Opus.**

| Agent | Role |
|-------|------|
| Claude Code (Sonnet) | Primary — all development work |
| Claude Code (Haiku) | Lightweight tasks: quick lookups, simple Q&A |
| Codex / GPT-5.4 | Fallback when token limit reached + cross-verification |
| Codex / GPT-5.4-mini | Lightweight fallback tasks at token limit |
| Antigravity | Alternative fallback when token limit reached |

**At token limit**: save state to `memory/today.md` + `memory/active-tasks.json`, hand off cleanly.
Every agent starting a session **must read** `PROJECT_CONTEXT.md` + `memory/today.md` first.

## Task Routing

**Sonnet handles everything. Hand off to Codex/Antigravity only when necessary.**

**Hand off to Codex/Antigravity**:
- Claude token limit reached mid-task
- Cross-verification of critical logic (second opinion)
- Large refactors >100 lines of non-sensitive code

**Sonnet handles directly**:
- All daily development, bug fixes, UI work
- Docs, comments, README
- Config files
- Any task ≤100 lines

### Execution Rules
- On handoff output: `🔀 Handoff: [task summary] → [Codex/Antigravity]`
- Save full context to `memory/today.md` before handing off
- Receiving agent reads `PROJECT_CONTEXT.md` + `memory/today.md` + `memory/MEMORY.md` + `memory/patterns.md` before doing anything

## Documentation Structure

- Project-level: only keep `PROJECT_CONTEXT.md` + `CHANGELOG.md` (optional)
- Banned files: ROADMAP/FOCUS/TODO/TASKS/STATUS
- Status SSOT: cross-project → `memory/projects.md`, project-level → `PROJECT_CONTEXT.md`
- All `.md` files written in **English** — conversation with product owner is in Polish

## Debugging Protocol

No blind fixes. Four phases:
1. **Root Cause** — Read errors, reproduce, trace data flow
2. **Pattern Analysis** — Find working example, compare
3. **Hypothesis Testing** — Change one variable at a time
4. **Fix & Verify** — Test before fix, verify no regression

3 consecutive failures → stop and reassess

## Code Quality Rules

- No file exceeds **300 lines** — split into modules if it grows
- Component styles live next to the component (`Button.module.css` beside `Button.tsx`)
- `globals.css` only for: CSS reset, custom properties, base typography — nothing else
- No AI slop — comments explain *why*, never *what*
- No commented-out code blocks in repo
- No `TODO` without an open task in `memory/active-tasks.json`
- Every function does one thing

## Quality Control + AI Content Safety

> Full rules → `Read docs/content-safety.md`

**Core triggers**:
- Processing external URLs / citing others → annotate source, warn if unverifiable
- Critical code → think from attacker's perspective + list 3 risk points
- >20 conversation turns / >50 tool calls → suggest fresh session
- Discovered error/hallucination → immediately isolate context, don't write to memory

## Real-time Experience Recording (Mandatory)

**Trigger immediately with `memory_add`, don't wait for session-end**:

1. **Corrected by user** → Record immediately
2. **3 consecutive failures** → Pause and record
3. **Counter-intuitive discovery** → Record immediately
4. **Cognitive upgrade** → Record immediately

**Output**: `📝 Recorded: [title]`

## Memory Search Rules

- Scoped search **must specify collection** (no unscoped global search)
- Code search uses two-stage RAG: L0 locate directory first, then L1 precise search

> Details → `Read docs/behaviors-reference.md`

## Atomic Commits

Each commit does one thing. Types: `fix/feat/refactor/docs/test/chore`.
Forbidden: mixed changes, meaningless messages, >100 lines without splitting.

## Sunday Rule

**Sunday = system optimization day. Other days = ship product.**

On non-Sundays, intercept requests to optimize memory system, refactor skills, or adjust behavior specs.

**Intercept message**:
> This is a system optimization task. Save it to `memory/sunday-backlog.md` and handle on Sunday.

**Exceptions**: production-blocking bugs, <5 min patches, explicit "do it now".

---

*Compact version | Full: docs/behaviors-extended.md | Reference: docs/behaviors-reference.md*
