import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  RuntimeExitConfirmFocusTarget,
  RuntimeSettingsExitConfirmFocusTarget,
  RuntimeSettingsFocusTarget,
} from './host-controls'
import {
  readCharadesPlayPreferences,
  writeCharadesPlayPreferences,
} from '../shared/charades-play-preferences'

type UseHostRuntimeUiStateParams = {
  isPresenterReconnectRequired: boolean
  isRoomReconnectRequired: boolean
  isIncorrectVerdictConfirmOpen: boolean
  isVerdictPickerOpen: boolean
  onPauseGame: () => void
  onResumeGame: () => void
}

export type HostRuntimeUiState = {
  isSettingsOpen: boolean
  isSettingsExitConfirmOpen: boolean
  isExitConfirmOpen: boolean
  exitConfirmFocusTarget: RuntimeExitConfirmFocusTarget
  settingsFocusTarget: RuntimeSettingsFocusTarget
  settingsExitConfirmFocusTarget: RuntimeSettingsExitConfirmFocusTarget
  soundEnabled: boolean
  animationsEnabled: boolean
  isPauseOverlayOpen: boolean
  setExitConfirmFocusTarget: (target: RuntimeExitConfirmFocusTarget) => void
  setSettingsFocusTarget: (target: RuntimeSettingsFocusTarget) => void
  setSettingsExitConfirmFocusTarget: (target: RuntimeSettingsExitConfirmFocusTarget) => void
  toggleSound: () => void
  toggleAnimations: () => void
  openSettings: () => void
  closeSettings: () => void
  openSettingsExitConfirm: () => void
  cancelSettingsExitConfirm: () => void
  openExitConfirm: () => void
  closeExitConfirm: () => void
}

export function useHostRuntimeUiState({
  isPresenterReconnectRequired,
  isRoomReconnectRequired,
  isIncorrectVerdictConfirmOpen,
  isVerdictPickerOpen,
  onPauseGame,
  onResumeGame,
}: UseHostRuntimeUiStateParams): HostRuntimeUiState {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSettingsExitConfirmOpen, setIsSettingsExitConfirmOpen] = useState(false)
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)
  const [exitConfirmFocusTarget, setExitConfirmFocusTarget] = useState<RuntimeExitConfirmFocusTarget>('stay')
  const [settingsFocusTarget, setSettingsFocusTarget] = useState<RuntimeSettingsFocusTarget>('sound')
  const [settingsExitConfirmFocusTarget, setSettingsExitConfirmFocusTarget] =
    useState<RuntimeSettingsExitConfirmFocusTarget>('stay')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const wasOverlayOpenRef = useRef(false)

  const isPauseOverlayOpen =
    isSettingsOpen ||
    isExitConfirmOpen ||
    isIncorrectVerdictConfirmOpen ||
    isVerdictPickerOpen ||
    isPresenterReconnectRequired ||
    isRoomReconnectRequired

  useEffect(() => {
    const preferences = readCharadesPlayPreferences()
    setSoundEnabled(preferences.soundEnabled)
    setAnimationsEnabled(preferences.animationsEnabled)
  }, [])

  useEffect(() => {
    if (!isSettingsOpen) {
      setIsSettingsExitConfirmOpen(false)
      setSettingsFocusTarget('sound')
      setSettingsExitConfirmFocusTarget('stay')
    }
  }, [isSettingsOpen])

  useEffect(() => {
    if (isPauseOverlayOpen) {
      wasOverlayOpenRef.current = true
      onPauseGame()
      return
    }

    if (wasOverlayOpenRef.current) {
      wasOverlayOpenRef.current = false
      onResumeGame()
    }
  }, [isPauseOverlayOpen, onPauseGame, onResumeGame])

  const persistPreferences = useCallback((nextSoundEnabled: boolean, nextAnimationsEnabled: boolean) => {
    writeCharadesPlayPreferences({
      soundEnabled: nextSoundEnabled,
      animationsEnabled: nextAnimationsEnabled,
    })
  }, [])

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

  const openSettings = useCallback(() => {
    setSettingsFocusTarget('sound')
    setSettingsExitConfirmFocusTarget('stay')
    setIsSettingsExitConfirmOpen(false)
    setIsSettingsOpen(true)
  }, [])

  const closeSettings = useCallback(() => {
    setIsSettingsExitConfirmOpen(false)
    setIsSettingsOpen(false)
  }, [])

  const openSettingsExitConfirm = useCallback(() => {
    setSettingsExitConfirmFocusTarget('stay')
    setIsSettingsExitConfirmOpen(true)
  }, [])

  const cancelSettingsExitConfirm = useCallback(() => {
    setSettingsExitConfirmFocusTarget('stay')
    setIsSettingsExitConfirmOpen(false)
  }, [])

  const openExitConfirm = useCallback(() => {
    setExitConfirmFocusTarget('stay')
    setIsExitConfirmOpen(true)
  }, [])

  const closeExitConfirm = useCallback(() => {
    setExitConfirmFocusTarget('stay')
    setIsExitConfirmOpen(false)
  }, [])

  return {
    isSettingsOpen,
    isSettingsExitConfirmOpen,
    isExitConfirmOpen,
    exitConfirmFocusTarget,
    settingsFocusTarget,
    settingsExitConfirmFocusTarget,
    soundEnabled,
    animationsEnabled,
    isPauseOverlayOpen,
    setExitConfirmFocusTarget,
    setSettingsFocusTarget,
    setSettingsExitConfirmFocusTarget,
    toggleSound,
    toggleAnimations,
    openSettings,
    closeSettings,
    openSettingsExitConfirm,
    cancelSettingsExitConfirm,
    openExitConfirm,
    closeExitConfirm,
  }
}
