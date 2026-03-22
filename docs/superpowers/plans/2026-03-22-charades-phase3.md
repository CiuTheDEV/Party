# Kalambury Phase 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zbudować kompletny moduł Kalambury — konfiguracja gry z parowaniem telefonu przez Partykit, rozgrywka z hasłem na telefonie prezentera, ekran wyników.

**Architecture:** Hub (Next.js) obsługuje wszystkie trasy `/games/charades/*`. Partykit server zarządza stanem rooma i synchronizuje hosta z telefonem prezentera. Telefon parowany raz przez QR przy konfiguracji, pozostaje połączony przez całą grę. Hasło widoczne wyłącznie na telefonie.

**Tech Stack:** Next.js 16 (App Router), Partykit, TypeScript, CSS Modules. Bez testów jednostkowych (brak setupu testowego w projekcie) — weryfikacja ręczna przez `npm run build` + `npm run dev`.

---

## Mapa plików

### Nowe pliki — content
```
content/charades/animals.ts         — kategoria Zwierzęta (≥30 słów)
content/charades/movies.ts          — kategoria Filmy (≥30 słów)
content/charades/sport.ts           — kategoria Sport (≥30 słów)
content/charades/index.ts           — eksport wszystkich kategorii
```

### Nowe pliki — Partykit server
```
packages/partykit/charades/server.ts  — Partykit room server dla Kalambury
packages/partykit/package.json        — konfiguracja paczki Partykit
partykit.json                         — konfiguracja Partykit (root projektu)
```

### Modyfikacje — game-sdk
```
packages/game-sdk/src/types/GameConfig.ts    — dodaj pola: modes, categories
packages/game-sdk/src/types/GameModule.ts    — zastąp GameConfigModal → GameSetup
packages/game-sdk/src/index.ts               — zaktualizuj eksporty
```

### Modyfikacje — @party/charades package
```
packages/games/charades/src/config.ts        — dodaj modes, categories do config
packages/games/charades/src/index.ts         — zaktualizuj eksporty
```

### Nowe pliki — trasy Next.js w hubie
```
apps/hub/src/app/games/charades/page.tsx                    — GameMenu
apps/hub/src/app/games/charades/page.module.css
apps/hub/src/app/games/charades/config/page.tsx             — SetupPage
apps/hub/src/app/games/charades/config/page.module.css
apps/hub/src/app/games/charades/play/page.tsx               — GameScreen host
apps/hub/src/app/games/charades/play/page.module.css
apps/hub/src/app/games/charades/present/page.tsx            — GameScreen prezenter
apps/hub/src/app/games/charades/present/page.module.css
apps/hub/src/app/games/charades/results/page.tsx            — GameResults
apps/hub/src/app/games/charades/results/page.module.css
```

### Nowe pliki — komponenty UI (charades-specific)
```
apps/hub/src/components/charades/PlayerForm/PlayerForm.tsx
apps/hub/src/components/charades/PlayerForm/PlayerForm.module.css
apps/hub/src/components/charades/PlayerList/PlayerList.tsx
apps/hub/src/components/charades/PlayerList/PlayerList.module.css
apps/hub/src/components/charades/CategoryPicker/CategoryPicker.tsx
apps/hub/src/components/charades/CategoryPicker/CategoryPicker.module.css
apps/hub/src/components/charades/SettingsModal/SettingsModal.tsx
apps/hub/src/components/charades/SettingsModal/SettingsModal.module.css
apps/hub/src/components/charades/QRPairing/QRPairing.tsx
apps/hub/src/components/charades/QRPairing/QRPairing.module.css
apps/hub/src/components/charades/Podium/Podium.tsx
apps/hub/src/components/charades/Podium/Podium.module.css
```

### Nowe pliki — logika gry (hooks)
```
apps/hub/src/hooks/charades/useGameState.ts   — stan gry po stronie hosta
apps/hub/src/hooks/charades/usePresenter.ts   — stan po stronie prezentera
apps/hub/src/hooks/charades/useWordPool.ts    — pula słów, losowanie, wyczerpanie
```

### Nowe pliki — typy Partykit
```
apps/hub/src/types/charades-events.ts         — typy eventów Partykit (shared)
```

---

## Task 1: Dane — kategorie słów

**Files:**
- Create: `content/charades/animals.ts`
- Create: `content/charades/movies.ts`
- Create: `content/charades/sport.ts`
- Create: `content/charades/index.ts`

- [ ] Utwórz `content/charades/animals.ts`:

```ts
import type { WordCategory } from './index'

export const animals: WordCategory = {
  id: 'animals',
  name: 'Zwierzęta',
  words: [
    'słoń', 'żyrafa', 'pingwin', 'krokodyl', 'małpa', 'niedźwiedź',
    'kangur', 'delfin', 'rekin', 'orzeł', 'sowa', 'papuga',
    'wąż', 'żółw', 'lis', 'wilk', 'koń', 'krowa',
    'świnia', 'owca', 'koza', 'kogut', 'kaczka', 'gęś',
    'kot', 'pies', 'królik', 'chomik', 'mysz', 'szczur',
    'żaba', 'ślimak', 'motyl', 'pszczoła', 'mrówka',
  ],
}
```

- [ ] Utwórz `content/charades/movies.ts`:

```ts
import type { WordCategory } from './index'

export const movies: WordCategory = {
  id: 'movies',
  name: 'Filmy',
  words: [
    'Titanic', 'Matrix', 'Avatar', 'Inception', 'Interstellar',
    'Gladiator', 'Braveheart', 'Rocky', 'Rambo', 'Terminator',
    'Batman', 'Superman', 'Spider-Man', 'Iron Man', 'Thor',
    'Shrek', 'Lew Król', 'Alladyn', 'Kopciuszek', 'Pinokio',
    'Harry Potter', 'Hobbit', 'Władca Pierścieni', 'Narnia',
    'Shining', 'Mumia', 'Dracula', 'Frankenstein',
    'Titanic', 'Pearl Harbor', 'Braveheart', 'Gladiator',
    'Forrest Gump', 'Cast Away', 'Szósty zmysł',
  ],
}
```

- [ ] Utwórz `content/charades/sport.ts`:

```ts
import type { WordCategory } from './index'

export const sport: WordCategory = {
  id: 'sport',
  name: 'Sport',
  words: [
    'piłka nożna', 'koszykówka', 'siatkówka', 'tenis', 'golf',
    'pływanie', 'boks', 'judo', 'karate', 'zapasy',
    'lekkoatletyka', 'maraton', 'sprint', 'skok wzwyż', 'rzut dyskiem',
    'kolarstwo', 'narciarstwo', 'snowboard', 'łyżwiarstwo', 'curling',
    'żeglarstwo', 'kajakarstwo', 'wioślarstwo', 'nurkowanie', 'surfing',
    'wspinaczka', 'biathlon', 'triathlon', 'rugby', 'baseball',
    'hokej', 'łucznictwo', 'szermierka', 'jeździectwo',
  ],
}
```

- [ ] Utwórz `content/charades/index.ts`:

```ts
export type WordCategory = {
  id: string
  name: string
  words: string[]
}

export { animals } from './animals'
export { movies } from './movies'
export { sport } from './sport'

import { animals } from './animals'
import { movies } from './movies'
import { sport } from './sport'

export const allCategories: WordCategory[] = [animals, movies, sport]
```

- [ ] Zweryfikuj build:
```bash
cd C:\Users\Mateo\Desktop\Party && npx tsc --noEmit -p apps/hub/tsconfig.json
```

