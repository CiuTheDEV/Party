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
import { IncorrectVerdictAlert } from './IncorrectVerdictAlert'
import { ExitToMenuAlert } from '../../shared/ExitToMenuAlert'
import { getVisibleActionHintLabel } from './action-hint-visibility'
import {
  getHostControlActionLabel,
  type HostControlCommand,
  type HostControlDevice,
} from './host-controls'
import { createRuntimeInputState, sleepRuntimeInput } from './runtime-input-state'
import { useHostControls } from './useHostControls'
import type { Phase, PlayerSummary } from './playboard-types'
import { useRoundOrderCountdown } from './useRoundOrderCountdown'
import {
  readCharadesPlayPreferences,
  writeCharadesPlayPreferences,
} from '../shared/charades-play-preferences'
import {
  CHARADES_BINDINGS_STORAGE_KEY,
  CHARADES_BINDINGS_UPDATED_EVENT,
  formatControllerLabelForProfile,
  loadPersistedBindings,
  type GamepadProfile,
} from '../../menu/charades-controls-bindings'
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
  isCorrectVerdictBlocked: boolean
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
  const [verdictFocusTarget, setVerdictFocusTarget] = useState<'correct' | 'incorrect'>('correct')
  const [roundSummaryFocusTarget, setRoundSummaryFocusTarget] = useState<'menu' | 'continue'>('continue')
  const [verdictPickerStage, setVerdictPickerStage] = useState<'players' | 'actions'>('players')
  const [verdictPickerActionTarget, setVerdictPickerActionTarget] = useState<'cancel' | 'confirm'>('confirm')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSettingsExitConfirmOpen, setIsSettingsExitConfirmOpen] = useState(false)
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)
  const [exitConfirmFocusTarget, setExitConfirmFocusTarget] = useState<'stay' | 'exit'>('stay')
  const [isIncorrectVerdictConfirmOpen, setIsIncorrectVerdictConfirmOpen] = useState(false)
  const [incorrectVerdictConfirmFocusTarget, setIncorrectVerdictConfirmFocusTarget] = useState<'stay' | 'confirm'>('stay')
  const [settingsFocusTarget, setSettingsFocusTarget] = useState<'sound' | 'animations' | 'exit' | 'continue'>('sound')
  const [settingsExitConfirmFocusTarget, setSettingsExitConfirmFocusTarget] = useState<'stay' | 'exit'>('stay')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [selectedGuessedPlayerIdx, setSelectedGuessedPlayerIdx] = useState<number | null>(null)
  const [scoreRailToggleSignal, setScoreRailToggleSignal] = useState(0)
  const [verdictWordToggleSignal, setVerdictWordToggleSignal] = useState(0)
  const [skipRoundOrderSignal, setSkipRoundOrderSignal] = useState(0)
  const [activeInputDevice, setActiveInputDevice] = useState<HostControlDevice>('keyboard')
  const [controllerProfile, setControllerProfile] = useState<GamepadProfile>('generic')
  const [controlBindings, setControlBindings] = useState<Record<string, string>>({})
  const [runtimeInputState, setRuntimeInputState] = useState(() => createRuntimeInputState())
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
  const isPauseOverlayOpen =
    isSettingsOpen ||
    isExitConfirmOpen ||
    isIncorrectVerdictConfirmOpen ||
    isPresenterReconnectRequired ||
    isRoomReconnectRequired
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
  const canSkipRoundOrder = orderedPlayers.length >= 9

  useEffect(() => {
    const preferences = readCharadesPlayPreferences()
    setSoundEnabled(preferences.soundEnabled)
    setAnimationsEnabled(preferences.animationsEnabled)
  }, [])

  useEffect(() => {
    setControlBindings(loadPersistedBindings())

    function handleStorage(event: StorageEvent) {
      if (event.key === CHARADES_BINDINGS_STORAGE_KEY) {
        setControlBindings(loadPersistedBindings())
      }
    }

    function handleBindingsUpdated() {
      setControlBindings(loadPersistedBindings())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(CHARADES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(CHARADES_BINDINGS_UPDATED_EVENT, handleBindingsUpdated)
    }
  }, [])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse') {
        return
      }

      setRuntimeInputState((current) => sleepRuntimeInput(current, 'mouse'))
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (props.phase !== 'verdict') {
      setIsVerdictPickerOpen(false)
      setSelectedGuessedPlayerIdx(null)
      setVerdictFocusTarget('correct')
      setVerdictPickerStage('players')
      setVerdictPickerActionTarget('confirm')
      setIncorrectVerdictConfirmFocusTarget('stay')
      setIsIncorrectVerdictConfirmOpen(false)
    }
  }, [props.phase])

  useEffect(() => {
    if (props.phase === 'verdict' && props.isCorrectVerdictBlocked) {
      setVerdictFocusTarget('incorrect')
      setIsVerdictPickerOpen(false)
      setVerdictPickerStage('players')
      setVerdictPickerActionTarget('confirm')
    }
  }, [props.isCorrectVerdictBlocked, props.phase])

  useEffect(() => {
    if (props.phase !== 'round-summary') {
      setRoundSummaryFocusTarget('continue')
    }
  }, [props.phase])

  useEffect(() => {
    if (!isSettingsOpen) {
      setIsSettingsExitConfirmOpen(false)
      setSettingsFocusTarget('sound')
      setSettingsExitConfirmFocusTarget('stay')
    }
  }, [isSettingsOpen])

  const openExitConfirm = useCallback(() => {
    setExitConfirmFocusTarget('stay')
    setIsExitConfirmOpen(true)
  }, [])

  const closeExitConfirm = useCallback(() => {
    setExitConfirmFocusTarget('stay')
    setIsExitConfirmOpen(false)
  }, [])

  const openIncorrectVerdictConfirm = useCallback(() => {
    setIncorrectVerdictConfirmFocusTarget('stay')
    setIsIncorrectVerdictConfirmOpen(true)
  }, [])

  const closeIncorrectVerdictConfirm = useCallback(() => {
    setIncorrectVerdictConfirmFocusTarget('stay')
    setIsIncorrectVerdictConfirmOpen(false)
  }, [])

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

  const handleSkipRoundOrder = useCallback(() => {
    if (props.phase !== 'round-order' || !props.isRoundOrderRevealing || roundOrderCountdown !== null || !canSkipRoundOrder) {
      return
    }

    setSkipRoundOrderSignal((current) => current + 1)
  }, [canSkipRoundOrder, props.isRoundOrderRevealing, props.phase, roundOrderCountdown])

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
  const guessedPlayerIndexes = guessedPlayers.map((player) => player.index)
  const canToggleScoreRail = props.phase === 'prepare' && props.players.some((player) => (player.score ?? 0) > 0)

  useEffect(() => {
    if (!isVerdictPickerOpen || selectedGuessedPlayerIdx !== null) {
      return
    }

    setSelectedGuessedPlayerIdx(guessedPlayerIndexes[0] ?? null)
  }, [guessedPlayerIndexes, isVerdictPickerOpen, selectedGuessedPlayerIdx])

  const handleHostControlCommand = useCallback(
    (command: HostControlCommand) => {
      switch (command.type) {
        case 'open-settings':
          setSettingsFocusTarget('sound')
          setSettingsExitConfirmFocusTarget('stay')
          setIsSettingsOpen(true)
          return
        case 'close-settings':
          setIsSettingsExitConfirmOpen(false)
          setIsSettingsOpen(false)
          return
        case 'set-settings-focus':
          setSettingsFocusTarget(command.target)
          return
        case 'open-settings-exit-confirm':
          setSettingsExitConfirmFocusTarget('stay')
          setIsSettingsExitConfirmOpen(true)
          return
        case 'cancel-settings-exit-confirm':
          setIsSettingsExitConfirmOpen(false)
          return
        case 'set-settings-exit-confirm-focus':
          setSettingsExitConfirmFocusTarget(command.target)
          return
        case 'toggle-settings-sound':
          toggleSound()
          return
        case 'toggle-settings-animations':
          toggleAnimations()
          return
        case 'open-exit-confirm':
          openExitConfirm()
          return
        case 'close-exit-confirm':
          closeExitConfirm()
          return
        case 'set-exit-confirm-focus':
          setExitConfirmFocusTarget(command.target)
          return
        case 'open-incorrect-verdict-confirm':
          openIncorrectVerdictConfirm()
          return
        case 'close-incorrect-verdict-confirm':
          closeIncorrectVerdictConfirm()
          return
        case 'set-incorrect-verdict-confirm-focus':
          setIncorrectVerdictConfirmFocusTarget(command.target)
          return
        case 'exit-to-menu':
          props.onExitToMenu()
          return
        case 'start-round-order':
          props.onStartRound()
          return
        case 'skip-round-order':
          handleSkipRoundOrder()
          return
        case 'stop-round':
          props.onStopRound()
          return
        case 'continue-round-summary':
          props.onFinishRoundSummary()
          return
        case 'set-round-summary-focus':
          setRoundSummaryFocusTarget(command.target)
          return
        case 'open-verdict-picker':
          setSelectedGuessedPlayerIdx((current) => current ?? guessedPlayerIndexes[0] ?? null)
          setVerdictPickerStage('players')
          setVerdictPickerActionTarget('confirm')
          setIsVerdictPickerOpen(true)
          return
        case 'close-verdict-picker':
          setVerdictPickerStage('players')
          setVerdictPickerActionTarget('confirm')
          setIsVerdictPickerOpen(false)
          return
        case 'set-verdict-focus':
          setVerdictFocusTarget(command.target)
          return
        case 'select-verdict-player':
          setSelectedGuessedPlayerIdx(command.playerIdx)
          setVerdictPickerStage('players')
          return
        case 'set-verdict-picker-stage':
          setVerdictPickerStage(command.stage)
          if (command.stage === 'actions') {
            setVerdictPickerActionTarget('confirm')
          }
          return
        case 'set-verdict-picker-action-target':
          setVerdictPickerActionTarget(command.target)
          return
        case 'confirm-verdict-player':
          if (selectedGuessedPlayerIdx !== null) {
            props.onGiveVerdict(true, selectedGuessedPlayerIdx)
          }
          return
        case 'give-incorrect-verdict':
          closeIncorrectVerdictConfirm()
          props.onGiveVerdict(false)
          return
        case 'toggle-score-rail':
          setScoreRailToggleSignal((current) => current + 1)
          return
        case 'toggle-verdict-word':
          setVerdictWordToggleSignal((current) => current + 1)
          return
      }
    },
    [
      closeExitConfirm,
      closeIncorrectVerdictConfirm,
      guessedPlayerIndexes,
      handleSkipRoundOrder,
      openExitConfirm,
      openIncorrectVerdictConfirm,
      props,
      selectedGuessedPlayerIdx,
    ],
  )

  useHostControls({
    context: {
      phase: props.phase,
      isRoundOrderRevealing: props.isRoundOrderRevealing,
      isRoundOrderCountdownActive: roundOrderCountdown !== null,
      canSkipRoundOrder,
      isSettingsOpen,
      isSettingsExitConfirmOpen,
      isExitConfirmOpen,
      isIncorrectVerdictConfirmOpen,
      isCorrectVerdictBlocked: props.isCorrectVerdictBlocked,
      settingsFocusTarget,
      settingsExitConfirmFocusTarget,
      exitConfirmFocusTarget,
      incorrectVerdictConfirmFocusTarget,
      roundSummaryFocusTarget,
      verdictFocusTarget,
      isVerdictPickerOpen,
      verdictPickerStage,
      verdictPickerActionTarget,
      selectedGuessedPlayerIdx,
      guessedPlayerIndexes,
      isReconnectBlocking: isPresenterReconnectRequired || isRoomReconnectRequired,
      canToggleScoreRail,
      isVerdictWordVisible: false,
    },
    inputState: runtimeInputState,
    onCommand: handleHostControlCommand,
    onInputStateChange: setRuntimeInputState,
    onDeviceChange: setActiveInputDevice,
    onControllerProfileChange: setControllerProfile,
  })

  const getActionHint = useCallback(
    (action: 'left' | 'right' | 'confirm' | 'back' | 'menu' | 'rail') => {
      const label = getHostControlActionLabel(controlBindings, activeInputDevice, action)
      const deviceLabel =
        activeInputDevice === 'controller' ? formatControllerLabelForProfile(label ?? '', controllerProfile) : label

      return getVisibleActionHintLabel(deviceLabel, runtimeInputState.isAwake)
    },
    [activeInputDevice, controlBindings, controllerProfile, runtimeInputState.isAwake],
  )

  return (
    <div className={styles.screen}>
      <RuntimeTopBar
        gameName="Kalambury"
        onOpenSettings={() => {
          setSettingsFocusTarget('sound')
          setSettingsExitConfirmFocusTarget('stay')
          setIsSettingsExitConfirmOpen(false)
          setIsSettingsOpen(true)
        }}
      />

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
        isCorrectVerdictBlocked={props.isCorrectVerdictBlocked}
        externalSkipRoundOrderSignal={skipRoundOrderSignal}
        externalToggleScoreRailSignal={scoreRailToggleSignal}
        externalToggleVerdictWordSignal={verdictWordToggleSignal}
        actionHintLabels={{
          rail: getActionHint('rail'),
        }}
      />

      <PlayBottomBar
        isRoomConnected={props.isRoomConnected}
        roomConnectionState={props.roomConnectionState}
        isDeviceConnected={props.isDeviceConnected}
        isRoundOrderRevealing={props.isRoundOrderRevealing}
        canSkipRoundOrder={canSkipRoundOrder}
        phase={props.phase}
        roundOrderCountdown={roundOrderCountdown}
        onContinueRoundSummary={props.onFinishRoundSummary}
        roundSummaryFocusedTarget={roundSummaryFocusTarget}
        onCorrectVerdict={() => {
          if (props.isCorrectVerdictBlocked) {
            return
          }
          setSelectedGuessedPlayerIdx(guessedPlayerIndexes[0] ?? null)
          setVerdictPickerStage('players')
          setVerdictPickerActionTarget('confirm')
          setIsVerdictPickerOpen(true)
        }}
        onExitToMenu={openExitConfirm}
        onIncorrectVerdict={() => {
          if (props.isCorrectVerdictBlocked) {
            props.onGiveVerdict(false)
            return
          }

          openIncorrectVerdictConfirm()
        }}
        verdictFocusedTarget={verdictFocusTarget}
        isCorrectVerdictBlocked={props.isCorrectVerdictBlocked}
        isFocusVisible={runtimeInputState.isAwake}
        onStartRound={props.onStartRound}
        onSkipRoundOrder={handleSkipRoundOrder}
        onStopRound={props.onStopRound}
        actionHints={{
          confirm: getActionHint('confirm'),
          rail: getActionHint('rail'),
        }}
      />

      {isVerdictPickerOpen ? (
        <VerdictPickerModal
          players={guessedPlayers}
          selectedPlayerIdx={selectedGuessedPlayerIdx}
          selectionStage={verdictPickerStage}
          actionTarget={verdictPickerActionTarget}
          isFocusVisible={runtimeInputState.isAwake}
          onSelectPlayer={(playerIdx) => {
            setSelectedGuessedPlayerIdx(playerIdx)
            setVerdictPickerStage('players')
          }}
          onCancel={() => {
            setVerdictPickerStage('players')
            setVerdictPickerActionTarget('confirm')
            setIsVerdictPickerOpen(false)
          }}
          onConfirm={() => {
            if (selectedGuessedPlayerIdx === null) {
              return
            }
            props.onGiveVerdict(true, selectedGuessedPlayerIdx)
          }}
          actionHints={{
            confirm: getActionHint('confirm'),
            cancel: getActionHint('back'),
            previous: getActionHint('left'),
            next: getActionHint('right'),
          }}
        />
      ) : null}

      {isSettingsOpen ? (
        <PlaySettingsModal
          soundEnabled={soundEnabled}
          animationsEnabled={animationsEnabled}
          isExitConfirmOpen={isSettingsExitConfirmOpen}
          focusedTarget={settingsFocusTarget}
          exitConfirmFocusedTarget={settingsExitConfirmFocusTarget}
          isFocusVisible={runtimeInputState.isAwake}
          onToggleSound={toggleSound}
          onToggleAnimations={toggleAnimations}
          onOpenExitConfirm={() => {
            setSettingsExitConfirmFocusTarget('stay')
            setIsSettingsExitConfirmOpen(true)
          }}
          onCancelExitConfirm={() => {
            setSettingsExitConfirmFocusTarget('stay')
            setIsSettingsExitConfirmOpen(false)
          }}
          onExitToMenu={props.onExitToMenu}
          onContinue={() => {
            setIsSettingsExitConfirmOpen(false)
            setIsSettingsOpen(false)
          }}
          actionHints={{
            confirm: getActionHint('confirm'),
          }}
        />
      ) : null}

      {isPresenterReconnectRequired ? (
        <ReconnectPresenterModal
          roomId={props.roomId}
          onBackToMenu={openExitConfirm}
        />
      ) : null}

      {roomConnectionModalState ? (
        <RoomConnectionModal
          connectionState={roomConnectionModalState}
          onBackToMenu={openExitConfirm}
        />
      ) : null}

      {isExitConfirmOpen ? (
        <ExitToMenuAlert
          copy="Bieżąca rozgrywka zostanie przerwana. Użyj tej opcji tylko wtedy, gdy naprawdę chcesz opuścić mecz."
          focusedTarget={exitConfirmFocusTarget}
          isFocusVisible={runtimeInputState.isAwake}
          onStay={closeExitConfirm}
          onExit={props.onExitToMenu}
          actionHints={{
            confirm: getActionHint('confirm'),
          }}
        />
      ) : null}

      {isIncorrectVerdictConfirmOpen ? (
        <IncorrectVerdictAlert
          focusedTarget={incorrectVerdictConfirmFocusTarget}
          isFocusVisible={runtimeInputState.isAwake}
          onStay={closeIncorrectVerdictConfirm}
          onConfirm={() => {
            closeIncorrectVerdictConfirm()
            props.onGiveVerdict(false)
          }}
          actionHints={{
            confirm: getActionHint('confirm'),
          }}
        />
      ) : null}
    </div>
  )
}
