import { useCallback, useEffect, useRef, useState } from 'react'
import type { CharadesCategoryDifficulty } from '../../setup/state'
import usePartySocket from 'partysocket/react'
import type { HostEvent, PresenterEvent } from '../shared/charades-events'
import { getPartykitHost } from '../shared/charades-runtime'
import {
  createInitialGameState,
  type GameSettings,
  type GameState,
  type Player,
} from './game-state-model'
import {
  buildRoundOrderFinishedState,
  buildRoundStartState,
  buildRoundSummaryFinishedState,
  buildStoppedRoundState,
  buildVerdictState,
} from './game-state-transitions'
import { createPendingTurnStart, resolvePendingWordChange } from './game-state-runtime-helpers'
import { usePhaseTimers } from './usePhaseTimers'
import type { TurnPrompt } from './word-pool-helpers'

export type { GameSettings, Player } from './game-state-model'
export type HostRoomConnectionState = 'connected' | 'reconnecting' | 'error'

export function useGameState(
  roomId: string,
  players: Player[],
  settings: GameSettings,
  getNextWord: (playerKey: string) => { word: string; category: string; difficulty: CharadesCategoryDifficulty },
  getWordOnlyReroll: (params: {
    playerKey: string
    currentPrompt: TurnPrompt
    rejectedPromptKeysThisTurn: string[]
  }) => TurnPrompt | null,
  getWordAndCategoryReroll: (params: {
    playerKey: string
    currentPrompt: TurnPrompt
    rejectedPromptKeysThisTurn: string[]
  }) => TurnPrompt | null,
  recordRejectedPrompt: (playerKey: string, prompt: TurnPrompt) => void,
  commitPrompt: (prompt: TurnPrompt) => void,
) {
  const [state, setState] = useState<GameState>(() => createInitialGameState(players, settings))
  const [roomConnectionState, setRoomConnectionState] = useState<HostRoomConnectionState>('connected')
  const currentTurnIdRef = useRef('')
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    onOpen() {
      setRoomConnectionState('connected')
      setState((current) => ({ ...current, isRoomConnected: true }))
    },
    onMessage(event) {
      const msg = JSON.parse(event.data) as PresenterEvent | HostEvent | { type: 'ROOM_STATE'; state: { presenterConnected: boolean } }

      if (msg.type === 'ROOM_STATE') {
        setRoomConnectionState('connected')
        setState((current) => ({
          ...current,
          isDeviceConnected: msg.state.presenterConnected,
          isRoomConnected: true,
        }))
        return
      }

      if (msg.type === 'DEVICE_CONNECTED') {
        setState((current) => ({ ...current, isDeviceConnected: true }))
        return
      }

      if (msg.type === 'PRESENTER_DISCONNECTED') {
        setState((current) => ({ ...current, isDeviceConnected: false }))
        return
      }

      if (msg.type === 'WORD_REVEALED') {
        if (msg.turnId !== currentTurnIdRef.current) {
          return
        }

        startRevealBuffer(msg.turnId)
        return
      }

      if (msg.type !== 'CHANGE_WORD') {
        return
      }

      const wordChange = resolvePendingWordChange({
        state: stateRef.current,
        settings,
        currentTurnId: currentTurnIdRef.current,
        requestedTurnId: msg.turnId,
        getWordOnlyReroll,
        getWordAndCategoryReroll,
      })

      if (!wordChange) {
        return
      }

      recordRejectedPrompt(wordChange.playerKey, wordChange.rejectedPrompt)
      stateRef.current = wordChange.nextState
      setState(wordChange.nextState)
      send(wordChange.hostEvent)
    },
    onError() {
      setRoomConnectionState('error')
      setState((current) => ({ ...current, isRoomConnected: false }))
    },
    onClose() {
      setRoomConnectionState((current) => (current === 'error' ? current : 'reconnecting'))
      setState((current) => ({
        ...current,
        isRoomConnected: false,
      }))
    },
  })

  const send = useCallback((event: HostEvent) => {
    try {
      socket.send(JSON.stringify(event))
    } catch {
      setRoomConnectionState('error')
      setState((current) => ({ ...current, isRoomConnected: false }))
    }
  }, [socket])

  const { clearPhaseTimer, pausePhaseTimer, resumePhaseTimer, startRevealBuffer } = usePhaseTimers({
    setState,
    send,
    timerSeconds: settings.timerSeconds,
    currentTurnIdRef,
    onRevealCommit: () => {
      const currentState = stateRef.current

      if (
        currentState.phase !== 'reveal-buffer' ||
        !currentState.currentWord ||
        !currentState.currentCategory ||
        !currentState.currentDifficulty
      ) {
        return
      }

      commitPrompt({
        word: currentState.currentWord,
        category: currentState.currentCategory,
        difficulty: currentState.currentDifficulty,
      })

      const nextState = {
        ...currentState,
        rejectedPromptKeysThisTurn: [],
      }
      stateRef.current = nextState
      setState(nextState)
    },
  })

  const startRound = useCallback(() => {
    clearPhaseTimer()
    setState((current) => buildRoundStartState(current, settings))
  }, [clearPhaseTimer, settings])

  const finishRoundOrder = useCallback(() => {
    setState((current) => buildRoundOrderFinishedState(current, settings))
  }, [settings])

  useEffect(() => {
    const pendingTurn = createPendingTurnStart({
      state,
      settings,
      getNextWord,
      createTurnId: () => crypto.randomUUID(),
    })

    if (!pendingTurn) {
      return
    }

    currentTurnIdRef.current = pendingTurn.turnId
    send(pendingTurn.hostEvent)
    setState(pendingTurn.nextState)
  }, [
    getNextWord,
    send,
    settings,
    state.currentOrderIdx,
    state.currentWord,
    state.order,
    state.phase,
    state.remainingWordChangesByPlayer,
  ])

  const stopRoundEarly = useCallback(() => {
    clearPhaseTimer()
    send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'manual-stop' })
    setState((current) => buildStoppedRoundState(current))
  }, [clearPhaseTimer, send])

  const giveVerdict = useCallback((correct: boolean, guessedPlayerIdx?: number) => {
    clearPhaseTimer()
    send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'verdict' })

    setState((current) => {
      const result = buildVerdictState(current, settings, correct, guessedPlayerIdx)

      if (result.betweenTurns) {
        send({
          type: 'BETWEEN_TURNS',
          nextPresenterName: result.betweenTurns.presenterName,
          nextPresenterAvatar: result.betweenTurns.presenterAvatar,
        })
      }

      if (result.shouldEndGame) {
        send({ type: 'GAME_END' })
      }

      return result.nextState
    })
  }, [clearPhaseTimer, send, settings])

  const isGameOver = state.currentRound > state.totalRounds

  const finishRoundSummary = useCallback(() => {
    setState((current) => buildRoundSummaryFinishedState(current, settings))
  }, [settings])

  return {
    state,
    startRound,
    finishRoundOrder,
    finishRoundSummary,
    giveVerdict,
    stopRoundEarly,
    pausePhaseTimer,
    resumePhaseTimer,
    isGameOver,
    roomConnectionState,
  }
}