- [ ] Commit:
```bash
git add content/
git commit -m "feat: add charades word categories — animals, movies, sport"
```

---

## Task 2: Typy eventów Partykit + rozszerzenie game-sdk

**Files:**
- Create: `apps/hub/src/types/charades-events.ts`
- Modify: `packages/game-sdk/src/types/GameConfig.ts`
- Modify: `packages/game-sdk/src/types/GameModule.ts`
- Modify: `packages/game-sdk/src/index.ts`
- Modify: `packages/games/charades/src/config.ts`

- [ ] Utwórz `apps/hub/src/types/charades-events.ts`:

```ts
// Eventy wysyłane przez HOSTA do prezentera
export type HostEvent =
  | { type: 'TURN_START'; turnId: string; word: string; category: string; presenterName: string; timerSeconds: number }
  | { type: 'TIMER_TICK'; turnId: string; remaining: number }
  | { type: 'TURN_END'; turnId: string; reason: 'timeout' | 'verdict' }
  | { type: 'BETWEEN_TURNS'; nextPresenterName: string; nextPresenterAvatar: string }
  | { type: 'GAME_END' }
  | { type: 'GAME_RESET' }

// Eventy wysyłane przez TELEFON PREZENTERA do hosta
export type PresenterEvent =
  | { type: 'PRESENTER_READY'; turnId: string }
  | { type: 'DEVICE_CONNECTED' }

export type CharadesEvent = HostEvent | PresenterEvent

// Stan rooma trzymany przez Partykit server
export type RoomState = {
  phase: 'waiting' | 'turn' | 'between' | 'ended'
  currentTurnId: string
  currentWord: string
  currentCategory: string
  currentPresenter: string
  timerRemaining: number
  nextPresenterName: string
  nextPresenterAvatar: string
}
```

- [ ] Zaktualizuj `packages/game-sdk/src/types/GameConfig.ts`:

```ts
export type GameConfig = {
  id: string
  name: string
  description: string
  icon: string
  minPlayers: number
  maxPlayers: number
  isPremium: boolean
  color: string
  href: string
  modes: string[]
  categories: string[]
}
```

- [ ] Zaktualizuj `packages/game-sdk/src/types/GameModule.ts`:

```ts
import type { ComponentType } from 'react'
import type { GameConfig } from './GameConfig'

export type GameResultsProps = {
  onPlayAgain: () => void
  onBackToMenu: () => void
}

export type GameModule = {
  config: GameConfig
  GameMenu: ComponentType
  GameSetup: ComponentType
  GameResults: ComponentType<GameResultsProps>
}
```

- [ ] Zaktualizuj `packages/game-sdk/src/index.ts`:

```ts
export type { GameConfig } from './types/GameConfig'
export type { GameModule, GameResultsProps } from './types/GameModule'
```

- [ ] Zaktualizuj `packages/games/charades/src/config.ts`:

```ts
import type { GameConfig } from '@party/game-sdk'

export const config: GameConfig = {
  id: 'charades',
  name: 'Kalambury',
  description: 'Pokazuj hasła bez słów — tylko gestem i mimiką.',
  icon: '🎭',
  minPlayers: 2,
  maxPlayers: 8,
  isPremium: false,
  color: '#7c3aed',
  href: '/games/charades',
  modes: ['classic'],
  categories: ['animals', 'movies', 'sport'],
}
```

- [ ] Zaktualizuj `packages/games/charades/src/index.ts`:

```ts
export { config } from './config'
```

- [ ] Zbuduj paczki:
```bash
cd C:\Users\Mateo\Desktop\Party && npm run build --workspace=packages/game-sdk && npm run build --workspace=packages/games/charades
```

- [ ] Zweryfikuj brak błędów TypeScript w hubie:
```bash
npx tsc --noEmit -p apps/hub/tsconfig.json
```

- [ ] Commit:
```bash
git add packages/game-sdk/ packages/games/charades/ apps/hub/src/types/
git commit -m "feat: extend game-sdk with modes/categories, add Partykit event types"
```

---

## Task 3: Partykit server

**Files:**
- Create: `packages/partykit/charades/server.ts`
- Create: `packages/partykit/package.json`
- Create: `partykit.json`

- [ ] Zainstaluj Partykit:
```bash
cd C:\Users\Mateo\Desktop\Party && npm install partykit partysocket --workspace=apps/hub
```

- [ ] Utwórz `packages/partykit/package.json`:

```json
{
  "name": "@party/partykit",
  "version": "0.0.1",
  "private": true,
  "main": "./charades/server.ts"
}
```

- [ ] Utwórz `packages/partykit/charades/types.ts` (kopia typów z hub — unikamy cross-workspace importu):

```ts
// Kopia apps/hub/src/types/charades-events.ts
// Partykit CLI bundluje server.ts niezależnie od npm workspace — importy relative są bezpieczne,
// ale imports z innych workspace'ów mogą nie być rozwiązane. Typy trzymamy lokalnie.

export type HostEvent =
  | { type: 'TURN_START'; turnId: string; word: string; category: string; presenterName: string; timerSeconds: number }
  | { type: 'TIMER_TICK'; turnId: string; remaining: number }
  | { type: 'TURN_END'; turnId: string; reason: 'timeout' | 'verdict' }
  | { type: 'BETWEEN_TURNS'; nextPresenterName: string; nextPresenterAvatar: string }
  | { type: 'GAME_END' }
  | { type: 'GAME_RESET' }

export type PresenterEvent =
  | { type: 'PRESENTER_READY'; turnId: string }
  | { type: 'DEVICE_CONNECTED' }

export type CharadesEvent = HostEvent | PresenterEvent

export type RoomState = {
  phase: 'waiting' | 'turn' | 'between' | 'ended'
  currentTurnId: string
  currentWord: string
  currentCategory: string
  currentPresenter: string
  timerRemaining: number
  nextPresenterName: string
  nextPresenterAvatar: string
}
```

- [ ] Utwórz `packages/partykit/charades/server.ts`:

```ts
import type * as Party from 'partykit/server'
// Typy skopiowane lokalnie żeby uniknąć cross-workspace relative import
// (Partykit CLI może nie rozwiązać ścieżek między workspace'ami)
import type { RoomState, CharadesEvent } from './types'

const initialState: RoomState = {
  phase: 'waiting',
  currentTurnId: '',
  currentWord: '',
  currentCategory: '',
  currentPresenter: '',
  timerRemaining: 0,
  nextPresenterName: '',
  nextPresenterAvatar: '',
}

export default class CharadesServer implements Party.Server {
  state: RoomState = { ...initialState }

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: 'ROOM_STATE', state: this.state }))
  }

  onMessage(message: string, sender: Party.Connection) {
    const event = JSON.parse(message) as CharadesEvent
    this.state = applyEvent(this.state, event)
    this.room.broadcast(message, [sender.id])
  }
}

function applyEvent(state: RoomState, event: CharadesEvent): RoomState {
  switch (event.type) {
    case 'TURN_START':
      return {
        ...state,
        phase: 'turn',
        currentTurnId: event.turnId,
        currentWord: event.word,
        currentCategory: event.category,
        currentPresenter: event.presenterName,
        timerRemaining: event.timerSeconds,
      }
    case 'TIMER_TICK':
      if (event.turnId !== state.currentTurnId) return state
      return { ...state, timerRemaining: event.remaining }
    case 'TURN_END':
      return { ...state, phase: 'between' }
    case 'BETWEEN_TURNS':
      return {
        ...state,
        phase: 'between',
        nextPresenterName: event.nextPresenterName,
        nextPresenterAvatar: event.nextPresenterAvatar,
      }
    case 'GAME_END':
      return { ...state, phase: 'ended' }
    case 'GAME_RESET':
      return { ...initialState }
    default:
      return state
  }
}
```

