import type * as Party from 'partykit/server'
import type { RoomState, CharadesEvent } from './types'

export const initialState: RoomState = {
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

type AuthorityState = {
  state: RoomState
  hostConnectionId: string | null
  presenterConnectionId: string | null
}

type IncomingEventResult = AuthorityState & {
  accepted: boolean
}

function buildResetRoomState(presenterConnected: boolean): RoomState {
  return {
    ...initialState,
    presenterConnected,
    presenterPhase: 'host-left',
  }
}

function buildRoundOrderRoomState(state: RoomState): RoomState {
  return {
    ...state,
    phase: 'waiting',
    presenterPhase: 'round-order',
    currentTurnId: '',
    currentWord: '',
    currentCategory: '',
    currentDifficulty: '',
    canChangeWord: false,
    remainingWordChanges: 0,
    currentPresenter: '',
    timerRemaining: 0,
    timerDuration: 0,
    revealRemaining: 0,
    revealDuration: 0,
    nextPresenterName: '',
    nextPresenterAvatar: '',
    nextStep: 'next-presenter',
    turnEndReason: 'none',
  }
}

function buildResetIncomingResult(current: AuthorityState, resolvedHostConnectionId: string): IncomingEventResult {
  return {
    accepted: true,
    state: buildResetRoomState(current.presenterConnectionId !== null),
    hostConnectionId: resolvedHostConnectionId,
    presenterConnectionId: current.presenterConnectionId,
  }
}

export default class CharadesServer implements Party.Server {
  state: RoomState = { ...initialState }
  hostConnectionId: string | null = null
  presenterConnectionId: string | null = null

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: 'ROOM_STATE', state: this.state }))
  }

  onMessage(message: string, sender: Party.Connection) {
    const event = JSON.parse(message) as CharadesEvent
    const next = reduceIncomingEvent(
      {
        state: this.state,
        hostConnectionId: this.hostConnectionId,
        presenterConnectionId: this.presenterConnectionId,
      },
      sender.id,
      event,
    )

    this.state = next.state
    this.hostConnectionId = next.hostConnectionId
    this.presenterConnectionId = next.presenterConnectionId

    if (!next.accepted) {
      return
    }

    this.room.broadcast(message, [sender.id])
  }

  onClose(conn: Party.Connection) {
    const presenterDisconnected = conn.id === this.presenterConnectionId
    const next = handleConnectionClosed(
      {
        state: this.state,
        hostConnectionId: this.hostConnectionId,
        presenterConnectionId: this.presenterConnectionId,
      },
      conn.id,
    )

    this.state = next.state
    this.hostConnectionId = next.hostConnectionId
    this.presenterConnectionId = next.presenterConnectionId

    if (presenterDisconnected) {
      this.room.broadcast(JSON.stringify({ type: 'PRESENTER_DISCONNECTED' }))
    }
  }
}

export function reduceIncomingEvent(current: AuthorityState, senderId: string, event: CharadesEvent): IncomingEventResult {
  if (event.type === 'DEVICE_CONNECTED') {
    return {
      accepted: true,
      state: applyEvent(current.state, event),
      hostConnectionId: current.hostConnectionId,
      presenterConnectionId: senderId,
    }
  }

  if (isPresenterEvent(event)) {
    if (senderId !== current.presenterConnectionId) {
      return {
        ...current,
        accepted: false,
      }
    }

    return {
      accepted: true,
      state: applyEvent(current.state, event),
      hostConnectionId: current.hostConnectionId,
      presenterConnectionId: current.presenterConnectionId,
    }
  }

  const resolvedHostConnectionId = current.hostConnectionId ?? senderId

  if (senderId !== resolvedHostConnectionId) {
    return {
      ...current,
      accepted: false,
    }
  }

  if (event.type === 'GAME_RESET') {
    return buildResetIncomingResult(current, resolvedHostConnectionId)
  }

  return {
    accepted: true,
    state: applyEvent(current.state, event),
    hostConnectionId: resolvedHostConnectionId,
    presenterConnectionId: current.presenterConnectionId,
  }
}

export function handleConnectionClosed(current: AuthorityState, connectionId: string): AuthorityState {
  const isPresenter = connectionId === current.presenterConnectionId
  const isHost = connectionId === current.hostConnectionId

  return {
    state: isPresenter
      ? {
          ...current.state,
          presenterConnected: false,
        }
      : current.state,
    hostConnectionId: isHost ? null : current.hostConnectionId,
    presenterConnectionId: isPresenter ? null : current.presenterConnectionId,
  }
}

function isPresenterEvent(event: CharadesEvent) {
  return event.type === 'WORD_REVEALED' || event.type === 'CHANGE_WORD'
}

export function applyEvent(state: RoomState, event: CharadesEvent): RoomState {
  switch (event.type) {
    case 'ROUND_ORDER_START':
      return buildRoundOrderRoomState(state)
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
    case 'DEVICES_DISCONNECTED':
      return state
    case 'SESSION_CODE_CHANGED':
      return state
    case 'GAME_RESET':
      return buildResetRoomState(state.presenterConnected)
    default:
      return state
  }
}
