import type * as Party from 'partykit/server'
import type { RoomState, CodenamesEvent, Card } from './types'

export const initialState: RoomState = {
  phase: 'waiting',
  cards: [],
  redTotal: 0,
  blueTotal: 0,
  roundWinsRed: 0,
  roundWinsBlue: 0,
  startingTeam: null,
  winner: null,
  assassinTeam: null,
  hostConnected: false,
  captainRedConnected: false,
  captainBlueConnected: false,
  captainRedReady: false,
  captainBlueReady: false,
  boardUnlocked: false,
  redTeam: { name: 'Czerwoni', avatar: 'star' },
  blueTeam: { name: 'Niebiescy', avatar: 'moon' },
}

type AuthorityState = {
  state: RoomState
  hostConnectionId: string | null
  captainRedConnectionId: string | null
  captainBlueConnectionId: string | null
}

type IncomingEventResult = AuthorityState & {
  accepted: boolean
  syncRoomState?: boolean
}

export default class CodenamesServer implements Party.Server {
  state: RoomState = { ...initialState }
  hostConnectionId: string | null = null
  captainRedConnectionId: string | null = null
  captainBlueConnectionId: string | null = null

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    conn.send(JSON.stringify({ type: 'ROOM_STATE', state: this.state }))
  }

  onMessage(message: string, sender: Party.Connection) {
    const event = JSON.parse(message) as CodenamesEvent
    const next = reduceIncomingEvent(
      {
        state: this.state,
        hostConnectionId: this.hostConnectionId,
        captainRedConnectionId: this.captainRedConnectionId,
        captainBlueConnectionId: this.captainBlueConnectionId,
      },
      sender.id,
      event,
    )

    this.state = next.state
    this.hostConnectionId = next.hostConnectionId
    this.captainRedConnectionId = next.captainRedConnectionId
    this.captainBlueConnectionId = next.captainBlueConnectionId

    if (!next.accepted) {
      return
    }

    this.room.broadcast(message)

    if (next.syncRoomState) {
      this.room.broadcast(JSON.stringify({ type: 'ROOM_STATE', state: this.state }))
    }
  }

  onClose(conn: Party.Connection) {
    const isRedCaptain = conn.id === this.captainRedConnectionId
    const isBlueCaptain = conn.id === this.captainBlueConnectionId
    const isHost = conn.id === this.hostConnectionId

    if (isRedCaptain) {
      this.state = {
        ...this.state,
        captainRedConnected: false,
        captainRedReady: this.state.boardUnlocked ? this.state.captainRedReady : false,
      }
      this.captainRedConnectionId = null
      this.room.broadcast(JSON.stringify({ type: 'CAPTAIN_DISCONNECTED', team: 'red' }))
    } else if (isBlueCaptain) {
      this.state = {
        ...this.state,
        captainBlueConnected: false,
        captainBlueReady: this.state.boardUnlocked ? this.state.captainBlueReady : false,
      }
      this.captainBlueConnectionId = null
      this.room.broadcast(JSON.stringify({ type: 'CAPTAIN_DISCONNECTED', team: 'blue' }))
    } else if (isHost) {
      this.state = { ...this.state, hostConnected: false }
      this.hostConnectionId = null
      this.room.broadcast(JSON.stringify({ type: 'HOST_DISCONNECTED' }))
    }
  }
}

