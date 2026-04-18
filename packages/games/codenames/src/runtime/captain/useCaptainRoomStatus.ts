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
  roundWinsRed: 0,
  roundWinsBlue: 0,
  startingTeam: null,
  winner: null,
  assassinTeam: null,
  hostConnected: false,
  captainRedConnected: false,
  captainBlueConnected: false,
}

type UseCaptainRoomStatusParams = {
  roomId: string
}

export function useCaptainRoomStatus({ roomId }: UseCaptainRoomStatusParams) {
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState)
  const [hasSyncedRoomState, setHasSyncedRoomState] = useState(false)
  const [hostDisconnected, setHostDisconnected] = useState(false)

  usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    party: 'codenames',
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
        setRoomState((current) => applyRoomStatusEvent(current, msg))
        setHostDisconnected(false)
        return
      }

      setRoomState((current) => applyRoomStatusEvent(current, msg))
    },
  })

  return { roomState, hasSyncedRoomState, hostDisconnected }
}

function applyRoomStatusEvent(state: RoomState, event: IncomingMessage): RoomState {
  switch (event.type) {
    case 'CAPTAIN_CONNECTED':
      return event.team === 'red'
        ? { ...state, captainRedConnected: true }
        : { ...state, captainBlueConnected: true }
    case 'CAPTAIN_DISCONNECTED':
      return event.team === 'red'
        ? { ...state, captainRedConnected: false }
        : { ...state, captainBlueConnected: false }
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
    case 'CARD_REVEAL':
    case 'ASSASSIN_TEAM':
    case 'GAME_RESET':
    case 'MATCH_RESET':
      return { ...state, hostConnected: true }
    default:
      return state
  }
}