- [ ] Utwórz `partykit.json` w root projektu:

```json
{
  "name": "party-charades",
  "main": "packages/partykit/charades/server.ts",
  "compatibilityDate": "2024-01-01"
}
```

- [ ] Sprawdź czy Partykit się uruchamia (dev):
```bash
cd C:\Users\Mateo\Desktop\Party && npx partykit dev
```
Oczekiwane: serwer nasłuchuje na `localhost:1999`. Zatrzymaj Ctrl+C.

- [ ] Commit:
```bash
git add packages/partykit/ partykit.json package.json
git commit -m "feat: add Partykit server for charades room state"
```

---

## Task 4: Hook useWordPool

**Files:**
- Create: `apps/hub/src/hooks/charades/useWordPool.ts`

- [ ] Utwórz `apps/hub/src/hooks/charades/useWordPool.ts`:

```ts
import { useState, useCallback } from 'react'
import type { WordCategory } from '../../../../content/charades/index'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPool(categories: WordCategory[]): string[] {
  const words = categories.flatMap((c) => c.words)
  return shuffle(words)
}

export function useWordPool(categories: WordCategory[]) {
  const [pool, setPool] = useState<string[]>(() => buildPool(categories))
  const [index, setIndex] = useState(0)

  const nextWord = useCallback((): string => {
    if (index >= pool.length) {
      // Wyczerpano pulę — nowa przetasowana pula
      const newPool = buildPool(categories)
      setPool(newPool)
      setIndex(1)
      return newPool[0]
    }
    const word = pool[index]
    setIndex((i) => i + 1)
    return word
  }, [pool, index, categories])

  const reset = useCallback(() => {
    setPool(buildPool(categories))
    setIndex(0)
  }, [categories])

  return { nextWord, reset }
}
```

- [ ] Zweryfikuj TypeScript:
```bash
cd C:\Users\Mateo\Desktop\Party && npx tsc --noEmit -p apps/hub/tsconfig.json
```

- [ ] Commit:
```bash
git add apps/hub/src/hooks/charades/useWordPool.ts
git commit -m "feat: add useWordPool hook with pool exhaustion handling"
```

---

## Task 5: Hook useGameState (host)

**Files:**
- Create: `apps/hub/src/hooks/charades/useGameState.ts`

Hook zarządza całym stanem gry po stronie hosta: kolejność graczy, punkty, rundy, wysyłanie eventów przez Partykit.

- [ ] Utwórz `apps/hub/src/hooks/charades/useGameState.ts`:

```ts
import { useState, useRef, useCallback, useEffect } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, PresenterEvent } from '../../types/charades-events'

export type Player = {
  name: string
  avatar: string
  gender: 'on' | 'ona' | 'none'
  score: number
}

export type GameSettings = {
  rounds: number
  timerSeconds: number
}

type GamePhase =
  | 'idle'           // przed wysłaniem hasła
  | 'waiting-ready'  // czekanie na PRESENTER_READY
  | 'timer-running'  // timer odlicza
  | 'verdict'        // czas minął, czekamy na werdykt
  | 'between'        // między turami

type GameState = {
  phase: GamePhase
  players: Player[]
  order: number[]       // indeksy graczy w kolejności prezentowania
  currentOrderIdx: number
  currentRound: number
  totalRounds: number
  timerRemaining: number
  currentWord: string
  currentCategory: string
  isDeviceConnected: boolean
}

export function useGameState(
  roomId: string,
  players: Player[],
  settings: GameSettings,
  getNextWord: () => { word: string; category: string },
) {
  const [state, setState] = useState<GameState>({
    phase: 'idle',
    players: players.map((p) => ({ ...p, score: 0 })),
    order: shuffle(players.map((_, i) => i)),
    currentOrderIdx: 0,
    currentRound: 1,
    totalRounds: settings.rounds,
    timerRemaining: settings.timerSeconds,
    currentWord: '',
    currentCategory: '',
    isDeviceConnected: false,
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentTurnIdRef = useRef('')

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999',
    room: roomId,
    onMessage(event) {
      const msg = JSON.parse(event.data) as PresenterEvent | { type: 'ROOM_STATE' }
      if (msg.type === 'PRESENTER_READY') {
        if (msg.turnId !== currentTurnIdRef.current) return
        startTimer()
      }
      if (msg.type === 'DEVICE_CONNECTED') {
        setState((s) => ({ ...s, isDeviceConnected: true }))
      }
    },
    onClose() {
      setState((s) => ({ ...s, isDeviceConnected: false }))
    },
  })

  function send(event: HostEvent) {
    socket.send(JSON.stringify(event))
  }

  function startTimer() {
    setState((s) => ({ ...s, phase: 'timer-running' }))
    let remaining = settings.timerSeconds
    timerRef.current = setInterval(() => {
      remaining -= 1
      send({ type: 'TIMER_TICK', turnId: currentTurnIdRef.current, remaining })
      setState((s) => ({ ...s, timerRemaining: remaining }))
      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        setState((s) => ({ ...s, phase: 'verdict' }))
        send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'timeout' })
      }
    }, 1000)
  }

  const sendWord = useCallback(() => {
    const { word, category } = getNextWord()
    const turnId = crypto.randomUUID()
    currentTurnIdRef.current = turnId
    const presenterIdx = state.order[state.currentOrderIdx]
    const presenter = state.players[presenterIdx]
    setState((s) => ({
      ...s,
      phase: 'waiting-ready',
      currentWord: word,
      currentCategory: category,
      timerRemaining: settings.timerSeconds,
    }))
    send({
      type: 'TURN_START',
      turnId,
      word,
      category,
      presenterName: presenter.name,
      timerSeconds: settings.timerSeconds,
    })
  }, [state, settings, getNextWord])

  const giveVerdict = useCallback((correct: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current)
    send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'verdict' })

    setState((s) => {
      const presenterIdx = s.order[s.currentOrderIdx]
      const updatedPlayers = s.players.map((p, i) =>
        i === presenterIdx && correct ? { ...p, score: p.score + 1 } : p,
      )
      const isLastInRound = s.currentOrderIdx === s.order.length - 1
      const isLastRound = s.currentRound === s.totalRounds && isLastInRound
      // Oblicz nextOrderIdx PRZED aktualizacją stanu
      const nextOrderIdx = isLastInRound ? 0 : s.currentOrderIdx + 1
      const nextRound = isLastInRound ? s.currentRound + 1 : s.currentRound
      // nextPresenter oparty na nextOrderIdx — nie na currentOrderIdx
      const nextPresenterIdx = s.order[nextOrderIdx]
      const nextPresenter = updatedPlayers[nextPresenterIdx]

      if (!isLastRound) {
        send({
          type: 'BETWEEN_TURNS',
          nextPresenterName: nextPresenter.name,
          nextPresenterAvatar: nextPresenter.avatar,
        })
      } else {
        send({ type: 'GAME_END' })
      }

      return {
        ...s,
        players: updatedPlayers,
        // phase 'idle' gdy koniec gry (komponent /play wykryje isGameOver i przekieruje)
        phase: isLastRound ? 'idle' : 'between',
        currentOrderIdx: nextOrderIdx,
        currentRound: nextRound,
      }
    })
  }, [])

  const isGameOver = state.currentRound > state.totalRounds

  return { state, sendWord, giveVerdict, isGameOver }
}

function shuffle(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
```

