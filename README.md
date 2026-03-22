# Project Party

Polish browser-based party game portal for hangouts and friend gatherings.

**Status**: 🚧 In development — Phase 0 (monorepo setup)

---

## What is this

A hub where you pick a game, and each game is an independent module. Think Jackbox Party Pack — but Polish, no installation, runs in the browser.

**First game**: Charades / Pantomime — show the word with gestures, expressions, and body language. No drawing, no saying the word.

## Architecture

```
project-party/                     # Monorepo (Turborepo)
├── apps/
│   └── hub/                       # Next.js — landing page, game list
├── packages/
│   ├── ui/                        # Shared UI components
│   │   └── game-template/         # Shared layout for every game menu
│   ├── game-sdk/                  # Game module contract (types, interfaces)
│   └── games/
│       └── charades/              # Module: Charades ← first game
└── content/
    └── charades/                  # Word lists and categories
```

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (React) + TypeScript |
| Monorepo | Turborepo |
| Real-time | Partykit |
| Database | Cloudflare D1 |
| Auth | Clerk (optional — guest play supported) |
| Hosting | Cloudflare Pages |
| Payments | Stripe (stub — not connected yet) |

## How it works

1. **Hub** — pick a game from the list
2. **Game menu** — choose a mode, click Play
3. **Config modal** — set up teams, pick word deck, configure options
4. **Gameplay** — everyone plays together
5. **Results** — scores, back to menu

Two ways to join:
- **Room code** — host on big screen, others join on phones (Jackbox-style)
- **Link** — click the link, everyone on their own device

## Development

This project is built with Claude Code (Sonnet) as the primary AI agent.
See `CLAUDE.md` for the full workflow configuration.

---

*Hobbyist project. Free tiers only. Built with Claude Code.*