export function reduceIncomingEvent(
  current: AuthorityState,
  senderId: string,
  event: CodenamesEvent,
): IncomingEventResult {
  if (event.type === 'HOST_SETUP_CONNECTED') {
    const isWaitingRoom = current.state.phase === 'waiting'
    const canResetStaleRuntime = current.state.phase !== 'waiting' && !current.state.hostConnected
    const resolvedHostConnectionId =
      isWaitingRoom || canResetStaleRuntime
        ? senderId
        : current.hostConnectionId ?? senderId

    if (
      current.hostConnectionId !== null &&
      senderId !== current.hostConnectionId &&
      current.state.hostConnected &&
      !isWaitingRoom
    ) {
      return { ...current, accepted: false }
    }

    if (canResetStaleRuntime) {
      return {
        accepted: true,
        state: {
          ...initialState,
          hostConnected: true,
          redTeam: event.redTeam,
          blueTeam: event.blueTeam,
        },
        hostConnectionId: resolvedHostConnectionId,
        captainRedConnectionId: null,
        captainBlueConnectionId: null,
        syncRoomState: true,
      }
    }

    return {
      accepted: true,
      state: { ...current.state, hostConnected: true, redTeam: event.redTeam, blueTeam: event.blueTeam },
      hostConnectionId: resolvedHostConnectionId,
      captainRedConnectionId: current.captainRedConnectionId,
      captainBlueConnectionId: current.captainBlueConnectionId,
    }
  }

  if (event.type === 'CAPTAIN_CONNECTED') {
    // Only register the first connection per team
    if (event.team === 'red') {
      if (current.captainRedConnectionId !== null) {
        return { ...current, accepted: false }
      }
      return {
        accepted: true,
        state: { ...current.state, captainRedConnected: true },
        hostConnectionId: current.hostConnectionId,
        captainRedConnectionId: senderId,
        captainBlueConnectionId: current.captainBlueConnectionId,
      }
    } else {
      if (current.captainBlueConnectionId !== null) {
        return { ...current, accepted: false }
      }
      return {
        accepted: true,
        state: { ...current.state, captainBlueConnected: true },
        hostConnectionId: current.hostConnectionId,
        captainRedConnectionId: current.captainRedConnectionId,
        captainBlueConnectionId: senderId,
      }
    }
  }

  if (event.type === 'CAPTAIN_READY') {
    if (current.state.phase !== 'playing' || current.state.boardUnlocked) {
      return { ...current, accepted: false }
    }

    if (event.team === 'red') {
      if (current.captainRedConnectionId !== senderId) {
        return { ...current, accepted: false }
      }

      const nextState = {
        ...current.state,
        captainRedReady: true,
        boardUnlocked: current.state.captainBlueReady,
      }

      return {
        accepted: true,
        state: nextState,
        hostConnectionId: current.hostConnectionId,
        captainRedConnectionId: current.captainRedConnectionId,
        captainBlueConnectionId: current.captainBlueConnectionId,
        syncRoomState: nextState.boardUnlocked,
      }
    }

    if (current.captainBlueConnectionId !== senderId) {
      return { ...current, accepted: false }
    }

    const nextState = {
      ...current.state,
      captainBlueReady: true,
      boardUnlocked: current.state.captainRedReady,
    }

    return {
      accepted: true,
      state: nextState,
      hostConnectionId: current.hostConnectionId,
      captainRedConnectionId: current.captainRedConnectionId,
      captainBlueConnectionId: current.captainBlueConnectionId,
      syncRoomState: nextState.boardUnlocked,
    }
  }

  if (event.type === 'HOST_CONNECTED') {
    const isHostReclaimingWaitingRoom =
      current.state.phase === 'waiting' &&
      current.hostConnectionId !== null &&
      senderId !== current.hostConnectionId

    const resolvedHostConnectionId = isHostReclaimingWaitingRoom
      ? senderId
      : current.hostConnectionId ?? senderId

    if (
      current.hostConnectionId !== null &&
      senderId !== current.hostConnectionId &&
      !isHostReclaimingWaitingRoom
    ) {
      return { ...current, accepted: false }
    }

    return {
      accepted: true,
      state: isHostReclaimingWaitingRoom
        ? {
            ...current.state,
            hostConnected: true,
            redTeam: event.redTeam,
            blueTeam: event.blueTeam,
            captainRedConnected: false,
            captainBlueConnected: false,
            captainRedReady: false,
            captainBlueReady: false,
            boardUnlocked: false,
          }
        : { ...current.state, hostConnected: true, redTeam: event.redTeam, blueTeam: event.blueTeam },
      hostConnectionId: resolvedHostConnectionId,
      captainRedConnectionId: isHostReclaimingWaitingRoom ? null : current.captainRedConnectionId,
      captainBlueConnectionId: isHostReclaimingWaitingRoom ? null : current.captainBlueConnectionId,
      syncRoomState: isHostReclaimingWaitingRoom,
    }
  }

  // All host events: first non-captain event claims host
  const resolvedHostConnectionId = current.hostConnectionId ?? senderId

  if (senderId !== resolvedHostConnectionId) {
    return { ...current, accepted: false }
  }

  const newState = applyEvent(current.state, event)
  if (
    newState === current.state &&
    event.type !== 'GAME_RESET' &&
    event.type !== 'SESSION_CODE_CHANGED' &&
    event.type !== 'DEVICES_DISCONNECTED'
  ) {
    // Event was rejected by applyEvent (invalid transition)
    return { ...current, accepted: false }
  }

  return {
    accepted: true,
    state: { ...newState, hostConnected: true },
    hostConnectionId: resolvedHostConnectionId,
    captainRedConnectionId: current.captainRedConnectionId,
    captainBlueConnectionId: current.captainBlueConnectionId,
    syncRoomState: event.type === 'MATCH_RESET',
  }
}

