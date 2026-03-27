# Agent Configuration & Multi-Agent Collaboration

> On-demand loading. Contains agent assignment, handoff protocol, and multi-model routing.

---

## Agent Setup

This project runs on **Claude Pro** with Sonnet as the primary model and Haiku for lightweight tasks. No Opus.

| Agent | Model | When |
|-------|-------|------|
| **Claude Code** | Sonnet | Primary - all development sessions |
| **Claude Code** | Haiku | Quick lookups, simple Q&A, lightweight tasks |
| **Codex** | GPT-5.4 | Token limit fallback + cross-verification |
| **Codex** | GPT-5.4-mini | Lightweight tasks when token limit is reached |
| **Antigravity** | - | Alternative fallback |

## Token Limit Handoff Protocol

When Claude is approaching the token limit:

1. Finish the current atomic unit of work
2. Update `memory/today.md` with a full session summary
3. Update `memory/active-tasks.json` with the current task state
4. Update the handoff block in `PROJECT_CONTEXT.md`
5. Output a clear handoff with the next steps

**Receiving agent checklist**

1. Read `PROJECT_CONTEXT.md`
2. Read `memory/today.md`
3. Read `memory/active-tasks.json`
4. Read `memory/MEMORY.md`
5. Read `memory/patterns.md`
6. Only then start working

## Agent Task Assignment

| Agent | Scope | Core Duty |
|-------|-------|-----------|
| **pr-reviewer** | Code review | PR quality, architecture consistency |
| **security-reviewer** | Security audit | Vulnerability detection, sensitive info |
| **performance-analyzer** | Performance analysis | Bottleneck identification, optimization |

## Subagent Dispatch Rules

**Default: sequential. Use parallel work only for truly independent tasks.**

**Memory injection when dispatching**

```text
You are working on Project Party - a Polish browser party game portal.

## Required reading
1. PROJECT_CONTEXT.md
2. memory/today.md
3. memory/MEMORY.md

## Task
[Specific task description]

## Completion requirements
1. Run lint + build and confirm PASS
2. Update PROJECT_CONTEXT.md Session Handoff section
3. Report results with evidence
```

## Cross-Verification

Use Codex for a second opinion on:
- critical game logic,
- real-time architecture decisions,
- security-sensitive code.

**Output format**

```text
Cross-verification:
- Claude: [analysis]
- Codex: [analysis]
- Agreement: [common ground]
- Divergence: [differences]
- Decision: [final direction and why]
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
| Claude Code | Anything (following `behaviors.md`) | Anything | - |
| Codex / Antigravity | Code files | Code + handoff block | `rules/`, `docs/`, `memory/` |

External agents may only write to the handoff block in `PROJECT_CONTEXT.md`.

### Violation Detection

1. Run `git diff --name-only`
2. If an agent wrote outside the allowed scope, roll it back and record the lesson in `memory/MEMORY.md`

---

*Customize based on available tools and subscriptions.*
