'use client'

import { AlertTriangle, Gamepad2, Keyboard, RotateCcw, Save, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import {
  AlertDialog,
  SettingsDetailHero,
  SettingsPanelFooter,
  SettingsPanelShell,
  SettingsPanelTabs,
  SettingsListHeader,
  SettingsPlaceholderCard,
  SettingsStatusPill,
} from '@party/ui'
import styles from './CharadesSettingsOverlay.module.css'
import {
  applyBindingAssignment,
  createGamepadSnapshot,
  createDefaultBindings,
  detectGamepadProfile,
  getBindingDevice,
  getBindingSlotKey,
  getBindingValue,
  hasBindingChanges,
  formatControllerLabelForProfile,
  getCurrentGamepadInputLabel,
  getGamepadInputLabel,
  listConnectedGamepads,
  loadPersistedBindings,
  normalizeKeyboardInput,
  pickPreferredGamepad,
  persistBindings,
  type BindingSlot,
  type GamepadSnapshot,
} from './charades-controls-bindings'
import {
  charadesSettingsAccentIcons,
  charadesSettingsCategories,
  type CharadesControlsBinding,
  type CharadesSettingsCategory,
} from './charades-settings-overlay-data'

type Props = {
  onBack: () => void
  onExitToMenu?: () => void
  isExitConfirmOpenExternal?: boolean
  onCloseExternalExitConfirm?: () => void
  onUnsavedChangesChange?: (value: boolean) => void
}

type GamepadDebugState = {
  connected: boolean
  id: string
  index: number | null
  buttons: number
  axes: number
  currentInput: string | null
}

type ConnectedGamepadOption = {
  index: number
  id: string
}

type PopupPosition = {
  x: number
  y: number
}

type DragState = {
  pointerId: number
  offsetX: number
  offsetY: number
}

const DEFAULT_DEBUG_POSITION: PopupPosition = { x: 24, y: 24 }
const defaultBindingsSnapshot = createDefaultBindings()

export function CharadesSettingsOverlay({
  onBack,
  onExitToMenu,
  isExitConfirmOpenExternal = false,
  onCloseExternalExitConfirm,
  onUnsavedChangesChange,
}: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<'general' | 'audio' | 'controls'>('controls')
  const [bindings, setBindings] = useState<Record<string, string>>(() => createDefaultBindings())
  const [savedBindings, setSavedBindings] = useState<Record<string, string>>(() => createDefaultBindings())
  const [activeControlsDevice, setActiveControlsDevice] = useState<'keyboard' | 'controller'>('keyboard')
  const [activeBindingId, setActiveBindingId] = useState('')
  const [listeningBindingKey, setListeningBindingKey] = useState<string | null>(null)
  const [isExitConfirmOpenInternal, setIsExitConfirmOpenInternal] = useState(false)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [gamepadDebug, setGamepadDebug] = useState<GamepadDebugState>({
    connected: false,
    id: '',
    index: null,
    buttons: 0,
    axes: 0,
    currentInput: null,
  })
  const [connectedGamepads, setConnectedGamepads] = useState<ConnectedGamepadOption[]>([])
  const [selectedGamepadIndex, setSelectedGamepadIndex] = useState<number | null>(null)
  const [isDebugOpen, setIsDebugOpen] = useState(false)
  const [debugPopupPosition, setDebugPopupPosition] = useState<PopupPosition>(DEFAULT_DEBUG_POSITION)
  const gamepadSnapshotRef = useRef<GamepadSnapshot | null>(null)
  const dragStateRef = useRef<DragState | null>(null)

  const activeCategory = useMemo(
    () => charadesSettingsCategories.find((category) => category.id === activeCategoryId) ?? charadesSettingsCategories[0],
    [activeCategoryId],
  )

  const activeBinding =
    activeCategory.bindings?.find((binding) => binding.id === activeBindingId) ?? activeCategory.bindings?.[0]
  const AccentIcon = charadesSettingsAccentIcons[activeCategory.id]
  const isControlsView = activeCategory.id === 'controls'
  const isPadView = isControlsView && activeControlsDevice === 'controller'
  const activeControllerProfile = isPadView ? detectGamepadProfile(gamepadDebug.id || '') : 'generic'
  const listeningBindingId = listeningBindingKey?.split(':')[0] ?? null
  const listeningBindingSlot = (listeningBindingKey?.split(':')[1] as BindingSlot | undefined) ?? null
  const listeningBindingDevice = listeningBindingId ? getBindingDevice(listeningBindingId) : null
  const hasUnsavedChanges = useMemo(() => hasBindingChanges(savedBindings, bindings), [bindings, savedBindings])
  const hasDefaultChanges = useMemo(() => hasBindingChanges(defaultBindingsSnapshot, bindings), [bindings])
  const isExitConfirmOpen = isExitConfirmOpenExternal || isExitConfirmOpenInternal

  useEffect(() => {
    const initialBindings = loadPersistedBindings()
    setSavedBindings(initialBindings)
    setBindings(initialBindings)
  }, [])

  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onUnsavedChangesChange])

  useEffect(() => {
    if (!activeBindingId && activeCategory.bindings?.[0]) {
      setActiveBindingId(activeCategory.bindings[0].id)
    }
  }, [activeBindingId, activeCategory])

  useEffect(() => {
    if (!isPadView) {
      setIsDebugOpen(false)
      setGamepadDebug({
        connected: false,
        id: '',
        index: null,
        buttons: 0,
        axes: 0,
        currentInput: null,
      })
      setConnectedGamepads([])
      setSelectedGamepadIndex(null)
      return
    }

    let frameId = 0

    const tick = () => {
      const availableGamepads = listConnectedGamepads()
      setConnectedGamepads(
        availableGamepads.map((gamepad) => ({
          index: gamepad.index,
          id: gamepad.id || `Kontroler ${gamepad.index + 1}`,
        })),
      )

      const preferredGamepad = pickPreferredGamepad(availableGamepads)
      const selectedGamepad =
        (selectedGamepadIndex !== null
          ? availableGamepads.find((gamepad) => gamepad.index === selectedGamepadIndex) ?? null
          : null) ?? preferredGamepad

      if (!selectedGamepad) {
        setGamepadDebug({
          connected: false,
          id: '',
          index: null,
          buttons: 0,
          axes: 0,
          currentInput: null,
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

      setGamepadDebug({
        connected: true,
        id: selectedGamepad.id || 'Nieznany kontroler',
        index: selectedGamepad.index,
        buttons: selectedGamepad.buttons.length,
        axes: selectedGamepad.axes.length,
        currentInput: formatControllerLabelForProfile(
          getCurrentGamepadInputLabel(selectedGamepad) ?? '',
          detectGamepadProfile(selectedGamepad.id || ''),
        ),
      })

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isPadView, selectedGamepadIndex])

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

      setBindings((current) => applyBindingAssignment(current, binding, slot, normalized))
      setActiveBindingId(binding.id)
      setListeningBindingKey(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeCategory.bindings, listeningBindingDevice, listeningBindingId, listeningBindingSlot])

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

      setBindings((current) => applyBindingAssignment(current, binding, slot, nextInput))
      setActiveBindingId(binding.id)
      setListeningBindingKey(null)
      gamepadSnapshotRef.current = null
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
      gamepadSnapshotRef.current = null
    }
  }, [activeCategory.bindings, listeningBindingDevice, listeningBindingId, listeningBindingSlot, selectedGamepadIndex])

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

  function handleCategoryChange(category: CharadesSettingsCategory) {
    setActiveCategoryId(category.id)
    setActiveBindingId(category.bindings?.[0]?.id ?? '')
    setListeningBindingKey(null)
    if (category.id === 'controls') {
      setActiveControlsDevice('keyboard')
    }
  }

  function handleBindingRowKeyDown(event: KeyboardEvent<HTMLDivElement>, bindingId: string) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    setActiveBindingId(bindingId)
  }

  function handleBindingSelect(binding: CharadesControlsBinding) {
    setActiveBindingId(binding.id)
  }

  function handleBindingListen(binding: CharadesControlsBinding, slot: BindingSlot) {
    setActiveBindingId(binding.id)
    gamepadSnapshotRef.current = null
    const nextKey = getBindingSlotKey(binding.id, slot)
    setListeningBindingKey((current) => (current === nextKey ? null : nextKey))
  }

  function handleBindingClear(binding: CharadesControlsBinding, slot: BindingSlot) {
    setBindings((current) => ({
      ...current,
      [getBindingSlotKey(binding.id, slot)]: '',
    }))
    setActiveBindingId(binding.id)
    setListeningBindingKey((current) => (current === getBindingSlotKey(binding.id, slot) ? null : current))
  }

  function handleResetBindings() {
    if (!hasDefaultChanges) {
      return
    }

    setIsResetConfirmOpen(true)
  }

  function handleConfirmResetBindings() {
    const defaults = createDefaultBindings()
    setBindings(defaults)
    setListeningBindingKey(null)
    setIsResetConfirmOpen(false)
  }

  function handleSaveBindings() {
    persistBindings(bindings)
    setSavedBindings(bindings)
    setIsExitConfirmOpenInternal(false)
    onCloseExternalExitConfirm?.()
  }

  function handleRequestBack() {
    setListeningBindingKey(null)

    if (!hasUnsavedChanges) {
      ;(onExitToMenu ?? onBack)()
      return
    }

    setIsExitConfirmOpenInternal(true)
  }

  function handleDiscardAndExit() {
    setBindings(savedBindings)
    setListeningBindingKey(null)
    setIsExitConfirmOpenInternal(false)
    onCloseExternalExitConfirm?.()
    ;(onExitToMenu ?? onBack)()
  }

  function handleSaveAndExit() {
    persistBindings(bindings)
    setSavedBindings(bindings)
    setListeningBindingKey(null)
    setIsExitConfirmOpenInternal(false)
    onCloseExternalExitConfirm?.()
    ;(onExitToMenu ?? onBack)()
  }

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

  function renderControlsList() {
    const visibleBindings = (activeCategory.bindings ?? []).filter((binding) => binding.device === activeControlsDevice)
    const groupedBindings = visibleBindings.reduce<Record<string, CharadesControlsBinding[]>>((groups, binding) => {
      groups[binding.section] ??= []
      groups[binding.section].push(binding)
      return groups
    }, {})
    const currentSectionLabel = Object.keys(groupedBindings)[0] ?? (activeControlsDevice === 'controller' ? 'Kontroler' : 'Klawiatura')

    return (
      <>
        <SettingsListHeader eyebrow="Mapowanie wejsc" title="Sterowanie" />

        <div className={styles.deviceSegmentRow}>
          <div className={styles.deviceSegment} role="tablist" aria-label="Urzadzenie sterowania">
            <button
              type="button"
              role="tab"
              aria-selected={activeControlsDevice === 'keyboard'}
              className={
                activeControlsDevice === 'keyboard'
                  ? `${styles.deviceSegmentButton} ${styles.deviceSegmentButtonActive}`
                  : styles.deviceSegmentButton
              }
              onClick={() => {
                setActiveControlsDevice('keyboard')
                const firstKeyboardBinding = (activeCategory.bindings ?? []).find((binding) => binding.device === 'keyboard')
                if (firstKeyboardBinding) {
                  setActiveBindingId(firstKeyboardBinding.id)
                }
                setListeningBindingKey(null)
              }}
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
              className={
                activeControlsDevice === 'controller'
                  ? `${styles.deviceSegmentButton} ${styles.deviceSegmentButtonActive}`
                  : styles.deviceSegmentButton
              }
              onClick={() => {
                setActiveControlsDevice('controller')
                const firstControllerBinding = (activeCategory.bindings ?? []).find(
                  (binding) => binding.device === 'controller',
                )
                if (firstControllerBinding) {
                  setActiveBindingId(firstControllerBinding.id)
                }
                setListeningBindingKey(null)
              }}
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

        <div className={styles.listScroller}>
          {Object.entries(groupedBindings).map(([section, bindingsInSection]) => (
            <div key={section} className={styles.sectionGroup}>
              {bindingsInSection.map((binding) => {
                const isActive = binding.id === activeBinding?.id
                const BindingIcon = binding.device === 'keyboard' ? Keyboard : Gamepad2

                return (
                  <div
                    key={binding.id}
                    role="button"
                    tabIndex={0}
                    className={isActive ? `${styles.optionRow} ${styles.optionRowActive}` : styles.optionRow}
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
                                  aria-label={`Odbinduj ${binding.title} ${slot === 'primary' ? 'glowny' : 'alternatywny'}`}
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
      subtitle="Ekran preferencji produktu i interfejsu. Nadal nie dotyka zasad meczu ani ustawien trybu gry."
      status={
        <SettingsStatusPill
          label={hasUnsavedChanges ? 'Niezapisane zmiany' : 'Wszystkie zmiany zapisane'}
          variant={hasUnsavedChanges ? 'warning' : 'default'}
        />
      }
      tabs={
        <SettingsPanelTabs
          items={charadesSettingsCategories.map((category) => ({
            id: category.id,
            label: category.label,
            icon: category.icon,
          }))}
          activeTab={activeCategory.id}
          onChange={(tabId) => {
            const nextCategory = charadesSettingsCategories.find((category) => category.id === tabId)
            if (nextCategory) {
              handleCategoryChange(nextCategory)
            }
          }}
          ariaLabel="Kategorie ustawien"
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
                <span className={styles.detailMetricMeta}>{isControlsView ? 'glowny / alternatywny' : 'placeholder'}</span>
              </div>
            </div>

            <div className={styles.detailSummaryRow}>
              <span className={styles.detailMetricLabel}>{isControlsView ? 'Urzadzenie' : 'Zakres'}</span>
              <div className={styles.detailMetricValue}>
                <span>
                  {isControlsView
                    ? activeBinding?.device === 'keyboard'
                      ? 'Klawiatura'
                      : 'Kontroler'
                    : 'UI-only'}
                </span>
                <span className={styles.detailMetricMeta}>{isControlsView ? 'typ zrodla' : 'bez logiki'}</span>
              </div>
            </div>
          </div>

          {isControlsView ? (
            <div className={styles.deviceUtilityRow}>
              <div className={styles.deviceToolsPrimary}>
                <span className={styles.deviceUtilityLabel}>Aktywne urzadzenie</span>
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
                          ? 'Jedno aktywne urzadzenie'
                          : 'Brak dodatkowych urzadzen'
                        : 'Staly input klawiatury'}
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
                ? 'Kliknij w box przypisania, a nastepny klawisz lub przycisk pada zostanie zapisany lokalnie. Konflikty sa rozwiazywane przez automatyczny swap.'
                : 'Ta zakladka zostala celowo uproszczona. Docelowa zawartosc wroci tu dopiero przy wdrazaniu realnych ustawien.'}
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
              <button type="button" className={styles.footerLinkButton} onClick={handleRequestBack}>
                Powrot do menu gry
              </button>
            </>
          }
          actions={
            <>
              <button type="button" className={styles.secondaryButton} onClick={handleResetBindings} disabled={!hasDefaultChanges}>
                <RotateCcw size={14} />
                Przywroc domyslne
              </button>
              <button type="button" className={styles.primaryButton} onClick={handleSaveBindings} disabled={!hasUnsavedChanges}>
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
        description="Zapisz je przed wyjsciem albo odrzuc i wroc do ostatniego zapisu."
        icon={<AlertTriangle size={18} />}
        actions={[
          {
            label: 'Zapisz i wyjdz',
            variant: 'primary',
            fullWidth: true,
            onClick: handleSaveAndExit,
          },
          {
            label: 'Odrzuc zmiany',
            variant: 'danger',
            onClick: handleDiscardAndExit,
          },
          {
            label: 'Wroc do ustawien',
            variant: 'secondary',
            onClick: () => {
              setIsExitConfirmOpenInternal(false)
              onCloseExternalExitConfirm?.()
            },
          },
        ]}
      />

      <AlertDialog
        open={isResetConfirmOpen}
        variant="danger"
        eyebrow="Reset ustawien"
        title="Przywrocic domyslne ustawienia?"
        description="To podmieni caly aktualny szkic ustawien na wartosci domyslne. Zmiana nie zapisze sie sama."
        icon={<AlertTriangle size={18} />}
        actions={[
          {
            label: 'Przywroc domyslne',
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
