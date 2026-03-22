# Project Setup Guide

> Read this before starting Phase 0.
> Contains exact commands and config for initializing the monorepo.

---

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Git configured
- Cloudflare account (free)
- GitHub account

---

## Phase 0 — Monorepo Initialization

### Step 1 — Initialize Turborepo

```bash
cd C:\Users\Mateo\Desktop\Party
pnpm dlx create-turbo@latest . --package-manager pnpm
```

Accept all defaults. Then clean up the generated example apps — we build our own structure.

### Step 2 — Final directory structure

```
Party/
├── apps/
│   └── hub/                    # Next.js app
├── packages/
│   ├── ui/                     # Shared components
│   │   └── game-template/      # Shared game menu layout
│   ├── game-sdk/               # Module contract (types only)
│   └── games/
│       └── charades/           # First game module
├── content/
│   └── charades/               # Word lists (JSON)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json                # Root
```

### Step 3 — Root config files

**`pnpm-workspace.yaml`**:
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "packages/games/*"
```

**Root `package.json`**:
```json
{
  "name": "project-party",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5",
    "@types/node": "^20"
  },
  "engines": {
    "node": ">=20"
  }
}
```

**`turbo.json`**:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {}
  }
}
```

**Root `tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

---

## Hub App (apps/hub)

### Initialize

```bash
cd apps
pnpm create next-app@latest hub --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### `apps/hub/package.json` additions

```json
{
  "name": "@party/hub",
  "dependencies": {
    "@party/ui": "workspace:*",
    "@party/game-sdk": "workspace:*"
  }
}
```

### Cloudflare Pages adapter

```bash
cd apps/hub
pnpm add @cloudflare/next-on-pages
pnpm add -D wrangler
```

**`apps/hub/next.config.ts`**:
```ts
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

const nextConfig = {
  reactStrictMode: true,
}

export default nextConfig
```

---

## Shared Packages

### packages/ui

```bash
mkdir -p packages/ui/src/game-template
```

**`packages/ui/package.json`**:
```json
{
  "name": "@party/ui",
  "version": "0.0.1",
  "private": true,
  "exports": {
    "./game-template": "./src/game-template/index.tsx",
    "./styles/*": "./src/styles/*"
  },
  "devDependencies": {
    "typescript": "^5",
    "react": "^19",
    "@types/react": "^19"
  },
  "peerDependencies": {
    "react": "^19"
  }
}
```

### packages/game-sdk

```bash
mkdir -p packages/game-sdk/src
```

**`packages/game-sdk/package.json`**:
```json
{
  "name": "@party/game-sdk",
  "version": "0.0.1",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

**`packages/game-sdk/src/index.ts`** — module contract:
```ts
export interface GameConfig {
  id: string
  name: string
  description: string
  icon: string
  color: string
  minPlayers: number
  maxPlayers: number
  modes: GameMode[]
  categories: GameCategory[]
  theme: 'dark' | 'light'
}

export interface GameMode {
  id: string
  name: string
  description: string
  meta: string
  available: boolean
  settings: GameSetting[]
}

export interface GameCategory {
  id: string
  name: string
  premium: boolean
}

export interface GameSetting {
  id: string
  label: string
  value: string | number
}

export interface GameModule {
  config: GameConfig
  Menu: React.ComponentType
  Screen: React.ComponentType
  Results: React.ComponentType
}
```

---

## First Game Module (packages/games/charades)

```bash
mkdir -p packages/games/charades/src
```

**`packages/games/charades/package.json`**:
```json
{
  "name": "@party/game-charades",
  "version": "0.0.1",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@party/ui": "workspace:*",
    "@party/game-sdk": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5",
    "react": "^19",
    "@types/react": "^19"
  }
}
```

---

## Cloudflare Pages — Deployment

### Connect repo to Cloudflare Pages

1. Go to Cloudflare Dashboard → Pages → Create project
2. Connect GitHub → select `Party` repo
3. Set build settings:
   - **Framework**: Next.js
   - **Build command**: `pnpm build`
   - **Output directory**: `.vercel/output/static`
   - **Root directory**: `apps/hub`
4. Add environment variable: `NODE_VERSION = 20`

### `apps/hub/.dev.vars` (local only, never commit)

```
# Local Cloudflare bindings for development
# Copy this file — never commit it
```

### `apps/hub/wrangler.toml`

```toml
name = "project-party-hub"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "project-party"
database_id = "FILL_IN_AFTER_CREATING"
```

---

## Cloudflare D1 — Database

```bash
# Create database (run once)
pnpm dlx wrangler d1 create project-party

# Copy the database_id into wrangler.toml
```

### Initial schema (`apps/hub/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at INTEGER NOT NULL
);
```

```bash
# Apply schema locally
pnpm dlx wrangler d1 execute project-party --local --file=apps/hub/schema.sql
```

---

## Auth — Clerk

1. Create account at clerk.com (free tier)
2. Create new application
3. Copy keys to `apps/hub/.dev.vars`:

```
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

```bash
cd apps/hub
pnpm add @clerk/nextjs
```

---

## Real-time — Partykit

```bash
cd apps/hub
pnpm add partykit partysocket
```

**`apps/hub/party/index.ts`** — basic room server:
```ts
import type * as Party from 'partykit/server'

export default class GameRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    this.room.broadcast(`player joined`, [conn.id])
  }

  onMessage(message: string, sender: Party.Connection) {
    this.room.broadcast(message, [sender.id])
  }

  onClose(conn: Party.Connection) {
    this.room.broadcast(`player left`, [conn.id])
  }
}
```

---

## Git Setup

```bash
# .gitignore additions
echo ".dev.vars" >> .gitignore
echo ".env.local" >> .gitignore
echo ".wrangler/" >> .gitignore
echo "*.local" >> .gitignore
```

---

## First Run Verification

```bash
# Install all dependencies
pnpm install

# Run dev server
pnpm dev

# Should start:
# - apps/hub on localhost:3000
```

---

## Environment Variables Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `CLERK_SECRET_KEY` | `.dev.vars` | Clerk auth (server) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.dev.vars` | Clerk auth (client) |
| `NODE_VERSION` | Cloudflare Pages dashboard | Build environment |

> Never commit `.dev.vars` or any file containing real keys.

---

*Read before Phase 0. Questions → ask product owner before deviating from this setup.*
