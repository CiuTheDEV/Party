'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PlayBoard } from './PlayBoard'
import { PlayBottomBar } from './PlayBottomBar'
import { PlayTopBar } from './PlayTopBar'
import styles from './HostGameScreen.module.css'

type PlayerSummary = {
  name: string
  avatar: string
  gender: 'on' | 'ona' | 'none'
}

type Phase =
  | 'round-order'
  | 'prepare'
  | 'waiting-ready'
  | 'timer-running'
  | 'verdict'

type HostGameScreenProps = {
  phase: Phase
  currentRound: number
  totalRounds: number
  currentOrderIdx: number
  order: number[]
  players: PlayerSummary[]
  presenter: PlayerSummary | undefined
  timerRemaining: number
  isDeviceConnected: boolean
  isRoundOrderRevealing: boolean
  onFinishRoundOrder: () => void
  onStartRound: () => void
  onSendWord: () => void
  onGiveVerdict: (correct: boolean) => void
}

export function HostGameScreen(props: HostGameScreenProps) {
  const [roundOrderCountdown, setRoundOrderCountdown] = useState<number | null>(null)
  const orderedPlayers = useMemo(
    () =>
      props.order
        .map((playerIdx) => props.players[playerIdx])
        .filter((player): player is PlayerSummary => Boolean(player)),
    [props.order, props.players]
  )

  useEffect(() => {
    if (props.phase !== 'round-order' || !props.isRoundOrderRevealing) {
      setRoundOrderCountdown(null)
    }
  }, [props.phase, props.isRoundOrderRevealing])

  useEffect(() => {
    if (roundOrderCountdown === null) {
      return
    }

    if (roundOrderCountdown <= 0) {
      props.onFinishRoundOrder()
      setRoundOrderCountdown(null)
      return
    }

    const timer = window.setTimeout(() => {
      setRoundOrderCountdown((current) => (current === null ? null : current - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [roundOrderCountdown, props.onFinishRoundOrder])

  const handleRoundOrderSettled = useCallback(() => {
    setRoundOrderCountdown((current) => (current === null ? 3 : current))
  }, [])

  return (
    <div className={styles.screen}>
      <PlayTopBar />

      <PlayBoard
        currentOrderIdx={props.currentOrderIdx}
        order={orderedPlayers}
        phase={props.phase}
        players={props.players}
        presenter={props.presenter}
        isRoundOrderRevealing={props.isRoundOrderRevealing}
        onRoundOrderSettled={handleRoundOrderSettled}
        timerRemaining={props.timerRemaining}
      />

      <PlayBottomBar
        isDeviceConnected={props.isDeviceConnected}
        isRoundOrderRevealing={props.isRoundOrderRevealing}
        phase={props.phase}
        roundOrderCountdown={roundOrderCountdown}
        onGiveVerdict={props.onGiveVerdict}
        onSendWord={props.onSendWord}
        onStartRound={props.onStartRound}
      />
    </div>
  )
}