- [ ] Zweryfikuj TypeScript:
```bash
npx tsc --noEmit -p apps/hub/tsconfig.json
```

- [ ] Commit:
```bash
git add apps/hub/src/hooks/charades/useGameState.ts
git commit -m "feat: add useGameState hook — host game loop with Partykit"
```

---

## Task 6: Hook usePresenter (telefon)

**Files:**
- Create: `apps/hub/src/hooks/charades/usePresenter.ts`

- [ ] Utwórz `apps/hub/src/hooks/charades/usePresenter.ts`:

```ts
import { useState, useCallback } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, PresenterEvent } from '../../types/charades-events'

type PresenterPhase = 'your-turn' | 'timer-running' | 'timeout' | 'between' | 'ended'

type PresenterState = {
  phase: PresenterPhase
  currentTurnId: string
  word: string
  category: string
  presenterName: string
  timerRemaining: number
  nextPresenterName: string
  nextPresenterAvatar: string
}

export function usePresenter(roomId: string) {
  const [state, setState] = useState<PresenterState>({
    phase: 'your-turn',
    currentTurnId: '',
    word: '',
    category: '',
    presenterName: '',
    timerRemaining: 0,
    nextPresenterName: '',
    nextPresenterAvatar: '',
  })

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999',
    room: roomId,
    onOpen() {
      const event: PresenterEvent = { type: 'DEVICE_CONNECTED' }
      socket.send(JSON.stringify(event))
    },
    onMessage(event) {
      const msg = JSON.parse(event.data) as HostEvent | { type: 'ROOM_STATE'; state: PresenterState }
      if (msg.type === 'ROOM_STATE') return // handled by initial load
      handleHostEvent(msg as HostEvent)
    },
  })

  function handleHostEvent(event: HostEvent) {
    switch (event.type) {
      case 'TURN_START':
        setState((s) => ({
          ...s,
          phase: 'your-turn',
          currentTurnId: event.turnId,
          word: event.word,
          category: event.category,
          presenterName: event.presenterName,
          timerRemaining: event.timerSeconds,
        }))
        break
      case 'TIMER_TICK':
        setState((s) => {
          if (event.turnId !== s.currentTurnId) return s
          return { ...s, phase: 'timer-running', timerRemaining: event.remaining }
        })
        break
      case 'TURN_END':
        setState((s) => ({ ...s, phase: 'timeout', word: '' }))
        break
      case 'BETWEEN_TURNS':
        setState((s) => ({
          ...s,
          phase: 'between',
          nextPresenterName: event.nextPresenterName,
          nextPresenterAvatar: event.nextPresenterAvatar,
        }))
        break
      case 'GAME_END':
      case 'GAME_RESET':
        setState((s) => ({ ...s, phase: event.type === 'GAME_END' ? 'ended' : 'your-turn', word: '' }))
        break
    }
  }

  const confirmReady = useCallback(() => {
    const event: PresenterEvent = { type: 'PRESENTER_READY', turnId: state.currentTurnId }
    socket.send(JSON.stringify(event))
    setState((s) => ({ ...s, phase: 'timer-running' }))
  }, [state.currentTurnId, socket])

  return { state, confirmReady }
}
```

- [ ] Zweryfikuj TypeScript:
```bash
npx tsc --noEmit -p apps/hub/tsconfig.json
```

- [ ] Commit:
```bash
git add apps/hub/src/hooks/charades/usePresenter.ts
git commit -m "feat: add usePresenter hook — presenter device Partykit integration"
```

---

## Task 7: Komponenty UI — PlayerForm i PlayerList

**Files:**
- Create: `apps/hub/src/components/charades/PlayerForm/PlayerForm.tsx`
- Create: `apps/hub/src/components/charades/PlayerForm/PlayerForm.module.css`
- Create: `apps/hub/src/components/charades/PlayerList/PlayerList.tsx`
- Create: `apps/hub/src/components/charades/PlayerList/PlayerList.module.css`

- [ ] Utwórz `apps/hub/src/components/charades/PlayerForm/PlayerForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Player } from '../../../hooks/charades/useGameState'
import styles from './PlayerForm.module.css'

const AVATARS = ['🎭', '🎪', '🎨', '🎬', '🎤', '🎸', '🎯', '🎲', '🏆', '⭐', '🌟', '🔥']

type Props = {
  onAdd: (player: Omit<Player, 'score'>) => void
}

export function PlayerForm({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [gender, setGender] = useState<Player['gender']>('none')
  const [open, setOpen] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), avatar, gender })
    setName('')
    setAvatar(AVATARS[0])
    setGender('none')
    setOpen(false)
  }

  if (!open) {
    return (
      <button className={styles.addBtn} onClick={() => setOpen(true)}>
        + Dodaj gracza
      </button>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Nazwa gracza"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        maxLength={20}
      />
      <div className={styles.avatarPicker}>
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            className={`${styles.avatarBtn} ${a === avatar ? styles.selected : ''}`}
            onClick={() => setAvatar(a)}
          >
            {a}
          </button>
        ))}
      </div>
      <div className={styles.genderRow}>
        {(['on', 'ona', 'none'] as const).map((g) => (
          <button
            key={g}
            type="button"
            className={`${styles.genderBtn} ${g === gender ? styles.selected : ''}`}
            onClick={() => setGender(g)}
          >
            {g === 'none' ? '—' : g}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={() => setOpen(false)}>
          Anuluj
        </button>
        <button type="submit" className={styles.submitBtn} disabled={!name.trim()}>
          Dodaj
        </button>
      </div>
    </form>
  )
}
```

- [ ] Utwórz `apps/hub/src/components/charades/PlayerForm/PlayerForm.module.css`:

```css
.addBtn {
  width: 100%;
  padding: 12px;
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.addBtn:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.input {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 15px;
}

.input:focus {
  outline: 2px solid var(--color-focus-outline);
}

.avatarPicker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.avatarBtn {
  width: 36px;
  height: 36px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: var(--color-surface);
  font-size: 18px;
  cursor: pointer;
}

.avatarBtn.selected {
  border-color: #7c3aed;
}

.genderRow {
  display: flex;
  gap: 8px;
}

.genderBtn {
  flex: 1;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 13px;
}

.genderBtn.selected {
  border-color: #7c3aed;
  color: var(--color-text);
  background: rgba(124, 58, 237, 0.15);
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.cancelBtn {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.submitBtn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #7c3aed;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.submitBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

- [ ] Utwórz `apps/hub/src/components/charades/PlayerList/PlayerList.tsx`:

```tsx
import type { Player } from '../../../hooks/charades/useGameState'
import styles from './PlayerList.module.css'

type Props = {
  players: Omit<Player, 'score'>[]
  onRemove: (index: number) => void
}

