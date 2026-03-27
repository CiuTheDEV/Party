# Project Party

Polish browser-based party game portal for hangouts and friend gatherings.

**Status**: In development - Phase 4 groundwork in progress

---

## What Is This

A hub where you pick a game, and each game is an independent module. Think Jackbox Party Pack, but browser-first, Polish-first, and installation-free.

**First game**: Charades / Pantomime - express the word with gestures, expressions, and body language. No drawing, no saying the word.

## Architecture

```text
project-party/
|- apps/
|  `- hub/                  # Next.js platform shell
|- packages/
|  |- ui/                   # Shared UI components and shell
|  |- game-sdk/             # Game module contract
|  `- games/
|     `- charades/          # First game module
`- content/
   `- charades/             # Word lists and categories
```

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (React) + TypeScript |
| Monorepo | Turborepo |
| Real-time | Partykit |
| Database | Cloudflare D1 |
| Auth | Clerk later |
| Hosting | Cloudflare Pages |
| Payments | Stripe stub |

## How It Works

1. **Hub** - pick a game
2. **Game menu** - choose mode and open setup
3. **Config modal** - players, settings, categories, devices, start
4. **Gameplay** - fully game-specific runtime
5. **Results** - scores and return paths

Join modes:
- **Room code** - host on a big screen, others join on phones
- **Link** - everyone joins from their own device

## Development

This repo is primarily developed with Claude Code and Codex working against the same project memory and repo rules.
See `AGENTS.md` / `CLAUDE.md` for workflow details.

---

*Hobby project. Free tiers only.*
