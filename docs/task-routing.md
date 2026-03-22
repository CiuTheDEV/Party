# Task Routing

> On-demand loading. Core routing rules live in `rules/behaviors.md`.

---

## Model Setup

**Claude Pro — Sonnet as primary, Haiku for lightweight tasks.**

| Model | Status | Use |
|-------|--------|-----|
| Sonnet | ✅ Active | Primary — all development work |
| Haiku | ✅ Active | Lightweight tasks: quick lookups, simple formatting, low-stakes Q&A |
| Codex / GPT-5.4 | ✅ Active | Token limit fallback + cross-verification |
| Codex / GPT-5.4-mini | ✅ Active | Lightweight fallback tasks when token limit reached |
| Antigravity | ✅ Active | Alternative fallback when token limit reached |
| Opus | ❌ Not used | Too expensive on Claude Pro |
| Local (Ollama) | ❌ Not used | Not set up |

---

## Routing Table

### Sonnet handles directly

| Task Type | Notes |
|-----------|-------|
| All UI / frontend development | Components, styles, layouts |
| Bug fixes | Any size |
| Docs, comments, README | Any `.md` file |
| Config files | Non-secret parameters |
| Game logic | Room management, scoring, state |
| API routes | Cloudflare Workers, D1 queries |
| Refactors ≤100 lines | Contained changes |
| Auth flow (Clerk) | Integration work |
| Partykit real-time setup | Multiplayer architecture |

### Hand off to Codex / Antigravity

| Trigger | Model | Action |
|---------|-------|--------|
| Token limit reached mid-task | GPT-5.4 | Save state → hand off with full context |
| Cross-verification of critical logic | GPT-5.4 | Codex reviews Claude's output |
| Lightweight token-limit tasks | GPT-5.4-mini | Simple, well-defined tasks only |
| Refactor >100 lines, non-sensitive | GPT-5.4 | Optional outsource |

### Use Haiku for

| Task | Notes |
|------|-------|
| Quick factual lookups | No code involved |
| Simple text formatting | No architectural decisions |
| Low-stakes Q&A | When Sonnet would be overkill |

---

## Handoff Template

When handing off to Codex/Antigravity:

```
# Project Party — Handoff

## Read first (in this order)
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
2. Confirm: PASS — read the output, don't assume
3. Update: PROJECT_CONTEXT.md handoff block
4. Report: results with evidence
```

---

## Free Tier Constraints

All services must have a free tier. Before adding anything new:

| Service | Free tier | Action if exceeded |
|---------|-----------|-------------------|
| Cloudflare Pages | Unlimited deploys | — |
| Cloudflare D1 | 5GB, 5M reads/day | Ask product owner |
| Cloudflare Workers | 100k req/day | Ask product owner |
| Clerk | 10,000 MAU | Ask product owner |
| Partykit | Free tier | Check limits before heavy use |
| Stripe | % per transaction | Not connected yet |

> Any service without a free tier → stop and ask the product owner.

---

*Project Party uses Claude Pro: Sonnet (primary), Haiku (lightweight), Codex GPT-5.4/GPT-5.4-mini (fallback). No Opus.*
