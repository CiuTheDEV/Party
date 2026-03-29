import { useState, useRef, useCallback, useEffect } from 'react'
import type { CharadesCategoryDifficulty } from '../../setup/state'
import usePartySocket from 'partysocket/react'
import type { HostEvent, PresenterEvent } from '../shared/charades-events'
import { getPartykitHost } from '../shared/charades-runtime'
import {
  createInitialGameState,
  GameSettings,
  GameState,
  Player,
} from './game-state-model'
import {
  buildPreparedTurnState,
  buildRoundOrderFinishedState,
  buildRoundStartState,
  buildRoundSummaryFinishedState,
  buildStoppedRoundState,
  buildVerdictState,
  getPendingTurnDescriptor,
} from './game-state-transitions'
import { usePhaseTimers } from './usePhaseTimers'
export type { GameSettings, Player } from './game-state-model'

export function useGameState(
  roomId: string,
  players: Player[],
  settings: GameSettings,
  getNextWord: () => { word: string; category: string; difficulty: CharadesCategoryDifficulty },
) {
  const [state, setState] = useState<GameState>(() => createInitialGameState(players, settings))
  const currentTurnIdRef = useRef('')

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    onOpen() {
      setState((current) => ({ ...current, isRoomConnected: true }))
    },
    onMessage(event) {
      const msg = JSON.parse(event.data) as PresenterEvent | HostEvent | { type: 'ROOM_STATE'; state: { presenterConnected: boolean } }

      if (msg.type === 'ROOM_STATE') {
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
      }
    },
    onError() {
      setState((current) => ({ ...current, isRoomConnected: false }))
    },
    onClose() {
      setState((current) => ({
        ...current,
        isRoomConnected: false,
      }))
    },
  })

  const send = useCallback((event: HostEvent) => {
    socket.send(JSON.stringify(event))
  }, [socket])

  const { clearPhaseTimer, pausePhaseTimer, resumePhaseTimer, startRevealBuffer } = usePhaseTimers({
    setState,
    send,
    timerSeconds: settings.timerSeconds,
    currentTurnIdRef,
  })

  const startRound = useCallback(() => {
    clearPhaseTimer()
    setState((current) => buildRoundStartState(current, settings))
  }, [clearPhaseTimer, settings])

  const finishRoundOrder = useCallback(() => {
    setState((current) => buildRoundOrderFinishedState(current, settings))
  }, [settings])

  useEffect(() => {
    if (state.phase !== 'prepare' || state.currentWord !== '' || state.order.length === 0) {
      return
    }

    const pendingTurn = getPendingTurnDescriptor(state)
    if (!pendingTurn) {
      return
    }

    const { word, category, difficulty } = getNextWord()
    const turnId = crypto.randomUUID()
    currentTurnIdRef.current = turnId

    send({
      type: 'TURN_START',
      turnId,
      word,
      category,
      difficulty,
      presenterName: pendingTurn.presenter.name,
      timerSeconds: settings.timerSeconds,
      nextPresenterName: pendingTurn.nextPresenter.name,
      nextPresenterAvatar: pendingTurn.nextPresenter.avatar,
      nextStep: pendingTurn.nextStep,
    })

    setState((current) => buildPreparedTurnState(current, settings, { word, category, difficulty }))
  }, [
    getNextWord,
    settings.timerSeconds,
    state.currentOrderIdx,
    state.currentWord,
    state.order,
    state.phase,
    state.players,
  ])

  const stopRoundEarly = useCallback(() => {
    clearPhaseTimer()
    send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'manual-stop' })
    setState((current) => buildStoppedRoundState(current))
  }, [clearPhaseTimer])

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
  }, [clearPhaseTimer, settings])

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
  }
}
