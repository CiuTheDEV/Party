'use client'

import { PlayBoard } from './PlayBoard'
import { PlayBottomBar } from './PlayBottomBar'
import { PlayTopBar } from './PlayTopBar'
import styles from './HostGameScreen.module.css'

type PlayerSummary = {
  name: string
  avatar: string
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
  const orderedPlayers = props.order
    .map((playerIdx) => props.players[playerIdx])
    .filter((player): player is PlayerSummary => Boolean(player))

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
        onFinishRoundOrder={props.onFinishRoundOrder}
        timerRemaining={props.timerRemaining}
      />

      <PlayBottomBar
        isDeviceConnected={props.isDeviceConnected}
        isRoundOrderRevealing={props.isRoundOrderRevealing}
        phase={props.phase}
        onGiveVerdict={props.onGiveVerdict}
        onSendWord={props.onSendWord}
        onStartRound={props.onStartRound}
      />
    </div>
  )
}
