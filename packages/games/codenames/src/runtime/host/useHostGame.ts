'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, IncomingMessage, RoomState } from '../shared/codenames-events'
import { getPartykitHost } from '../shared/codenames-runtime'
import {
  readCodenamesWordHistory,
  resetCodenamesCategoryHistories,
  writeCodenamesWordHistory,
} from '../shared/codenames-word-history'
import { ROUND_INTRO_DURATION_MS } from '../shared/RoundIntroOverlay'
import { prepareCodenamesGameStart } from './start-game'
import { canStartWaitingGame, shouldAutoStartPendingRound } from './start-policy'

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
  captainRedReady: false,
  captainBlueReady: false,
  boardUnlocked: false,
  redTeam: { name: 'Czerwoni', avatar: 'star' },
  blueTeam: { name: 'Niebiescy', avatar: 'moon' },
}

type UseHostGameParams = {
  categories: Array<{ id: string; words: string[] }>
  roomId: string
  teams: [{ name: string; avatar: string }, { name: string; avatar: string }]
}

export function useHostGame({ categories, roomId, teams }: UseHostGameParams) {
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState)
  const [hasSyncedRoomState, setHasSyncedRoomState] = useState(false)
  const [isRoundIntroVisible, setIsRoundIntroVisible] = useState(false)
  const [startBlockedReason, setStartBlockedReason] = useState<string | null>(null)

  const categoriesRef = useRef(categories)
  categoriesRef.current = categories
  const previousBoardUnlockedRef = useRef(false)
  const gameStartedRef = useRef(false)
  const pendingNewGameRef = useRef(false)
  const initialStartTriggeredRef = useRef(false)
  const teamsRef = useRef(teams)
  teamsRef.current = teams

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    party: 'codenames',
    onOpen() {
      socket.send(
        JSON.stringify({
          type: 'HOST_CONNECTED',
          redTeam: teamsRef.current[0],
          blueTeam: teamsRef.current[1],
        } satisfies HostEvent),
      )
    },
    onMessage(evt) {
      const msg = JSON.parse(evt.data) as IncomingMessage

      if (msg.type === 'ROOM_STATE') {
        setRoomState((current) => ({ ...msg.state, hostConnected: msg.state.hostConnected || current.hostConnected }))
        setHasSyncedRoomState(true)
        return
      }

      setRoomState((current) => applyEvent(current, msg))
    },
  })

  useEffect(() => {
    if (pendingNewGameRef.current) {
      return
    }

    if (initialStartTriggeredRef.current || gameStartedRef.current) {
      return
    }

    if (!canStartWaitingGame(roomState)) {
      return
    }

    initialStartTriggeredRef.current = true
    gameStartedRef.current = trySendGameStart(socket, categoriesRef.current, setStartBlockedReason)
  }, [roomState, socket])

  useEffect(() => {
    if (!pendingNewGameRef.current) {
      return
    }

    if (!shouldAutoStartPendingRound(roomState)) {
      return
    }

    pendingNewGameRef.current = false
    gameStartedRef.current = trySendGameStart(socket, categoriesRef.current, setStartBlockedReason)
  }, [roomState, socket])

  useEffect(() => {
    const previousBoardUnlocked = previousBoardUnlockedRef.current
    previousBoardUnlockedRef.current = roomState.boardUnlocked

    if (roomState.phase === 'playing' && roomState.boardUnlocked && !previousBoardUnlocked) {
      setIsRoundIntroVisible(true)

      const timeoutId = window.setTimeout(() => {
        setIsRoundIntroVisible(false)
      }, ROUND_INTRO_DURATION_MS)

      return () => window.clearTimeout(timeoutId)
    }

    if (roomState.phase !== 'playing' || !roomState.boardUnlocked) {
      setIsRoundIntroVisible(false)
    }
  }, [roomState.boardUnlocked, roomState.phase])

  const revealCard = useCallback(
    (index: number) => {
      if (isRoundIntroVisible || !roomState.boardUnlocked) return
      const event = { type: 'CARD_REVEAL' as const, index }
      socket.send(JSON.stringify(event satisfies HostEvent))
    },
    [isRoundIntroVisible, roomState.boardUnlocked, socket],
  )

  const setAssassinTeam = useCallback(
    (team: 'red' | 'blue') => {
      const event = { type: 'ASSASSIN_TEAM' as const, team }
      socket.send(JSON.stringify(event satisfies HostEvent))
    },
    [socket],
  )

  const startGame = useCallback(() => {
    if (!canStartWaitingGame(roomState) || gameStartedRef.current) {
      return
    }

    gameStartedRef.current = trySendGameStart(socket, categoriesRef.current, setStartBlockedReason)
  }, [roomState, socket])

  const resetGame = useCallback(() => {
    setStartBlockedReason(null)
    pendingNewGameRef.current = true
    gameStartedRef.current = false
    initialStartTriggeredRef.current = true
    const event = { type: 'GAME_RESET' as const }
    socket.send(JSON.stringify(event satisfies HostEvent))
  }, [socket])

  const restartMatch = useCallback(() => {
    setStartBlockedReason(null)
    pendingNewGameRef.current = true
    gameStartedRef.current = false
    initialStartTriggeredRef.current = true
    const event = { type: 'MATCH_RESET' as const }
    socket.send(JSON.stringify(event satisfies HostEvent))
  }, [socket])

  const clearStartBlockedReason = useCallback(() => {
    setStartBlockedReason(null)
  }, [])

  const resetPoolAndRetryStart = useCallback(() => {
    const activeCategoryIds = categoriesRef.current.map((category) => category.id)

    if (activeCategoryIds.length > 0) {
      writeCodenamesWordHistory(
        resetCodenamesCategoryHistories({
          history: readCodenamesWordHistory(),
          categoryIds: activeCategoryIds,
        }),
      )
    }

    setStartBlockedReason(null)

    if (!canStartWaitingGame(roomState) || gameStartedRef.current) {
      return
    }

    gameStartedRef.current = trySendGameStart(socket, categoriesRef.current, setStartBlockedReason)
  }, [roomState, socket])

  return {
    roomState,
    hasSyncedRoomState,
    revealCard,
    setAssassinTeam,
    resetGame,
    restartMatch,
    startGame,
    isRoundIntroVisible,
    startBlockedReason,
    clearStartBlockedReason,
    resetPoolAndRetryStart,
  }
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
        captainRedReady: false,
        captainBlueReady: false,
        boardUnlocked: false,
      }

    case 'HOST_CONNECTED':
      return { ...state, hostConnected: true, redTeam: msg.redTeam, blueTeam: msg.blueTeam }

    case 'CARD_REVEAL': {
      if (state.phase !== 'playing') return state
      if (!state.boardUnlocked) return state
      if (msg.index < 0 || msg.index > 24) return state
      if (!state.cards[msg.index]) return state
      if (state.cards[msg.index].revealed) return state
      const cards = state.cards.map((c, i) => (i === msg.index ? { ...c, revealed: true } : c))
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
        captainRedReady: false,
        captainBlueReady: false,
        boardUnlocked: false,
        redTeam: state.redTeam,
        blueTeam: state.blueTeam,
      }

    case 'MATCH_RESET':
      return {
        ...initialRoomState,
        hostConnected: true,
        captainRedConnected: state.captainRedConnected,
        captainBlueConnected: state.captainBlueConnected,
        captainRedReady: false,
        captainBlueReady: false,
        boardUnlocked: false,
        redTeam: state.redTeam,
        blueTeam: state.blueTeam,
      }

    case 'CAPTAIN_CONNECTED':
      return msg.team === 'red' ? { ...state, captainRedConnected: true } : { ...state, captainBlueConnected: true }

    case 'CAPTAIN_READY':
      return msg.team === 'red'
        ? { ...state, captainRedReady: true, boardUnlocked: state.captainBlueReady }
        : { ...state, captainBlueReady: true, boardUnlocked: state.captainRedReady }

    case 'CAPTAIN_DISCONNECTED':
      return msg.team === 'red'
        ? { ...state, captainRedConnected: false, captainRedReady: state.boardUnlocked ? state.captainRedReady : false }
        : { ...state, captainBlueConnected: false, captainBlueReady: state.boardUnlocked ? state.captainBlueReady : false }

    case 'HOST_DISCONNECTED':
      return { ...state, hostConnected: false }

    default:
      return state
  }
}

function trySendGameStart(
  socket: { send: (data: string) => void },
  categories: Array<{ id: string; words: string[] }>,
  setStartBlockedReason: (reason: string | null) => void,
) {
  const result = prepareCodenamesGameStart({
    categories,
    history: readCodenamesWordHistory(),
  })

  if (!result.ok) {
    setStartBlockedReason(result.reason)
    return false
  }

  writeCodenamesWordHistory(result.history)
  setStartBlockedReason(null)
  const event = {
    type: 'GAME_START' as const,
    cards: result.board.cards,
    redTotal: result.board.redTotal,
    blueTotal: result.board.blueTotal,
    startingTeam: result.board.startingTeam,
  }

  socket.send(JSON.stringify(event satisfies HostEvent))
  return true
}