export function applyEvent(state: RoomState, event: CodenamesEvent): RoomState {
  switch (event.type) {
    case 'GAME_START': {
      if (state.phase !== 'waiting') return state
      if (!state.captainRedConnected || !state.captainBlueConnected) return state
      return {
        ...state,
        phase: 'playing',
        cards: event.cards,
        redTotal: event.redTotal,
        blueTotal: event.blueTotal,
        startingTeam: event.startingTeam,
        winner: null,
        assassinTeam: null,
        captainRedReady: false,
        captainBlueReady: false,
        boardUnlocked: false,
      }
    }

    case 'CARD_REVEAL': {
      if (state.phase !== 'playing') return state
      if (!state.boardUnlocked) return state
      if (!state.captainRedConnected || !state.captainBlueConnected) return state
      if (event.index < 0 || event.index > 24) return state
      if (!state.cards[event.index]) return state
      if (state.cards[event.index].revealed) return state

      const cards: Card[] = state.cards.map((card, i) =>
        i === event.index ? { ...card, revealed: true } : card,
      )

      if (cards[event.index].color === 'assassin') {
        return { ...state, cards, phase: 'assassin-reveal' }
      }

      const redRevealed = cards.filter(c => c.color === 'red' && c.revealed).length
      const blueRevealed = cards.filter(c => c.color === 'blue' && c.revealed).length

      if (redRevealed >= state.redTotal) {
        return { ...state, cards, phase: 'ended', winner: 'red', roundWinsRed: state.roundWinsRed + 1 }
      }
      if (blueRevealed >= state.blueTotal) {
        return { ...state, cards, phase: 'ended', winner: 'blue', roundWinsBlue: state.roundWinsBlue + 1 }
      }

      return { ...state, cards }
    }

    case 'ASSASSIN_TEAM': {
      if (state.phase !== 'assassin-reveal') return state
      if (!state.captainRedConnected || !state.captainBlueConnected) return state
      const winner = event.team === 'red' ? 'blue' : 'red'
      return {
        ...state,
        assassinTeam: event.team,
        winner,
        phase: 'ended',
        roundWinsRed: winner === 'red' ? state.roundWinsRed + 1 : state.roundWinsRed,
        roundWinsBlue: winner === 'blue' ? state.roundWinsBlue + 1 : state.roundWinsBlue,
      }
    }

    case 'GAME_RESET': {
      return {
        ...initialState,
        hostConnected: state.hostConnected,
        roundWinsRed: state.roundWinsRed,
        roundWinsBlue: state.roundWinsBlue,
        captainRedConnected: state.captainRedConnected,
        captainBlueConnected: state.captainBlueConnected,
        captainRedReady: false,
        captainBlueReady: false,
        boardUnlocked: false,
        redTeam: state.redTeam,
        blueTeam: state.blueTeam,
      }
    }

    case 'MATCH_RESET': {
      return {
        ...initialState,
        hostConnected: state.hostConnected,
        captainRedConnected: state.captainRedConnected,
        captainBlueConnected: state.captainBlueConnected,
        captainRedReady: false,
        captainBlueReady: false,
        boardUnlocked: false,
        redTeam: state.redTeam,
        blueTeam: state.blueTeam,
      }
    }

    case 'DEVICES_DISCONNECTED':
      return state
    case 'SESSION_CODE_CHANGED':
      return state

    default:
      return state
  }
}
