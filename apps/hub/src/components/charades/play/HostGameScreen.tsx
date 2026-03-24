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
  | 'reveal-buffer'
  | 'timer-running'
  | 'round-summary'
  | 'verdict'

type HostGameScreenProps = {
  phase: Phase
  currentRound: number
  totalRounds: number
  currentOrderIdx: number
  order: number[]
  players: PlayerSummary[]
  presenter: PlayerSummary | undefined
  currentWord: string
  timerRemaining: number
  bufferRemaining: number
  isDeviceConnected: boolean
  isRoundOrderRevealing: boolean
  onFinishRoundOrder: () => void
  onFinishRoundSummary: () => void
  onStartRound: () => void
  onExitToMenu: () => void
  onStopRound: () => void
  onGiveVerdict: (correct: boolean, guessedPlayerIdx?: number) => void
}

export function HostGameScreen(props: HostGameScreenProps) {
  const [roundOrderCountdown, setRoundOrderCountdown] = useState<number | null>(null)
  const [isVerdictPickerOpen, setIsVerdictPickerOpen] = useState(false)
  const [selectedGuessedPlayerIdx, setSelectedGuessedPlayerIdx] = useState<number | null>(null)
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
    if (props.phase !== 'verdict') {
      setIsVerdictPickerOpen(false)
      setSelectedGuessedPlayerIdx(null)
    }
  }, [props.phase])

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

  const presenterIdx = props.order[props.currentOrderIdx]
  const guessedPlayers = props.players
    .map((player, index) => ({ ...player, index }))
    .filter((player) => player.index !== presenterIdx)

  return (
    <div className={styles.screen}>
      <PlayTopBar />

      <PlayBoard
        currentOrderIdx={props.currentOrderIdx}
        order={orderedPlayers}
        phase={props.phase}
        players={props.players}
        presenter={props.presenter}
        currentWord={props.currentWord}
        isRoundOrderRevealing={props.isRoundOrderRevealing}
        onRoundOrderSettled={handleRoundOrderSettled}
        timerRemaining={props.timerRemaining}
        bufferRemaining={props.bufferRemaining}
        currentRound={props.currentRound}
        totalRounds={props.totalRounds}
      />

      <PlayBottomBar
        isDeviceConnected={props.isDeviceConnected}
        isRoundOrderRevealing={props.isRoundOrderRevealing}
        phase={props.phase}
        roundOrderCountdown={roundOrderCountdown}
        onContinueRoundSummary={props.onFinishRoundSummary}
        onCorrectVerdict={() => {
          setSelectedGuessedPlayerIdx(null)
          setIsVerdictPickerOpen(true)
        }}
        onExitToMenu={props.onExitToMenu}
        onIncorrectVerdict={() => props.onGiveVerdict(false)}
        onStartRound={props.onStartRound}
        onStopRound={props.onStopRound}
      />

      {isVerdictPickerOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Wybierz gracza">
          <div className={styles.modalCard}>
            <span className={styles.modalEyebrow}>Zgadnieto</span>
            <h2 className={styles.modalTitle}>Ktory gracz odgadl haslo?</h2>
            <div className={styles.modalList}>
              {guessedPlayers.map((player) => {
                const isSelected = selectedGuessedPlayerIdx === player.index
                return (
                  <button
                    key={`${player.name}-${player.index}`}
                    className={isSelected ? styles.playerOptionSelected : styles.playerOption}
                    onClick={() => setSelectedGuessedPlayerIdx(player.index)}
                  >
                    <span className={styles.playerAvatar}>{player.avatar}</span>
                    <span className={styles.playerName} data-gender={player.gender}>
                      {player.name}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setIsVerdictPickerOpen(false)}>
                Wroc
              </button>
              <button
                className={styles.confirmButton}
                disabled={selectedGuessedPlayerIdx === null}
                onClick={() => {
                  if (selectedGuessedPlayerIdx === null) {
                    return
                  }
                  props.onGiveVerdict(true, selectedGuessedPlayerIdx)
                }}
              >
                Przyznaj punkt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
