import type { CharadesGameSettings } from '../../setup/state'

export type PlayerSummary = {
  name: string
  avatar: string
  gender: 'on' | 'ona' | 'none'
  score?: number
}

export type Phase =
  | 'round-order'
  | 'prepare'
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

export type PlayBoardProps = {
  phase: Phase
  players: PlayerSummary[]
  order: PlayerSummary[]
  currentOrderIdx: number
  presenter: PlayerSummary | undefined
  currentWord: string
  currentCategory: string
  settings: CharadesGameSettings
  isRoundOrderRevealing: boolean
  onRoundOrderSettled: () => void
  timerRemaining: number
  bufferRemaining?: number
  currentRound: number
  totalRounds: number
  animationsEnabled?: boolean
  externalToggleScoreRailSignal?: number
  externalToggleVerdictWordSignal?: number
  actionHintLabels?: {
    rail?: string | null
  }
}

export type CardPoint = {
  x: number
  y: number
}

export type RankedPlayer = PlayerSummary & {
  rank: number
}
