import { useState, useRef, useCallback, useEffect } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, PresenterEvent } from '../../types/charades-events'

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
  | 'idle'           // przed wysłaniem hasła
  | 'waiting-ready'  // czekanie na PRESENTER_READY
  | 'timer-running'  // timer odlicza
  | 'verdict'        // czas minął, czekamy na werdykt
  | 'between'        // między turami

type GameState = {
  phase: GamePhase
  players: Player[]
  order: number[]       // indeksy graczy w kolejności prezentowania
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
    phase: 'idle',
    players: players.map((p) => ({ ...p, score: 0 })),
    order: shuffle(players.map((_, i) => i)),
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

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? 'localhost:1999',
    room: roomId,
    onMessage(event) {
      const msg = JSON.parse(event.data) as PresenterEvent | { type: 'ROOM_STATE' }
      if (msg.type === 'PRESENTER_READY') {
        if ((msg as PresenterEvent & { type: 'PRESENTER_READY' }).turnId !== currentTurnIdRef.current) return
        startTimer()
      }
      if (msg.type === 'DEVICE_CONNECTED') {
        setState((s) => ({ ...s, isDeviceConnected: true }))
      }
    },
    onClose() {
      setState((s) => ({ ...s, isDeviceConnected: false }))
    },
  })

  function send(event: HostEvent) {
    socket.send(JSON.stringify(event))
  }

  function startTimer() {
    setState((s) => ({ ...s, phase: 'timer-running' }))
    let remaining = settings.timerSeconds
    timerRef.current = setInterval(() => {
      remaining -= 1
      send({ type: 'TIMER_TICK', turnId: currentTurnIdRef.current, remaining })
      setState((s) => ({ ...s, timerRemaining: remaining }))
      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        setState((s) => ({ ...s, phase: 'verdict' }))
        send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'timeout' })
      }
    }, 1000)
  }

  const sendWord = useCallback(() => {
    const { word, category } = getNextWord()
    const turnId = crypto.randomUUID()
    currentTurnIdRef.current = turnId
    const presenterIdx = state.order[state.currentOrderIdx]
    const presenter = state.players[presenterIdx]

    send({
      type: 'TURN_START',
      turnId,
      word,
      category,
      presenterName: presenter.name,
      timerSeconds: settings.timerSeconds,
    })

    setState((s) => ({
      ...s,
      phase: 'waiting-ready',
      currentWord: word,
      currentCategory: category,
      timerRemaining: settings.timerSeconds,
    }))
  }, [getNextWord, settings.timerSeconds, state.order, state.currentOrderIdx, state.players])

  const giveVerdict = useCallback((correct: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current)
    send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'verdict' })

    setState((s) => {
      const presenterIdx = s.order[s.currentOrderIdx]
      const updatedPlayers = s.players.map((p, i) =>
        i === presenterIdx && correct ? { ...p, score: p.score + 1 } : p,
      )
      const isLastInRound = s.currentOrderIdx === s.order.length - 1
      const isLastRound = s.currentRound === s.totalRounds && isLastInRound
      // Oblicz nextOrderIdx PRZED aktualizacją stanu
      const nextOrderIdx = isLastInRound ? 0 : s.currentOrderIdx + 1
      const nextRound = isLastInRound ? s.currentRound + 1 : s.currentRound
      // nextPresenter oparty na nextOrderIdx — nie na currentOrderIdx
      const nextPresenterIdx = s.order[nextOrderIdx]
      const nextPresenter = updatedPlayers[nextPresenterIdx]

      if (!isLastRound) {
        send({
          type: 'BETWEEN_TURNS',
          nextPresenterName: nextPresenter.name,
          nextPresenterAvatar: nextPresenter.avatar,
        })
      } else {
        send({ type: 'GAME_END' })
      }

      return {
        ...s,
        players: updatedPlayers,
        // phase 'idle' gdy koniec gry (komponent /play wykryje isGameOver i przekieruje)
        phase: isLastRound ? 'idle' : 'between',
        currentOrderIdx: nextOrderIdx,
        currentRound: nextRound,
      }
    })
  }, [])

  const isGameOver = state.currentRound > state.totalRounds

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return { state, sendWord, giveVerdict, isGameOver }
}

function shuffle(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