export function PlayerList({ players, onRemove }: Props) {
  if (players.length === 0) return null

  return (
    <ul className={styles.list}>
      {players.map((p, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.avatar}>{p.avatar}</span>
          <span className={styles.name}>{p.name}</span>
          {p.gender !== 'none' && <span className={styles.gender}>{p.gender}</span>}
          <button className={styles.remove} onClick={() => onRemove(i)} aria-label="Usuń gracza">
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] Utwórz `apps/hub/src/components/charades/PlayerList/PlayerList.module.css`:

```css
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.avatar {
  font-size: 22px;
}

.name {
  flex: 1;
  font-size: 15px;
}

.gender {
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.remove {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
}

.remove:hover {
  color: #ef4444;
}
```

- [ ] Commit:
```bash
git add apps/hub/src/components/charades/
git commit -m "feat: add PlayerForm and PlayerList components"
```

---

## Task 8: Komponenty UI — CategoryPicker i SettingsModal

**Files:**
- Create: `apps/hub/src/components/charades/CategoryPicker/CategoryPicker.tsx`
- Create: `apps/hub/src/components/charades/CategoryPicker/CategoryPicker.module.css`
- Create: `apps/hub/src/components/charades/SettingsModal/SettingsModal.tsx`
- Create: `apps/hub/src/components/charades/SettingsModal/SettingsModal.module.css`

- [ ] Utwórz `apps/hub/src/components/charades/CategoryPicker/CategoryPicker.tsx`:

```tsx
'use client'

import type { WordCategory } from '../../../../../content/charades/index'
import styles from './CategoryPicker.module.css'

type Props = {
  categories: WordCategory[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function CategoryPicker({ categories, selected, onChange }: Props) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    )
  }

  return (
    <div className={styles.grid}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`${styles.card} ${selected.includes(cat.id) ? styles.selected : ''}`}
          onClick={() => toggle(cat.id)}
        >
          <span className={styles.name}>{cat.name}</span>
          <span className={styles.count}>{cat.words.length} słów</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] Utwórz `apps/hub/src/components/charades/CategoryPicker/CategoryPicker.module.css`:

```css
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card {
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  transition: border-color 0.2s, background 0.2s;
  min-width: 120px;
}

.card:hover {
  border-color: var(--color-border-hover);
}

.card.selected {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.12);
}

.name {
  font-size: 15px;
  font-weight: 600;
}

.count {
  font-size: 12px;
  color: var(--color-text-muted);
}
```

- [ ] Utwórz `apps/hub/src/components/charades/SettingsModal/SettingsModal.tsx`:

```tsx
'use client'

import type { GameSettings } from '../../../hooks/charades/useGameState'
import styles from './SettingsModal.module.css'

type Props = {
  settings: GameSettings
  onChange: (s: GameSettings) => void
  onClose: () => void
}

export function SettingsModal({ settings, onChange, onClose }: Props) {
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Ustawienia trybu</h2>
          <button className={styles.close} onClick={onClose} aria-label="Zamknij">✕</button>
        </div>

        <label className={styles.field}>
          <span>Liczba rund: <strong>{settings.rounds}</strong></span>
          <input
            type="range"
            min={1}
            max={10}
            value={settings.rounds}
            onChange={(e) => onChange({ ...settings, rounds: Number(e.target.value) })}
          />
        </label>

        <label className={styles.field}>
          <span>Czas na hasło: <strong>{settings.timerSeconds}s</strong></span>
          <input
            type="range"
            min={30}
            max={120}
            step={10}
            value={settings.timerSeconds}
            onChange={(e) => onChange({ ...settings, timerSeconds: Number(e.target.value) })}
          />
        </label>
      </div>
    </div>
  )
}
```

- [ ] Utwórz `apps/hub/src/components/charades/SettingsModal/SettingsModal.module.css`:

```css
.backdrop {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  width: min(400px, 90vw);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  font-size: 18px;
}

.close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 18px;
  cursor: pointer;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.field input[type='range'] {
  width: 100%;
  accent-color: #7c3aed;
}
```

- [ ] Commit:
```bash
git add apps/hub/src/components/charades/CategoryPicker/ apps/hub/src/components/charades/SettingsModal/
git commit -m "feat: add CategoryPicker and SettingsModal components"
```

---

## Task 9: Komponent QRPairing

**Files:**
- Create: `apps/hub/src/components/charades/QRPairing/QRPairing.tsx`
- Create: `apps/hub/src/components/charades/QRPairing/QRPairing.module.css`

- [ ] Zainstaluj bibliotekę QR:
```bash
cd C:\Users\Mateo\Desktop\Party && npm install qrcode.react --workspace=apps/hub
npm install --save-dev @types/qrcode.react --workspace=apps/hub
```

> Uwaga: `qrcode.react` v3+ eksportuje `QRCodeSVG` i `QRCodeCanvas`. Używamy `QRCodeSVG`.

- [ ] Utwórz `apps/hub/src/components/charades/QRPairing/QRPairing.tsx`:

```tsx
'use client'

import { QRCodeSVG } from 'qrcode.react'
import styles from './QRPairing.module.css'

type Props = {
  roomId: string
  isConnected: boolean
  onDisconnect: () => void
}

export function QRPairing({ roomId, isConnected, onDisconnect }: Props) {
  const presenterUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/games/charades/present?room=${roomId}`
    : ''

  if (isConnected) {
    return (
      <div className={styles.connected}>
        <span className={styles.icon}>📱</span>
        <span>Urządzenie połączone</span>
        <button className={styles.disconnectBtn} onClick={onDisconnect}>
          Rozłącz
        </button>
      </div>
    )
  }

  return (
    <div className={styles.qrWrapper}>
      <p className={styles.hint}>Zeskanuj QR kodem telefon prezentera</p>
      {presenterUrl && (
        <QRCodeSVG
          value={presenterUrl}
          size={180}
          bgColor="transparent"
          fgColor="#f0f0f0"
        />
      )}
      <p className={styles.url}>{presenterUrl}</p>
    </div>
  )
}
```

- [ ] Utwórz `apps/hub/src/components/charades/QRPairing/QRPairing.module.css`:

```css
.qrWrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
}

.hint {
  font-size: 14px;
  color: var(--color-text-muted);
}

.url {
  font-size: 11px;
  color: var(--color-text-muted);
  word-break: break-all;
  text-align: center;
}

.connected {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border: 2px solid #22c55e;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.08);
  font-size: 15px;
}

.icon {
  font-size: 20px;
}

.disconnectBtn {
  margin-left: auto;
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
}
```

- [ ] Commit:
```bash
git add apps/hub/src/components/charades/QRPairing/
git commit -m "feat: add QRPairing component with qrcode.react"
```

---

## Task 10: Komponent Podium

**Files:**
- Create: `apps/hub/src/components/charades/Podium/Podium.tsx`
- Create: `apps/hub/src/components/charades/Podium/Podium.module.css`

- [ ] Utwórz `apps/hub/src/components/charades/Podium/Podium.tsx`:

```tsx
import type { Player } from '../../../hooks/charades/useGameState'
import styles from './Podium.module.css'

type Props = {
  players: Player[]
}

export function Podium({ players }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <div className={styles.wrapper}>
      <div className={styles.podium}>
        {top3[1] && <PodiumSlot player={top3[1]} place={2} />}
        {top3[0] && <PodiumSlot player={top3[0]} place={1} />}
        {top3[2] && <PodiumSlot player={top3[2]} place={3} />}
      </div>
      {rest.length > 0 && (
        <ul className={styles.rest}>
          {rest.map((p, i) => (
            <li key={p.name} className={styles.restItem}>
              <span className={styles.place}>{i + 4}.</span>
              <span className={styles.avatar}>{p.avatar}</span>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.score}>{p.score} pkt</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PodiumSlot({ player, place }: { player: Player; place: number }) {
  const heights = { 1: 120, 2: 90, 3: 70 }
  return (
    <div className={`${styles.slot} ${styles[`place${place}`]}`}>
      <div className={styles.slotAvatar}>{player.avatar}</div>
      <div className={styles.slotName}>{player.name}</div>
      <div className={styles.slotScore}>{player.score} pkt</div>
      <div className={styles.bar} style={{ height: heights[place as 1 | 2 | 3] }}>
        {place}
      </div>
    </div>
  )
}
```

- [ ] Utwórz `apps/hub/src/components/charades/Podium/Podium.module.css`:

```css
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.podium {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100px;
}

.slotAvatar {
  font-size: 32px;
}

.slotName {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.slotScore {
  font-size: 12px;
  color: var(--color-text-muted);
}

.bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px 6px 0 0;
  font-size: 20px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
}

.place1 .bar { background: #7c3aed; }
.place2 .bar { background: rgba(124,58,237,0.5); }
.place3 .bar { background: rgba(124,58,237,0.3); }

.rest {
  list-style: none;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.restItem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.place { color: var(--color-text-muted); font-size: 13px; width: 20px; }
.avatar { font-size: 20px; }
.name { flex: 1; font-size: 14px; }
.score { font-size: 13px; color: var(--color-text-muted); }
```

- [ ] Commit:
```bash
git add apps/hub/src/components/charades/Podium/
git commit -m "feat: add Podium component for results screen"
```

---

## Task 11: GameMenu strona

**Files:**
- Create: `apps/hub/src/app/games/charades/page.tsx`
- Create: `apps/hub/src/app/games/charades/page.module.css`

- [ ] Utwórz `apps/hub/src/app/games/charades/page.tsx`:

```tsx
import Link from 'next/link'
import styles from './page.module.css'

export default function CharadesMenuPage() {
  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.icon}>🎭</span>
        <h1 className={styles.title}>Kalambury</h1>
        <p className={styles.description}>
          Pokazuj hasła bez słów — tylko gestem i mimiką.
        </p>
      </div>

      <div className={styles.modeCard}>
        <h2 className={styles.modeName}>Tryb Klasyczny</h2>
        <p className={styles.modeDesc}>
          Każdy gracz prezentuje hasło po kolei. Gra do wybranej liczby rund.
          Potrzebujesz drugiego urządzenia dla prezentera.
        </p>
        <ul className={styles.details}>
          <li>2–8 graczy</li>
          <li>Jedno urządzenie dla prezentera (telefon)</li>
          <li>Wybierasz kategorie słów i liczbę rund</li>
        </ul>
        <Link href="/games/charades/config" className={styles.playBtn}>
          Zagraj
        </Link>
      </div>

      <Link href="/" className={styles.backLink}>
        ← Wróć do lobby
      </Link>
    </main>
  )
}
```

- [ ] Utwórz `apps/hub/src/app/games/charades/page.module.css`:

```css
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 24px;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.icon {
  font-size: 64px;
}

.title {
  font-size: 36px;
  font-weight: 700;
}

.description {
  font-size: 16px;
  color: var(--color-text-muted);
  max-width: 400px;
}

.modeCard {
  width: min(480px, 100%);
  padding: 28px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modeName {
  font-size: 20px;
  font-weight: 700;
}

.modeDesc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.details {
  list-style: disc;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.playBtn {
  display: block;
  text-align: center;
  padding: 14px;
  background: #7c3aed;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border-radius: 10px;
  transition: opacity 0.2s;
}

.playBtn:hover {
  opacity: 0.85;
}

.backLink {
  font-size: 14px;
  color: var(--color-text-muted);
}

.backLink:hover {
  color: var(--color-text);
}
```

- [ ] Sprawdź czy strona się renderuje:
```bash
cd C:\Users\Mateo\Desktop\Party && npm run dev
```
Otwórz `http://localhost:3000/games/charades`. Zatrzymaj Ctrl+C.

- [ ] Commit:
```bash
git add apps/hub/src/app/games/charades/
git commit -m "feat: add Charades GameMenu page"
```

---

## Task 12: SetupPage — strona konfiguracji

**Files:**
- Create: `apps/hub/src/app/games/charades/config/page.tsx`
- Create: `apps/hub/src/app/games/charades/config/page.module.css`

- [ ] Utwórz `apps/hub/src/app/games/charades/config/page.tsx`:

```tsx
'use client'

import { useState, useId } from 'react'
import { useRouter } from 'next/navigation'
import { allCategories } from '../../../../../content/charades/index'
import { PlayerForm } from '../../../../components/charades/PlayerForm/PlayerForm'
import { PlayerList } from '../../../../components/charades/PlayerList/PlayerList'
import { CategoryPicker } from '../../../../components/charades/CategoryPicker/CategoryPicker'
import { SettingsModal } from '../../../../components/charades/SettingsModal/SettingsModal'
import { QRPairing } from '../../../../components/charades/QRPairing/QRPairing'
import type { Player, GameSettings } from '../../../../hooks/charades/useGameState'
import styles from './page.module.css'

export default function CharadesConfigPage() {
  const router = useRouter()
  const roomId = useId().replace(/:/g, '')

  const [players, setPlayers] = useState<Omit<Player, 'score'>[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [settings, setSettings] = useState<GameSettings>({ rounds: 3, timerSeconds: 60 })
  const [showSettings, setShowSettings] = useState(false)
  const [isDeviceConnected, setIsDeviceConnected] = useState(false)

  function addPlayer(p: Omit<Player, 'score'>) {
    setPlayers((prev) => [...prev, p])
  }

  function removePlayer(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index))
  }

  const canStart = players.length >= 2 && selectedCategories.length >= 1 && isDeviceConnected

  function handleStart() {
    if (!canStart) return
    // Przekaż konfigurację przez sessionStorage — /play ją odczyta
    sessionStorage.setItem(
      'charades:config',
      JSON.stringify({ players, selectedCategories, settings, roomId }),
    )
    router.push('/games/charades/play')
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Konfiguracja gry</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Gracze</h2>
        <PlayerList players={players} onRemove={removePlayer} />
        <PlayerForm onAdd={addPlayer} />
        {players.length < 2 && (
          <p className={styles.hint}>Dodaj co najmniej 2 graczy</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Talia słów</h2>
        <CategoryPicker
          categories={allCategories}
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
        {selectedCategories.length === 0 && (
          <p className={styles.hint}>Wybierz co najmniej 1 kategorię</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Urządzenie prezentera</h2>
        <QRPairing
          roomId={roomId}
          isConnected={isDeviceConnected}
          onDisconnect={() => setIsDeviceConnected(false)}
        />
        {/* Partykit connection status listener — usePresenter-like minimal hook */}
        <DeviceListener roomId={roomId} onConnect={() => setIsDeviceConnected(true)} />
      </section>

      <div className={styles.footer}>
        <button className={styles.settingsBtn} onClick={() => setShowSettings(true)}>
          Ustawienia trybu
        </button>
        <button
          className={styles.startBtn}
          disabled={!canStart}
          onClick={handleStart}
        >
          Rozpocznij grę
        </button>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  )
}

// DeviceListener importowany przez dynamic() z ssr:false — plik poniżej.
```

Utwórz `apps/hub/src/components/charades/DeviceListener.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import PartySocket from 'partysocket'

export default function DeviceListener({
  roomId,
  onConnect,
}: {
  roomId: string
  onConnect: () => void
}) {
  useEffect(() => {
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999'
    const ws = new PartySocket({ host, room: roomId })
    ws.addEventListener('message', (event: MessageEvent) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'DEVICE_CONNECTED') onConnect()
    })
    return () => ws.close()
  }, [roomId, onConnect])
  return null
}
```

Dodaj dynamic import na górze `config/page.tsx` (przed innymi importami):

```tsx
import dynamic from 'next/dynamic'
const DeviceListener = dynamic(
  () => import('../../../../components/charades/DeviceListener'),
  { ssr: false },
)
```

> `ssr: false` zapobiega crashowi WebSocket podczas server-side rendering.

- [ ] Utwórz `apps/hub/src/app/games/charades/config/page.module.css`:

```css
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.title {
  font-size: 24px;
  font-weight: 700;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sectionTitle {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 12px;
}

.hint {
  font-size: 13px;
  color: var(--color-text-muted);
}

.footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.settingsBtn {
  padding: 12px 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
}

.settingsBtn:hover {
  border-color: var(--color-border-hover);
}

.startBtn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.startBtn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
```

- [ ] Sprawdź build:
```bash
cd C:\Users\Mateo\Desktop\Party && npm run build --workspace=apps/hub
```

- [ ] Commit:
```bash
git add apps/hub/src/app/games/charades/config/
git commit -m "feat: add Charades SetupPage with player, category, QR pairing"
```

---

## Task 13: GameScreen — host (/play)

**Files:**
- Create: `apps/hub/src/app/games/charades/play/page.tsx`
- Create: `apps/hub/src/app/games/charades/play/page.module.css`

- [ ] Utwórz `apps/hub/src/app/games/charades/play/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { allCategories } from '../../../../../content/charades/index'
import { useWordPool } from '../../../../hooks/charades/useWordPool'
import { useGameState } from '../../../../hooks/charades/useGameState'
import type { Player, GameSettings } from '../../../../hooks/charades/useGameState'
import styles from './page.module.css'

type Config = {
  players: Omit<Player, 'score'>[]
  selectedCategories: string[]
  settings: GameSettings
  roomId: string
}

export default function CharadesPlayPage() {
  const router = useRouter()
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('charades:config')
    if (!raw) { router.replace('/games/charades/config'); return }
    setConfig(JSON.parse(raw))
  }, [router])

  if (!config) return null
  return <PlayScreen config={config} />
}

function PlayScreen({ config }: { config: Config }) {
  const router = useRouter()
  const cats = allCategories.filter((c) => config.selectedCategories.includes(c.id))
  const { nextWord, reset } = useWordPool(cats)

  const { state, sendWord, giveVerdict, isGameOver } = useGameState(
    config.roomId,
    config.players.map((p) => ({ ...p, score: 0 })),
    config.settings,
    () => {
      const pool = cats.flatMap((c) => c.words)
      const word = nextWord()
      const cat = cats.find((c) => c.words.includes(word))?.name ?? ''
      return { word, category: cat }
    },
  )

  useEffect(() => {
    if (isGameOver) {
      sessionStorage.setItem('charades:results', JSON.stringify(state.players))
      router.push('/games/charades/results')
    }
  }, [isGameOver, state.players, router])

  const presenterIdx = state.order[state.currentOrderIdx]
  const presenter = state.players[presenterIdx]
  const pronouns = { on: 'pokazuje on', ona: 'pokazuje ona', none: `pokazuje ${presenter?.name}` }
  const label = pronouns[presenter?.gender ?? 'none']

  return (
    <div className={styles.screen}>
      <header className={styles.topbar}>
        <span className={styles.gameName}>🎭 Kalambury</span>
        <span className={styles.round}>Runda {state.currentRound}/{state.totalRounds}</span>
        <div className={styles.scores}>
          {state.players.map((p) => (
            <span key={p.name} className={styles.score}>
              {p.avatar} {p.score}
            </span>
          ))}
        </div>
        <span className={styles.deviceStatus}>
          {state.isDeviceConnected ? '📱' : '📵'}
        </span>
      </header>

      <main className={styles.main}>
        <div className={styles.presenterInfo}>
          <span className={styles.presenterAvatar}>{presenter?.avatar}</span>
          <span className={styles.presenterName}>{presenter?.name}</span>
          <span className={styles.presenterLabel}>{label}</span>
        </div>

        {state.phase === 'idle' && (
          <button className={styles.primaryBtn} onClick={sendWord}>
            Wyślij hasło na telefon
          </button>
        )}

        {state.phase === 'waiting-ready' && (
          <p className={styles.waitingText}>⏳ Czekam aż prezenter kliknie „Gotowy"…</p>
        )}

        {state.phase === 'timer-running' && (
          <div className={styles.timer}>{state.timerRemaining}</div>
        )}

        {(state.phase === 'timer-running' || state.phase === 'verdict') && (
          <div className={styles.verdictBtns}>
            <button
              className={`${styles.verdictBtn} ${styles.correct}`}
              onClick={() => giveVerdict(true)}
            >
              Zgadnięto ✓
            </button>
            <button
              className={`${styles.verdictBtn} ${styles.wrong}`}
              onClick={() => giveVerdict(false)}
            >
              Nie zgadnięto ✗
            </button>
          </div>
        )}

        {state.phase === 'between' && (
          <p className={styles.betweenText}>Podaj telefon kolejnej osobie…</p>
        )}
      </main>
    </div>
  )
}
```

- [ ] Utwórz `apps/hub/src/app/games/charades/play/page.module.css`:

```css
.screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.gameName {
  font-weight: 700;
  font-size: 16px;
}

.round {
  font-size: 14px;
  color: var(--color-text-muted);
}

.scores {
  display: flex;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.score {
  font-size: 14px;
}

.deviceStatus {
  font-size: 20px;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 32px;
}

.presenterInfo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.presenterAvatar {
  font-size: 64px;
}

.presenterName {
  font-size: 28px;
  font-weight: 700;
}

.presenterLabel {
  font-size: 16px;
  color: var(--color-text-muted);
}

.timer {
  font-size: 96px;
  font-weight: 700;
  color: #7c3aed;
  font-variant-numeric: tabular-nums;
}

.waitingText,
.betweenText {
  font-size: 18px;
  color: var(--color-text-muted);
}

.primaryBtn {
  padding: 16px 32px;
  background: #7c3aed;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.verdictBtns {
  display: flex;
  gap: 16px;
}

.verdictBtn {
  padding: 20px 40px;
  font-size: 20px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.correct {
  background: #22c55e;
  color: #fff;
}

.wrong {
  background: #ef4444;
  color: #fff;
}
```

- [ ] Commit:
```bash
git add apps/hub/src/app/games/charades/play/
git commit -m "feat: add Charades host GameScreen (/play)"
```

---

## Task 14: GameScreen — prezenter (/present)

**Files:**
- Create: `apps/hub/src/app/games/charades/present/page.tsx`
- Create: `apps/hub/src/app/games/charades/present/page.module.css`

- [ ] Utwórz `apps/hub/src/app/games/charades/present/page.tsx`:

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { usePresenter } from '../../../../hooks/charades/usePresenter'
import styles from './page.module.css'

export default function PresentPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Łączenie…</div>}>
      <PresentScreen />
    </Suspense>
  )
}

