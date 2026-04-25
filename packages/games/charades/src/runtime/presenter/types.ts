import type { PresenterNextStep, PresenterTurnEndReason, PresenterWordDifficulty } from '../shared/charades-events'

export type PresenterPhase =
  | 'waiting'
  | 'round-order'
  | 'host-left'
  | 'devices-disconnected'
  | 'session-code-changed'
  | 'your-turn'
  | 'reveal-buffer'
  | 'timer-running'
  | 'awaiting-verdict'
  | 'between'
  | 'ended'

export type PresenterConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'error'

export type PresenterViewState = {
  phase: PresenterPhase
  currentTurnId: string
  word: string
  category: string
  difficulty: PresenterWordDifficulty
  canChangeWord: boolean
  remainingWordChanges: number
  presenterName: string
  timerRemaining: number
  timerDuration: number
  revealRemaining: number
  revealDuration: number
  nextPresenterName: string
  nextPresenterAvatar: string
  nextStep: PresenterNextStep
  turnEndReason: PresenterTurnEndReason
  nextRoomId: string
}

export type PresenterScreenProps = {
  state: PresenterViewState
  connectionState: PresenterConnectionState
  onRevealWord: () => boolean
  onChangeWord: () => boolean
}
