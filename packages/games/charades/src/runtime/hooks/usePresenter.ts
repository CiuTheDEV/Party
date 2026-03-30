import { useState, useCallback, useEffect, useMemo } from 'react'
import usePartySocket from 'partysocket/react'
import type { PresenterViewState } from '../presenter/types'
import type { HostEvent, PresenterEvent, RoomState, RoomStateMessage } from '../shared/charades-events'
import { getPartykitHost } from '../shared/charades-runtime'
import {
  clearPresenterSession,
  getPresenterHeartbeatMs,
  readPresenterSession,
  writePresenterSession,
} from '../shared/charades-storage'

const INITIAL_PRESENTER_STATE: PresenterViewState = {
  phase: 'waiting',
  currentTurnId: '',
  word: '',
  category: '',
  difficulty: '',
  canChangeWord: false,
  remainingWordChanges: 0,
  presenterName: '',
  timerRemaining: 0,
  timerDuration: 0,
  revealRemaining: 0,
  revealDuration: 0,
  nextPresenterName: '',
  nextPresenterAvatar: '',
  nextStep: 'next-presenter',
  turnEndReason: 'none',
}

export function usePresenter(roomId: string) {
  const sessionId = useMemo(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }

    return Math.random().toString(36).slice(2)
  }, [])

  const [state, setState] = useState<PresenterViewState>(INITIAL_PRESENTER_STATE)

  const socket = usePartySocket({
    host: getPartykitHost(),
    room: roomId,
    onOpen() {
      writeHeartbeat()
      const event: PresenterEvent = { type: 'DEVICE_CONNECTED' }
      socket.send(JSON.stringify(event))
    },
    onMessage(event) {
      const msg = JSON.parse(event.data) as HostEvent | RoomStateMessage
      if (msg.type === 'ROOM_STATE') {
        setState(mapRoomStateToPresenterView(msg.state))
        return
      }
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
          difficulty: event.difficulty,
          canChangeWord: event.canChangeWord,
          remainingWordChanges: event.remainingWordChanges,
          presenterName: event.presenterName,
          timerRemaining: event.timerSeconds,
          timerDuration: event.timerSeconds,
          revealRemaining: 0,
          revealDuration: 0,
          nextPresenterName: event.nextPresenterName,
          nextPresenterAvatar: event.nextPresenterAvatar,
          nextStep: event.nextStep,
          turnEndReason: 'none',
        }))
        break
      case 'REVEAL_BUFFER_START':
      case 'REVEAL_BUFFER_TICK':
        setState((s) => {
          if (event.turnId !== s.currentTurnId) return s
          return {
            ...s,
            phase: 'reveal-buffer',
            revealRemaining: event.remaining,
            revealDuration: s.revealDuration || event.remaining,
          }
        })
        break
      case 'REVEAL_BUFFER_END':
        setState((s) => {
          if (event.turnId !== s.currentTurnId) return s
          return { ...s, phase: 'timer-running', revealRemaining: 0 }
        })
        break
      case 'WORD_CHANGED':
        setState((s) => {
          if (event.turnId !== s.currentTurnId) return s
          return {
            ...s,
            word: event.word,
            category: event.category,
            difficulty: event.difficulty,
            remainingWordChanges: event.remainingWordChanges,
          }
        })
        break
      case 'TIMER_TICK':
        setState((s) => {
          if (event.turnId !== s.currentTurnId) return s
          return { ...s, phase: 'timer-running', timerRemaining: event.remaining }
        })
        break
      case 'TURN_END':
        setState((s) => {
          if (event.turnId !== s.currentTurnId) return s
          return {
            ...s,
            phase: 'awaiting-verdict',
            word: '',
            difficulty: '',
            canChangeWord: false,
            remainingWordChanges: 0,
            revealRemaining: 0,
            turnEndReason: event.reason,
          }
        })
        break
      case 'BETWEEN_TURNS':
        setState((s) => ({
          ...s,
          phase: 'between',
          nextPresenterName: event.nextPresenterName,
          nextPresenterAvatar: event.nextPresenterAvatar,
          word: '',
          difficulty: '',
          canChangeWord: false,
          remainingWordChanges: 0,
          revealRemaining: 0,
          turnEndReason: 'none',
        }))
        break
      case 'GAME_END':
        setState((s) => ({
          ...s,
          phase: 'ended',
          word: '',
          difficulty: '',
          canChangeWord: false,
          remainingWordChanges: 0,
          revealRemaining: 0,
          turnEndReason: 'none',
        }))
        break
      case 'GAME_RESET':
        setState(INITIAL_PRESENTER_STATE)
        break
    }
  }

  const revealWord = useCallback(() => {
    if (!state.currentTurnId) {
      return false
    }

    const event: PresenterEvent = { type: 'WORD_REVEALED', turnId: state.currentTurnId }
    try {
      socket.send(JSON.stringify(event))
      return true
    } catch {
      return false
    }
  }, [state.currentTurnId, socket])

  const changeWord = useCallback(() => {
    if (
      !state.currentTurnId ||
      state.phase !== 'reveal-buffer' ||
      !state.canChangeWord ||
      state.remainingWordChanges <= 0
    ) {
      return false
    }

    const event: PresenterEvent = { type: 'CHANGE_WORD', turnId: state.currentTurnId }

    try {
      socket.send(JSON.stringify(event))
      return true
    } catch {
      return false
    }
  }, [state.canChangeWord, state.currentTurnId, state.phase, state.remainingWordChanges, socket])

  return { state, revealWord, changeWord }
}

