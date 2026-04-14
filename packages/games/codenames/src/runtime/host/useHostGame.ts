'use client'

import { useCallback, useRef, useState } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, IncomingMessage, RoomState } from '../shared/codenames-events'
import { getPartykitHost } from '../shared/codenames-runtime'
import { generateBoard } from '../shared/board-generator'

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

type UseHostGameParams = {
  roomId: string
  wordPool: string[]
}

export function useHostGame({ roomId, wordPool }: UseHostGameParams) {
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState)

  // Refs that are always current — safe to use inside socket callbacks
  const wordPoolRef = useRef(wordPool)
  wordPoolRef.current = wordPool

  // Tracks whether we already sent GAME_START for this session
  // so reconnects don't send it again when the room is already playing
  const gameStartedRef = useRef(false)

  // Tracks whether we sent GAME_RESET and are waiting to send GAME_START after
  const pendingNewGameRef = useRef(false)

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    party: 'codenames',
    onMessage(evt) {
      const msg = JSON.parse(evt.data) as IncomingMessage

      if (msg.type === 'ROOM_STATE') {
        setRoomState(msg.state)

        // First message after connect. If room is fresh → start immediately.
        // If already playing (host reconnected mid-game) → do nothing.
        if (msg.state.phase === 'waiting' && !gameStartedRef.current) {
          gameStartedRef.current = true
          sendGameStart(socket, wordPoolRef.current)
        }
        return
      }

      setRoomState((s) => applyEvent(s, msg))

      // Server confirmed our GAME_RESET — now send the new board
      if (msg.type === 'GAME_RESET' && pendingNewGameRef.current) {
        pendingNewGameRef.current = false
        sendGameStart(socket, wordPoolRef.current)
      }
    },
  })

  const revealCard = useCallback(
    (index: number) => {
      socket.send(JSON.stringify({ type: 'CARD_REVEAL', index } satisfies HostEvent))
    },
    [socket],
  )

  const setAssassinTeam = useCallback(
    (team: 'red' | 'blue') => {
      socket.send(JSON.stringify({ type: 'ASSASSIN_TEAM', team } satisfies HostEvent))
    },
    [socket],
  )

  const resetGame = useCallback(() => {
    pendingNewGameRef.current = true
    gameStartedRef.current = false
    socket.send(JSON.stringify({ type: 'GAME_RESET' } satisfies HostEvent))
  }, [socket])

  return { roomState, revealCard, setAssassinTeam, resetGame }
}

function sendGameStart(socket: { send: (data: string) => void }, wordPool: string[]) {
  const board = generateBoard(wordPool)
  socket.send(JSON.stringify({
    type: 'GAME_START',
    cards: board.cards,
    redTotal: board.redTotal,
    blueTotal: board.blueTotal,
    startingTeam: board.startingTeam,
  } satisfies HostEvent))
}

function applyEvent(state: RoomState, msg: IncomingMessage): RoomState {
  switch (msg.type) {
    case 'GAME_START':
      return {
        ...state,
        phase: 'playing',
        cards: msg.cards,
        redTotal: msg.redTotal,
        blueTotal: msg.blueTotal,
        startingTeam: msg.startingTeam,
        winner: null,
        assassinTeam: null,
      }

    case 'CARD_REVEAL': {
      if (msg.index < 0 || msg.index > 24) return state
      const cards = state.cards.map((c, i) =>
        i === msg.index ? { ...c, revealed: true } : c,
      )
      const hit = cards[msg.index]
      if (hit.color === 'assassin') return { ...state, cards, phase: 'assassin-reveal' }
      const redRevealed = cards.filter((c) => c.color === 'red' && c.revealed).length
      const blueRevealed = cards.filter((c) => c.color === 'blue' && c.revealed).length
      if (redRevealed >= state.redTotal) return { ...state, cards, phase: 'ended', winner: 'red' }
      if (blueRevealed >= state.blueTotal) return { ...state, cards, phase: 'ended', winner: 'blue' }
      return { ...state, cards }
    }

    case 'ASSASSIN_TEAM':
      return { ...state, assassinTeam: msg.team, winner: msg.team === 'red' ? 'blue' : 'red', phase: 'ended' }

    case 'GAME_RESET':
      return { ...initialRoomState, captainRedConnected: state.captainRedConnected, captainBlueConnected: state.captainBlueConnected }

    case 'CAPTAIN_CONNECTED':
      return msg.team === 'red' ? { ...state, captainRedConnected: true } : { ...state, captainBlueConnected: true }

    case 'CAPTAIN_DISCONNECTED':
      return msg.team === 'red' ? { ...state, captainRedConnected: false } : { ...state, captainBlueConnected: false }

    default:
      return state
  }
}
