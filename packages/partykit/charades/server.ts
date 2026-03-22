import type * as Party from 'partykit/server'
// Typy skopiowane lokalnie żeby uniknąć cross-workspace relative import
// (Partykit CLI może nie rozwiązać ścieżek między workspace'ami)
import type { RoomState, CharadesEvent } from './types'

const initialState: RoomState = {
  phase: 'waiting',
  currentTurnId: '',
  currentWord: '',
  currentCategory: '',
  currentPresenter: '',
  timerRemaining: 0,
  nextPresenterName: '',
  nextPresenterAvatar: '',
}

export default class CharadesServer implements Party.Server {
  state: RoomState = { ...initialState }

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: 'ROOM_STATE', state: this.state }))
  }

  onMessage(message: string, sender: Party.Connection) {
    const event = JSON.parse(message) as CharadesEvent
    this.state = applyEvent(this.state, event)
    this.room.broadcast(message, [sender.id])
  }
}

function applyEvent(state: RoomState, event: CharadesEvent): RoomState {
  switch (event.type) {
    case 'TURN_START':
      return {
        ...state,
        phase: 'turn',
        currentTurnId: event.turnId,
        currentWord: event.word,
        currentCategory: event.category,
        currentPresenter: event.presenterName,
        timerRemaining: event.timerSeconds,
      }
    case 'TIMER_TICK':
      if (event.turnId !== state.currentTurnId) return state
      return { ...state, timerRemaining: event.remaining }
    case 'TURN_END':
      return { ...state, phase: 'between' }
    case 'BETWEEN_TURNS':
      return {
        ...state,
        phase: 'between',
        nextPresenterName: event.nextPresenterName,
        nextPresenterAvatar: event.nextPresenterAvatar,
      }
    case 'GAME_END':
      return { ...state, phase: 'ended' }
    case 'GAME_RESET':
      return { ...initialState }
    default:
      return state
  }
}
