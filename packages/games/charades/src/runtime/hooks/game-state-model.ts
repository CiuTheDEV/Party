import type { CharadesCategoryDifficulty, CharadesGameSettings, CharadesPlayerDraft } from '../../setup/state'

export type Player = CharadesPlayerDraft & {
  score: number
  totalGuessTimeSeconds: number
  lastCorrectGuessSeconds: number | null
  lastScoredRound: number | null
}

export type GameSettings = CharadesGameSettings

export type GamePhase =
  | 'round-order'
  | 'prepare'
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

export type VerdictReason = 'timeout' | 'manual-stop' | null

export type GameState = {
  phase: GamePhase
  players: Player[]
  remainingWordChangesByPlayer: number[]
  rejectedPromptKeysThisTurn: string[]
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
  verdictReason: VerdictReason
  isDeviceConnected: boolean
  isRoomConnected: boolean
}

export const REVEAL_BUFFER_SECONDS = 10

export function createInitialGameState(players: Player[], settings: GameSettings): GameState {
  return {
    phase: 'round-order',
    players: players.map((player) => ({
      ...player,
      score: 0,
      totalGuessTimeSeconds: 0,
      lastCorrectGuessSeconds: null,
      lastScoredRound: null,
    })),
    remainingWordChangesByPlayer: players.map(() => settings.wordChange.changesPerPlayer),
    rejectedPromptKeysThisTurn: [],
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
    verdictReason: null,
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
