import { useState, useRef, useCallback, useEffect } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, PresenterEvent } from '../../types/charades-events'
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
  | 'waiting-ready'
  | 'timer-running'
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
  currentWord: string
  currentCategory: string
  isDeviceConnected: boolean
}

export function useGameState(
  roomId: string,
  players: Player[],
  settings: GameSettings,
  getNextWord: () => { word: string; category: string },
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
    currentWord: '',
    currentCategory: '',
    isDeviceConnected: false,
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentTurnIdRef = useRef('')

  const startTimer = useCallback(() => {
    setState((current) => ({ ...current, phase: 'timer-running' }))

    let remaining = settings.timerSeconds
    timerRef.current = setInterval(() => {
      remaining -= 1
      send({ type: 'TIMER_TICK', turnId: currentTurnIdRef.current, remaining })
      setState((current) => ({ ...current, timerRemaining: remaining }))

      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        setState((current) => ({ ...current, phase: 'verdict' }))
        send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'timeout' })
      }
    }, 1000)
  }, [settings.timerSeconds])

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    onMessage(event) {
      const msg = JSON.parse(event.data) as PresenterEvent | { type: 'ROOM_STATE' }

      if (msg.type === 'PRESENTER_READY') {
        if ((msg as PresenterEvent & { type: 'PRESENTER_READY' }).turnId !== currentTurnIdRef.current) {
          return
        }
        startTimer()
      }

      if (msg.type === 'DEVICE_CONNECTED') {
        setState((current) => ({ ...current, isDeviceConnected: true }))
      }
    },
    onClose() {
      setState((current) => ({ ...current, isDeviceConnected: false }))
    },
  })

  function send(event: HostEvent) {
    socket.send(JSON.stringify(event))
  }

  const startRound = useCallback(() => {
    setState((current) => ({
      ...current,
      order: shuffle(current.players.map((_, index) => index)),
      isRoundOrderRevealing: true,
      currentOrderIdx: 0,
    }))
  }, [])

  const finishRoundOrder = useCallback(() => {
    setState((current) => ({
      ...current,
      phase: 'prepare',
      isRoundOrderRevealing: false,
      currentOrderIdx: 0,
    }))
  }, [])

  const sendWord = useCallback(() => {
    const { word, category } = getNextWord()
    const turnId = crypto.randomUUID()
    currentTurnIdRef.current = turnId

    const presenterIdx = state.order[state.currentOrderIdx]
    const presenter = state.players[presenterIdx]

    if (!presenter) {
      return
    }

    send({
      type: 'TURN_START',
      turnId,
      word,
      category,
      presenterName: presenter.name,
      timerSeconds: settings.timerSeconds,
    })

    setState((current) => ({
      ...current,
      phase: 'waiting-ready',
      currentWord: word,
      currentCategory: category,
      timerRemaining: settings.timerSeconds,
    }))
  }, [getNextWord, settings.timerSeconds, state.currentOrderIdx, state.order, state.players])

  const giveVerdict = useCallback((correct: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'verdict' })

    setState((current) => {
      const presenterIdx = current.order[current.currentOrderIdx]
      const updatedPlayers = current.players.map((player, index) =>
        index === presenterIdx && correct ? { ...player, score: player.score + 1 } : player,
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
        }
      }

      if (!isGameEnding) {
        const nextPresenter = updatedPlayers[0]

        send({
          type: 'BETWEEN_TURNS',
          nextPresenterName: nextPresenter.name,
          nextPresenterAvatar: nextPresenter.avatar,
        })

        return {
          ...current,
          players: updatedPlayers,
          phase: 'round-order',
          order: [],
          isRoundOrderRevealing: false,
          currentOrderIdx: 0,
          currentRound: current.currentRound + 1,
        }
      }

      send({ type: 'GAME_END' })
      return {
        ...current,
        players: updatedPlayers,
        phase: 'verdict',
        currentRound: current.currentRound + 1,
      }
    })
  }, [])

  const isGameOver = state.currentRound > state.totalRounds

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return { state, startRound, finishRoundOrder, sendWord, giveVerdict, isGameOver }
}

function shuffle(values: number[]) {
  const shuffled = [...values]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}
