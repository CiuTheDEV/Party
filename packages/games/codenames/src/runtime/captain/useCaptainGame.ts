'use client'

import { useState } from 'react'
import usePartySocket from 'partysocket/react'
import type { IncomingMessage, RoomState } from '../shared/codenames-events'
import { getPartykitHost } from '../shared/codenames-runtime'

const initialRoomState: RoomState = {
  phase: 'waiting',
  cards: [],
  redTotal: 0,
  blueTotal: 0,
  startingTeam: null,
  winner: null,
  assassinTeam: null,
  captainRedConnected: false,
  captainBlueConnected: false,
}

type UseCaptainGameParams = {
  roomId: string
  team: 'red' | 'blue'
}

export function useCaptainGame({ roomId, team }: UseCaptainGameParams) {
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState)

  usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    party: 'codenames',
    onOpen(event) {
      // @ts-expect-error — socket is accessible via event.target
      const socket = event.target
      socket.send(JSON.stringify({ type: 'CAPTAIN_CONNECTED', team }))
    },
    onMessage(event) {
      const msg = JSON.parse(event.data) as IncomingMessage

      if (msg.type === 'ROOM_STATE') {
        setRoomState(msg.state)
        return
      }

      // Captains are read-only — only update local state from server broadcasts
      setRoomState((current) => applyServerEvent(current, msg))
    },
  })

  return { roomState }
}

function applyServerEvent(state: RoomState, event: IncomingMessage): RoomState {
  switch (event.type) {
    case 'GAME_START':
      return {
        ...state,
        phase: 'playing',
        cards: event.cards,
        redTotal: event.redTotal,
        blueTotal: event.blueTotal,
        startingTeam: event.startingTeam,
        winner: null,
        assassinTeam: null,
      }
    case 'CARD_REVEAL': {
      if (event.index < 0 || event.index > 24) return state
      const cards = state.cards.map((card, i) =>
        i === event.index ? { ...card, revealed: true } : card,
      )
      return { ...state, cards }
    }
    case 'ASSASSIN_TEAM': {
      const winner = event.team === 'red' ? 'blue' : 'red'
      return { ...state, assassinTeam: event.team, winner, phase: 'ended' }
    }
    case 'GAME_RESET':
      return {
        ...initialRoomState,
        captainRedConnected: state.captainRedConnected,
        captainBlueConnected: state.captainBlueConnected,
      }
    case 'CAPTAIN_CONNECTED':
      return event.team === 'red'
        ? { ...state, captainRedConnected: true }
        : { ...state, captainBlueConnected: true }
    // Ignore CAPTAIN_DISCONNECTED — captain screens are read-only and don't react to other captains
    default:
      return state
  }
}
