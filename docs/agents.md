# Agent Configuration & Multi-Agent Collaboration

> On-demand loading. Contains agent assignment, handoff protocol, multi-model routing.

---

## Agent Setup

This project runs on **Claude Pro** — Sonnet as primary, Haiku for lightweight tasks. No Opus.

| Agent | Model | When |
|-------|-------|------|
| **Claude Code** | Sonnet | Primary — all development sessions |
| **Claude Code** | Haiku | Quick lookups, simple Q&A, lightweight tasks |
| **Codex** | GPT-5.4 | Token limit fallback + cross-verification |
| **Codex** | GPT-5.4-mini | Lightweight tasks when token limit reached |
| **Antigravity** | — | Alternative fallback when token limit reached |

## Token Limit Handoff Protocol

When Claude token limit is approaching:

1. Complete the current atomic unit of work (don't stop mid-function)
2. Update `memory/today.md` with full session summary
3. Update `memory/active-tasks.json` with current task state
4. Update `PROJECT_CONTEXT.md` handoff block
5. Output: `🔀 Handoff: [task] → Codex` with next steps clearly listed

**Receiving agent checklist** (Codex/Antigravity starting a session):
1. Read `PROJECT_CONTEXT.md` — architecture, current phase, decisions
2. Read `memory/today.md` — what happened today, current task
3. Read `memory/active-tasks.json` — in-flight tasks
4. Read `memory/MEMORY.md` — technical pitfalls to avoid
5. Read `memory/patterns.md` — reusable solutions (if exists)
6. Only then start working

## Agent Task Assignment

| Agent | Scope | Core Duty |
|-------|-------|-----------|
| **pr-reviewer** | Code review | PR quality, architecture consistency |
| **security-reviewer** | Security audit | Vulnerability detection, sensitive info |
| **performance-analyzer** | Performance analysis | Bottleneck identification, optimization |

## Subagent Dispatch Rules

**Default: sequential. Parallel only for truly independent tasks.**

**Memory injection when dispatching** (mandatory):
```
You are working on Project Party — a Polish browser party game portal.

## Required reading (before anything else)
1. PROJECT_CONTEXT.md — architecture, current phase, key decisions
2. memory/today.md — today's session context and current task
3. memory/MEMORY.md — technical pitfalls to avoid

## Task
[Specific task description]

## Completion requirements
1. Run lint + build, confirm PASS
2. Update PROJECT_CONTEXT.md Session Handoff section
3. Report results with evidence (not "should work")
```

## Cross-Verification

Use Codex for second opinion on:
- Critical game logic (room management, scoring)
- Real-time architecture decisions (Partykit setup)
- Security-sensitive code (auth flow, session tokens)

**Output format**:
```
Cross-verification:
- Claude: [analysis]
- Codex: [analysis]
- Agreement: [what both agree on]
- Divergence: [differences, if any]
- Decision: [what we go with and why]
```

## Multi-Agent SSOT Contract

| Layer | Location | Writer | Purpose |
|-------|----------|--------|---------|
| **L0 Rules** | `rules/` + `docs/` | Claude only | Rules, memory, experience |
| **L1 Interface** | `PROJECT_CONTEXT.md` | All agents (restricted) | Project state |
| **L2 Code** | `apps/` + `packages/` | All agents | Product code |

### File Operation Rules

| Agent | Can create | Can modify | Never touch |
|-------|-----------|-----------|-------------|
| Claude Code | Anything (following behaviors.md) | Anything | — |
| Codex / Antigravity | Code files | Code + Handoff block | `rules/`, `docs/`, `memory/` |

External agents can only write to the handoff block in `PROJECT_CONTEXT.md`:
```
<!-- handoff:start -->
## Session Handoff
- Last: [time] by [agent]
- Task: [description]
- Did: [what was done]
- Next: [next steps]
- Blocker: [if any]
<!-- handoff:end -->
```

### Violation Detection

1. `git diff --name-only` — check for modifications outside whitelist
2. Violation → `git checkout -- [file]` rollback + record in `memory/MEMORY.md`

---

*Customize based on available tools and subscriptions.*
