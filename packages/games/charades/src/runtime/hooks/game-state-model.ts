import type { CharadesCategoryDifficulty, CharadesGameSettings, CharadesPlayerDraft } from '../../setup/state'

export type Player = CharadesPlayerDraft & {
  score: number
}

export type GameSettings = CharadesGameSettings

export type GamePhase =
  | 'round-order'
  | 'prepare'
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

export type GameState = {
  phase: GamePhase
  players: Player[]
  order: number[]
  isRoundOrderRevealing: boolean
  currentOrderIdx: number
  currentRound: number
  totalRounds: number
  timerRemaining: number
  bufferRemaining: number
  currentWord: string
  currentCategory: string
  currentDifficulty: CharadesCategoryDifficulty | ''
  isDeviceConnected: boolean
  isRoomConnected: boolean
}

export const REVEAL_BUFFER_SECONDS = 10

export function createInitialGameState(players: Player[], settings: GameSettings): GameState {
  return {
    phase: 'round-order',
    players: players.map((player) => ({ ...player, score: 0 })),
    order: [],
    isRoundOrderRevealing: false,
    currentOrderIdx: 0,
    currentRound: 1,
    totalRounds: settings.rounds,
    timerRemaining: settings.timerSeconds,
    bufferRemaining: REVEAL_BUFFER_SECONDS,
    currentWord: '',
    currentCategory: '',
    currentDifficulty: '',
    isDeviceConnected: false,
    isRoomConnected: true,
  }
}

export function shuffle(values: number[]) {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

export function getNextPresenter(order: number[], currentOrderIdx: number, players: Player[]) {
  const nextPresenterIdx = order[currentOrderIdx + 1]
  const nextPresenter = nextPresenterIdx === undefined ? undefined : players[nextPresenterIdx]

  return {
    name: nextPresenter?.name ?? '',
    avatar: nextPresenter?.avatar ?? '',
  }
}
