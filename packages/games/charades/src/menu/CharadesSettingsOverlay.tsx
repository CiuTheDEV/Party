'use client'

import { Gamepad2, Keyboard, RotateCcw, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import styles from './CharadesSettingsOverlay.module.css'
import {
  applyBindingAssignment,
  clearPersistedBindings,
  createGamepadSnapshot,
  createDefaultBindings,
  getBindingDevice,
  getCurrentGamepadInputLabel,
  getGamepadInputLabel,
  listConnectedGamepads,
  loadPersistedBindings,
  normalizeKeyboardInput,
  pickPreferredGamepad,
  persistBindings,
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

export function CharadesSettingsOverlay({ onBack }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<'general' | 'audio' | 'controls'>('controls')
  const [bindings, setBindings] = useState<Record<string, string>>(() => createDefaultBindings())
  const [activeControlsDevice, setActiveControlsDevice] = useState<'keyboard' | 'controller'>('keyboard')
  const [activeBindingId, setActiveBindingId] = useState('')
  const [listeningBindingId, setListeningBindingId] = useState<string | null>(null)
  const [isBindingsReady, setIsBindingsReady] = useState(false)
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
  const listeningBindingDevice = listeningBindingId ? getBindingDevice(listeningBindingId) : null

  useEffect(() => {
    const initialBindings = loadPersistedBindings()
    setBindings(initialBindings)
    setIsBindingsReady(true)
  }, [])

  useEffect(() => {
    if (!isBindingsReady) {
      return
    }

    persistBindings(bindings)
  }, [bindings, isBindingsReady])

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
        currentInput: getCurrentGamepadInputLabel(selectedGamepad),
      })

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isPadView, selectedGamepadIndex])

  useEffect(() => {
    if (listeningBindingDevice !== 'keyboard' || !listeningBindingId) {
      return
    }

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

      setBindings((current) => applyBindingAssignment(current, binding, normalized))
      setActiveBindingId(binding.id)
      setListeningBindingId(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeCategory.bindings, listeningBindingDevice, listeningBindingId])

  useEffect(() => {
    if (listeningBindingDevice !== 'controller' || !listeningBindingId) {
      gamepadSnapshotRef.current = null
      return
    }

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

      setBindings((current) => applyBindingAssignment(current, binding, nextInput))
      setActiveBindingId(binding.id)
      setListeningBindingId(null)
      gamepadSnapshotRef.current = null
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
      gamepadSnapshotRef.current = null
    }
  }, [activeCategory.bindings, listeningBindingDevice, listeningBindingId, selectedGamepadIndex])

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
    setListeningBindingId(null)
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

  function handleBindingListen(binding: CharadesControlsBinding) {
    setActiveBindingId(binding.id)
    gamepadSnapshotRef.current = null
    setListeningBindingId((current) => (current === binding.id ? null : binding.id))
  }

  function handleBindingClear(binding: CharadesControlsBinding) {
    setBindings((current) => ({
      ...current,
      [binding.id]: '',
    }))
    setActiveBindingId(binding.id)
    setListeningBindingId((current) => (current === binding.id ? null : current))
  }

  function handleResetBindings() {
    const defaults = createDefaultBindings()
    setBindings(defaults)
    setListeningBindingId(null)
    clearPersistedBindings()
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

    return (
      <>
        <div className={styles.listHeader}>
          <span className={styles.listEyebrow}>Mapowanie wejsc</span>
          <strong className={styles.listTitle}>Sterowanie</strong>
        </div>

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
                setListeningBindingId(null)
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
                setListeningBindingId(null)
              }}
            >
              <span className={styles.deviceSegmentIcon}>
                <Gamepad2 size={15} />
              </span>
              <span className={styles.deviceSegmentLabel}>Pad</span>
            </button>
          </div>

        </div>

        <div className={styles.listScroller}>
          {Object.entries(groupedBindings).map(([section, bindingsInSection]) => (
            <div key={section} className={styles.sectionGroup}>
              <h3 className={styles.sectionTitle}>{section}</h3>

              {bindingsInSection.map((binding) => {
                const isActive = binding.id === activeBinding?.id
                const isListening = binding.id === listeningBindingId
                const bindingValue = bindings[binding.id]
                const hasBinding = Boolean(bindingValue)
                const bindingLabel = isListening ? 'Nasluchiwanie...' : bindingValue || 'Nieprzypisany'
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
                            handleBindingListen(binding)
                          }}
                        >
                          <BindingIcon size={14} />
                          <span className={styles.bindingChipText}>{bindingLabel}</span>
                        </button>
                        {hasBinding && !isListening ? (
                          <button
                            type="button"
                            aria-label={`Odbinduj ${binding.title}`}
                            className={styles.bindingChipClear}
                            onClick={(event) => {
                              event.stopPropagation()
                              handleBindingClear(binding)
                            }}
                          >
                            <X size={13} />
                          </button>
                        ) : null}
                      </span>
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
        <div className={styles.listHeader}>
          <span className={styles.listEyebrow}>Sekcja przygotowana</span>
          <strong className={styles.listTitle}>{activeCategory.label}</strong>
        </div>

        <div className={styles.placeholderPanel}>
          <div className={styles.placeholderCard}>
            <div className={styles.placeholderIcon}>
              <AccentIcon size={22} />
            </div>
            <h3 className={styles.placeholderTitle}>{activeCategory.label}</h3>
            <p className={styles.placeholderText}>{activeCategory.description}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <section className={styles.panel} aria-labelledby="charades-settings-title">
      <div className={styles.topbar}>
        <div className={styles.titleGroup}>
          <span className={styles.eyebrow}>
            <SlidersHorizontal size={14} />
            Panel systemowy
          </span>
          <div className={styles.titleRow}>
            <h2 id="charades-settings-title" className={styles.title}>
              Ustawienia
            </h2>
            <div className={styles.statusPill}>Lokalny zapis / bez runtime</div>
          </div>
          <p className={styles.subtitle}>
            Ekran preferencji produktu i interfejsu. Nadal nie dotyka zasad meczu ani ustawien trybu gry.
          </p>
        </div>
      </div>

      <div className={styles.categoryTabs} role="tablist" aria-label="Kategorie ustawien">
        {charadesSettingsCategories.map((category) => {
          const Icon = category.icon
          const isActive = category.id === activeCategory.id

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={isActive ? `${styles.categoryTab} ${styles.categoryTabActive}` : styles.categoryTab}
              onClick={() => handleCategoryChange(category)}
            >
              <Icon size={18} />
              <span className={styles.categoryTabLabel}>{category.label}</span>
            </button>
          )
        })}
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.listPanel}>{isControlsView ? renderControlsList() : renderPlaceholderList()}</div>

        <aside className={styles.detailPanel} aria-live="polite">
          <div className={styles.detailHero}>
            <div className={styles.detailIcon}>
              <AccentIcon size={22} />
            </div>
            <div className={styles.detailHeroBody}>
              <span className={styles.detailLabel}>{activeCategory.label}</span>
              <h3 className={styles.detailTitle}>{isControlsView ? activeBinding?.title : activeCategory.label}</h3>
            </div>
          </div>

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
                        ? bindings[activeBinding.id] || 'Nieprzypisany'
                        : ''
                    : 'W przygotowaniu'}
                </span>
                <span className={styles.detailMetricMeta}>{isControlsView ? 'wejscie aktywne' : 'placeholder'}</span>
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
        </aside>
      </div>

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

      <div className={styles.footer}>
        <span className={styles.footerNote}>{isControlsView ? 'Sterowanie / lokalny rebinding' : `${activeCategory.label} / placeholder`}</span>

        <div className={styles.footerActions}>
          <button type="button" className={styles.secondaryButton} onClick={handleResetBindings}>
            <RotateCcw size={14} />
            Przywroc domyslne
          </button>
          <button type="button" className={styles.primaryButton} onClick={onBack}>
            Wroc do menu gry
          </button>
        </div>
      </div>
    </section>
  )
}
