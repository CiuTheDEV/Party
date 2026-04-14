'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  const wordPoolRef = useRef(wordPool)
  const awaitingResetRef = useRef(false)
  const socketRef = useRef<ReturnType<typeof usePartySocket> | null>(null)

  const startNewGame = useCallback(() => {
    if (!socketRef.current) return
    const board = generateBoard(wordPoolRef.current)
    socketRef.current.send(JSON.stringify({
      type: 'GAME_START',
      cards: board.cards,
      redTotal: board.redTotal,
      blueTotal: board.blueTotal,
      startingTeam: board.startingTeam,
    } satisfies HostEvent))
  }, [])

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    party: 'codenames',
    onMessage(event) {
      const msg = JSON.parse(event.data) as IncomingMessage

      if (msg.type === 'ROOM_STATE') {
        setRoomState(msg.state)
        // Server just sent us current state on connect.
        // If room is waiting (fresh room), start the game immediately.
        if (msg.state.phase === 'waiting') {
          startNewGame()
        }
        return
      }

      setRoomState((current) => applyClientEvent(current, msg))

      // After reset, server broadcasts GAME_RESET → phase goes to 'waiting' client-side,
      // but we handle the new game start here when the reset flag is set.
      if (msg.type === 'GAME_RESET' && awaitingResetRef.current) {
        awaitingResetRef.current = false
        startNewGame()
      }
    },
  })

  // Keep socketRef in sync so startNewGame can always access the current socket
  useEffect(() => {
    socketRef.current = socket
  }, [socket])

  const sendEvent = useCallback(
    (event: HostEvent) => {
      socket.send(JSON.stringify(event))
    },
    [socket],
  )

  const revealCard = useCallback(
    (index: number) => {
      sendEvent({ type: 'CARD_REVEAL', index })
    },
    [sendEvent],
  )

  const setAssassinTeam = useCallback(
    (team: 'red' | 'blue') => {
      sendEvent({ type: 'ASSASSIN_TEAM', team })
    },
    [sendEvent],
  )

  const resetGame = useCallback(() => {
    awaitingResetRef.current = true
    sendEvent({ type: 'GAME_RESET' })
  }, [sendEvent])

  return {
    roomState,
    revealCard,
    setAssassinTeam,
    resetGame,
  }
}

function applyClientEvent(state: RoomState, event: IncomingMessage): RoomState {
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
      const revealed = cards[event.index]
      if (revealed.color === 'assassin') {
        return { ...state, cards, phase: 'assassin-reveal' }
      }
      const redRevealed = cards.filter((c) => c.color === 'red' && c.revealed).length
      const blueRevealed = cards.filter((c) => c.color === 'blue' && c.revealed).length
      if (redRevealed >= state.redTotal) return { ...state, cards, phase: 'ended', winner: 'red' }
      if (blueRevealed >= state.blueTotal) return { ...state, cards, phase: 'ended', winner: 'blue' }
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
    case 'CAPTAIN_DISCONNECTED':
      return event.team === 'red'
        ? { ...state, captainRedConnected: false }
        : { ...state, captainBlueConnected: false }
    default:
      return state
  }
}
