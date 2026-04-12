# Task Routing

> On-demand loading. Core routing rules live in `rules/behaviors.md`.

---

## Model Setup

**Claude Pro - Sonnet as primary, Haiku for lightweight tasks.**

| Model | Status | Use |
|-------|--------|-----|
| Sonnet | Active | Primary - all development work |
| Haiku | Active | Lightweight tasks: quick lookups, simple formatting, low-stakes Q&A |
| Codex / GPT-5.4 | Active | Token limit fallback + cross-verification |
| Codex / GPT-5.4-mini | Active | Lightweight fallback tasks when token limit is reached |
| Antigravity | Active | Alternative fallback |
| Opus | Not used | Too expensive on Claude Pro |
| Local (Ollama) | Not used | Not set up |

## Routing Table

### Sonnet Handles Directly

| Task Type | Notes |
|-----------|-------|
| UI / frontend development | Components, styles, layouts |
| Bug fixes | Any size |
| Docs, comments, README | Any `.md` file |
| Config files | Non-secret parameters |
| Game logic | Room management, scoring, state |
| API routes | Cloudflare Workers, D1 queries |
| Contained refactors | Small to medium changes |
| Auth flow (custom email/password) | Integration work |
| Partykit setup | Multiplayer architecture |

### Hand Off to Codex / Antigravity

| Trigger | Model | Action |
|---------|-------|--------|
| Token limit reached mid-task | GPT-5.4 | Save state and hand off with full context |
| Cross-verification of critical logic | GPT-5.4 | Codex reviews Claude output |
| Lightweight token-limit tasks | GPT-5.4-mini | Simple, well-defined tasks only |
| Large non-sensitive refactor | GPT-5.4 | Optional outsource |

### Use Haiku For

| Task | Notes |
|------|-------|
| Quick factual lookups | No code involved |
| Simple text formatting | No architecture decisions |
| Low-stakes Q&A | When Sonnet would be overkill |

## Handoff Template

```text
# Project Party - Handoff

## Read first
1. PROJECT_CONTEXT.md
2. memory/today.md
3. memory/active-tasks.json
4. memory/MEMORY.md
5. memory/patterns.md

## Task
[Specific description]

## Context
[What has been done, what remains]

## Completion requirements
1. Run: npm run lint && npm run build
2. Confirm PASS from output
3. Update PROJECT_CONTEXT.md handoff block
4. Report results with evidence
```

## Free Tier Constraints

All services must have a free tier. Before adding anything new:

| Service | Free tier | Action if exceeded |
|---------|-----------|-------------------|
| Cloudflare Pages | Yes | Ask the product owner if limits matter |
| Cloudflare D1 | Yes | Ask the product owner |
| Cloudflare Workers | Yes | Ask the product owner |
| Custom auth | Yes | Ask the product owner if it adds cost |
| Partykit | Yes | Verify limits before heavy use |
| Stripe | Transaction-based | Not connected yet |

> Any service without a free tier means stop and ask the product owner.

---

*Project Party uses Claude Pro: Sonnet (primary), Haiku (lightweight), Codex GPT-5.4/GPT-5.4-mini (fallback).* 
