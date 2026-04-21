import type { CharadesPlayerDraft } from '../setup/state'

export type CharadesResultPlayer = CharadesPlayerDraft & {
  score: number
  totalGuessTimeSeconds?: number
  lastCorrectGuessSeconds?: number | null
  lastScoredRound?: number | null
}
