import type * as Party from 'partykit/server'
// Typy skopiowane lokalnie żeby uniknąć cross-workspace relative import
// (Partykit CLI może nie rozwiązać ścieżek między workspace'ami)
import type { RoomState, CharadesEvent } from './types'

const initialState: RoomState = {
  phase: 'waiting',
  presenterPhase: 'waiting',
  currentTurnId: '',
  currentWord: '',
  currentCategory: '',
  currentDifficulty: '',
  canChangeWord: false,
  remainingWordChanges: 0,
  currentPresenter: '',
  presenterConnected: false,
  timerRemaining: 0,
  timerDuration: 0,
  revealRemaining: 0,
  revealDuration: 0,
  nextPresenterName: '',
  nextPresenterAvatar: '',
  nextStep: 'next-presenter',
  turnEndReason: 'none',
}

export default class CharadesServer implements Party.Server {
  state: RoomState = { ...initialState }
  presenterConnectionId: string | null = null

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: 'ROOM_STATE', state: this.state }))
  }

  onMessage(message: string, sender: Party.Connection) {
    const event = JSON.parse(message) as CharadesEvent

    if (event.type === 'DEVICE_CONNECTED') {
      this.presenterConnectionId = sender.id
    }

    this.state = applyEvent(this.state, event)
    this.room.broadcast(message, [sender.id])
  }

  onClose(conn: Party.Connection) {
    if (conn.id !== this.presenterConnectionId) {
      return
    }

    this.presenterConnectionId = null
    this.state = {
      ...this.state,
      presenterConnected: false,
    }
    this.room.broadcast(JSON.stringify({ type: 'PRESENTER_DISCONNECTED' }))
  }
}

export function applyEvent(state: RoomState, event: CharadesEvent): RoomState {
  switch (event.type) {
    case 'TURN_START':
      return {
        ...state,
        phase: 'turn',
        presenterPhase: 'your-turn',
        currentTurnId: event.turnId,
        currentWord: event.word,
        currentCategory: event.category,
        currentDifficulty: event.difficulty,
        canChangeWord: event.canChangeWord,
        remainingWordChanges: event.remainingWordChanges,
        currentPresenter: event.presenterName,
        timerRemaining: event.timerSeconds,
        timerDuration: event.timerSeconds,
        revealRemaining: 0,
        revealDuration: 0,
        nextPresenterName: event.nextPresenterName,
        nextPresenterAvatar: event.nextPresenterAvatar,
        nextStep: event.nextStep,
        turnEndReason: 'none',
      }
    case 'DEVICE_CONNECTED':
      return {
        ...state,
        presenterConnected: true,
      }
    case 'REVEAL_BUFFER_START':
    case 'REVEAL_BUFFER_TICK':
      if (event.turnId !== state.currentTurnId) return state
      return {
        ...state,
        phase: 'turn',
        presenterPhase: 'reveal-buffer',
        revealRemaining: event.remaining,
        revealDuration: state.revealDuration || event.remaining,
      }
    case 'REVEAL_BUFFER_END':
      if (event.turnId !== state.currentTurnId) return state
      return { ...state, phase: 'turn', presenterPhase: 'timer-running', revealRemaining: 0 }
    case 'WORD_CHANGED':
      if (event.turnId !== state.currentTurnId) return state
      return {
        ...state,
        currentWord: event.word,
        currentCategory: event.category,
        currentDifficulty: event.difficulty,
        remainingWordChanges: event.remainingWordChanges,
      }
    case 'TIMER_TICK':
      if (event.turnId !== state.currentTurnId) return state
      return { ...state, phase: 'turn', presenterPhase: 'timer-running', timerRemaining: event.remaining }
    case 'TURN_END':
      return {
        ...state,
        phase: 'turn',
        presenterPhase: event.reason === 'timeout' ? 'timeout' : 'awaiting-verdict',
        currentWord: '',
        currentCategory: '',
        currentDifficulty: '',
        canChangeWord: false,
        remainingWordChanges: 0,
        revealRemaining: 0,
        revealDuration: 0,
        turnEndReason: event.reason,
      }
    case 'BETWEEN_TURNS':
      return {
        ...state,
        phase: 'between',
        presenterPhase: 'between',
        nextPresenterName: event.nextPresenterName,
        nextPresenterAvatar: event.nextPresenterAvatar,
        currentWord: '',
        currentCategory: '',
        currentDifficulty: '',
        canChangeWord: false,
        remainingWordChanges: 0,
        revealRemaining: 0,
        revealDuration: 0,
      }
    case 'GAME_END':
      return {
        ...state,
        phase: 'ended',
        presenterPhase: 'ended',
        currentWord: '',
        currentCategory: '',
        currentDifficulty: '',
        canChangeWord: false,
        remainingWordChanges: 0,
        revealRemaining: 0,
        revealDuration: 0,
      }
    case 'GAME_RESET':
      return { ...initialState }
    default:
      return state
  }
}
