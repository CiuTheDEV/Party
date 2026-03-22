# Game SDK Design Spec

*Date: 2026-03-22*
*Status: Approved*

---

## Goal

Define the contract that every game module must implement. `@party/game-sdk` is a TypeScript-only package — no runtime code, no dependencies. It provides types that hub and game modules share.

---

## Architecture

- Pure TypeScript types, no runtime code
- No React dependency in SDK itself (types reference React.ComponentType)
- Hub imports `GameConfig` to build the game list
- Each game module imports `GameModule` and implements it
- Adding a new game = new package that satisfies `GameModule` contract

---

## Types

### GameConfig

Data about a game — exported by each game package, imported by hub.

```typescript
type GameConfig = {
  id: string           // unique identifier, kebab-case, e.g. "charades"
  name: string         // display name in Polish, e.g. "Kalambury"
  description: string  // 1 sentence in Polish
  icon: string         // emoji
  minPlayers: number
  maxPlayers: number
  isPremium: boolean   // true = lock icon in hub, modal on click
  color: string        // accent color for glow and theming, hex e.g. "#7c3aed"
  href: string         // route to game, e.g. "/games/charades"
}
```

### GameModule

Full contract for a game module — exported by each game package.

```typescript
type GameModule = {
  config: GameConfig
  GameMenu: React.ComponentType
  GameConfigModal: React.ComponentType<GameConfigModalProps>
  GameResults: React.ComponentType<GameResultsProps>
}

type GameConfigModalProps = {
  onClose: () => void   // close modal, return to menu
  onStart: () => void   // start the game
}

type GameResultsProps = {
  onPlayAgain: () => void    // restart with same config
  onBackToMenu: () => void   // return to GameMenu
}
```

### Modal lifecycle

`GameConfigModal` is rendered and managed **internally by `GameMenu`**. The hub never touches it. GameMenu owns the open/close state and mode selection — closing the modal returns to GameMenu with mode selection preserved.

```
GameMenu (owns state)
  └── GameConfigModal (rendered when user clicks "Play")
        ├── onClose → modal closes, GameMenu stays visible
        └── onStart → navigate to GameScreen
```

### What SDK does NOT define

- `GameScreen` — each game implements its own gameplay screen with unique flow
- Any runtime logic, helpers, or utilities
- Any UI components

---

## Package Config

`package.json` must include exports so TypeScript can resolve types:

```json
{
  "name": "@party/game-sdk",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "lint": "eslint ."
  }
}
```

---

## File Structure

```
packages/game-sdk/
├── src/
│   ├── types/
│   │   ├── GameConfig.ts       ← GameConfig type
│   │   ├── GameModule.ts       ← GameModule, GameConfigModalProps, GameResultsProps
│   │   └── index.ts            ← re-exports all types
│   └── index.ts                ← main entry point
├── tsconfig.json
└── package.json
```

---

## Usage

### Hub imports GameConfig

```typescript
// apps/hub/src/data/games.ts
import type { GameConfig } from '@party/game-sdk'
import { config as charades } from '@party/charades'

export const games: GameConfig[] = [charades]
```

### Game module implements GameModule

```typescript
// packages/games/charades/src/index.ts
import type { GameModule } from '@party/game-sdk'
import { config } from './config'
import { GameMenu } from './components/GameMenu'
import { GameConfigModal } from './components/GameConfigModal'
import { GameResults } from './components/GameResults'

export const charades: GameModule = { config, GameMenu, GameConfigModal, GameResults }
export { config }
```

---

## Out of Scope

- Game state management (per-game concern)
- Multiplayer types (Phase 4)
- Auth/user types (Phase 5)
- Payment/unlock logic (Phase 7)
