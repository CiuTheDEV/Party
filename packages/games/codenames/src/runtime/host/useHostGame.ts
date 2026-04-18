'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, IncomingMessage, RoomState } from '../shared/codenames-events'
import { getPartykitHost } from '../shared/codenames-runtime'
import { generateBoard } from '../shared/board-generator'
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

type UseHostGameParams = {
  roomId: string
  wordPool: string[]
}

export function useHostGame({ roomId, wordPool }: UseHostGameParams) {
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState)
  const [isRoundIntroVisible, setIsRoundIntroVisible] = useState(false)

  // Refs that are always current — safe to use inside socket callbacks
  const wordPoolRef = useRef(wordPool)
  wordPoolRef.current = wordPool
  const previousPhaseRef = useRef<RoomState['phase'] | null>(null)

  // Tracks whether we already sent GAME_START for this session
  // so reconnects don't send it again when the room is already playing
  const gameStartedRef = useRef(false)

  // Tracks whether we sent GAME_RESET and are waiting to send GAME_START after
  const pendingNewGameRef = useRef(false)

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    party: 'codenames',
    onOpen() {
      socket.send(JSON.stringify({ type: 'HOST_CONNECTED' }))
    },
    onMessage(evt) {
      const msg = JSON.parse(evt.data) as IncomingMessage

      if (msg.type === 'ROOM_STATE') {
        setRoomState((current) => {
          const nextState = { ...msg.state, hostConnected: msg.state.hostConnected || current.hostConnected }

          // First message after connect. If room is fresh → start immediately.
          // If already playing (host reconnected mid-game) → do nothing.
          if (
            nextState.phase === 'waiting' &&
            !gameStartedRef.current &&
            nextState.captainRedConnected &&
            nextState.captainBlueConnected
          ) {
            sendGameStart(socket, wordPoolRef.current)
            gameStartedRef.current = true
          }

          return nextState
        })
        return
      }

      setRoomState((s) => applyEvent(s, msg))
    },
  })

  useEffect(() => {
    if (!pendingNewGameRef.current) {
      return
    }

    if (roomState.phase !== 'waiting') {
      return
    }

    if (!roomState.captainRedConnected || !roomState.captainBlueConnected) {
      return
    }

    pendingNewGameRef.current = false
    sendGameStart(socket, wordPoolRef.current)
    gameStartedRef.current = true
  }, [roomState, socket])

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

  const revealCard = useCallback(
    (index: number) => {
      if (isRoundIntroVisible) return
      const event = { type: 'CARD_REVEAL' as const, index }
      socket.send(JSON.stringify(event satisfies HostEvent))
    },
    [isRoundIntroVisible, socket],
  )

  const setAssassinTeam = useCallback(
    (team: 'red' | 'blue') => {
      const event = { type: 'ASSASSIN_TEAM' as const, team }
      socket.send(JSON.stringify(event satisfies HostEvent))
    },
    [socket],
  )

  const resetGame = useCallback(() => {
    pendingNewGameRef.current = true
    gameStartedRef.current = false
    const event = { type: 'GAME_RESET' as const }
    socket.send(JSON.stringify(event satisfies HostEvent))
  }, [socket])

  const restartMatch = useCallback(() => {
    pendingNewGameRef.current = true
    gameStartedRef.current = false
    const event = { type: 'MATCH_RESET' as const }
    socket.send(JSON.stringify(event satisfies HostEvent))
  }, [socket])

  return { roomState, revealCard, setAssassinTeam, resetGame, restartMatch, isRoundIntroVisible }
}


export function applyEvent(state: RoomState, msg: IncomingMessage): RoomState {
  switch (msg.type) {
    case 'GAME_START':
      if (state.phase !== 'waiting') return state
      return {
        ...state,
        hostConnected: true,
        phase: 'playing',
        cards: msg.cards,
        redTotal: msg.redTotal,
        blueTotal: msg.blueTotal,
        startingTeam: msg.startingTeam,
        winner: null,
        assassinTeam: null,
      }

    case 'HOST_CONNECTED':
      return { ...state, hostConnected: true }

    case 'CARD_REVEAL': {
      if (state.phase !== 'playing') return state
      if (msg.index < 0 || msg.index > 24) return state
      if (!state.cards[msg.index]) return state
      if (state.cards[msg.index].revealed) return state
      const cards = state.cards.map((c, i) =>
        i === msg.index ? { ...c, revealed: true } : c,
      )
      const hit = cards[msg.index]
      if (hit.color === 'assassin') return { ...state, hostConnected: true, cards, phase: 'assassin-reveal' }
      const redRevealed = cards.filter((c) => c.color === 'red' && c.revealed).length
      const blueRevealed = cards.filter((c) => c.color === 'blue' && c.revealed).length
      if (redRevealed >= state.redTotal) return { ...state, hostConnected: true, cards, phase: 'ended', winner: 'red', roundWinsRed: state.roundWinsRed + 1 }
      if (blueRevealed >= state.blueTotal) return { ...state, hostConnected: true, cards, phase: 'ended', winner: 'blue', roundWinsBlue: state.roundWinsBlue + 1 }
      return { ...state, hostConnected: true, cards }
    }

    case 'ASSASSIN_TEAM':
      if (state.phase !== 'assassin-reveal') return state
      const winner = msg.team === 'red' ? 'blue' : 'red'
      return {
        ...state,
        hostConnected: true,
        assassinTeam: msg.team,
        winner,
        phase: 'ended',
        roundWinsRed: winner === 'red' ? state.roundWinsRed + 1 : state.roundWinsRed,
        roundWinsBlue: winner === 'blue' ? state.roundWinsBlue + 1 : state.roundWinsBlue,
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
      return msg.team === 'red' ? { ...state, captainRedConnected: true } : { ...state, captainBlueConnected: true }

    case 'CAPTAIN_DISCONNECTED':
      return msg.team === 'red' ? { ...state, captainRedConnected: false } : { ...state, captainBlueConnected: false }

    case 'HOST_DISCONNECTED':
      return { ...state, hostConnected: false }

    default:
      return state
  }
}

function sendGameStart(socket: { send: (data: string) => void }, wordPool: string[]) {
  const board = generateBoard(wordPool)
  const event = {
    type: 'GAME_START' as const,
    cards: board.cards,
    redTotal: board.redTotal,
    blueTotal: board.blueTotal,
    startingTeam: board.startingTeam,
  }

  socket.send(JSON.stringify(event satisfies HostEvent))
}
