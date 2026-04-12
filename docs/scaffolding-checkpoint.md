# Scaffolding Checkpoint

> Run this checklist before any new stack decision or new service addition.
> Project Party is a hobby project - **free tiers only, no paid services at launch.**

---

## Rule #0 - Free Tier Check

Before evaluating any service:
- [ ] Does it have a free tier?
- [ ] What are the free-tier limits?
- [ ] Are those limits realistic for the next 3 months?

**If the answer is no free tier: stop and ask the product owner.**

## 1. Deployment Layer

**Default: Cloudflare Pages**

- [ ] Use Cloudflare Pages for frontend by default
- [ ] Need server-side logic? Consider Cloudflare Workers first
- [ ] If you want anything else, explain why Cloudflare does not fit

## 2. Database Layer

**Default: Cloudflare D1**

- [ ] Use Cloudflare D1 by default
- [ ] If considering Supabase / PlanetScale / Neon, confirm free-tier details first
- [ ] If considering self-hosted Postgres, explain why D1 is insufficient

## 3. Real-Time Layer

**Default: Partykit**

- [ ] Use Partykit for multiplayer rooms by default
- [ ] If considering Cloudflare Durable Objects directly, justify the extra complexity
- [ ] Any other solution must pass the free-tier check first

## 4. Auth Layer

**Default: custom auth**

- [ ] Use the in-house email/password auth flow
- [ ] Guest play must stay supported
- [ ] Keep auth on the same origin as the hub

## 5. Payments Layer

**Default: Stripe stubs only**

- [ ] Payment UI should exist only as stubs at this stage
- [ ] No live Stripe connection yet
- [ ] When ready, Stripe Checkout is the expected direction

## 6. Storage Layer

**Default: Cloudflare R2 if needed**

- [ ] If file storage is needed, check R2 first
- [ ] If considering S3 or anything else, explain why R2 is insufficient

## 7. Code Size Check

- [ ] Core feature estimated size: _____ lines
- [ ] Files above ~300 lines were reviewed for cohesion; split only when boundaries are real, not just to satisfy a number
- [ ] Styles remain modular - no giant CSS file
- [ ] If a package grows too large, decide whether it should split into smaller modules

## Decision Record Template

```md
## Stack Decision - [feature/service]

### Choice
[What was chosen]

### Free tier confirmed
[Yes / No - limits: ...]

### Why not the default
[Reason for deviation]

### Fallback if limits are hit
[What to do later]
```

---

*Cloudflare-first. Free tier always. Ask before spending.*
