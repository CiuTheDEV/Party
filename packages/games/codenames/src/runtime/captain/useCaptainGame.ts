'use client'

import { useEffect, useRef, useState } from 'react'
import usePartySocket from 'partysocket/react'
import type { IncomingMessage, RoomState } from '../shared/codenames-events'
import { getPartykitHost } from '../shared/codenames-runtime'
import { ROUND_INTRO_DURATION_MS } from '../shared/RoundIntroOverlay'

const initialRoomState: RoomState = {
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
}

type UseCaptainGameParams = {
  roomId: string
  team: 'red' | 'blue'
}

export function useCaptainGame({ roomId, team }: UseCaptainGameParams) {
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState)
  const [hasSyncedRoomState, setHasSyncedRoomState] = useState(false)
  const [hostDisconnected, setHostDisconnected] = useState(false)
  const [isRoundIntroVisible, setIsRoundIntroVisible] = useState(false)
  const teamRef = useRef(team)
  const previousPhaseRef = useRef<RoomState['phase'] | null>(null)

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    party: 'codenames',
    onOpen() {
      socket.send(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team: teamRef.current }))
    },
    onMessage(event) {
      const msg = JSON.parse(event.data) as IncomingMessage

      if (msg.type === 'ROOM_STATE') {
        setRoomState((current) => {
          const nextState = { ...msg.state, hostConnected: msg.state.hostConnected || current.hostConnected }
          setHostDisconnected((currentDisconnected) => (nextState.hostConnected ? false : currentDisconnected))
          return nextState
        })
        setHasSyncedRoomState(true)
        return
      }

      if (msg.type === 'HOST_DISCONNECTED') {
        setRoomState((current) => ({ ...current, hostConnected: false }))
        setHostDisconnected(true)
        return
      }

      if (msg.type === 'HOST_CONNECTED') {
        setRoomState((current) => applyServerEvent(current, msg))
        setHostDisconnected(false)
        return
      }

      // Captains are read-only — only update local state from server broadcasts
      setRoomState((current) => applyServerEvent(current, msg))
    },
  })

  useEffect(() => {
    const previousPhase = previousPhaseRef.current

    if (previousPhase === null) {
      previousPhaseRef.current = roomState.phase
      return
    }

    if (roomState.phase === 'playing' && previousPhase !== 'playing') {
      setIsRoundIntroVisible(true)

      const timeoutId = window.setTimeout(() => {
        setIsRoundIntroVisible(false)
      }, ROUND_INTRO_DURATION_MS)

      previousPhaseRef.current = roomState.phase
      return () => window.clearTimeout(timeoutId)
    }

    if (roomState.phase !== 'playing') {
      setIsRoundIntroVisible(false)
    }

    previousPhaseRef.current = roomState.phase
  }, [roomState.phase])

  return { roomState, hasSyncedRoomState, hostDisconnected, isRoundIntroVisible }
}

function applyServerEvent(state: RoomState, event: IncomingMessage): RoomState {
  switch (event.type) {
    case 'GAME_START':
      return {
        ...state,
        hostConnected: true,
        phase: 'playing',
        cards: event.cards,
        redTotal: event.redTotal,
        blueTotal: event.blueTotal,
        startingTeam: event.startingTeam,
        winner: null,
        assassinTeam: null,
      }
    case 'HOST_CONNECTED':
      return { ...state, hostConnected: true }
    case 'CARD_REVEAL': {
      if (event.index < 0 || event.index > 24) return state
      if (!state.cards[event.index]) return state
      const cards = state.cards.map((card, i) =>
        i === event.index ? { ...card, revealed: true } : card,
      )
      const hit = cards[event.index]
      if (hit.color === 'assassin') return { ...state, hostConnected: true, cards, phase: 'assassin-reveal' }
      const redRevealed = cards.filter((card) => card.color === 'red' && card.revealed).length
      const blueRevealed = cards.filter((card) => card.color === 'blue' && card.revealed).length
      if (redRevealed >= state.redTotal) {
        return { ...state, hostConnected: true, cards, phase: 'ended', winner: 'red', roundWinsRed: state.roundWinsRed + 1 }
      }
      if (blueRevealed >= state.blueTotal) {
        return { ...state, hostConnected: true, cards, phase: 'ended', winner: 'blue', roundWinsBlue: state.roundWinsBlue + 1 }
      }
      return { ...state, hostConnected: true, cards }
    }
    case 'ASSASSIN_TEAM': {
      const winner = event.team === 'red' ? 'blue' : 'red'
      return {
        ...state,
        hostConnected: true,
        assassinTeam: event.team,
        winner,
        phase: 'ended',
        roundWinsRed: winner === 'red' ? state.roundWinsRed + 1 : state.roundWinsRed,
        roundWinsBlue: winner === 'blue' ? state.roundWinsBlue + 1 : state.roundWinsBlue,
      }
    }
    case 'GAME_RESET':
      return {
        ...initialRoomState,
        hostConnected: true,
        roundWinsRed: state.roundWinsRed,
        roundWinsBlue: state.roundWinsBlue,
        captainRedConnected: state.captainRedConnected,
        captainBlueConnected: state.captainBlueConnected,
      }
    case 'MATCH_RESET':
      return {
        ...initialRoomState,
        hostConnected: true,
        captainRedConnected: state.captainRedConnected,
        captainBlueConnected: state.captainBlueConnected,
      }
    case 'CAPTAIN_CONNECTED':
      return event.team === 'red'
        ? { ...state, captainRedConnected: true }
        : { ...state, captainBlueConnected: true }
    case 'CAPTAIN_DISCONNECTED':
      return event.team === 'red'
        ? { ...state, captainRedConnected: false }
        : { ...state, captainBlueConnected: false }
    default:
      return state
  }
}
