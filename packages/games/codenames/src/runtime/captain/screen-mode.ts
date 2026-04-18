import type { RoomState } from '../shared/codenames-events'

export type CaptainScreenMode = 'waiting' | 'board'

export function getCaptainScreenMode(state: Pick<RoomState, 'phase' | 'cards'>): CaptainScreenMode {
  return state.phase === 'waiting' || state.cards.length === 0 ? 'waiting' : 'board'
}
