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
  buildPreparedTurnState,
  buildRoundOrderFinishedState,
  buildRoundStartState,
  buildRoundSummaryFinishedState,
  buildStoppedRoundState,
  buildVerdictState,
  getPendingTurnDescriptor,
} from './game-state-transitions'
import { usePhaseTimers } from './usePhaseTimers'
import { toPlayerHistoryKey } from './word-history-helpers'
import { resolveWordChangeRequest } from './word-change-helpers'
import type { TurnPrompt } from './word-pool-helpers'

export type { GameSettings, Player } from './game-state-model'

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
  const currentTurnIdRef = useRef('')
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

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
        return
      }

      if (msg.type !== 'CHANGE_WORD') {
        return
      }

      const currentState = stateRef.current

      if (
        currentState.phase !== 'reveal-buffer' ||
        msg.turnId !== currentTurnIdRef.current ||
        !settings.wordChange.enabled ||
        currentState.currentDifficulty === ''
      ) {
        return
      }

      const currentPrompt: TurnPrompt = {
        word: currentState.currentWord,
        category: currentState.currentCategory,
        difficulty: currentState.currentDifficulty,
      }
      const presenterIdx = currentState.order[currentState.currentOrderIdx]
      const presenter = presenterIdx === undefined ? undefined : currentState.players[presenterIdx]
      const playerKey = presenter ? toPlayerHistoryKey(presenter) : ''
      const nextPrompt =
        settings.wordChange.rerollScope === 'word-only'
          ? getWordOnlyReroll({
              playerKey,
              currentPrompt,
              rejectedPromptKeysThisTurn: currentState.rejectedPromptKeysThisTurn,
            })
          : getWordAndCategoryReroll({
              playerKey,
              currentPrompt,
              rejectedPromptKeysThisTurn: currentState.rejectedPromptKeysThisTurn,
            })
      const result = resolveWordChangeRequest({
        state: currentState,
        settings,
        currentTurnId: currentTurnIdRef.current,
        requestedTurnId: msg.turnId,
        nextPrompt,
      })

      if (!result.sync) {
        return
      }

      recordRejectedPrompt(playerKey, currentPrompt)
      stateRef.current = result.nextState
      setState(result.nextState)
      send({
        type: 'WORD_CHANGED',
        turnId: msg.turnId,
        word: result.sync.word,
        category: result.sync.category,
        difficulty: result.sync.difficulty,
        remainingWordChanges: result.sync.remainingWordChanges,
      })
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
    if (state.phase !== 'prepare' || state.currentWord !== '' || state.order.length === 0) {
      return
    }

    const pendingTurn = getPendingTurnDescriptor(state)

    if (!pendingTurn) {
      return
    }

    const playerKey = toPlayerHistoryKey(pendingTurn.presenter)
    const { word, category, difficulty } = getNextWord(playerKey)
    const turnId = crypto.randomUUID()
    const presenterIdx = state.order[state.currentOrderIdx]
    currentTurnIdRef.current = turnId

    send({
      type: 'TURN_START',
      turnId,
      word,
      category,
      difficulty,
      canChangeWord: settings.wordChange.enabled,
      remainingWordChanges: state.remainingWordChangesByPlayer[presenterIdx] ?? 0,
      presenterName: pendingTurn.presenter.name,
      timerSeconds: settings.timerSeconds,
      nextPresenterName: pendingTurn.nextPresenter.name,
      nextPresenterAvatar: pendingTurn.nextPresenter.avatar,
      nextStep: pendingTurn.nextStep,
    })

    setState((current) => buildPreparedTurnState(current, settings, { word, category, difficulty }))
  }, [
    getNextWord,
    send,
    settings,
    state.currentOrderIdx,
    state.currentWord,
    state.order,
    state.phase,
    state.remainingWordChangesByPlayer,
    commitPrompt,
    recordRejectedPrompt,
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
  }
}