function PresentScreen() {
  const params = useSearchParams()
  const roomId = params.get('room') ?? ''
  const { state, confirmReady } = usePresenter(roomId)

  if (!roomId) {
    return <div className={styles.error}>Brak kodu pokoju. Zeskanuj QR ponownie.</div>
  }

  return (
    <div className={styles.screen}>
      {state.phase === 'your-turn' && (
        <div className={styles.turnView}>
          <p className={styles.presenterLabel}>{state.presenterName}, Twoja tura!</p>
          <div className={styles.word}>{state.word || '…'}</div>
          <p className={styles.category}>{state.category}</p>
          <button className={styles.readyBtn} onClick={confirmReady} disabled={!state.word}>
            Gotowy
          </button>
        </div>
      )}

      {state.phase === 'timer-running' && (
        <div className={styles.timerView}>
          <div className={styles.word}>{state.word}</div>
          <p className={styles.category}>{state.category}</p>
          <div className={styles.timerBar}>
            <div
              className={styles.timerFill}
              style={{ width: `${(state.timerRemaining / 60) * 100}%` }}
            />
          </div>
          <span className={styles.timerCount}>{state.timerRemaining}s</span>
        </div>
      )}

      {state.phase === 'timeout' && (
        <div className={styles.timeoutView}>
          <span className={styles.timeoutIcon}>⏰</span>
          <p className={styles.timeoutText}>Koniec czasu!</p>
          <p className={styles.timeoutSub}>Czekaj na werdykt hosta…</p>
        </div>
      )}

      {state.phase === 'between' && (
        <div className={styles.betweenView}>
          <p className={styles.betweenLabel}>Za chwilę następna tura</p>
          <span className={styles.nextAvatar}>{state.nextPresenterAvatar}</span>
          <p className={styles.nextName}>{state.nextPresenterName}</p>
          <p className={styles.betweenHint}>Podaj telefon tej osobie</p>
        </div>
      )}

      {state.phase === 'ended' && (
        <div className={styles.endedView}>
          <span className={styles.endedIcon}>🎉</span>
          <p className={styles.endedText}>Gra zakończona!</p>
          <p className={styles.endedSub}>Możesz zamknąć tę kartę.</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] Utwórz `apps/hub/src/app/games/charades/present/page.module.css`:

```css
.screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0a;
  color: #f0f0f0;
  padding: 24px;
}

.loading,
.error {
  font-size: 16px;
  color: rgba(240,240,240,0.5);
  text-align: center;
}

/* Twoja tura */
.turnView {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  width: 100%;
}

.presenterLabel {
  font-size: 16px;
  color: rgba(240,240,240,0.6);
}

.word {
  font-size: clamp(32px, 10vw, 64px);
  font-weight: 900;
  line-height: 1.1;
  text-align: center;
}

.category {
  font-size: 14px;
  color: rgba(240,240,240,0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.readyBtn {
  margin-top: 16px;
  padding: 18px 48px;
  background: #7c3aed;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  border: none;
  border-radius: 16px;
  cursor: pointer;
}

.readyBtn:disabled {
  opacity: 0.3;
}

/* Timer running */
.timerView {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.timerBar {
  width: 100%;
  max-width: 320px;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.timerFill {
  height: 100%;
  background: #7c3aed;
  border-radius: 4px;
  transition: width 1s linear;
}

.timerCount {
  font-size: 18px;
  color: rgba(240,240,240,0.5);
}

/* Timeout */
.timeoutView {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.timeoutIcon { font-size: 48px; }
.timeoutText { font-size: 24px; font-weight: 700; }
.timeoutSub { font-size: 14px; color: rgba(240,240,240,0.5); }

/* Between turns */
.betweenView {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.betweenLabel { font-size: 16px; color: rgba(240,240,240,0.6); }
.nextAvatar { font-size: 56px; }
.nextName { font-size: 24px; font-weight: 700; }
.betweenHint { font-size: 14px; color: rgba(240,240,240,0.4); }

/* Ended */
.endedView {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.endedIcon { font-size: 56px; }
.endedText { font-size: 24px; font-weight: 700; }
.endedSub { font-size: 14px; color: rgba(240,240,240,0.5); }
```

- [ ] Commit:
```bash
git add apps/hub/src/app/games/charades/present/
git commit -m "feat: add Charades presenter GameScreen (/present)"
```

---

## Task 15: GameResults strona

**Files:**
- Create: `apps/hub/src/app/games/charades/results/page.tsx`
- Create: `apps/hub/src/app/games/charades/results/page.module.css`

- [ ] Utwórz `apps/hub/src/app/games/charades/results/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Podium } from '../../../../components/charades/Podium/Podium'
import type { Player } from '../../../../hooks/charades/useGameState'
import styles from './page.module.css'

export default function CharadesResultsPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    const raw = sessionStorage.getItem('charades:results')
    if (!raw) { router.replace('/games/charades'); return }
    setPlayers(JSON.parse(raw))
  }, [router])

  function handlePlayAgain() {
    sessionStorage.removeItem('charades:results')
    // config pozostaje — /play ją odczyta i wysłe GAME_RESET
    router.push('/games/charades/play')
  }

  function handleBackToMenu() {
    sessionStorage.removeItem('charades:config')
    sessionStorage.removeItem('charades:results')
    router.push('/games/charades')
  }

  if (players.length === 0) return null

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Wyniki</h1>
      <Podium players={players} />
      <div className={styles.actions}>
        <button className={styles.againBtn} onClick={handlePlayAgain}>
          Zagraj jeszcze raz
        </button>
        <button className={styles.menuBtn} onClick={handleBackToMenu}>
          Wróć do menu
        </button>
      </div>
    </main>
  )
}
```

- [ ] Utwórz `apps/hub/src/app/games/charades/results/page.module.css`:

```css
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 32px 16px;
}

.title {
  font-size: 32px;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 16px;
}

.againBtn {
  padding: 14px 28px;
  background: #7c3aed;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.menuBtn {
  padding: 14px 28px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  cursor: pointer;
}
```

- [ ] Commit:
```bash
git add apps/hub/src/app/games/charades/results/
git commit -m "feat: add Charades GameResults page with Podium"
```

---

## Task 16: Weryfikacja końcowa

- [ ] Sprawdź pełny build bez błędów:
```bash
cd C:\Users\Mateo\Desktop\Party && npm run build
```
Oczekiwane: `✓ Compiled successfully` bez błędów TypeScript.

- [ ] Uruchom dev server i przetestuj ręcznie cały flow:
```bash
npm run dev
```
Sprawdź kolejno:
1. `http://localhost:3000/games/charades` — GameMenu ✓
2. `http://localhost:3000/games/charades/config` — SetupPage: dodaj 2 graczy, wybierz kategorię
3. Uruchom `npx partykit dev` w osobnym terminalu
4. Zeskanuj QR lub otwórz URL prezentera ręcznie — sprawdź status połączenia
5. Kliknij "Rozpocznij grę" → sprawdź `/play`
6. Wyślij hasło → sprawdź że pojawia się na `/present`
7. Kliknij "Gotowy" na prezentera → timer startuje na hoscie
8. Wydaj werdykt → punkty się aktualizują
9. Po ostatniej rundzie → `/results` z podium

- [ ] Aktualizuj `memory/today.md` z wynikami sesji:
```
### S2 (~HH:MM) [Project Party] Phase 3 — Kalambury MVP
- Zaimplementowano pełny moduł Kalambury: GameMenu, SetupPage, GameScreen host i prezenter, GameResults
- Partykit server z eventami TURN_START/TIMER_TICK/TURN_END/BETWEEN_TURNS/GAME_END/GAME_RESET
- QR parowanie obowiązkowe, timer autorytatywny po stronie hosta
- Next: Phase 4 — Cloudflare Pages deploy + Partykit deploy
- Experience recorded: tak
```

- [ ] Commit końcowy:
```bash
git add memory/today.md
git commit -m "docs: session end — Phase 3 Kalambury complete"
```
