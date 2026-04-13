'use client'

import { AlertTriangle, Gamepad2, Keyboard, RotateCcw, Save, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  AlertDialog,
  SettingsDetailHero,
  SettingsPanelFooter,
  SettingsPanelShell,
  SettingsPanelTabs,
  SettingsListHeader,
  SettingsPlaceholderCard,
  SettingsStatusPill,
  useHostNavigation,
} from '@party/ui'
import styles from './CodenamesSettingsOverlay.module.css'
import {
  applyBindingAssignment,
  createGamepadSnapshot,
  detectGamepadProfile,
  getBindingDevice,
  getBindingSlotKey,
  getBindingValue,
  formatControllerLabelForProfile,
  getCurrentGamepadInputLabel,
  getGamepadInputLabel,
  listConnectedGamepads,
  normalizeKeyboardInput,
  pickPreferredGamepad,
  type BindingSlot,
  type GamepadSnapshot,
} from './codenames-controls-bindings'
import {
  codenamesSettingsAccentIcons,
  codenamesSettingsCategories,
  type CodenamesControlsBinding,
  type CodenamesSettingsCategory,
} from './codenames-settings-overlay-data'
import {
  getNextBindingFocusId,
  getNextFooterFocusId,
  getNextSettingsCategoryId,
  getNextSettingsFocusArea,
  resolveSettingsTabsCommand,
  type SettingsFocusArea,
  type SettingsFooterFocusId,
} from './menu-controls'
import {
  areConnectedGamepadOptionsEqual,
  areGamepadDebugStatesEqual,
  getNextDialogActionIndex,
  publishSettingsDirtyState,
  type ConnectedGamepadOption,
  type GamepadDebugState,
} from './codenames-settings-overlay-helpers'
import {
  CODENAMES_NAVIGATION_SCREENS,
  CODENAMES_NAVIGATION_TARGETS,
  CODENAMES_NAVIGATION_ZONES,
  getCodenamesControlsDeviceTarget,
  getCodenamesSettingsEntryTarget,
  getCodenamesSettingsTabTarget,
} from '../navigation/codenames-navigation-targets'
import { useMenuControls } from './useMenuControls'
import type { CodenamesMenuView } from './menu-view'
import { useSettingsGamepadDebug } from './useSettingsGamepadDebug'
import { useSettingsBindingsDraft } from './useSettingsBindingsDraft'

type Props = {
  onBack: () => void
  onFocusRail?: () => void
  onWakeHostFocus?: (device?: 'keyboard' | 'controller') => void
  onSleepHostFocus?: () => void
  registerSettingsExitGuard?: (guard: ((view: CodenamesMenuView) => boolean) | null) => void
  onCommitViewChange?: (view: CodenamesMenuView) => void
  onModalOpenChange?: (value: boolean) => void
  onUnsavedChangesChange?: (value: boolean) => void
  isHostFocused?: boolean
  isHostInputAwake?: boolean
}

const EXIT_DIALOG_ACTION_COUNT = 3
const RESET_DIALOG_ACTION_COUNT = 2

