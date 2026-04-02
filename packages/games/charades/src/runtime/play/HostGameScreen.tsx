'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RuntimeTopBar } from '@party/ui'
import type { CharadesGameSettings } from '../../setup/state'
import { PlayBoard } from './PlayBoard'
import { PlayBottomBar } from './PlayBottomBar'
import { ReconnectPresenterModal } from './ReconnectPresenterModal'
import { RoomConnectionModal } from './RoomConnectionModal'
import { PlaySettingsModal } from './PlaySettingsModal'
import { VerdictPickerModal } from './VerdictPickerModal'
import type { Phase, PlayerSummary } from './playboard-types'
import { useRoundOrderCountdown } from './useRoundOrderCountdown'
import {
  readCharadesPlayPreferences,
  writeCharadesPlayPreferences,
} from '../shared/charades-play-preferences'
import styles from './HostGameScreen.module.css'

type HostGameScreenProps = {
  phase: Phase
  currentRound: number
  totalRounds: number
  currentOrderIdx: number
  order: number[]
  players: PlayerSummary[]
  presenter: PlayerSummary | undefined
  roomId: string
  roomConnectionState: 'connected' | 'reconnecting' | 'error'
  currentWord: string
  currentCategory: string
  settings: CharadesGameSettings
  timerRemaining: number
  bufferRemaining: number
  isDeviceConnected: boolean
  isRoomConnected: boolean
  isRoundOrderRevealing: boolean
  onFinishRoundOrder: () => void
  onFinishRoundSummary: () => void
  onStartRound: () => void
  onExitToMenu: () => void
  onPauseGame: () => void
  onResumeGame: () => void
  onStopRound: () => void
  onGiveVerdict: (correct: boolean, guessedPlayerIdx?: number) => void
}

export function HostGameScreen(props: HostGameScreenProps) {
  const [isVerdictPickerOpen, setIsVerdictPickerOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [selectedGuessedPlayerIdx, setSelectedGuessedPlayerIdx] = useState<number | null>(null)
  const wasSettingsOpenRef = useRef(false)
  const isPresenterReconnectRequired =
    !props.isDeviceConnected &&
    (props.phase === 'prepare' || props.phase === 'reveal-buffer' || props.phase === 'timer-running')
  const isRoomReconnectRequired = props.roomConnectionState !== 'connected'
  const roomConnectionModalState: 'reconnecting' | 'error' | null = isRoomReconnectRequired
    ? props.roomConnectionState === 'error'
      ? 'error'
      : 'reconnecting'
    : null
  const isPauseOverlayOpen = isSettingsOpen || isPresenterReconnectRequired || isRoomReconnectRequired
  const { roundOrderCountdown, startRoundOrderCountdown } = useRoundOrderCountdown({
    shouldRun: props.phase === 'round-order' && props.isRoundOrderRevealing,
    isPaused: isPauseOverlayOpen,
    onFinished: props.onFinishRoundOrder,
  })
  const orderedPlayers = useMemo(
    () =>
      props.order
        .map((playerIdx) => props.players[playerIdx])
        .filter((player): player is PlayerSummary => Boolean(player)),
    [props.order, props.players]
  )

  useEffect(() => {
    const preferences = readCharadesPlayPreferences()
    setSoundEnabled(preferences.soundEnabled)
    setAnimationsEnabled(preferences.animationsEnabled)
  }, [])

  useEffect(() => {
    if (props.phase !== 'verdict') {
      setIsVerdictPickerOpen(false)
      setSelectedGuessedPlayerIdx(null)
    }
  }, [props.phase])

  useEffect(() => {
    if (isPauseOverlayOpen) {
      wasSettingsOpenRef.current = true
      props.onPauseGame()
      return
    }

    if (wasSettingsOpenRef.current) {
      wasSettingsOpenRef.current = false
      props.onResumeGame()
    }
  }, [isPauseOverlayOpen, props.onPauseGame, props.onResumeGame])

  const persistPreferences = useCallback((nextSoundEnabled: boolean, nextAnimationsEnabled: boolean) => {
    writeCharadesPlayPreferences({
      soundEnabled: nextSoundEnabled,
      animationsEnabled: nextAnimationsEnabled,
    })
  }, [])

  const handleRoundOrderSettled = useCallback(() => {
    startRoundOrderCountdown()
  }, [startRoundOrderCountdown])

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const next = !current
      persistPreferences(next, animationsEnabled)
      return next
    })
  }, [animationsEnabled, persistPreferences])

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled((current) => {
      const next = !current
      persistPreferences(soundEnabled, next)
      return next
    })
  }, [persistPreferences, soundEnabled])

  const presenterIdx = props.order[props.currentOrderIdx]
  const guessedPlayers = props.players
    .map((player, index) => ({ ...player, index }))
    .filter((player) => player.index !== presenterIdx)

  return (
    <div className={styles.screen}>
      <RuntimeTopBar gameName="Kalambury" onOpenSettings={() => setIsSettingsOpen(true)} />

      <PlayBoard
        animationsEnabled={animationsEnabled}
        currentOrderIdx={props.currentOrderIdx}
        order={orderedPlayers}
        phase={props.phase}
        players={props.players}
        presenter={props.presenter}
        currentWord={props.currentWord}
        currentCategory={props.currentCategory}
        settings={props.settings}
        isRoundOrderRevealing={props.isRoundOrderRevealing}
        onRoundOrderSettled={handleRoundOrderSettled}
        timerRemaining={props.timerRemaining}
        bufferRemaining={props.bufferRemaining}
        currentRound={props.currentRound}
        totalRounds={props.totalRounds}
      />

      <PlayBottomBar
        isRoomConnected={props.isRoomConnected}
        roomConnectionState={props.roomConnectionState}
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

      {isVerdictPickerOpen ? (
        <VerdictPickerModal
          players={guessedPlayers}
          selectedPlayerIdx={selectedGuessedPlayerIdx}
          onSelectPlayer={setSelectedGuessedPlayerIdx}
          onCancel={() => setIsVerdictPickerOpen(false)}
          onConfirm={() => {
            if (selectedGuessedPlayerIdx === null) {
              return
            }
            props.onGiveVerdict(true, selectedGuessedPlayerIdx)
          }}
        />
      ) : null}

      {isSettingsOpen ? (
        <PlaySettingsModal
          soundEnabled={soundEnabled}
          animationsEnabled={animationsEnabled}
          onToggleSound={toggleSound}
          onToggleAnimations={toggleAnimations}
          onExitToMenu={props.onExitToMenu}
          onContinue={() => setIsSettingsOpen(false)}
        />
      ) : null}

      {isPresenterReconnectRequired ? (
        <ReconnectPresenterModal
          roomId={props.roomId}
          onBackToMenu={props.onExitToMenu}
        />
      ) : null}

      {roomConnectionModalState ? (
        <RoomConnectionModal
          connectionState={roomConnectionModalState}
          onBackToMenu={props.onExitToMenu}
        />
      ) : null}
    </div>
  )
}
