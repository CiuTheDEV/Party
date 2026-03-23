import { useState, useCallback, useEffect, useMemo } from 'react'
import usePartySocket from 'partysocket/react'
import type { HostEvent, PresenterEvent } from '../../types/charades-events'
import { getPartykitHost } from '../../utils/charades-runtime'
import {
  clearPresenterSession,
  getPresenterHeartbeatMs,
  readPresenterSession,
  writePresenterSession,
} from '../../utils/charades-storage'

type PresenterPhase = 'your-turn' | 'timer-running' | 'timeout' | 'between' | 'ended'

type PresenterState = {
  phase: PresenterPhase
  currentTurnId: string
  word: string
  category: string
  presenterName: string
  timerRemaining: number
  nextPresenterName: string
  nextPresenterAvatar: string
}

export function usePresenter(roomId: string) {
  const sessionId = useMemo(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }

    return Math.random().toString(36).slice(2)
  }, [])

  const [state, setState] = useState<PresenterState>({
    phase: 'your-turn',
    currentTurnId: '',
    word: '',
    category: '',
    presenterName: '',
    timerRemaining: 0,
    nextPresenterName: '',
    nextPresenterAvatar: '',
  })

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    onOpen() {
      writeHeartbeat()
      const event: PresenterEvent = { type: 'DEVICE_CONNECTED' }
      socket.send(JSON.stringify(event))
    },
    onMessage(event) {
      const msg = JSON.parse(event.data) as HostEvent | { type: 'ROOM_STATE' }
      if (msg.type === 'ROOM_STATE') return
      handleHostEvent(msg as HostEvent)
    },
  })

  const writeHeartbeat = useCallback(() => {
    if (!roomId) {
      return
    }

    writePresenterSession({
      roomId,
      sessionId,
      connected: true,
      lastSeenAt: Date.now(),
    })
  }, [roomId, sessionId])

  useEffect(() => {
    if (!roomId) {
      return
    }

    writeHeartbeat()

    const interval = window.setInterval(writeHeartbeat, getPresenterHeartbeatMs())

    return () => {
      window.clearInterval(interval)
      const session = readPresenterSession()

      if (session?.sessionId === sessionId) {
        clearPresenterSession()
      }
    }
  }, [roomId, sessionId, writeHeartbeat])

  function handleHostEvent(event: HostEvent) {
    switch (event.type) {
      case 'TURN_START':
        setState((s) => ({
          ...s,
          phase: 'your-turn',
          currentTurnId: event.turnId,
          word: event.word,
          category: event.category,
          presenterName: event.presenterName,
          timerRemaining: event.timerSeconds,
        }))
        break
      case 'TIMER_TICK':
        setState((s) => {
          if (event.turnId !== s.currentTurnId) return s
          return { ...s, phase: 'timer-running', timerRemaining: event.remaining }
        })
        break
      case 'TURN_END':
        setState((s) => ({ ...s, phase: 'timeout', word: '' }))
        break
      case 'BETWEEN_TURNS':
        setState((s) => ({
          ...s,
          phase: 'between',
          nextPresenterName: event.nextPresenterName,
          nextPresenterAvatar: event.nextPresenterAvatar,
        }))
        break
      case 'GAME_END':
        setState((s) => ({ ...s, phase: 'ended', word: '' }))
        break
      case 'GAME_RESET':
        setState((s) => ({ ...s, phase: 'your-turn', word: '' }))
        break
    }
  }

  const confirmReady = useCallback(() => {
    const event: PresenterEvent = { type: 'PRESENTER_READY', turnId: state.currentTurnId }
    socket.send(JSON.stringify(event))
    setState((s) => ({ ...s, phase: 'timer-running' }))
  }, [state.currentTurnId, socket])

  return { state, confirmReady }
}
