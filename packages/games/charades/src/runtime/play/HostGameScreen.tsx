'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
  type HostControlDevice,
} from './host-controls'
import { createRuntimeInputState, sleepRuntimeInput } from './runtime-input-state'
import { useHostControls } from './useHostControls'
import type { Phase, PlayerSummary } from './playboard-types'
import { useRoundOrderCountdown } from './useRoundOrderCountdown'
import { useHostVerdictFlow } from './useHostVerdictFlow'
import { useHostRuntimeUiState } from './useHostRuntimeUiState'
import { useHostRuntimeCommands } from './useHostRuntimeCommands'
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
  const [scoreRailToggleSignal, setScoreRailToggleSignal] = useState(0)
  const [verdictWordToggleSignal, setVerdictWordToggleSignal] = useState(0)
  const [skipRoundOrderSignal, setSkipRoundOrderSignal] = useState(0)
  const [activeInputDevice, setActiveInputDevice] = useState<HostControlDevice>('keyboard')
  const [controllerProfile, setControllerProfile] = useState<GamepadProfile>('generic')
  const [controlBindings, setControlBindings] = useState<Record<string, string>>({})
  const [runtimeInputState, setRuntimeInputState] = useState(() => createRuntimeInputState())
  const {
    closeIncorrectVerdictConfirm,
    closeVerdictPicker,
    confirmVerdictPlayer,
    guessedPlayerIndexes,
    guessedPlayers,
    handleIncorrectVerdict,
    incorrectVerdictConfirmFocusTarget,
    isIncorrectVerdictConfirmOpen,
    isVerdictPickerOpen,
    openIncorrectVerdictConfirm,
    openVerdictPicker,
    roundSummaryFocusTarget,
    selectedGuessedPlayerIdx,
    selectVerdictPlayer,
    setIncorrectVerdictConfirmFocusTarget,
    setRoundSummaryFocusTarget,
    setSelectedGuessedPlayerIdx,
    setVerdictFocusTarget,
    setVerdictPickerActionTarget,
    setVerdictPickerStage,
    verdictFocusTarget,
    verdictPickerActionTarget,
    verdictPickerStage,
  } = useHostVerdictFlow({
    phase: props.phase,
    players: props.players,
    order: props.order,
    currentOrderIdx: props.currentOrderIdx,
    isCorrectVerdictBlocked: props.isCorrectVerdictBlocked,
    onGiveVerdict: props.onGiveVerdict,
  })
  const isPresenterReconnectRequired =
    !props.isDeviceConnected &&
    (props.phase === 'prepare' || props.phase === 'reveal-buffer' || props.phase === 'timer-running')
  const isRoomReconnectRequired = props.roomConnectionState !== 'connected'
  const roomConnectionModalState: 'reconnecting' | 'error' | null = isRoomReconnectRequired
    ? props.roomConnectionState === 'error'
      ? 'error'
      : 'reconnecting'
    : null
  const ui = useHostRuntimeUiState({
    isPresenterReconnectRequired,
    isRoomReconnectRequired,
    isIncorrectVerdictConfirmOpen,
    isVerdictPickerOpen,
    onPauseGame: props.onPauseGame,
    onResumeGame: props.onResumeGame,
  })
  const { roundOrderCountdown, startRoundOrderCountdown } = useRoundOrderCountdown({
    shouldRun: props.phase === 'round-order' && props.isRoundOrderRevealing,
    isPaused: ui.isPauseOverlayOpen,
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

  const handleRoundOrderSettled = useCallback(() => {
    startRoundOrderCountdown()
  }, [startRoundOrderCountdown])

  const handleSkipRoundOrder = useCallback(() => {
    if (props.phase !== 'round-order' || !props.isRoundOrderRevealing || roundOrderCountdown !== null || !canSkipRoundOrder) {
      return
    }

    setSkipRoundOrderSignal((current) => current + 1)
  }, [canSkipRoundOrder, props.isRoundOrderRevealing, props.phase, roundOrderCountdown])

  const canToggleScoreRail = props.phase === 'prepare' && props.players.some((player) => (player.score ?? 0) > 0)
  const focusVerdictPlayer = useCallback(
    (playerIdx: number) => {
      setSelectedGuessedPlayerIdx(playerIdx)
      setVerdictPickerStage('players')
    },
    [setSelectedGuessedPlayerIdx, setVerdictPickerStage],
  )
  const showVerdictPickerPlayers = useCallback(() => {
    setVerdictPickerStage('players')
  }, [setVerdictPickerStage])
  const openVerdictPickerActions = useCallback(() => {
    setVerdictPickerStage('actions')
    setVerdictPickerActionTarget('confirm')
  }, [setVerdictPickerActionTarget, setVerdictPickerStage])
  const handleHostControlCommand = useHostRuntimeCommands({
    onStartRound: props.onStartRound,
    onStopRound: props.onStopRound,
    onFinishRoundSummary: props.onFinishRoundSummary,
    onExitToMenu: props.onExitToMenu,
    onGiveIncorrectVerdict: () => props.onGiveVerdict(false),
    onSkipRoundOrder: handleSkipRoundOrder,
    onToggleScoreRail: () => setScoreRailToggleSignal((current) => current + 1),
    onToggleVerdictWord: () => setVerdictWordToggleSignal((current) => current + 1),
    ui: {
      openSettings: ui.openSettings,
      closeSettings: ui.closeSettings,
      focusSettingsTarget: ui.setSettingsFocusTarget,
      openSettingsExitConfirm: ui.openSettingsExitConfirm,
      cancelSettingsExitConfirm: ui.cancelSettingsExitConfirm,
      focusSettingsExitConfirmTarget: ui.setSettingsExitConfirmFocusTarget,
      toggleSound: ui.toggleSound,
      toggleAnimations: ui.toggleAnimations,
      openExitConfirm: ui.openExitConfirm,
      closeExitConfirm: ui.closeExitConfirm,
      focusExitConfirmTarget: ui.setExitConfirmFocusTarget,
    },
    verdict: {
      openVerdictPicker,
      closeVerdictPicker,
      openIncorrectVerdictConfirm,
      closeIncorrectVerdictConfirm,
      focusIncorrectVerdictConfirmTarget: setIncorrectVerdictConfirmFocusTarget,
      focusRoundSummaryTarget: setRoundSummaryFocusTarget,
      focusVerdictTarget: setVerdictFocusTarget,
      focusVerdictPlayer,
      showVerdictPickerPlayers,
      openVerdictPickerActions,
      focusVerdictPickerAction: setVerdictPickerActionTarget,
      confirmVerdictPlayer,
    },
  })

  useHostControls({
    context: {
      phase: props.phase,
      isRoundOrderRevealing: props.isRoundOrderRevealing,
      isRoundOrderCountdownActive: roundOrderCountdown !== null,
      canSkipRoundOrder,
      isSettingsOpen: ui.isSettingsOpen,
      isSettingsExitConfirmOpen: ui.isSettingsExitConfirmOpen,
      isExitConfirmOpen: ui.isExitConfirmOpen,
      isIncorrectVerdictConfirmOpen,
      isCorrectVerdictBlocked: props.isCorrectVerdictBlocked,
      settingsFocusTarget: ui.settingsFocusTarget,
      settingsExitConfirmFocusTarget: ui.settingsExitConfirmFocusTarget,
      exitConfirmFocusTarget: ui.exitConfirmFocusTarget,
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
        onOpenSettings={ui.openSettings}
      />

      <PlayBoard
        animationsEnabled={ui.animationsEnabled}
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
          openVerdictPicker()
        }}
        onExitToMenu={ui.openExitConfirm}
        onIncorrectVerdict={handleIncorrectVerdict}
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
          onSelectPlayer={selectVerdictPlayer}
          onCancel={closeVerdictPicker}
          onConfirm={confirmVerdictPlayer}
          actionHints={{
            confirm: getActionHint('confirm'),
            cancel: getActionHint('back'),
            previous: getActionHint('left'),
            next: getActionHint('right'),
          }}
        />
      ) : null}

      {ui.isSettingsOpen ? (
        <PlaySettingsModal
          soundEnabled={ui.soundEnabled}
          animationsEnabled={ui.animationsEnabled}
          isExitConfirmOpen={ui.isSettingsExitConfirmOpen}
          focusedTarget={ui.settingsFocusTarget}
          exitConfirmFocusedTarget={ui.settingsExitConfirmFocusTarget}
          isFocusVisible={runtimeInputState.isAwake}
          onToggleSound={ui.toggleSound}
          onToggleAnimations={ui.toggleAnimations}
          onOpenExitConfirm={ui.openSettingsExitConfirm}
          onCancelExitConfirm={ui.cancelSettingsExitConfirm}
          onExitToMenu={props.onExitToMenu}
          onContinue={ui.closeSettings}
          actionHints={{
            confirm: getActionHint('confirm'),
          }}
        />
      ) : null}

      {isPresenterReconnectRequired ? (
        <ReconnectPresenterModal
          roomId={props.roomId}
          onBackToMenu={ui.openExitConfirm}
        />
      ) : null}

      {roomConnectionModalState ? (
        <RoomConnectionModal
          connectionState={roomConnectionModalState}
          onBackToMenu={ui.openExitConfirm}
        />
      ) : null}

      {ui.isExitConfirmOpen ? (
        <ExitToMenuAlert
          copy="Bieżąca rozgrywka zostanie przerwana. Użyj tej opcji tylko wtedy, gdy naprawdę chcesz opuścić mecz."
          focusedTarget={ui.exitConfirmFocusTarget}
          isFocusVisible={runtimeInputState.isAwake}
          onStay={ui.closeExitConfirm}
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