export function CodenamesSettingsOverlay({
  onBack,
  onFocusRail,
  onWakeHostFocus,
  onSleepHostFocus,
  registerSettingsExitGuard,
  onCommitViewChange,
  onModalOpenChange,
  onUnsavedChangesChange,
  isHostFocused = true,
  isHostInputAwake = false,
}: Props) {
  const hostNavigation = useHostNavigation()
  const [isInputAwake, setIsInputAwake] = useState(false)
  const [isControllerWakeGuardActive, setIsControllerWakeGuardActive] = useState(false)
  const [tabsInputDevice, setTabsInputDevice] = useState<'mouse' | 'keyboard' | 'controller'>('mouse')
  const [tabsControllerProfile, setTabsControllerProfile] = useState<'xbox' | 'playstation' | 'generic'>('generic')
  const [activeCategoryId, setActiveCategoryId] = useState<'general' | 'audio' | 'controls'>('controls')
  const [activeControlsDevice, setActiveControlsDevice] = useState<'keyboard' | 'controller'>('keyboard')
  const [activeBindingId, setActiveBindingId] = useState('')
  const [listeningBindingKey, setListeningBindingKey] = useState<string | null>(null)
  const [isExitConfirmOpenInternal, setIsExitConfirmOpenInternal] = useState(false)
  const [pendingExitView, setPendingExitView] = useState<CodenamesMenuView | null>(null)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [focusedArea, setFocusedArea] = useState<SettingsFocusArea>('device')
  const [focusedFooterAction, setFocusedFooterAction] = useState<SettingsFooterFocusId>('reset')
  const [exitDialogFocusedActionIndex, setExitDialogFocusedActionIndex] = useState(0)
  const [resetDialogFocusedActionIndex, setResetDialogFocusedActionIndex] = useState(0)
  const tabsGamepadSnapshotRef = useRef<GamepadSnapshot | null>(null)
  const gamepadSnapshotRef = useRef<GamepadSnapshot | null>(null)
  const wakeDeviceRef = useRef<'keyboard' | 'controller'>('keyboard')
  const bindingsListRef = useRef<HTMLDivElement | null>(null)
  const bindingRowRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const activeCategory = useMemo(
    () => codenamesSettingsCategories.find((category) => category.id === activeCategoryId) ?? codenamesSettingsCategories[0],
    [activeCategoryId],
  )

  const activeBinding =
    activeCategory.bindings?.find((binding) => binding.id === activeBindingId) ?? activeCategory.bindings?.[0]
  const AccentIcon = codenamesSettingsAccentIcons[activeCategory.id]
  const isControlsView = activeCategory.id === 'controls'
  const isPadView = isControlsView && activeControlsDevice === 'controller'
  const {
    bindings,
    savedBindings,
    hasUnsavedChanges,
    hasDefaultChanges,
    updateBindings,
    saveBindings,
    resetToSavedBindings,
    resetToDefaultBindings,
  } = useSettingsBindingsDraft({ onUnsavedChangesChange })
  const {
    gamepadDebug,
    connectedGamepads,
    selectedGamepadIndex,
    setSelectedGamepadIndex,
    isDebugOpen,
    setIsDebugOpen,
    debugPopupPosition,
    handleDebugPointerDown,
  } = useSettingsGamepadDebug({ isPadView })
  const activeControllerProfile = isPadView ? detectGamepadProfile(gamepadDebug.id || '') : 'generic'
  const listeningBindingId = listeningBindingKey?.split(':')[0] ?? null
  const listeningBindingSlot = (listeningBindingKey?.split(':')[1] as BindingSlot | undefined) ?? null
  const listeningBindingDevice = listeningBindingId ? getBindingDevice(listeningBindingId) : null
  const isExitConfirmOpen = isExitConfirmOpenInternal
  const visibleBindings = useMemo(
    () => (activeCategory.bindings ?? []).filter((binding) => binding.device === activeControlsDevice),
    [activeCategory.bindings, activeControlsDevice],
  )
  const areControlsInteractive = !isExitConfirmOpen && !isResetConfirmOpen && listeningBindingKey === null
  const isFocusVisible = isInputAwake && isHostFocused && isHostInputAwake
  const isDialogFocusVisible = isInputAwake && isHostInputAwake
  const focusedTab = isFocusVisible && focusedArea === 'tabs' ? activeCategory.id : null

  useEffect(() => {
    registerSettingsExitGuard?.((nextView: CodenamesMenuView) => {
      setListeningBindingKey(null)

      if (!hasUnsavedChanges) {
        return true
      }

      setPendingExitView(nextView)
      setExitDialogFocusedActionIndex(0)
      setIsExitConfirmOpenInternal(true)
      return false
    })

    return () => {
      registerSettingsExitGuard?.(null)
    }
  }, [hasUnsavedChanges, registerSettingsExitGuard])

  useEffect(() => {
    if (!activeBindingId && activeCategory.bindings?.[0]) {
      setActiveBindingId(activeCategory.bindings[0].id)
    }
  }, [activeBindingId, activeCategory])

  useEffect(() => {
    if (!isControlsView) {
      setFocusedArea('tabs')
    }
  }, [isControlsView])

  useEffect(() => {
    if (!isHostFocused || isExitConfirmOpen || isResetConfirmOpen) {
      return
    }

    if (focusedArea === 'tabs') {
      hostNavigation.setFocus({
        screenId: CODENAMES_NAVIGATION_SCREENS.settings,
        zoneId: CODENAMES_NAVIGATION_ZONES.tabs,
        targetId: getCodenamesSettingsTabTarget(activeCategory.id),
      })
      return
    }

    if (focusedArea === 'device') {
      hostNavigation.setFocus({
        screenId: CODENAMES_NAVIGATION_SCREENS.settings,
        zoneId: CODENAMES_NAVIGATION_ZONES.device,
        targetId: getCodenamesControlsDeviceTarget(activeControlsDevice),
      })
      return
    }

    if (focusedArea === 'bindings') {
      hostNavigation.setFocus({
        screenId: CODENAMES_NAVIGATION_SCREENS.settings,
        zoneId: CODENAMES_NAVIGATION_ZONES.bindings,
        targetId: activeBindingId || visibleBindings[0]?.id || CODENAMES_NAVIGATION_TARGETS.settingsFooterReset,
      })
      return
    }

    if (focusedArea === 'footer') {
      hostNavigation.setFocus({
        screenId: CODENAMES_NAVIGATION_SCREENS.settings,
        zoneId: CODENAMES_NAVIGATION_ZONES.footer,
        targetId:
          focusedFooterAction === 'reset'
            ? CODENAMES_NAVIGATION_TARGETS.settingsFooterReset
            : CODENAMES_NAVIGATION_TARGETS.settingsFooterSave,
      })
      return
    }

    const entryTarget = getCodenamesSettingsEntryTarget(activeCategory.id)
    hostNavigation.setFocus({
      screenId: CODENAMES_NAVIGATION_SCREENS.settings,
      zoneId: entryTarget.zoneId,
      targetId: entryTarget.targetId,
    })
  }, [
    activeBindingId,
    activeCategory.id,
    activeControlsDevice,
    focusedArea,
    focusedFooterAction,
    hostNavigation,
    isExitConfirmOpen,
    isHostFocused,
    isResetConfirmOpen,
    visibleBindings,
  ])

  useEffect(() => {
    if (isHostInputAwake) {
      return
    }

    setIsInputAwake(false)
  }, [isHostInputAwake])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse') {
        return
      }

      setIsInputAwake(false)
      setIsControllerWakeGuardActive(false)
      setTabsInputDevice('mouse')
      onSleepHostFocus?.()
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [onSleepHostFocus])

  useEffect(() => {
    if (!isControlsView || visibleBindings.length === 0) {
      return
    }

    if (!visibleBindings.some((binding) => binding.id === activeBindingId)) {
      setActiveBindingId(visibleBindings[0].id)
    }
  }, [activeBindingId, isControlsView, visibleBindings])

  useEffect(() => {
    if (focusedArea !== 'bindings' || !activeBindingId) {
      return
    }

    const listElement = bindingsListRef.current
    const activeRow = bindingRowRefs.current[activeBindingId]
    if (!listElement || !activeRow) {
      return
    }

    const listRect = listElement.getBoundingClientRect()
    const rowRect = activeRow.getBoundingClientRect()
    const topOffset = rowRect.top - listRect.top
    const bottomOffset = rowRect.bottom - listRect.bottom

    if (topOffset < 0) {
      listElement.scrollBy({ top: topOffset - 12, behavior: 'smooth' })
      return
    }

    if (bottomOffset > 0) {
      listElement.scrollBy({ top: bottomOffset + 12, behavior: 'smooth' })
    }
  }, [activeBindingId, focusedArea])

  useEffect(() => {
    if (!hasDefaultChanges && !hasUnsavedChanges) {
      return
    }

    if (focusedFooterAction === 'save' && !hasUnsavedChanges) {
      setFocusedFooterAction('reset')
      return
    }

    if (focusedFooterAction === 'reset' && !hasDefaultChanges) {
      setFocusedFooterAction('save')
    }
  }, [focusedFooterAction, hasDefaultChanges, hasUnsavedChanges])

  useEffect(() => {
    if (isExitConfirmOpen) {
      setExitDialogFocusedActionIndex(0)
    }
  }, [isExitConfirmOpen])

  useEffect(() => {
    if (isResetConfirmOpen) {
      setResetDialogFocusedActionIndex(0)
    }
  }, [isResetConfirmOpen])

  useEffect(() => {
    onModalOpenChange?.(isExitConfirmOpen || isResetConfirmOpen)

    return () => {
      onModalOpenChange?.(false)
    }
  }, [isExitConfirmOpen, isResetConfirmOpen, onModalOpenChange])

  useEffect(() => {
    if (listeningBindingDevice !== 'keyboard' || !listeningBindingId || !listeningBindingSlot) {
      return
    }

    const slot = listeningBindingSlot

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      const normalized = normalizeKeyboardInput(event.key)
      if (!normalized) {
        return
      }

      event.preventDefault()

      const binding = activeCategory.bindings?.find((item) => item.id === listeningBindingId)
      if (!binding) {
        return
      }

      const nextBindings = applyBindingAssignment(bindings, binding, slot, normalized)
      updateBindings(nextBindings)
      setActiveBindingId(binding.id)
      setListeningBindingKey(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeCategory.bindings, bindings, listeningBindingDevice, listeningBindingId, listeningBindingSlot])

  useEffect(() => {
    if (listeningBindingDevice !== 'controller' || !listeningBindingId || !listeningBindingSlot) {
      gamepadSnapshotRef.current = null
      return
    }

    const slot = listeningBindingSlot

    let frameId = 0

    const tick = () => {
      const binding = activeCategory.bindings?.find((item) => item.id === listeningBindingId)
      const availableGamepads = listConnectedGamepads()
      const activeGamepad =
        (selectedGamepadIndex !== null
          ? availableGamepads.find((gamepad) => gamepad.index === selectedGamepadIndex) ?? null
          : null) ?? pickPreferredGamepad(availableGamepads)

      if (!binding || !activeGamepad) {
        gamepadSnapshotRef.current = null
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const currentSnapshot = createGamepadSnapshot(activeGamepad)

      if (!gamepadSnapshotRef.current) {
        gamepadSnapshotRef.current = currentSnapshot
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const nextInput = getGamepadInputLabel(activeGamepad, gamepadSnapshotRef.current)
      gamepadSnapshotRef.current = currentSnapshot

      if (!nextInput) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const nextBindings = applyBindingAssignment(bindings, binding, slot, nextInput)
      updateBindings(nextBindings)
      setActiveBindingId(binding.id)
      setListeningBindingKey(null)
      gamepadSnapshotRef.current = null
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
      gamepadSnapshotRef.current = null
    }
  }, [activeCategory.bindings, bindings, listeningBindingDevice, listeningBindingId, listeningBindingSlot, selectedGamepadIndex])

  function handleCategoryChange(category: CodenamesSettingsCategory) {
    setActiveCategoryId(category.id)
    setActiveBindingId(category.bindings?.[0]?.id ?? '')
    setListeningBindingKey(null)
    if (category.id === 'controls') {
      setActiveControlsDevice('keyboard')
      setFocusedArea('device')
      return
    }

    setFocusedArea('tabs')
  }

  function stepCategory(direction: -1 | 1) {
    const nextCategoryId = getNextSettingsCategoryId(activeCategory.id, direction === -1 ? 'left' : 'right')
    const nextCategory = codenamesSettingsCategories.find((category) => category.id === nextCategoryId)
    if (nextCategory) {
      handleCategoryChange(nextCategory)
    }
  }

  const tabsShortcutHints = useMemo(() => {
    if (!isInputAwake || !isHostFocused) {
      return { previous: undefined, next: undefined }
    }

    if (tabsInputDevice === 'mouse') {
      return { previous: undefined, next: undefined }
    }

    if (tabsInputDevice === 'keyboard') {
      return { previous: 'Q', next: 'E' }
    }

    if (tabsControllerProfile === 'xbox') {
      return { previous: 'LB', next: 'RB' }
    }

    if (tabsControllerProfile === 'playstation') {
      return { previous: 'L1', next: 'R1' }
    }

    return { previous: 'LB/L1', next: 'RB/R1' }
  }, [isHostFocused, isInputAwake, tabsControllerProfile, tabsInputDevice])

  function setControlsDevice(device: 'keyboard' | 'controller') {
    setFocusedArea('device')
    setActiveControlsDevice(device)
    const firstBinding = (activeCategory.bindings ?? []).find((binding) => binding.device === device)
    if (firstBinding) {
      setActiveBindingId(firstBinding.id)
    }
    setListeningBindingKey(null)
  }

  function stepControlsDevice(direction: -1 | 1) {
    if (direction === -1) {
      if (activeControlsDevice === 'controller') {
        setControlsDevice('keyboard')
        return
      }

      onFocusRail?.()
      return
    }

    if (activeControlsDevice === 'keyboard') {
      setControlsDevice('controller')
    }
  }

  function handleBindingRowKeyDown(event: KeyboardEvent<HTMLDivElement>, bindingId: string) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    setActiveBindingId(bindingId)
  }

  function handleBindingSelect(binding: CodenamesControlsBinding) {
    setFocusedArea('bindings')
    setActiveBindingId(binding.id)
  }

  function handleBindingListen(binding: CodenamesControlsBinding, slot: BindingSlot) {
    setFocusedArea('bindings')
    setActiveBindingId(binding.id)
    gamepadSnapshotRef.current = null
    const nextKey = getBindingSlotKey(binding.id, slot)
    setListeningBindingKey((current) => (current === nextKey ? null : nextKey))
  }

  function handleBindingClear(binding: CodenamesControlsBinding, slot: BindingSlot) {
    const nextBindings = {
      ...bindings,
      [getBindingSlotKey(binding.id, slot)]: '',
    }
    updateBindings(nextBindings)
    setActiveBindingId(binding.id)
    setListeningBindingKey((current) => (current === getBindingSlotKey(binding.id, slot) ? null : current))
  }

  function handleResetBindings() {
    if (!hasDefaultChanges) {
      return
    }

    setResetDialogFocusedActionIndex(0)
    setIsResetConfirmOpen(true)
  }

  function handleConfirmResetBindings() {
    resetToDefaultBindings()
    setListeningBindingKey(null)
    setIsResetConfirmOpen(false)
  }

  function handleSaveBindings() {
    saveBindings()
    setIsExitConfirmOpenInternal(false)
  }

  function commitExitView(view: CodenamesMenuView) {
    if (onCommitViewChange) {
      onCommitViewChange(view)
      return
    }

    onBack()
  }

  function requestSettingsExit(nextView: CodenamesMenuView) {
    setListeningBindingKey(null)

    if (!hasUnsavedChanges) {
      commitExitView(nextView)
      return
    }

    setPendingExitView(nextView)
    setExitDialogFocusedActionIndex(0)
    setIsExitConfirmOpenInternal(true)
  }

  function handleRequestBack() {
    requestSettingsExit('mode')
  }

  function handleDiscardAndExit() {
    resetToSavedBindings()
    setListeningBindingKey(null)
    setIsExitConfirmOpenInternal(false)
    commitExitView(pendingExitView ?? 'mode')
  }

  function handleSaveAndExit() {
    saveBindings()
    setListeningBindingKey(null)
    setIsExitConfirmOpenInternal(false)
    commitExitView(pendingExitView ?? 'mode')
  }

  function handleExitDialogAction(index: number) {
    if (index === 0) {
      handleSaveAndExit()
      return
    }

    if (index === 1) {
      handleDiscardAndExit()
      return
    }

    setIsExitConfirmOpenInternal(false)
    setPendingExitView(null)
  }

  function handleResetDialogAction(index: number) {
    if (index === 0) {
      handleConfirmResetBindings()
      return
    }

    setIsResetConfirmOpen(false)
  }

  useEffect(() => {
    if (!areControlsInteractive || !isInputAwake) {
      return
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.repeat) {
        return
      }

      if (event.key === 'q' || event.key === 'Q') {
        event.preventDefault()
        stepCategory(-1)
        return
      }

      if (event.key === 'e' || event.key === 'E') {
        event.preventDefault()
        stepCategory(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeCategory.id, areControlsInteractive, isInputAwake])

  useEffect(() => {
    if (!areControlsInteractive || !isInputAwake || isControllerWakeGuardActive) {
      tabsGamepadSnapshotRef.current = null
      return
    }

    let frameId = 0

    const tick = () => {
      const activeGamepad = pickPreferredGamepad(listConnectedGamepads())

      if (!activeGamepad) {
        tabsGamepadSnapshotRef.current = null
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const currentSnapshot = createGamepadSnapshot(activeGamepad)

      if (!tabsGamepadSnapshotRef.current) {
        tabsGamepadSnapshotRef.current = currentSnapshot
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const nextInput = getGamepadInputLabel(activeGamepad, tabsGamepadSnapshotRef.current)
      tabsGamepadSnapshotRef.current = currentSnapshot

      if (nextInput === 'L1 / LB') {
        stepCategory(-1)
      } else if (nextInput === 'R1 / RB') {
        stepCategory(1)
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [activeCategory.id, areControlsInteractive, isControllerWakeGuardActive, isInputAwake])

  useEffect(() => {
    if (!areControlsInteractive) {
      return
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.repeat) {
        return
      }

      if (event.key !== 'q' && event.key !== 'Q' && event.key !== 'e' && event.key !== 'E') {
        return
      }

      event.preventDefault()
      setTabsInputDevice('keyboard')

      if (isInputAwake) {
        return
      }

      onWakeHostFocus?.('keyboard')
      wakeDeviceRef.current = 'keyboard'
      setIsInputAwake(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [areControlsInteractive, isInputAwake, onWakeHostFocus])

  useEffect(() => {
    if (!areControlsInteractive || isInputAwake) {
      tabsGamepadSnapshotRef.current = null
      return
    }

    let frameId = 0

    const tick = () => {
      const activeGamepad = pickPreferredGamepad(listConnectedGamepads())

      if (!activeGamepad) {
        tabsGamepadSnapshotRef.current = null
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const profile = detectGamepadProfile(activeGamepad.id || '')
      if (tabsControllerProfile !== profile) {
        setTabsControllerProfile(profile)
      }

      const currentSnapshot = createGamepadSnapshot(activeGamepad)

      if (!tabsGamepadSnapshotRef.current) {
        tabsGamepadSnapshotRef.current = currentSnapshot
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const nextInput = getGamepadInputLabel(activeGamepad, tabsGamepadSnapshotRef.current)
      tabsGamepadSnapshotRef.current = currentSnapshot

      if (nextInput !== 'L1 / LB' && nextInput !== 'R1 / RB') {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      onWakeHostFocus?.('controller')
      wakeDeviceRef.current = 'controller'
      setTabsInputDevice('controller')
      setIsInputAwake(true)
      setIsControllerWakeGuardActive(true)
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [areControlsInteractive, isInputAwake, onWakeHostFocus, tabsControllerProfile])

  useEffect(() => {
    if (!isControllerWakeGuardActive) {
      return
    }

    let frameId = 0

    const tick = () => {
      const activeGamepad = pickPreferredGamepad(listConnectedGamepads())
      const currentInput = activeGamepad ? getCurrentGamepadInputLabel(activeGamepad) : null

      if (!currentInput) {
        setIsControllerWakeGuardActive(false)
        return
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [isControllerWakeGuardActive])

  useMenuControls({
    enabled: areControlsInteractive && !isInputAwake,
    onDeviceChange: (device) => {
      wakeDeviceRef.current = device
      setTabsInputDevice(device === 'controller' ? 'controller' : 'keyboard')
    },
    onControllerProfileChange: (profile) => {
      setTabsControllerProfile(profile)
    },
    onAction: (_action, input) => {
      onWakeHostFocus?.(input?.device)

      if (input?.device === 'controller') {
        setTabsInputDevice('controller')
      } else if (input?.device === 'keyboard') {
        setTabsInputDevice('keyboard')
      }

      setIsInputAwake(true)

      if (wakeDeviceRef.current === 'controller') {
        setIsControllerWakeGuardActive(true)
      }
    },
  })

  useMenuControls({
    enabled: areControlsInteractive && isInputAwake && !isControllerWakeGuardActive,
    onDeviceChange: (device) => {
      setTabsInputDevice(device)
    },
    onControllerProfileChange: (profile) => {
      setTabsControllerProfile(profile)
    },
    onAction: (action, input) => {
      const isControllerBumperInput =
        input?.device === 'controller' && (input.inputLabel === 'L1 / LB' || input.inputLabel === 'R1 / RB')

      if (isControllerBumperInput) {
        return
      }

      if (action === 'back' || action === 'menu') {
        handleRequestBack()
        return
      }

      if (focusedArea === 'tabs') {
        const tabsCommand = resolveSettingsTabsCommand(activeCategory.id, action)
        if (tabsCommand?.type === 'focus-rail') {
          onFocusRail?.()
          return
        }

        if (tabsCommand?.type === 'select-category') {
          const nextCategory = codenamesSettingsCategories.find((category) => category.id === tabsCommand.categoryId)
          if (nextCategory) {
            handleCategoryChange(nextCategory)
          }
          return
        }

        if (action === 'down' || action === 'up') {
          setFocusedArea(getNextSettingsFocusArea('tabs', action, { isControlsView }))
        }
        return
      }

      if (focusedArea === 'device') {
        if (action === 'left') {
          stepControlsDevice(-1)
          return
        }

        if (action === 'right') {
          stepControlsDevice(1)
          return
        }

        if (action === 'down' || action === 'up') {
          setFocusedArea(getNextSettingsFocusArea('device', action, { isControlsView }))
        }
        return
      }

      if (focusedArea === 'bindings') {
        if (action === 'up' || action === 'down') {
          setActiveBindingId((current) => getNextBindingFocusId(visibleBindings.map((binding) => binding.id), current, action))
          if (action === 'down' && visibleBindings[visibleBindings.length - 1]?.id === activeBindingId) {
            setFocusedArea('footer')
          }
          if (action === 'up' && visibleBindings[0]?.id === activeBindingId) {
            setFocusedArea('device')
          }
          return
        }

        if ((action === 'confirm' || action === 'primary') && activeBinding) {
          if (input?.device === 'controller' && input.inputLabel !== 'A / Cross') {
            return
          }

          handleBindingListen(activeBinding, 'primary')
          return
        }
        return
      }

      if (focusedArea === 'footer') {
        if (action === 'left' || action === 'right') {
          setFocusedFooterAction((current) => getNextFooterFocusId(current, action))
          return
        }

        if (action === 'up' || action === 'down') {
          setFocusedArea(getNextSettingsFocusArea('footer', action, { isControlsView }))
          return
        }

        if (action === 'confirm' || action === 'primary') {
          if (focusedFooterAction === 'reset') {
            handleResetBindings()
            return
          }

          handleSaveBindings()
        }
      }
    },
  })

  useMenuControls({
    enabled: (isExitConfirmOpen || isResetConfirmOpen) && !isInputAwake,
    onDeviceChange: (device) => {
      wakeDeviceRef.current = device
      setTabsInputDevice(device === 'controller' ? 'controller' : 'keyboard')
    },
    onControllerProfileChange: (profile) => {
      setTabsControllerProfile(profile)
    },
    onAction: (_action, input) => {
      onWakeHostFocus?.(input?.device)

      if (input?.device === 'controller') {
        setTabsInputDevice('controller')
      } else if (input?.device === 'keyboard') {
        setTabsInputDevice('keyboard')
      }

      setIsInputAwake(true)

      if (wakeDeviceRef.current === 'controller') {
        setIsControllerWakeGuardActive(true)
      }
    },
  })

  useMenuControls({
    enabled: (isExitConfirmOpen || isResetConfirmOpen) && isInputAwake && !isControllerWakeGuardActive,
    onDeviceChange: (device) => {
      setTabsInputDevice(device)
    },
    onControllerProfileChange: (profile) => {
      setTabsControllerProfile(profile)
    },
    onAction: (action) => {
      if (isExitConfirmOpen) {
        if (action === 'left' || action === 'up') {
          setExitDialogFocusedActionIndex((current) =>
            getNextDialogActionIndex(current, -1, EXIT_DIALOG_ACTION_COUNT),
          )
          return
        }

        if (action === 'right' || action === 'down') {
          setExitDialogFocusedActionIndex((current) =>
            getNextDialogActionIndex(current, 1, EXIT_DIALOG_ACTION_COUNT),
          )
          return
        }

        if (action === 'confirm' || action === 'primary') {
          handleExitDialogAction(exitDialogFocusedActionIndex)
          return
        }

        if (action === 'back' || action === 'secondary' || action === 'menu') {
          handleExitDialogAction(2)
        }

        return
      }

      if (action === 'left' || action === 'up') {
        setResetDialogFocusedActionIndex((current) =>
          getNextDialogActionIndex(current, -1, RESET_DIALOG_ACTION_COUNT),
        )
        return
      }

      if (action === 'right' || action === 'down') {
        setResetDialogFocusedActionIndex((current) =>
          getNextDialogActionIndex(current, 1, RESET_DIALOG_ACTION_COUNT),
        )
        return
      }

      if (action === 'confirm' || action === 'primary') {
        handleResetDialogAction(resetDialogFocusedActionIndex)
        return
      }

      if (action === 'back' || action === 'secondary' || action === 'menu') {
        handleResetDialogAction(1)
      }
    },
  })

  function renderControlsList() {
    const groupedBindings = visibleBindings.reduce<Record<string, CodenamesControlsBinding[]>>((groups, binding) => {
      groups[binding.section] ??= []
      groups[binding.section].push(binding)
      return groups
    }, {})
    const currentSectionLabel = Object.keys(groupedBindings)[0] ?? (activeControlsDevice === 'controller' ? 'Kontroler' : 'Klawiatura')

    return (
      <>
        <SettingsListHeader eyebrow="Mapowanie wejsc" title="Sterowanie" />

        <div className={styles.deviceSegmentRow}>
          <div className={styles.deviceSegment} role="tablist" aria-label="Urządzenie sterowania">
            <button
              type="button"
              role="tab"
              aria-selected={activeControlsDevice === 'keyboard'}
              className={[
                styles.deviceSegmentButton,
                activeControlsDevice === 'keyboard' ? styles.deviceSegmentButtonActive : '',
                isFocusVisible && focusedArea === 'device' && activeControlsDevice === 'keyboard' ? styles.controlFocused : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setControlsDevice('keyboard')}
            >
              <span className={styles.deviceSegmentIcon}>
                <Keyboard size={15} />
              </span>
              <span className={styles.deviceSegmentLabel}>Klawiatura</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeControlsDevice === 'controller'}
              className={[
                styles.deviceSegmentButton,
                activeControlsDevice === 'controller' ? styles.deviceSegmentButtonActive : '',
                isFocusVisible && focusedArea === 'device' && activeControlsDevice === 'controller' ? styles.controlFocused : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setControlsDevice('controller')}
            >
              <span className={styles.deviceSegmentIcon}>
                <Gamepad2 size={15} />
              </span>
              <span className={styles.deviceSegmentLabel}>Pad</span>
            </button>
          </div>

        </div>

        <div className={styles.controlsColumnsHeader} aria-hidden="true">
          <span className={styles.controlsColumnsSection}>{currentSectionLabel}</span>
          <span className={styles.controlsColumnLabel}>Glowny</span>
          <span className={styles.controlsColumnLabel}>Alternatywny</span>
        </div>

        <div ref={bindingsListRef} className={styles.listScroller}>
          {Object.entries(groupedBindings).map(([section, bindingsInSection]) => (
            <div key={section} className={styles.sectionGroup}>
              {bindingsInSection.map((binding) => {
                const isActive = binding.id === activeBinding?.id
                const BindingIcon = binding.device === 'keyboard' ? Keyboard : Gamepad2

                return (
                  <div
                    key={binding.id}
                    ref={(element) => {
                      bindingRowRefs.current[binding.id] = element
                    }}
                    role="button"
                    tabIndex={0}
                    className={[styles.optionRow, isActive ? styles.optionRowActive : '', isFocusVisible && focusedArea === 'bindings' && isActive ? styles.controlFocused : ''].filter(Boolean).join(' ')}
                    onClick={() => handleBindingSelect(binding)}
                    onKeyDown={(event) => handleBindingRowKeyDown(event, binding.id)}
                  >
                    <span className={styles.optionInfo}>
                      <span className={styles.optionTitle}>{binding.title}</span>
                      <span className={styles.optionMeta}>{binding.device === 'keyboard' ? 'Klawiatura' : 'Kontroler'}</span>
                    </span>
                    <span className={styles.optionControl}>
                      {(['primary', 'secondary'] as BindingSlot[]).map((slot) => {
                        const chipKey = getBindingSlotKey(binding.id, slot)
                        const isListening = chipKey === listeningBindingKey
                        const bindingValue = getBindingValue(bindings, binding.id, slot)
                        const hasBinding = Boolean(bindingValue)
                        const displayedBindingValue =
                          binding.device === 'controller'
                            ? formatControllerLabelForProfile(bindingValue, activeControllerProfile)
                            : bindingValue
                        const bindingLabel = isListening ? 'Nasluchiwanie...' : displayedBindingValue || 'Nieprzypisany'

                        return (
                          <span key={chipKey} className={styles.bindingChipStack}>
                            <span className={styles.bindingChipShell}>
                              <button
                                type="button"
                                className={[
                                  styles.bindingChip,
                                  isListening ? styles.bindingChipListening : '',
                                  hasBinding && !isListening ? styles.bindingChipClearable : '',
                                  !hasBinding && !isListening ? styles.bindingChipEmpty : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleBindingListen(binding, slot)
                                }}
                              >
                                <BindingIcon size={14} />
                                <span className={styles.bindingChipText}>{bindingLabel}</span>
                              </button>
                              {hasBinding && !isListening ? (
                                <button
                                  type="button"
                                  aria-label={`Odbinduj ${binding.title} ${slot === 'primary' ? 'główny' : 'alternatywny'}`}
                                  className={styles.bindingChipClear}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleBindingClear(binding, slot)
                                  }}
                                >
                                  <X size={13} />
                                </button>
                              ) : null}
                            </span>
                          </span>
                        )
                      })}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </>
    )
  }

  function renderPlaceholderList() {
    return (
      <>
        <SettingsListHeader eyebrow="Sekcja przygotowana" title={activeCategory.label} />
        <SettingsPlaceholderCard icon={AccentIcon} title={activeCategory.label} description={activeCategory.description} />
      </>
    )
  }

  return (
    <>
      <SettingsPanelShell
      eyebrow={
        <>
          <SlidersHorizontal size={14} />
          Panel systemowy
        </>
      }
      title="Ustawienia"
      subtitle="Ekran preferencji produktu i interfejsu. Nadal nie dotyka zasad meczu ani ustawień trybu gry."
      status={
        <SettingsStatusPill
          label={hasUnsavedChanges ? 'Niezapisane zmiany' : 'Wszystkie zmiany zapisane'}
          variant={hasUnsavedChanges ? 'warning' : 'default'}
        />
      }
      tabs={
        <SettingsPanelTabs
          items={codenamesSettingsCategories.map((category) => ({
            id: category.id,
            label: category.label,
            icon: category.icon,
          }))}
          activeTab={activeCategory.id}
          focusedTab={focusedTab}
          isFocusVisible={isFocusVisible}
          onPrevious={() => {
            setTabsInputDevice('mouse')
            stepCategory(-1)
          }}
          onNext={() => {
            setTabsInputDevice('mouse')
            stepCategory(1)
          }}
          previousShortcutLabel={tabsShortcutHints.previous}
          nextShortcutLabel={tabsShortcutHints.next}
          onChange={(tabId) => {
            setTabsInputDevice('mouse')
            const nextCategory = codenamesSettingsCategories.find((category) => category.id === tabId)
            if (nextCategory) {
              handleCategoryChange(nextCategory)
            }
          }}
          ariaLabel="Kategorie ustawień"
        />
      }
      main={isControlsView ? renderControlsList() : renderPlaceholderList()}
      aside={
        <div aria-live="polite">
          <SettingsDetailHero
            icon={AccentIcon}
            label={activeCategory.label}
            title={isControlsView ? activeBinding?.title ?? activeCategory.label : activeCategory.label}
          />

          <p className={styles.detailCopy}>
            {isControlsView ? activeBinding?.description : activeCategory.description}
          </p>

          <div className={styles.detailSummaryPanel}>
            <div className={styles.detailSummaryRow}>
              <span className={styles.detailMetricLabel}>{isControlsView ? 'Binding' : 'Status'}</span>
              <div className={styles.detailMetricValue}>
                <span>
                  {isControlsView
                    ? listeningBindingId === activeBinding?.id
                      ? 'Nasluchiwanie...'
                      : activeBinding
                        ? `${
                            activeBinding.device === 'controller'
                              ? formatControllerLabelForProfile(getBindingValue(bindings, activeBinding.id, 'primary'), activeControllerProfile)
                              : getBindingValue(bindings, activeBinding.id, 'primary')
                          } / ${
                            (activeBinding.device === 'controller'
                              ? formatControllerLabelForProfile(getBindingValue(bindings, activeBinding.id, 'secondary'), activeControllerProfile)
                              : getBindingValue(bindings, activeBinding.id, 'secondary')) || 'Brak'
                          }`
                        : ''
                    : 'W przygotowaniu'}
                </span>
                        <span className={styles.detailMetricMeta}>{isControlsView ? 'główny / alternatywny' : 'placeholder'}</span>
              </div>
            </div>

            <div className={styles.detailSummaryRow}>
              <span className={styles.detailMetricLabel}>{isControlsView ? 'Urządzenie' : 'Zakres'}</span>
              <div className={styles.detailMetricValue}>
                <span>
                  {isControlsView
                    ? activeBinding?.device === 'keyboard'
                      ? 'Klawiatura'
                      : 'Kontroler'
                    : 'UI-only'}
                </span>
                <span className={styles.detailMetricMeta}>{isControlsView ? 'typ źródła' : 'bez logiki'}</span>
              </div>
            </div>
          </div>

          {isControlsView ? (
            <div className={styles.deviceUtilityRow}>
              <div className={styles.deviceToolsPrimary}>
                <span className={styles.deviceUtilityLabel}>Aktywne urządzenie</span>
                <span className={styles.deviceSelectorCurrent} title={isPadView ? gamepadDebug.id || 'Brak aktywnego kontrolera' : 'Klawiatura systemowa'}>
                  {isPadView ? gamepadDebug.id || 'Brak aktywnego kontrolera' : 'Klawiatura systemowa'}
                </span>
                <div className={styles.deviceSelectorSlot}>
                  {isPadView && connectedGamepads.length > 1 ? (
                    <select
                      className={styles.deviceSelector}
                      value={selectedGamepadIndex ?? ''}
                      onChange={(event) => {
                        const nextValue = event.target.value
                        setSelectedGamepadIndex(nextValue === '' ? null : Number(nextValue))
                        gamepadSnapshotRef.current = null
                      }}
                    >
                      {connectedGamepads.map((gamepad) => (
                        <option key={gamepad.index} value={gamepad.index}>
                          {gamepad.id}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={styles.deviceSelectorHint}>
                      {isPadView
                        ? connectedGamepads.length === 1
                          ? 'Jedno aktywne urządzenie'
                          : 'Brak dodatkowych urządzeń'
                        : 'Stały input klawiatury'}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className={
                  isPadView
                    ? isDebugOpen
                      ? `${styles.devButton} ${styles.devButtonActive}`
                      : styles.devButton
                    : `${styles.devButton} ${styles.devButtonHidden}`
                }
                onClick={() => {
                  if (!isPadView) {
                    return
                  }
                  setIsDebugOpen((current) => !current)
                }}
                aria-hidden={!isPadView}
                tabIndex={isPadView ? 0 : -1}
              >
                DEV
              </button>
            </div>
          ) : null}

          <div className={styles.detailInsightCompact}>
            <span className={styles.detailInsightLabel}>
              <Sparkles size={14} />
              {isControlsView ? 'Lokalny rebinding' : 'Stan sekcji'}
            </span>
            <p className={styles.detailHint}>
              {isControlsView
                ? 'Kliknij w box przypisania, a następny klawisz lub przycisk pada zostanie zapisany lokalnie. Konflikty są rozwiązywane przez automatyczny swap.'
                : 'Ta zakładka została celowo uproszczona. Docelowa zawartość wróci tu dopiero przy wdrażaniu realnych ustawień.'}
            </p>
          </div>
        </div>
      }
      footer={
        <SettingsPanelFooter
          meta={
            <>
              <span className={styles.footerNote}>
                {hasUnsavedChanges
                  ? 'Masz niezapisane zmiany w ustawieniach.'
                  : isControlsView
                    ? 'Sterowanie jest zapisane lokalnie na tym urzadzeniu.'
                    : `${activeCategory.label} / placeholder`}
              </span>
            </>
          }
          actions={
            <>
              <button
                type="button"
                className={[styles.secondaryButton, isFocusVisible && focusedArea === 'footer' && focusedFooterAction === 'reset' ? styles.controlFocused : ''].filter(Boolean).join(' ')}
                onClick={() => {
                  setFocusedArea('footer')
                  setFocusedFooterAction('reset')
                  handleResetBindings()
                }}
                disabled={!hasDefaultChanges}
              >
                <RotateCcw size={14} />
                Przywróć domyślne
              </button>
              <button
                type="button"
                className={[styles.primaryButton, isFocusVisible && focusedArea === 'footer' && focusedFooterAction === 'save' ? styles.controlFocused : ''].filter(Boolean).join(' ')}
                onClick={() => {
                  setFocusedArea('footer')
                  setFocusedFooterAction('save')
                  handleSaveBindings()
                }}
                disabled={!hasUnsavedChanges}
              >
                <Save size={14} />
                Zapisz
              </button>
            </>
          }
        />
      }
      />

      {isPadView && isDebugOpen ? (
        <div
          className={styles.devPopup}
          style={{ left: `${debugPopupPosition.x}px`, top: `${debugPopupPosition.y}px` }}
        >
          <div className={styles.devPopupHeader} onPointerDown={handleDebugPointerDown}>
            <span className={styles.devPopupTitle}>DEV / Kontroler</span>
            <button type="button" className={styles.devPopupClose} onClick={() => setIsDebugOpen(false)}>
              <X size={14} />
            </button>
          </div>
          <div className={styles.devPopupBody}>
            <span className={styles.debugLine}>Stan: {gamepadDebug.connected ? 'Wykryty' : 'Brak kontrolera'}</span>
            <span className={styles.debugLine}>Index: {gamepadDebug.index ?? '---'}</span>
            <span className={styles.debugLine}>Input: {gamepadDebug.currentInput ?? 'Brak aktywnego wejscia'}</span>
            <span className={styles.debugLine}>Przyciski: {gamepadDebug.buttons}</span>
            <span className={styles.debugLine}>Osie: {gamepadDebug.axes}</span>
            <span className={styles.debugLine}>ID: {gamepadDebug.id || '---'}</span>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={isExitConfirmOpen}
        variant="danger"
        eyebrow="Alert zapisu"
        title="Masz niezapisane zmiany"
        description="Zapisz je przed wyjściem albo odrzuć i wróć do ostatniego zapisu."
        icon={<AlertTriangle size={18} />}
        focusedActionIndex={isDialogFocusVisible ? exitDialogFocusedActionIndex : null}
        isFocusVisible={isDialogFocusVisible}
        actions={[
          {
            label: 'Zapisz i wyjdź',
            variant: 'primary',
            fullWidth: true,
            onClick: handleSaveAndExit,
          },
          {
            label: 'Odrzuć zmiany',
            variant: 'danger',
            onClick: handleDiscardAndExit,
          },
          {
            label: 'Wróć do ustawień',
            variant: 'secondary',
            onClick: () => {
              setIsExitConfirmOpenInternal(false)
              setPendingExitView(null)
            },
          },
        ]}
      />

      <AlertDialog
        open={isResetConfirmOpen}
        variant="danger"
        eyebrow="Reset ustawień"
        title="Przywrócić domyślne ustawienia?"
        description="To podmieni cały aktualny szkic ustawień na wartości domyślne. Zmiana nie zapisze się sama."
        icon={<AlertTriangle size={18} />}
        focusedActionIndex={isDialogFocusVisible ? resetDialogFocusedActionIndex : null}
        isFocusVisible={isDialogFocusVisible}
        actions={[
          {
            label: 'Przywróć domyślne',
            variant: 'danger',
            fullWidth: true,
            onClick: handleConfirmResetBindings,
          },
          {
            label: 'Anuluj',
            variant: 'secondary',
            onClick: () => setIsResetConfirmOpen(false),
          },
        ]}
      />

    </>
  )
}
