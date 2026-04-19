import type { RoomState } from '../shared/codenames-events'

type WaitingGameState = Pick<RoomState, 'phase' | 'captainRedConnected' | 'captainBlueConnected'>

export function canStartWaitingGame(state: WaitingGameState) {
  return state.phase === 'waiting' && state.captainRedConnected && state.captainBlueConnected
}

export function shouldAutoStartPendingRound(state: WaitingGameState) {
  return canStartWaitingGame(state)
}
