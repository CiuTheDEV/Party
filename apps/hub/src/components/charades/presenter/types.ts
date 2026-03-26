import type { PresenterNextStep, PresenterTurnEndReason, PresenterWordDifficulty } from '../../../types/charades-events'

export type PresenterPhase =
  | 'waiting'
  | 'your-turn'
  | 'reveal-buffer'
  | 'timer-running'
  | 'awaiting-verdict'
  | 'between'
  | 'ended'

export type PresenterViewState = {
  phase: PresenterPhase
  currentTurnId: string
  word: string
  category: string
  difficulty: PresenterWordDifficulty
  presenterName: string
  timerRemaining: number
  timerDuration: number
  revealRemaining: number
  revealDuration: number
  nextPresenterName: string
  nextPresenterAvatar: string
  nextStep: PresenterNextStep
  turnEndReason: PresenterTurnEndReason
}

export type PresenterScreenProps = {
  state: PresenterViewState
  onRevealWord: () => boolean
}
