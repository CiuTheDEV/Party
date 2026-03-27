# Project Setup Guide

> Read this before starting Phase 0.
> Contains the exact commands and baseline config for initializing the monorepo.

---

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Git configured
- Cloudflare account (free)
- GitHub account

---

## Phase 0 - Monorepo Initialization

### Step 1 - Initialize Turborepo

```bash
cd C:\Users\Mateo\Desktop\Party
pnpm dlx create-turbo@latest . --package-manager pnpm
```

Accept the defaults, then clean up the generated example apps.

### Step 2 - Target directory structure

```text
Party/
|- apps/
|  `- hub/                    # Next.js app
|- packages/
|  |- ui/                     # Shared components
|  |- game-sdk/               # Module contract
|  `- games/
|     `- charades/            # First game module
|- content/
|  `- charades/               # Word lists
|- turbo.json
|- pnpm-workspace.yaml
`- package.json
```

### Step 3 - Root config files

Keep the root workspace scoped to:
- `apps/*`
- `packages/*`
- `packages/games/*`

Baseline root scripts should expose:
- `dev`
- `build`
- `lint`
- `test`

---

## Hub App (`apps/hub`)

Initialize the hub with Next.js, TypeScript, App Router, and strict TS settings.

### Cloudflare Pages adapter

```bash
cd apps/hub
pnpm add @cloudflare/next-on-pages
pnpm add -D wrangler
```

The hub should stay Cloudflare-ready from the beginning.

---

## Shared Packages

### `packages/ui`

Purpose:
- shared shell,
- shared setup template,
- reusable visual primitives.

### `packages/game-sdk`

Purpose:
- define the module contract,
- keep game boundaries explicit,
- prevent the hub from hardcoding per-game behavior.

---

## First Game Module (`packages/games/charades`)

The first game module should own:
- config,
- menu content,
- setup sections,
- setup validation/state,
- results,
- later: gameplay entrypoints/runtime.

---

## Cloudflare Pages - Deployment

Default direction:
1. Connect the GitHub repo to Cloudflare Pages
2. Use Next.js build settings appropriate for the hub
3. Keep local Cloudflare bindings in local-only files
4. Never commit secrets or local binding files

---

## Cloudflare D1

Use D1 as the default database layer.

Initial schema should stay minimal:
- users,
- rooms,
- only what is needed for the current phase.

---

## Auth - Clerk

Clerk is planned, but should only be wired into runtime once real test keys exist.

---

## Real-Time - Partykit

Partykit is the default direction for room-based multiplayer and presenter/host flows.

---

## First Run Verification

```bash
pnpm install
pnpm dev
```

Expected result:
- the hub starts locally,
- shared packages resolve correctly,
- the workspace can build without hidden paid dependencies.

---

## Environment Variable Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `CLERK_SECRET_KEY` | local env only | Clerk server auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | local env only | Clerk client auth |
| `NODE_VERSION` | Cloudflare Pages | Build environment |

> Never commit real secrets.

---

*Read before Phase 0. If the setup needs to deviate, ask the product owner first.*
