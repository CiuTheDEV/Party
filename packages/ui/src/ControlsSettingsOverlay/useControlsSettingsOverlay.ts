'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useHostNavigation } from '../host-navigation/useHostNavigation'
import { resolveFixedHostNavigationAction, useHostNavigationInput } from '../host-navigation/useHostNavigationInput'
import type {
  ControlsSettingsOverlayAction,
  ControlsSettingsOverlayBinding,
  ControlsSettingsOverlayBindingApi,
  ControlsSettingsOverlayBindingSlot,
  ControlsSettingsOverlayCategory,
  ControlsSettingsOverlayCommonProps,
  ControlsSettingsOverlayConnectedGamepad,
  ControlsSettingsOverlayDevice,
  ControlsSettingsOverlayFooterFocusId,
  ControlsSettingsOverlayFocusArea,
  ControlsSettingsOverlayGamepadDebugState,
  ControlsSettingsOverlayGamepadProfile,
  ControlsSettingsOverlayInputDevice,
  ControlsSettingsOverlayGamepadSnapshot,
} from './types'

type UseControlsSettingsMenuControlsOptions<TBinding extends ControlsSettingsOverlayBinding> = {
  enabled?: boolean
  onAction: (action: ControlsSettingsOverlayAction, input?: { device: ControlsSettingsOverlayDevice; inputLabel: string }) => void
  onDeviceChange?: (device: ControlsSettingsOverlayDevice) => void
  onControllerProfileChange?: (profile: ControlsSettingsOverlayGamepadProfile) => void
  bindingApi: ControlsSettingsOverlayBindingApi<TBinding>
}

type UseControlsSettingsOverlayOptions<
  TMenuView extends string,
  TCategory extends ControlsSettingsOverlayCategory,
  TBinding extends ControlsSettingsOverlayBinding,
  TTargetId extends string = string,
  TScreenId extends string = string,
  TZoneId extends string = string,
> = ControlsSettingsOverlayCommonProps<TMenuView, TCategory, TBinding, TTargetId, TScreenId, TZoneId>

const DEFAULT_DEBUG_POSITION = { x: 24, y: 24 }
const EXIT_DIALOG_ACTION_COUNT = 3
const RESET_DIALOG_ACTION_COUNT = 2

export function useControlsSettingsOverlay<
  TMenuView extends string,
  TCategory extends ControlsSettingsOverlayCategory,
  TBinding extends ControlsSettingsOverlayBinding,
  TTargetId extends string = string,
  TScreenId extends string = string,
  TZoneId extends string = string,
