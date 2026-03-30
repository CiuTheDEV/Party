export type PresenterNextStep = 'next-presenter' | 'round-summary' | 'game-end'
export type PresenterTurnEndReason = 'timeout' | 'verdict' | 'manual-stop' | 'none'
export type PresenterWordDifficulty = 'easy' | 'hard' | ''

// Eventy wysyłane przez HOSTA do prezentera
export type HostEvent =
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

// Eventy wysyłane przez TELEFON PREZENTERA do hosta
export type PresenterEvent =
  | { type: 'WORD_REVEALED'; turnId: string }
  | { type: 'CHANGE_WORD'; turnId: string }
  | { type: 'DEVICE_CONNECTED' }

export type CharadesEvent = HostEvent | PresenterEvent

// Stan rooma trzymany przez Partykit server
export type RoomState = {
  phase: 'waiting' | 'turn' | 'between' | 'ended'
  presenterPhase:
    | 'waiting'
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

export type RoomStateMessage = {
  type: 'ROOM_STATE'
  state: RoomState
}
