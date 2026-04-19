# Project Party

Polish browser-based party game portal for hangouts and friend gatherings.

**Status**: In development - Phase 5 (custom auth) complete, with current follow-up work around Codenames runtime validation, browser coverage, and deploy hardening

---

## What Is This

A hub where you pick a game, and each game is an independent module. Think Jackbox Party Pack, but browser-first, Polish-first, and installation-free.

**Live modules**:
- **Charades / Kalambury** - gesture-based party game with host + presenter flow
- **Codenames / Tajniacy** - live module with setup, runtime, captain devices, and ongoing polish/validation work

## Architecture

```text
project-party/
|- apps/
|  `- hub/                  # Next.js platform shell
|- packages/
|  |- ui/                   # Shared shell, setup chrome, modal primitives
|  |- game-sdk/             # Game module contract
|  `- games/
|     |- charades/          # First live game module
|     `- codenames/         # Second live game module
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
| Auth | Custom email/password auth |
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

### Basic commands

```bash
npm install
npm run dev
```

### Browser verification

```bash
npm run test:e2e
npm run test:e2e:live
```

`test:e2e:live` runs Playwright in a visible browser with slower interactions, so local UI flows are easier to watch during validation.

This repo is primarily developed with Claude Code and Codex working against the same project memory and repo rules.
See `AGENTS.md` / `CLAUDE.md` for workflow details.

---

*Hobby project. Free tiers only.*
