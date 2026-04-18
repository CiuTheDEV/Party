import type { RoomState } from '../shared/codenames-events'

export type CaptainBoardMetaInput = Pick<
  RoomState,
  'cards' | 'redTotal' | 'blueTotal' | 'roundWinsRed' | 'roundWinsBlue' | 'startingTeam'
>

export type CaptainBoardMeta = {
  currentRound: number
  redRemaining: number
  blueRemaining: number
  roundWinsRed: number
  roundWinsBlue: number
  startingTeam: 'red' | 'blue' | null
}

export function getCaptainBoardMeta(state: CaptainBoardMetaInput): CaptainBoardMeta {
  const redRevealed = state.cards.filter((card) => card.color === 'red' && card.revealed).length
  const blueRevealed = state.cards.filter((card) => card.color === 'blue' && card.revealed).length

  return {
    currentRound: state.roundWinsRed + state.roundWinsBlue + 1,
    redRemaining: Math.max(0, state.redTotal - redRevealed),
    blueRemaining: Math.max(0, state.blueTotal - blueRevealed),
    roundWinsRed: state.roundWinsRed,
    roundWinsBlue: state.roundWinsBlue,
    startingTeam: state.startingTeam,
  }
}