function mapRoomStateToPresenterView(roomState: RoomState): PresenterViewState {
  switch (roomState.presenterPhase) {
    case 'your-turn':
    case 'reveal-buffer':
    case 'timer-running':
    case 'awaiting-verdict':
    case 'timeout':
      return {
        phase: roomState.presenterPhase === 'timeout' ? 'awaiting-verdict' : roomState.presenterPhase,
        currentTurnId: roomState.currentTurnId,
        word: roomState.currentWord,
        category: roomState.currentCategory,
        difficulty: roomState.currentDifficulty,
        canChangeWord: roomState.canChangeWord,
        remainingWordChanges: roomState.remainingWordChanges,
        presenterName: roomState.currentPresenter,
        timerRemaining: roomState.timerRemaining,
        timerDuration: roomState.timerDuration,
        revealRemaining: roomState.revealRemaining,
        revealDuration: roomState.revealDuration,
        nextPresenterName: roomState.nextPresenterName,
        nextPresenterAvatar: roomState.nextPresenterAvatar,
        nextStep: roomState.nextStep,
        turnEndReason: roomState.turnEndReason,
      }
    case 'between':
      return {
        ...INITIAL_PRESENTER_STATE,
        phase: 'between',
        currentTurnId: roomState.currentTurnId,
        presenterName: roomState.currentPresenter,
        difficulty: roomState.currentDifficulty,
        canChangeWord: roomState.canChangeWord,
        remainingWordChanges: roomState.remainingWordChanges,
        nextPresenterName: roomState.nextPresenterName,
        nextPresenterAvatar: roomState.nextPresenterAvatar,
        nextStep: roomState.nextStep,
        turnEndReason: roomState.turnEndReason,
      }
    case 'ended':
      return {
        ...INITIAL_PRESENTER_STATE,
        phase: 'ended',
        currentTurnId: roomState.currentTurnId,
        presenterName: roomState.currentPresenter,
        difficulty: roomState.currentDifficulty,
        canChangeWord: roomState.canChangeWord,
        remainingWordChanges: roomState.remainingWordChanges,
        turnEndReason: roomState.turnEndReason,
      }
    case 'waiting':
    default:
      return INITIAL_PRESENTER_STATE
  }
}