>(options: UseControlsSettingsOverlayOptions<TMenuView, TCategory, TBinding, TTargetId, TScreenId, TZoneId>) {
  const {
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
    categories,
    navigation,
    bindingApi,
    helpers,
    menuControlsApi,
    defaultExitView,
  } = options

  const hostNavigation = useHostNavigation()
  const [isInputAwake, setIsInputAwake] = useState(false)
  const [isControllerWakeGuardActive, setIsControllerWakeGuardActive] = useState(false)
  const [tabsInputDevice, setTabsInputDevice] = useState<ControlsSettingsOverlayInputDevice>('mouse')
  const [tabsControllerProfile, setTabsControllerProfile] = useState<ControlsSettingsOverlayGamepadProfile>('generic')
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? '')
  const [activeControlsDevice, setActiveControlsDevice] = useState<ControlsSettingsOverlayDevice>('keyboard')
  const [activeBindingId, setActiveBindingId] = useState('')
  const [listeningBindingKey, setListeningBindingKey] = useState<string | null>(null)
  const [isExitConfirmOpenInternal, setIsExitConfirmOpenInternal] = useState(false)
  const [pendingExitView, setPendingExitView] = useState<TMenuView | null>(null)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [focusedArea, setFocusedArea] = useState<ControlsSettingsOverlayFocusArea>('device')
  const [focusedFooterAction, setFocusedFooterAction] = useState<ControlsSettingsOverlayFooterFocusId>('reset')
  const [exitDialogFocusedActionIndex, setExitDialogFocusedActionIndex] = useState(0)
  const [resetDialogFocusedActionIndex, setResetDialogFocusedActionIndex] = useState(0)
  const [gamepadDebug, setGamepadDebug] = useState<ControlsSettingsOverlayGamepadDebugState>({
    connected: false,
    id: '',
    index: null,
    buttons: 0,
    axes: 0,
    currentInput: null,
  })
  const [connectedGamepads, setConnectedGamepads] = useState<ControlsSettingsOverlayConnectedGamepad[]>([])
  const [selectedGamepadIndex, setSelectedGamepadIndex] = useState<number | null>(null)
  const [isDebugOpen, setIsDebugOpen] = useState(false)
  const [debugPopupPosition, setDebugPopupPosition] = useState(DEFAULT_DEBUG_POSITION)
  const tabsGamepadSnapshotRef = useRef<ControlsSettingsOverlayGamepadSnapshot | null>(null)
  const gamepadSnapshotRef = useRef<ControlsSettingsOverlayGamepadSnapshot | null>(null)
  const wakeDeviceRef = useRef<ControlsSettingsOverlayDevice>('keyboard')
  const onUnsavedChangesChangeRef = useRef(onUnsavedChangesChange)
  const bindingsListRef = useRef<HTMLDivElement | null>(null)
  const bindingRowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const dragStateRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null)
  const defaultBindingsSnapshotRef = useRef(bindingApi.createDefaultBindings())
  const onWakeHostFocusRef = useRef(onWakeHostFocus)
  const onSleepHostFocusRef = useRef(onSleepHostFocus)
  const onFocusRailRef = useRef(onFocusRail)

  const [bindings, setBindings] = useState<Record<string, string>>(() => bindingApi.createDefaultBindings())
  const [savedBindings, setSavedBindings] = useState<Record<string, string>>(() => bindingApi.createDefaultBindings())

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
    [activeCategoryId, categories],
  )
  const activeBinding = (
    activeCategory?.bindings?.find((binding) => binding.id === activeBindingId) ?? activeCategory?.bindings?.[0]
  ) as TBinding | undefined
  const isControlsView = Boolean(activeCategory?.bindings?.length)
  const isPadView = isControlsView && activeControlsDevice === 'controller'
  const activeControllerProfile = isPadView ? bindingApi.detectGamepadProfile(gamepadDebug.id || '') : 'generic'
  const listeningBindingId = listeningBindingKey?.split(':')[0] ?? null
  const listeningBindingSlot = (listeningBindingKey?.split(':')[1] as ControlsSettingsOverlayBindingSlot | undefined) ?? null
  const listeningBindingDevice = listeningBindingId ? bindingApi.getBindingDevice(listeningBindingId) : null
  const isExitConfirmOpen = isExitConfirmOpenInternal
  const categoryBindings = (activeCategory?.bindings ?? []) as TBinding[]
  const visibleBindings = useMemo(
    () => categoryBindings.filter((binding) => binding.device === activeControlsDevice),
    [activeControlsDevice, categoryBindings],
  )
  const groupedBindings = useMemo(
    () =>
      visibleBindings.reduce<Record<string, TBinding[]>>((groups, binding) => {
        groups[binding.section] ??= []
        groups[binding.section].push(binding)
        return groups
      }, {}),
    [visibleBindings],
  )
  const hasUnsavedChanges = useMemo(() => bindingApi.hasBindingChanges(savedBindings, bindings), [bindingApi, bindings, savedBindings])
  const hasDefaultChanges = useMemo(
    () => bindingApi.hasBindingChanges(defaultBindingsSnapshotRef.current, bindings),
    [bindingApi, bindings],
  )
  const areControlsInteractive = !isExitConfirmOpen && !isResetConfirmOpen && listeningBindingKey === null
  const isFocusVisible = isInputAwake && isHostFocused && isHostInputAwake
  const isDialogFocusVisible = isInputAwake && isHostInputAwake
  const focusedTab = isFocusVisible && focusedArea === 'tabs' ? activeCategory?.id ?? null : null
  const currentSectionLabel = Object.keys(groupedBindings)[0] ?? (activeControlsDevice === 'controller' ? 'Kontroler' : 'Klawiatura')

  useEffect(() => {
    onUnsavedChangesChangeRef.current = onUnsavedChangesChange
  }, [onUnsavedChangesChange])

  useEffect(() => {
    onWakeHostFocusRef.current = onWakeHostFocus
  }, [onWakeHostFocus])

  useEffect(() => {
    onSleepHostFocusRef.current = onSleepHostFocus
  }, [onSleepHostFocus])

  useEffect(() => {
    onFocusRailRef.current = onFocusRail
  }, [onFocusRail])

  useEffect(() => {
    const initialBindings = bindingApi.loadPersistedBindings()
    setSavedBindings(initialBindings)
    setBindings(initialBindings)
    helpers.publishSettingsDirtyState(false, onUnsavedChangesChangeRef.current)
  }, [bindingApi, helpers])

  useEffect(() => {
    return () => {
      helpers.publishSettingsDirtyState(false, onUnsavedChangesChangeRef.current)
    }
  }, [helpers])

  useEffect(() => {
    registerSettingsExitGuard?.((nextView: TMenuView) => {
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
    if (!activeBindingId && activeCategory?.bindings?.[0]) {
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

    if (focusedArea === 'tabs' && activeCategory) {
      hostNavigation.setFocus({
        screenId: navigation.settingsScreenId,
        zoneId: navigation.tabsZoneId,
        targetId: navigation.getSettingsTabTarget(activeCategory.id),
      })
      return
    }

    if (focusedArea === 'device') {
      hostNavigation.setFocus({
        screenId: navigation.settingsScreenId,
        zoneId: navigation.deviceZoneId,
        targetId: navigation.getControlsDeviceTarget(activeControlsDevice),
      })
      return
    }

    if (focusedArea === 'bindings') {
      hostNavigation.setFocus({
        screenId: navigation.settingsScreenId,
        zoneId: navigation.bindingsZoneId,
        targetId: activeBindingId || visibleBindings[0]?.id || navigation.footerResetTargetId,
      })
      return
    }

    if (focusedArea === 'footer') {
      hostNavigation.setFocus({
        screenId: navigation.settingsScreenId,
        zoneId: navigation.footerZoneId,
        targetId: focusedFooterAction === 'reset' ? navigation.footerResetTargetId : navigation.footerSaveTargetId,
      })
      return
    }

    if (activeCategory) {
      const entryTarget = navigation.getSettingsEntryTarget(activeCategory.id)
      hostNavigation.setFocus({
        screenId: navigation.settingsScreenId,
        zoneId: entryTarget.zoneId,
        targetId: entryTarget.targetId,
      })
    }
  }, [
    activeBindingId,
    activeCategory,
    activeControlsDevice,
    focusedArea,
    focusedFooterAction,
    hostNavigation,
    isExitConfirmOpen,
    isHostFocused,
    isResetConfirmOpen,
    navigation,
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
      onSleepHostFocusRef.current?.()
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [])

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
      const normalized = bindingApi.normalizeKeyboardInput(event.key)
      if (!normalized) {
        return
      }

      event.preventDefault()

      const binding = categoryBindings.find((item) => item.id === listeningBindingId)
      if (!binding) {
        return
      }

      const nextBindings = bindingApi.applyBindingAssignment(bindings, binding, slot, normalized)
      updateBindings(nextBindings)
      setActiveBindingId(binding.id)
      setListeningBindingKey(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bindingApi, bindings, categoryBindings, listeningBindingDevice, listeningBindingId, listeningBindingSlot])

  useEffect(() => {
    if (listeningBindingDevice !== 'controller' || !listeningBindingId || !listeningBindingSlot) {
      gamepadSnapshotRef.current = null
      return
    }

    const slot = listeningBindingSlot

    let frameId = 0

    const tick = () => {
      const binding = categoryBindings.find((item) => item.id === listeningBindingId)
      const availableGamepads = bindingApi.listConnectedGamepads()
      const activeGamepad =
        (selectedGamepadIndex !== null
          ? availableGamepads.find((gamepad) => gamepad.index === selectedGamepadIndex) ?? null
          : null) ?? bindingApi.pickPreferredGamepad(availableGamepads)

      if (!binding || !activeGamepad) {
        gamepadSnapshotRef.current = null
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const currentSnapshot = bindingApi.createGamepadSnapshot(activeGamepad)

      if (!gamepadSnapshotRef.current) {
        gamepadSnapshotRef.current = currentSnapshot
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const nextInput = bindingApi.getGamepadInputLabel(activeGamepad, gamepadSnapshotRef.current)
      gamepadSnapshotRef.current = currentSnapshot

      if (!nextInput) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const nextBindings = bindingApi.applyBindingAssignment(bindings, binding, slot, nextInput)
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
  }, [bindingApi, bindings, categoryBindings, listeningBindingDevice, listeningBindingId, listeningBindingSlot, selectedGamepadIndex])

  function updateBindings(nextBindings: Record<string, string>) {
    setBindings(nextBindings)
    helpers.publishSettingsDirtyState(bindingApi.hasBindingChanges(savedBindings, nextBindings), onUnsavedChangesChangeRef.current)
  }

  function saveBindings() {
    bindingApi.persistBindings(bindings)
    setSavedBindings(bindings)
    helpers.publishSettingsDirtyState(false, onUnsavedChangesChangeRef.current)
  }

  function resetToSavedBindings() {
    updateBindings(savedBindings)
  }

  function resetToDefaultBindings() {
    const defaults = bindingApi.createDefaultBindings()
    updateBindings(defaults)
  }

  function handleCategoryChange(category: TCategory) {
    setActiveCategoryId(category.id)
    setActiveBindingId(category.bindings?.[0]?.id ?? '')
    setListeningBindingKey(null)
    if (category.bindings?.length) {
      setActiveControlsDevice('keyboard')
      setFocusedArea('device')
      return
    }

    setFocusedArea('tabs')
  }

  function stepCategory(direction: -1 | 1) {
    if (!activeCategory) {
      return
    }
    const nextCategoryId = menuControlsApi.getNextSettingsCategoryId(
      activeCategory.id,
      direction === -1 ? 'left' : 'right',
    )
    const nextCategory = categories.find((category) => category.id === nextCategoryId)
    if (!nextCategory) {
      return
    }
    handleCategoryChange(nextCategory as TCategory)
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

  function setControlsDevice(device: ControlsSettingsOverlayDevice) {
    setFocusedArea('device')
    setActiveControlsDevice(device)
    const firstBinding = (activeCategory?.bindings ?? []).find((binding) => binding.device === device)
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

      onFocusRailRef.current?.()
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

  function handleBindingSelect(binding: TBinding) {
    setFocusedArea('bindings')
    setActiveBindingId(binding.id)
  }

  function handleBindingListen(binding: TBinding, slot: ControlsSettingsOverlayBindingSlot) {
    setFocusedArea('bindings')
    setActiveBindingId(binding.id)
    gamepadSnapshotRef.current = null
    const nextKey = bindingApi.getBindingSlotKey(binding.id, slot)
    setListeningBindingKey((current) => (current === nextKey ? null : nextKey))
  }

  function handleBindingClear(binding: TBinding, slot: ControlsSettingsOverlayBindingSlot) {
    const nextBindings = {
      ...bindings,
      [bindingApi.getBindingSlotKey(binding.id, slot)]: '',
    }
    updateBindings(nextBindings)
    setActiveBindingId(binding.id)
    setListeningBindingKey((current) => (current === bindingApi.getBindingSlotKey(binding.id, slot) ? null : current))
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

  function commitExitView(view: TMenuView) {
    if (onCommitViewChange) {
      onCommitViewChange(view)
      return
    }

    onBack()
  }

  function requestSettingsExit(nextView: TMenuView) {
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
    requestSettingsExit(defaultExitView)
  }

  function handleDiscardAndExit() {
    resetToSavedBindings()
    setListeningBindingKey(null)
    setIsExitConfirmOpenInternal(false)
    commitExitView(pendingExitView ?? defaultExitView)
  }

  function handleSaveAndExit() {
    saveBindings()
    setListeningBindingKey(null)
    setIsExitConfirmOpenInternal(false)
    commitExitView(pendingExitView ?? defaultExitView)
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
  }, [activeCategory?.id, areControlsInteractive, isInputAwake])

  useEffect(() => {
    if (!areControlsInteractive || !isInputAwake || isControllerWakeGuardActive) {
      tabsGamepadSnapshotRef.current = null
      return
    }

    let frameId = 0

    const tick = () => {
      const activeGamepad = bindingApi.pickPreferredGamepad(bindingApi.listConnectedGamepads())

      if (!activeGamepad) {
        tabsGamepadSnapshotRef.current = null
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const currentSnapshot = bindingApi.createGamepadSnapshot(activeGamepad)

      if (!tabsGamepadSnapshotRef.current) {
        tabsGamepadSnapshotRef.current = currentSnapshot
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const nextInput = bindingApi.getGamepadInputLabel(activeGamepad, tabsGamepadSnapshotRef.current)
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
  }, [activeCategory?.id, areControlsInteractive, bindingApi, isControllerWakeGuardActive, isInputAwake])

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

      onWakeHostFocusRef.current?.('keyboard')
      wakeDeviceRef.current = 'keyboard'
      setIsInputAwake(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [areControlsInteractive, isInputAwake])

  useEffect(() => {
    if (!areControlsInteractive || isInputAwake) {
      tabsGamepadSnapshotRef.current = null
      return
    }

    let frameId = 0

    const tick = () => {
      const activeGamepad = bindingApi.pickPreferredGamepad(bindingApi.listConnectedGamepads())

      if (!activeGamepad) {
        tabsGamepadSnapshotRef.current = null
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const profile = bindingApi.detectGamepadProfile(activeGamepad.id || '')
      if (tabsControllerProfile !== profile) {
        setTabsControllerProfile(profile)
      }

      const currentSnapshot = bindingApi.createGamepadSnapshot(activeGamepad)

      if (!tabsGamepadSnapshotRef.current) {
        tabsGamepadSnapshotRef.current = currentSnapshot
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const nextInput = bindingApi.getGamepadInputLabel(activeGamepad, tabsGamepadSnapshotRef.current)
      tabsGamepadSnapshotRef.current = currentSnapshot

      if (nextInput !== 'L1 / LB' && nextInput !== 'R1 / RB') {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      onWakeHostFocusRef.current?.('controller')
      wakeDeviceRef.current = 'controller'
      setTabsInputDevice('controller')
      setIsInputAwake(true)
      setIsControllerWakeGuardActive(true)
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [areControlsInteractive, bindingApi, isInputAwake, tabsControllerProfile])

  useEffect(() => {
    if (!isControllerWakeGuardActive) {
      return
    }

    let frameId = 0

    const tick = () => {
      const activeGamepad = bindingApi.pickPreferredGamepad(bindingApi.listConnectedGamepads())
      const currentInput = activeGamepad ? bindingApi.getCurrentGamepadInputLabel(activeGamepad) : null

      if (!currentInput) {
        setIsControllerWakeGuardActive(false)
        return
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [bindingApi, isControllerWakeGuardActive])

  useControlsMenuControls({
    enabled: areControlsInteractive && !isInputAwake,
    bindingApi,
    onDeviceChange: (device) => {
      wakeDeviceRef.current = device === 'controller' ? 'controller' : 'keyboard'
      setTabsInputDevice(device === 'controller' ? 'controller' : 'keyboard')
    },
    onControllerProfileChange: (profile) => {
      setTabsControllerProfile(profile)
    },
    onAction: (_action, input) => {
      onWakeHostFocusRef.current?.(input?.device)

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

  useControlsMenuControls({
    enabled: areControlsInteractive && isInputAwake && !isControllerWakeGuardActive,
    bindingApi,
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

      if (focusedArea === 'tabs' && activeCategory) {
        const tabsCommand = menuControlsApi.resolveSettingsTabsCommand(activeCategory.id, action)
        if (tabsCommand?.type === 'focus-rail') {
          onFocusRailRef.current?.()
          return
        }

        if (tabsCommand?.type === 'select-category') {
          const nextCategory = categories.find((category) => category.id === tabsCommand.categoryId)
          if (nextCategory) {
            handleCategoryChange(nextCategory)
          }
          return
        }

        if (action === 'down' || action === 'up') {
          setFocusedArea(menuControlsApi.getNextSettingsFocusArea('tabs', action, { isControlsView }))
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
          setFocusedArea(menuControlsApi.getNextSettingsFocusArea('device', action, { isControlsView }))
        }
        return
      }

      if (focusedArea === 'bindings') {
        if (action === 'up' || action === 'down') {
          setActiveBindingId((current) =>
            menuControlsApi.getNextBindingFocusId(visibleBindings.map((binding) => binding.id), current, action),
          )
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
          setFocusedFooterAction((current) => menuControlsApi.getNextFooterFocusId(current, action))
          return
        }

        if (action === 'up' || action === 'down') {
          setFocusedArea(menuControlsApi.getNextSettingsFocusArea('footer', action, { isControlsView }))
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

  useControlsMenuControls({
    enabled: (isExitConfirmOpen || isResetConfirmOpen) && !isInputAwake,
    bindingApi,
    onDeviceChange: (device) => {
      wakeDeviceRef.current = device === 'controller' ? 'controller' : 'keyboard'
      setTabsInputDevice(device === 'controller' ? 'controller' : 'keyboard')
    },
    onControllerProfileChange: (profile) => {
      setTabsControllerProfile(profile)
    },
    onAction: (_action, input) => {
      onWakeHostFocusRef.current?.(input?.device)

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

  useControlsMenuControls({
    enabled: (isExitConfirmOpen || isResetConfirmOpen) && isInputAwake && !isControllerWakeGuardActive,
    bindingApi,
    onDeviceChange: (device) => {
      setTabsInputDevice(device)
    },
    onControllerProfileChange: (profile) => {
      setTabsControllerProfile(profile)
    },
    onAction: (action) => {
      if (isExitConfirmOpen) {
        if (action === 'left' || action === 'up') {
          setExitDialogFocusedActionIndex((current) => helpers.getNextDialogActionIndex(current, -1, EXIT_DIALOG_ACTION_COUNT))
          return
        }

        if (action === 'right' || action === 'down') {
          setExitDialogFocusedActionIndex((current) => helpers.getNextDialogActionIndex(current, 1, EXIT_DIALOG_ACTION_COUNT))
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
        setResetDialogFocusedActionIndex((current) => helpers.getNextDialogActionIndex(current, -1, RESET_DIALOG_ACTION_COUNT))
        return
      }

      if (action === 'right' || action === 'down') {
        setResetDialogFocusedActionIndex((current) => helpers.getNextDialogActionIndex(current, 1, RESET_DIALOG_ACTION_COUNT))
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

  useEffect(() => {
    if (!isPadView) {
      setIsDebugOpen(false)
      setGamepadDebug((current) => {
        const nextState: ControlsSettingsOverlayGamepadDebugState = {
          connected: false,
          id: '',
          index: null,
          buttons: 0,
          axes: 0,
          currentInput: null,
        }

        return helpers.areGamepadDebugStatesEqual(current, nextState) ? current : nextState
      })
      setConnectedGamepads((current) => (current.length === 0 ? current : []))
      setSelectedGamepadIndex((current) => (current === null ? current : null))
      return
    }

    let frameId = 0

    const tick = () => {
      const availableGamepads = bindingApi.listConnectedGamepads()
      const nextConnectedGamepads = availableGamepads.map((gamepad) => ({
        index: gamepad.index,
        id: gamepad.id || `Kontroler ${gamepad.index + 1}`,
      }))

      setConnectedGamepads((current) =>
        helpers.areConnectedGamepadOptionsEqual(current, nextConnectedGamepads) ? current : nextConnectedGamepads,
      )

      const preferredGamepad = bindingApi.pickPreferredGamepad(availableGamepads)
      const selectedGamepad =
        (selectedGamepadIndex !== null
          ? availableGamepads.find((gamepad) => gamepad.index === selectedGamepadIndex) ?? null
          : null) ?? preferredGamepad

      if (!selectedGamepad) {
        setGamepadDebug((current) => {
          const nextState: ControlsSettingsOverlayGamepadDebugState = {
            connected: false,
            id: '',
            index: null,
            buttons: 0,
            axes: 0,
            currentInput: null,
          }

          return helpers.areGamepadDebugStatesEqual(current, nextState) ? current : nextState
        })
        frameId = window.requestAnimationFrame(tick)
        return
      }

      if (
        selectedGamepadIndex === null ||
        !availableGamepads.some((gamepad) => gamepad.index === selectedGamepadIndex)
      ) {
        setSelectedGamepadIndex(selectedGamepad.index)
      }

      setGamepadDebug((current) => {
        const nextState: ControlsSettingsOverlayGamepadDebugState = {
          connected: true,
          id: selectedGamepad.id || 'Nieznany kontroler',
          index: selectedGamepad.index,
          buttons: selectedGamepad.buttons.length,
          axes: selectedGamepad.axes.length,
          currentInput: bindingApi.formatControllerLabelForProfile(
            bindingApi.getCurrentGamepadInputLabel(selectedGamepad) ?? '',
            bindingApi.detectGamepadProfile(selectedGamepad.id || ''),
          ),
        }

        return helpers.areGamepadDebugStatesEqual(current, nextState) ? current : nextState
      })

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [bindingApi, helpers, isPadView, selectedGamepadIndex])

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragStateRef.current) {
        return
      }

      setDebugPopupPosition({
        x: Math.max(8, event.clientX - dragStateRef.current.offsetX),
        y: Math.max(8, event.clientY - dragStateRef.current.offsetY),
      })
    }

    function handlePointerUp(event: PointerEvent) {
      if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) {
        return
      }

      dragStateRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  function handleDebugPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const popupRect = event.currentTarget.parentElement?.getBoundingClientRect()
    if (!popupRect) {
      return
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - popupRect.left,
      offsetY: event.clientY - popupRect.top,
    }
  }

  return {
    hostNavigation,
    activeCategory,
    activeBinding,
    isControlsView,
    isPadView,
    activeControlsDevice,
    activeControllerProfile,
    bindings,
    savedBindings,
    hasUnsavedChanges,
    hasDefaultChanges,
    updateBindings,
    saveBindings,
    resetToSavedBindings,
    resetToDefaultBindings,
    gamepadDebug,
    connectedGamepads,
    selectedGamepadIndex,
    setSelectedGamepadIndex,
    isDebugOpen,
    setIsDebugOpen,
    debugPopupPosition,
    handleDebugPointerDown,
    listeningBindingId,
    listeningBindingDevice,
    isExitConfirmOpen,
    isResetConfirmOpen,
    focusedArea,
    focusedFooterAction,
    exitDialogFocusedActionIndex,
    resetDialogFocusedActionIndex,
    isInputAwake,
    isDialogFocusVisible,
    isFocusVisible,
    areControlsInteractive,
    focusedTab,
    tabsShortcutHints,
    visibleBindings,
    groupedBindings,
    currentSectionLabel,
    bindingsListRef,
    bindingRowRefs,
    setFocusedArea,
    setFocusedFooterAction,
    setTabsInputDevice,
    stepCategory,
    handleCategoryChange,
    setControlsDevice,
    stepControlsDevice,
    handleBindingRowKeyDown,
    handleBindingSelect,
    handleBindingListen,
    handleBindingClear,
    handleResetBindings,
    handleConfirmResetBindings,
    handleSaveBindings,
    handleDiscardAndExit,
    handleSaveAndExit,
    handleExitDialogAction,
    handleResetDialogAction,
    requestSettingsExit,
    handleRequestBack,
    listeningBindingKey,
  }
}

function useControlsMenuControls<TBinding extends ControlsSettingsOverlayBinding>({
  enabled = true,
  onAction,
  onDeviceChange,
  onControllerProfileChange,
  bindingApi,
}: UseControlsSettingsMenuControlsOptions<TBinding>) {
  const onActionRef = useRef(onAction)
  const onDeviceChangeRef = useRef(onDeviceChange)
  const onControllerProfileChangeRef = useRef(onControllerProfileChange)
  const enabledRef = useRef(enabled)
  const lastDeviceRef = useRef<ControlsSettingsOverlayDevice | null>(null)
  const lastControllerProfileRef = useRef<ControlsSettingsOverlayGamepadProfile>('generic')

  onActionRef.current = onAction
  onDeviceChangeRef.current = onDeviceChange
  onControllerProfileChangeRef.current = onControllerProfileChange
  enabledRef.current = enabled

  useEffect(() => {
    onActionRef.current = onAction
  }, [onAction])

  useEffect(() => {
    onDeviceChangeRef.current = onDeviceChange
  }, [onDeviceChange])

  useEffect(() => {
    onControllerProfileChangeRef.current = onControllerProfileChange
  }, [onControllerProfileChange])

  useHostNavigationInput({
    enabled,
    shouldHandleKeyboardEvent: (event) => !isTypingTarget(event.target),
    onAction: (action, input) => {
      const inputLabel = bindingApi.normalizeKeyboardInput(input.inputLabel)
      if (!inputLabel || !isHostControlAction(action)) {
        return
      }

      reportDevice('keyboard', lastDeviceRef, onDeviceChangeRef)
      onActionRef.current(action, { device: 'keyboard', inputLabel })
    },
  })

  useEffect(() => {
    let frameId = 0
    let previousSnapshot: ControlsSettingsOverlayGamepadSnapshot | null = null

    const tick = () => {
      if (!enabledRef.current) {
        const sleepingGamepad = bindingApi.pickPreferredGamepad(bindingApi.listConnectedGamepads())
        previousSnapshot = sleepingGamepad ? bindingApi.createGamepadSnapshot(sleepingGamepad) : null
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const activeGamepad = bindingApi.pickPreferredGamepad(bindingApi.listConnectedGamepads())

      if (!activeGamepad) {
        previousSnapshot = null
        if (lastControllerProfileRef.current !== 'generic') {
          lastControllerProfileRef.current = 'generic'
          onControllerProfileChangeRef.current?.('generic')
        }
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const profile = bindingApi.detectGamepadProfile(activeGamepad.id || '')
      if (lastControllerProfileRef.current !== profile) {
        lastControllerProfileRef.current = profile
        onControllerProfileChangeRef.current?.(profile)
      }

      const nextSnapshot = bindingApi.createGamepadSnapshot(activeGamepad)
      if (!previousSnapshot) {
        previousSnapshot = nextSnapshot
        reportDevice('controller', lastDeviceRef, onDeviceChangeRef)
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const inputLabel = bindingApi.getGamepadInputLabel(activeGamepad, previousSnapshot)
      previousSnapshot = nextSnapshot

      if (!inputLabel) {
        frameId = window.requestAnimationFrame(tick)
        return
      }

      const action = resolveFixedHostNavigationAction('controller', inputLabel)
      if (action && isHostControlAction(action)) {
        reportDevice('controller', lastDeviceRef, onDeviceChangeRef)
        onActionRef.current(action, { device: 'controller', inputLabel })
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [bindingApi])
}

function reportDevice(
  nextDevice: ControlsSettingsOverlayDevice,
  lastDeviceRef: { current: ControlsSettingsOverlayDevice | null },
  onDeviceChangeRef: { current?: ((device: ControlsSettingsOverlayDevice) => void) | undefined },
) {
  if (lastDeviceRef.current === nextDevice) {
    return
  }

  lastDeviceRef.current = nextDevice
  onDeviceChangeRef.current?.(nextDevice)
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function isHostControlAction(action: string): action is ControlsSettingsOverlayAction {
  return (
    action === 'left' ||
    action === 'right' ||
    action === 'up' ||
    action === 'down' ||
    action === 'confirm' ||
    action === 'back' ||
    action === 'menu' ||
    action === 'primary' ||
    action === 'secondary'
  )
}
