import { useCallback, useEffect, useRef } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { HostEvent } from '../../types/charades-events'
import type { GameState } from './game-state-model'
import { REVEAL_BUFFER_SECONDS } from './game-state-model'

type Params = {
  setState: Dispatch<SetStateAction<GameState>>
  send: (event: HostEvent) => void
  timerSeconds: number
  currentTurnIdRef: MutableRefObject<string>
}

type PhaseTimerMode = 'timer-running' | 'reveal-buffer' | null

export function usePhaseTimers({ setState, send, timerSeconds, currentTurnIdRef }: Params) {
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseTimerModeRef = useRef<PhaseTimerMode>(null)
  const phaseTimerRemainingRef = useRef(0)
  const phaseTimerTurnIdRef = useRef<string | null>(null)

  const clearPhaseTimer = useCallback((reset = true) => {
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current)
      phaseTimerRef.current = null
    }

    if (reset) {
      phaseTimerModeRef.current = null
      phaseTimerRemainingRef.current = 0
      phaseTimerTurnIdRef.current = null
    }
  }, [])

  const startTimer = useCallback((remaining = timerSeconds) => {
    clearPhaseTimer(false)
    phaseTimerModeRef.current = 'timer-running'
    phaseTimerRemainingRef.current = remaining
    phaseTimerTurnIdRef.current = currentTurnIdRef.current

    setState((current) => ({
      ...current,
      phase: 'timer-running',
      bufferRemaining: 0,
      timerRemaining: remaining,
    }))

    phaseTimerRef.current = setInterval(() => {
      phaseTimerRemainingRef.current -= 1
      const nextRemaining = phaseTimerRemainingRef.current

      send({ type: 'TIMER_TICK', turnId: currentTurnIdRef.current, remaining: nextRemaining })
      setState((current) => ({ ...current, timerRemaining: nextRemaining }))

      if (nextRemaining <= 0) {
        clearPhaseTimer()
        setState((current) => ({ ...current, phase: 'verdict' }))
        send({ type: 'TURN_END', turnId: currentTurnIdRef.current, reason: 'timeout' })
      }
    }, 1000)
  }, [clearPhaseTimer, currentTurnIdRef, send, setState, timerSeconds])

  const startRevealBuffer = useCallback((
    turnId: string,
    remaining = REVEAL_BUFFER_SECONDS,
    announceStart = true,
  ) => {
    clearPhaseTimer(false)
    phaseTimerModeRef.current = 'reveal-buffer'
    phaseTimerRemainingRef.current = remaining
    phaseTimerTurnIdRef.current = turnId

    if (announceStart) {
      send({ type: 'REVEAL_BUFFER_START', turnId, remaining })
    }

    setState((current) => ({
      ...current,
      phase: 'reveal-buffer',
      bufferRemaining: remaining,
    }))

    phaseTimerRef.current = setInterval(() => {
      phaseTimerRemainingRef.current -= 1
      const nextRemaining = phaseTimerRemainingRef.current

      if (nextRemaining <= 0) {
        clearPhaseTimer()
        send({ type: 'REVEAL_BUFFER_END', turnId })
        startTimer()
        return
      }

      send({ type: 'REVEAL_BUFFER_TICK', turnId, remaining: nextRemaining })
      setState((current) => ({ ...current, bufferRemaining: nextRemaining }))
    }, 1000)
  }, [clearPhaseTimer, send, setState, startTimer])

  const pausePhaseTimer = useCallback(() => {
    if (!phaseTimerModeRef.current) {
      return
    }

    clearPhaseTimer(false)
  }, [clearPhaseTimer])

  const resumePhaseTimer = useCallback(() => {
    if (phaseTimerModeRef.current === 'timer-running' && phaseTimerRemainingRef.current > 0) {
      startTimer(phaseTimerRemainingRef.current)
      return
    }

    if (
      phaseTimerModeRef.current === 'reveal-buffer' &&
      phaseTimerTurnIdRef.current &&
      phaseTimerRemainingRef.current > 0
    ) {
      startRevealBuffer(phaseTimerTurnIdRef.current, phaseTimerRemainingRef.current, false)
    }
  }, [startRevealBuffer, startTimer])

  useEffect(() => () => clearPhaseTimer(), [clearPhaseTimer])

  return {
    clearPhaseTimer,
    pausePhaseTimer,
    resumePhaseTimer,
    startRevealBuffer,
    startTimer,
  }
}
