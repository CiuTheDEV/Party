// Kopia apps/hub/src/types/charades-events.ts
// Partykit CLI bundluje server.ts niezależnie od npm workspace — importy relative są bezpieczne,
// ale imports z innych workspace'ów mogą nie być rozwiązane. Typy trzymamy lokalnie.

export type PresenterNextStep = 'next-presenter' | 'round-summary' | 'game-end'
export type PresenterTurnEndReason = 'timeout' | 'verdict' | 'manual-stop' | 'none'
export type PresenterWordDifficulty = 'easy' | 'hard' | ''

export type HostEvent =
  | { type: 'ROUND_ORDER_START' }
  | {
      type: 'TURN_START'
      turnId: string
      word: string
      category: string
      difficulty: PresenterWordDifficulty
      canChangeWord: boolean
      remainingWordChanges: number
      presenterName: string
      timerSeconds: number
      nextPresenterName: string
      nextPresenterAvatar: string
      nextStep: PresenterNextStep
    }
  | { type: 'REVEAL_BUFFER_START'; turnId: string; remaining: number }
  | { type: 'REVEAL_BUFFER_TICK'; turnId: string; remaining: number }
  | { type: 'REVEAL_BUFFER_END'; turnId: string }
  | {
      type: 'WORD_CHANGED'
      turnId: string
      word: string
      category: string
      difficulty: PresenterWordDifficulty
      remainingWordChanges: number
    }
  | { type: 'TIMER_TICK'; turnId: string; remaining: number }
  | { type: 'TURN_END'; turnId: string; reason: 'timeout' | 'verdict' | 'manual-stop' }
  | { type: 'BETWEEN_TURNS'; nextPresenterName: string; nextPresenterAvatar: string }
  | { type: 'PRESENTER_DISCONNECTED' }
  | { type: 'GAME_END' }
  | { type: 'GAME_RESET' }

export type PresenterEvent =
  | { type: 'WORD_REVEALED'; turnId: string }
  | { type: 'CHANGE_WORD'; turnId: string }
  | { type: 'DEVICE_CONNECTED' }

export type CharadesEvent = HostEvent | PresenterEvent

export type RoomState = {
  phase: 'waiting' | 'turn' | 'between' | 'ended'
  presenterPhase:
    | 'waiting'
    | 'round-order'
    | 'host-left'
    | 'your-turn'
    | 'reveal-buffer'
    | 'timer-running'
    | 'awaiting-verdict'
    | 'timeout'
    | 'between'
    | 'ended'
  currentTurnId: string
  currentWord: string
  currentCategory: string
  currentDifficulty: PresenterWordDifficulty
  canChangeWord: boolean
  remainingWordChanges: number
  currentPresenter: string
  presenterConnected: boolean
  timerRemaining: number
  timerDuration: number
  revealRemaining: number
  revealDuration: number
  nextPresenterName: string
  nextPresenterAvatar: string
  nextStep: PresenterNextStep
  turnEndReason: PresenterTurnEndReason
}
