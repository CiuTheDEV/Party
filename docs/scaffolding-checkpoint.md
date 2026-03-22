# Scaffolding Checkpoint

> Run this checklist before any new tech stack decision or new service addition.
> Project Party is hobbyist — **free tiers only, no paid services at launch.**

---

## Rule #0 — Free Tier Check (always first)

Before evaluating any service:
- [ ] Does it have a free tier?
- [ ] What are the free tier limits?
- [ ] Will we realistically hit those limits in the next 3 months?

**If no free tier → stop. Do not proceed. Ask product owner.**

---

## 1. Deployment Layer

**Default: Cloudflare Pages** (owner has account, free tier, edge performance)

- [ ] Using Cloudflare Pages for frontend? ✅ Preferred
- [ ] Need server-side logic? → Cloudflare Workers (free: 100k req/day)
- [ ] If considering something else → explain why Cloudflare doesn't work

## 2. Database Layer

**Default: Cloudflare D1** (native CF, SQLite, free: 5GB + 5M reads/day)

- [ ] Using Cloudflare D1? ✅ Preferred
- [ ] If considering Supabase/PlanetScale/Neon → confirm free tier first
- [ ] If self-hosting Postgres → explain why D1 is insufficient

## 3. Real-time Layer

**Default: Partykit** (built on Cloudflare, free tier available)

- [ ] Using Partykit for multiplayer rooms? ✅ Preferred
- [ ] If considering Cloudflare Durable Objects directly → more complex, justify
- [ ] Any other solution → verify free tier limits

## 4. Auth Layer

**Default: Clerk** (free: 10k MAU — sufficient for launch)

- [ ] Using Clerk? ✅ Preferred
- [ ] Guest play without auth is supported — don't force registration
- [ ] Self-implementing auth → never, too much risk

## 5. Payments Layer

**Default: Stripe stubs** — not connected, architected for future

- [ ] Payment UI exists as stubs only? ✅ Correct
- [ ] No actual Stripe connection at this stage? ✅ Correct
- [ ] When ready → Stripe Checkout (% per transaction, no monthly fee)

## 6. Storage Layer

**Default: Cloudflare R2** if needed (free: 10GB/month)

- [ ] Need file storage? → Cloudflare R2 first
- [ ] If considering S3 → explain why R2 is insufficient

## 7. Code Size Check

- [ ] Core feature estimated lines: _____ lines
- [ ] Every single file stays under **300 lines**?
- [ ] Styles are modular — no single giant CSS file?
- [ ] If >3000 lines total in a package → should it be split into separate modules?

---

## Decision Record Template

```markdown
## Stack Decision — [feature/service name]

### Choice
[What was chosen]

### Free tier confirmed
[Yes / No — limits: ...]

### Why not the default
[Reason if deviating from Cloudflare-first defaults]

### Fallback if limits hit
[What to do when free tier runs out]
```

---

*Cloudflare-first. Free tier always. Ask before spending.*
