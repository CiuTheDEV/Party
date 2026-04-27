import type { RoomState } from '../shared/codenames-events'

export type BoardKeyStats = {
  lastRevealedIndex: number | null
  redRevealed: number
  redTotal: number
  blueRevealed: number
  blueTotal: number
  neutralTotal: number
  assassinTotal: number
  assassinTeam: RoomState['assassinTeam']
  winner: RoomState['winner']
}

export function getBoardKeyStats(state: Pick<RoomState, 'cards' | 'lastRevealedIndex' | 'redTotal' | 'blueTotal' | 'assassinTeam' | 'winner'>): BoardKeyStats {
  return {
    lastRevealedIndex: state.lastRevealedIndex,
    redRevealed: state.cards.filter((card) => card.color === 'red' && card.revealed).length,
    redTotal: state.redTotal,
    blueRevealed: state.cards.filter((card) => card.color === 'blue' && card.revealed).length,
    blueTotal: state.blueTotal,
    neutralTotal: state.cards.filter((card) => card.color === 'neutral').length,
    assassinTotal: state.cards.filter((card) => card.color === 'assassin').length,
    assassinTeam: state.assassinTeam,
    winner: state.winner,
  }
}
