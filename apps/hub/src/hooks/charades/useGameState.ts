import { useState, useRef, useCallback, useEffect } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, PresenterEvent } from '../../types/charades-events'
import type { CategoryDifficulty } from '../../components/charades/CategoryPicker/CategoryPicker'
import { getPartykitHost } from '../../utils/charades-runtime'

export type Player = {
  name: string
  avatar: string
  gender: 'on' | 'ona' | 'none'
  score: number
}

export type GameSettings = {
  rounds: number
  timerSeconds: number
}

type GamePhase =
  | 'round-order'
  | 'prepare'
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

type GameState = {
  phase: GamePhase
  players: Player[]
  order: number[]
  isRoundOrderRevealing: boolean
  currentOrderIdx: number
  currentRound: number
  totalRounds: number
  timerRemaining: number
  bufferRemaining: number
  currentWord: string
  currentCategory: string
  currentDifficulty: CategoryDifficulty | ''
  isDeviceConnected: boolean
}

const REVEAL_BUFFER_SECONDS = 10

export function useGameState(
  roomId: string,
  players: Player[],
  settings: GameSettings,
  getNextWord: () => { word: string; category: string; difficulty: CategoryDifficulty },
) {
  const [state, setState] = useState<GameState>({
    phase: 'round-order',
    players: players.map((player) => ({ ...player, score: 0 })),
    order: [],
    isRoundOrderRevealing: false,
    currentOrderIdx: 0,
    currentRound: 1,
    totalRounds: settings.rounds,
    timerRemaining: settings.timerSeconds,
    bufferRemaining: REVEAL_BUFFER_SECONDS,
    currentWord: '',
    currentCategory: '',
    currentDifficulty: '',
    isDeviceConnected: false,
  })

  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentTurnIdRef = useRef('')

  function clearPhaseTimer() {
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current)
      phaseTimerRef.current = null
    }
  }

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    onMessage(event) {
      const msg = JSON.parse(event.data) as PresenterEvent | { type: 'ROOM_STATE' }

      if (msg.type === 'DEVICE_CONNECTED') {
        setState((current) => ({ ...current, isDeviceConnected: true }))
        return
      }

      if (msg.type === 'WORD_REVEALED') {
        if (msg.turnId !== currentTurnIdRef.current) {
          return
        }

        startRevealBuffer(msg.turnId)
      }
    },
    onClose() {
      setState((current) => ({ ...current, isDeviceConnected: false }))
    },
  })

  function send(event: HostEvent) {
    socket.send(JSON.stringify(event))
  }

  const startTimer = useCallback(() => {
    clearPhaseTimer()
    setState((current) => ({
      ...current,
      phase: 'timer-running',
      bufferRemaining: 0,
      timerRemaining: settings.timerSeconds,
    }))

    let remaining = settings.timerSeconds
    phaseTimerRef.current = setInterval(() => {
      remaining -= 1
      send({ type: 'TIMER_TICK', turnId: currentTurnIdRef.current, remaining })
      setState((current) => ({ ...current, timerRemaining: remaining }))

      if (remaining <= 0) {
        clearPhaseTimer()
        setState((current) => ({ ...current, phase: 'verdict' }))
        send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'timeout' })
      }
    }, 1000)
  }, [settings.timerSeconds])

  const startRevealBuffer = useCallback((turnId: string) => {
    clearPhaseTimer()
    let remaining = REVEAL_BUFFER_SECONDS

    send({ type: 'REVEAL_BUFFER_START', turnId, remaining })
    setState((current) => ({
      ...current,
      phase: 'reveal-buffer',
      bufferRemaining: remaining,
    }))

    phaseTimerRef.current = setInterval(() => {
      remaining -= 1

      if (remaining <= 0) {
        clearPhaseTimer()
        send({ type: 'REVEAL_BUFFER_END', turnId })
        startTimer()
        return
      }

      send({ type: 'REVEAL_BUFFER_TICK', turnId, remaining })
      setState((current) => ({ ...current, bufferRemaining: remaining }))
    }, 1000)
  }, [startTimer])

  const startRound = useCallback(() => {
    clearPhaseTimer()
    setState((current) => ({
      ...current,
      order: shuffle(current.players.map((_, index) => index)),
      isRoundOrderRevealing: true,
      currentOrderIdx: 0,
      currentWord: '',
      currentCategory: '',
      currentDifficulty: '',
      bufferRemaining: REVEAL_BUFFER_SECONDS,
      timerRemaining: settings.timerSeconds,
    }))
  }, [settings.timerSeconds])

  const finishRoundOrder = useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'prepare',
      isRoundOrderRevealing: false,
      currentOrderIdx: 0,
      currentWord: '',
      currentCategory: '',
      currentDifficulty: '',
      bufferRemaining: REVEAL_BUFFER_SECONDS,
      timerRemaining: settings.timerSeconds,
    }))
  }, [settings.timerSeconds])

  useEffect(() => {
    if (state.phase !== 'prepare' || state.currentWord !== '' || state.order.length === 0) {
      return
    }

    const presenterIdx = state.order[state.currentOrderIdx]
    const presenter = state.players[presenterIdx]

    if (!presenter) {
      return
    }

    const { word, category, difficulty } = getNextWord()
    const turnId = crypto.randomUUID()
    const nextPresenter = getNextPresenter(state.order, state.currentOrderIdx, state.players)
    const isLastInRound = state.currentOrderIdx === state.order.length - 1
    const nextStep = isLastInRound
      ? state.currentRound === state.totalRounds
        ? 'game-end'
        : 'round-summary'
      : 'next-presenter'
    currentTurnIdRef.current = turnId

    send({
      type: 'TURN_START',
      turnId,
      word,
      category,
      difficulty,
      presenterName: presenter.name,
      timerSeconds: settings.timerSeconds,
      nextPresenterName: nextPresenter.name,
      nextPresenterAvatar: nextPresenter.avatar,
      nextStep,
    })

    setState((current) => ({
      ...current,
      currentWord: word,
      currentCategory: category,
      currentDifficulty: difficulty,
      timerRemaining: settings.timerSeconds,
      bufferRemaining: REVEAL_BUFFER_SECONDS,
    }))
  }, [
    getNextWord,
    settings.timerSeconds,
    state.currentOrderIdx,
    state.currentWord,
    state.order,
    state.phase,
    state.players,
  ])

  const sendWord = useCallback(() => {
    return
  }, [])

  const stopRoundEarly = useCallback(() => {
    clearPhaseTimer()
    send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'manual-stop' })
    setState((current) => ({
      ...current,
      phase: 'verdict',
      timerRemaining: Math.max(current.timerRemaining, 0),
    }))
  }, [])

  const giveVerdict = useCallback((correct: boolean, guessedPlayerIdx?: number) => {
    clearPhaseTimer()
    send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'verdict' })

    setState((current) => {
      const winnerIdx = correct ? guessedPlayerIdx : undefined
      const updatedPlayers = current.players.map((player, index) =>
        index === winnerIdx ? { ...player, score: player.score + 1 } : player,
      )

      const isLastInRound = current.currentOrderIdx === current.order.length - 1
      const isGameEnding = current.currentRound === current.totalRounds && isLastInRound

      if (!isLastInRound) {
        const nextPresenterIdx = current.order[current.currentOrderIdx + 1]
        const nextPresenter = updatedPlayers[nextPresenterIdx]

        send({
          type: 'BETWEEN_TURNS',
          nextPresenterName: nextPresenter.name,
          nextPresenterAvatar: nextPresenter.avatar,
        })

        return {
          ...current,
          players: updatedPlayers,
          phase: 'prepare',
          currentOrderIdx: current.currentOrderIdx + 1,
          currentWord: '',
          currentCategory: '',
          currentDifficulty: '',
          bufferRemaining: REVEAL_BUFFER_SECONDS,
          timerRemaining: settings.timerSeconds,
        }
      }

      if (!isGameEnding) {
        return {
          ...current,
          players: updatedPlayers,
          phase: 'round-summary',
          isRoundOrderRevealing: false,
          currentOrderIdx: 0,
          currentWord: '',
          currentCategory: '',
          currentDifficulty: '',
          bufferRemaining: REVEAL_BUFFER_SECONDS,
          timerRemaining: settings.timerSeconds,
        }
      }

      send({ type: 'GAME_END' })
      return {
        ...current,
        players: updatedPlayers,
        phase: 'verdict',
        currentRound: current.currentRound + 1,
        currentWord: '',
        currentCategory: '',
        currentDifficulty: '',
        bufferRemaining: 0,
      }
    })
  }, [settings.timerSeconds])

  const isGameOver = state.currentRound > state.totalRounds

  const finishRoundSummary = useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'round-order',
      order: [],
      isRoundOrderRevealing: false,
      currentOrderIdx: 0,
      currentRound: current.currentRound + 1,
      currentWord: '',
      currentCategory: '',
      currentDifficulty: '',
      bufferRemaining: REVEAL_BUFFER_SECONDS,
      timerRemaining: settings.timerSeconds,
    }))
  }, [settings.timerSeconds])

  useEffect(() => {
    return () => {
      clearPhaseTimer()
    }
  }, [])

  return { state, startRound, finishRoundOrder, finishRoundSummary, sendWord, giveVerdict, stopRoundEarly, isGameOver }
}

function shuffle(values: number[]) {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

function getNextPresenter(order: number[], currentOrderIdx: number, players: Player[]) {
  const nextPresenterIdx = order[currentOrderIdx + 1]
  const nextPresenter = nextPresenterIdx === undefined ? undefined : players[nextPresenterIdx]

  return {
    name: nextPresenter?.name ?? '',
    avatar: nextPresenter?.avatar ?? '',
  }
}
