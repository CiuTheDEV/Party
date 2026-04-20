'use client'

import { AlertTriangle, Gamepad2, Keyboard, RotateCcw, Save, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import {
  AlertDialog,
} from '../AlertDialog/AlertDialog'
import { SettingsDetailHero } from '../SettingsDetailHero/SettingsDetailHero'
import { SettingsListHeader } from '../SettingsListHeader/SettingsListHeader'
import { SettingsPanelFooter } from '../SettingsPanelFooter/SettingsPanelFooter'
import { SettingsPanelShell } from '../SettingsPanelShell/SettingsPanelShell'
import { SettingsPanelTabs } from '../SettingsPanelTabs/SettingsPanelTabs'
import { SettingsPlaceholderCard } from '../SettingsPlaceholderCard/SettingsPlaceholderCard'
import { SettingsStatusPill } from '../SettingsStatusPill/SettingsStatusPill'
import { useControlsSettingsOverlay } from './useControlsSettingsOverlay'
import type {
  ControlsSettingsOverlayBinding,
  ControlsSettingsOverlayCategory,
  ControlsSettingsOverlayProps,
} from './types'

const slotOrder = ['primary', 'secondary'] as const

export function ControlsSettingsOverlay<
  TMenuView extends string,
  TCategory extends ControlsSettingsOverlayCategory,
  TBinding extends ControlsSettingsOverlayBinding,
  TTargetId extends string = string,
  TScreenId extends string = string,
  TZoneId extends string = string,
>(props: ControlsSettingsOverlayProps<TMenuView, TCategory, TBinding, TTargetId, TScreenId, TZoneId>) {
  const state = useControlsSettingsOverlay<TMenuView, TCategory, TBinding, TTargetId, TScreenId, TZoneId>(props)
  const activeCategory = state.activeCategory
  const AccentIcon = activeCategory?.icon ?? Sparkles
  const isControlsView = state.isControlsView
  const isPadView = state.isPadView
  const activeBinding = state.activeBinding

  function joinClassNames(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ')
  }

  function renderControlsList() {
    return (
      <>
        <SettingsListHeader eyebrow="Mapowanie wejsc" title="Sterowanie" />

        <div className={props.styles.deviceSegmentRow}>
          <div className={props.styles.deviceSegment} role="tablist" aria-label="Urządzenie sterowania">
            <button
              type="button"
              role="tab"
              aria-selected={state.activeControlsDevice === 'keyboard'}
              className={joinClassNames(
                props.styles.deviceSegmentButton,
                state.activeControlsDevice === 'keyboard' ? props.styles.deviceSegmentButtonActive : '',
                state.isFocusVisible && state.focusedArea === 'device' && state.activeControlsDevice === 'keyboard'
                  ? props.styles.controlFocused
                  : '',
              )}
              onClick={() => state.setControlsDevice('keyboard')}
            >
              <span className={props.styles.deviceSegmentIcon}>
                <Keyboard size={15} />
              </span>
              <span className={props.styles.deviceSegmentLabel}>Klawiatura</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={state.activeControlsDevice === 'controller'}
              className={joinClassNames(
                props.styles.deviceSegmentButton,
                state.activeControlsDevice === 'controller' ? props.styles.deviceSegmentButtonActive : '',
                state.isFocusVisible && state.focusedArea === 'device' && state.activeControlsDevice === 'controller'
                  ? props.styles.controlFocused
                  : '',
              )}
              onClick={() => state.setControlsDevice('controller')}
            >
              <span className={props.styles.deviceSegmentIcon}>
                <Gamepad2 size={15} />
              </span>
              <span className={props.styles.deviceSegmentLabel}>Pad</span>
            </button>
          </div>
        </div>

        <div className={props.styles.controlsColumnsHeader} aria-hidden="true">
          <span className={props.styles.controlsColumnsSection}>{state.currentSectionLabel}</span>
          <span className={props.styles.controlsColumnLabel}>Glowny</span>
          <span className={props.styles.controlsColumnLabel}>Alternatywny</span>
        </div>

        <div ref={state.bindingsListRef} className={props.styles.listScroller}>
          {Object.entries(state.groupedBindings).map(([section, bindingsInSection]) => (
            <div key={section} className={props.styles.sectionGroup}>
              {bindingsInSection.map((binding) => {
                const isActive = binding.id === activeBinding?.id
                const BindingIcon = binding.device === 'keyboard' ? Keyboard : Gamepad2

                return (
                  <div
                    key={binding.id}
                    ref={(element) => {
                      state.bindingRowRefs.current[binding.id] = element
                    }}
                    role="button"
                    tabIndex={0}
                    className={joinClassNames(
                      props.styles.optionRow,
                      isActive ? props.styles.optionRowActive : '',
                      state.isFocusVisible && state.focusedArea === 'bindings' && isActive ? props.styles.controlFocused : '',
                    )}
                    onClick={() => state.handleBindingSelect(binding)}
                    onKeyDown={(event) => state.handleBindingRowKeyDown(event, binding.id)}
                  >
                    <span className={props.styles.optionInfo}>
                      <span className={props.styles.optionTitle}>{binding.title}</span>
                      <span className={props.styles.optionMeta}>{binding.device === 'keyboard' ? 'Klawiatura' : 'Kontroler'}</span>
                    </span>
                    <span className={props.styles.optionControl}>
                      {slotOrder.map((slot) => {
                        const chipKey = props.bindingApi.getBindingSlotKey(binding.id, slot)
                        const isListening = chipKey === state.listeningBindingKey
                        const bindingValue = props.bindingApi.getBindingValue(state.bindings, binding.id, slot)
                        const hasBinding = Boolean(bindingValue)
                        const displayedBindingValue =
                          binding.device === 'controller'
                            ? props.bindingApi.formatControllerLabelForProfile(bindingValue, state.activeControllerProfile)
                            : bindingValue
                        const bindingLabel = isListening ? 'Nasluchiwanie...' : displayedBindingValue || 'Nieprzypisany'

                        return (
                          <span key={chipKey} className={props.styles.bindingChipStack}>
                            <span className={props.styles.bindingChipShell}>
                              <button
                                type="button"
                                className={joinClassNames(
                                  props.styles.bindingChip,
                                  isListening ? props.styles.bindingChipListening : '',
                                  hasBinding && !isListening ? props.styles.bindingChipClearable : '',
                                  !hasBinding && !isListening ? props.styles.bindingChipEmpty : '',
                                )}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  state.handleBindingListen(binding, slot)
                                }}
                              >
                                <BindingIcon size={14} />
                                <span className={props.styles.bindingChipText}>{bindingLabel}</span>
                              </button>
                              {hasBinding && !isListening ? (
                                <button
                                  type="button"
                                  aria-label={`Odbinduj ${binding.title} ${slot === 'primary' ? 'główny' : 'alternatywny'}`}
                                  className={props.styles.bindingChipClear}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    state.handleBindingClear(binding, slot)
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
        <SettingsListHeader eyebrow="Sekcja przygotowana" title={activeCategory?.label ?? 'Ustawienia'} />
        <SettingsPlaceholderCard
          icon={AccentIcon}
          title={activeCategory?.label ?? 'Ustawienia'}
          description={activeCategory?.description ?? ''}
        />
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
            label={state.hasUnsavedChanges ? 'Niezapisane zmiany' : 'Wszystkie zmiany zapisane'}
            variant={state.hasUnsavedChanges ? 'warning' : 'default'}
          />
        }
        tabs={
          <SettingsPanelTabs
            items={props.categories.map((category) => ({
              id: category.id,
              label: category.label,
              icon: category.icon,
            }))}
            activeTab={activeCategory?.id ?? ''}
            focusedTab={state.focusedTab}
            isFocusVisible={state.isFocusVisible}
            onPrevious={() => {
              state.setTabsInputDevice('mouse')
              state.stepCategory(-1)
            }}
            onNext={() => {
              state.setTabsInputDevice('mouse')
              state.stepCategory(1)
            }}
            previousShortcutLabel={state.tabsShortcutHints.previous}
            nextShortcutLabel={state.tabsShortcutHints.next}
            onChange={(tabId) => {
              state.setTabsInputDevice('mouse')
              const nextCategory = props.categories.find((category) => category.id === tabId)
              if (nextCategory) {
                state.handleCategoryChange(nextCategory)
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
              label={activeCategory?.label ?? 'Ustawienia'}
              title={isControlsView ? activeBinding?.title ?? activeCategory?.label ?? 'Ustawienia' : activeCategory?.label ?? 'Ustawienia'}
            />

            <p className={props.styles.detailCopy}>
              {isControlsView ? activeBinding?.description : activeCategory?.description}
            </p>

            <div className={props.styles.detailSummaryPanel}>
              <div className={props.styles.detailSummaryRow}>
                <span className={props.styles.detailMetricLabel}>{isControlsView ? 'Binding' : 'Status'}</span>
                <div className={props.styles.detailMetricValue}>
                  <span>
                    {isControlsView
                      ? state.listeningBindingId === activeBinding?.id
                        ? 'Nasluchiwanie...'
                        : activeBinding
                          ? `${
                              activeBinding.device === 'controller'
                                ? props.bindingApi.formatControllerLabelForProfile(
                                    props.bindingApi.getBindingValue(state.bindings, activeBinding.id, 'primary'),
                                    state.activeControllerProfile,
                                  )
                                : props.bindingApi.getBindingValue(state.bindings, activeBinding.id, 'primary')
                            } / ${
                              (activeBinding.device === 'controller'
                                ? props.bindingApi.formatControllerLabelForProfile(
                                    props.bindingApi.getBindingValue(state.bindings, activeBinding.id, 'secondary'),
                                    state.activeControllerProfile,
                                  )
                                : props.bindingApi.getBindingValue(state.bindings, activeBinding.id, 'secondary')) || 'Brak'
                            }`
                          : ''
                      : 'W przygotowaniu'}
                  </span>
                  <span className={props.styles.detailMetricMeta}>{isControlsView ? 'główny / alternatywny' : 'placeholder'}</span>
                </div>
              </div>

              <div className={props.styles.detailSummaryRow}>
                <span className={props.styles.detailMetricLabel}>{isControlsView ? 'Urządzenie' : 'Zakres'}</span>
                <div className={props.styles.detailMetricValue}>
                  <span>
                    {isControlsView
                      ? activeBinding?.device === 'keyboard'
                        ? 'Klawiatura'
                        : 'Kontroler'
                      : 'UI-only'}
                  </span>
                  <span className={props.styles.detailMetricMeta}>{isControlsView ? 'typ źródła' : 'bez logiki'}</span>
                </div>
              </div>
            </div>

            {isControlsView ? (
              <div className={props.styles.deviceUtilityRow}>
                <div className={props.styles.deviceToolsPrimary}>
                  <span className={props.styles.deviceUtilityLabel}>Aktywne urządzenie</span>
                  <span
                    className={props.styles.deviceSelectorCurrent}
                    title={isPadView ? state.gamepadDebug.id || 'Brak aktywnego kontrolera' : 'Klawiatura systemowa'}
                  >
                    {isPadView ? state.gamepadDebug.id || 'Brak aktywnego kontrolera' : 'Klawiatura systemowa'}
                  </span>
                  <div className={props.styles.deviceSelectorSlot}>
                    {isPadView && state.connectedGamepads.length > 1 ? (
                      <select
                        className={props.styles.deviceSelector}
                        value={state.selectedGamepadIndex ?? ''}
                        onChange={(event) => {
                          const nextValue = event.target.value
                          state.setSelectedGamepadIndex(nextValue === '' ? null : Number(nextValue))
                        }}
                      >
                        {state.connectedGamepads.map((gamepad) => (
                          <option key={gamepad.index} value={gamepad.index}>
                            {gamepad.id}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={props.styles.deviceSelectorHint}>
                        {isPadView
                          ? state.connectedGamepads.length === 1
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
                      ? state.isDebugOpen
                        ? `${props.styles.devButton} ${props.styles.devButtonActive}`
                        : props.styles.devButton
                      : `${props.styles.devButton} ${props.styles.devButtonHidden}`
                  }
                  onClick={() => {
                    if (!isPadView) {
                      return
                    }
                    state.setIsDebugOpen((current) => !current)
                  }}
                  aria-hidden={!isPadView}
                  tabIndex={isPadView ? 0 : -1}
                >
                  DEV
                </button>
              </div>
            ) : null}

            <div className={props.styles.detailInsightCompact}>
              <span className={props.styles.detailInsightLabel}>
                <Sparkles size={14} />
                {isControlsView ? 'Lokalny rebinding' : 'Stan sekcji'}
              </span>
              <p className={props.styles.detailHint}>
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
                <span className={props.styles.footerNote}>
                  {state.hasUnsavedChanges
                    ? 'Masz niezapisane zmiany w ustawieniach.'
                    : isControlsView
                      ? 'Sterowanie jest zapisane lokalnie na tym urzadzeniu.'
                      : `${activeCategory?.label ?? 'Ustawienia'} / placeholder`}
                </span>
              </>
            }
            actions={
              <>
                <button
                  type="button"
                  className={joinClassNames(
                    props.styles.secondaryButton,
                    state.isFocusVisible && state.focusedArea === 'footer' && state.focusedFooterAction === 'reset'
                      ? props.styles.controlFocused
                      : '',
                  )}
                  onClick={() => {
                    state.setFocusedArea('footer')
                    state.setFocusedFooterAction('reset')
                    state.handleResetBindings()
                  }}
                  disabled={!state.hasDefaultChanges}
                >
                  <RotateCcw size={14} />
                  Przywróć domyślne
                </button>
                <button
                  type="button"
                  className={joinClassNames(
                    props.styles.primaryButton,
                    state.isFocusVisible && state.focusedArea === 'footer' && state.focusedFooterAction === 'save'
                      ? props.styles.controlFocused
                      : '',
                  )}
                  onClick={() => {
                    state.setFocusedArea('footer')
                    state.setFocusedFooterAction('save')
                    state.handleSaveBindings()
                  }}
                  disabled={!state.hasUnsavedChanges}
                >
                  <Save size={14} />
                  Zapisz
                </button>
              </>
            }
          />
        }
      />

      {isPadView && state.isDebugOpen ? (
        <div
          className={props.styles.devPopup}
          style={{ left: `${state.debugPopupPosition.x}px`, top: `${state.debugPopupPosition.y}px` }}
        >
          <div className={props.styles.devPopupHeader} onPointerDown={state.handleDebugPointerDown}>
            <span className={props.styles.devPopupTitle}>DEV / Kontroler</span>
            <button type="button" className={props.styles.devPopupClose} onClick={() => state.setIsDebugOpen(false)}>
              <X size={14} />
            </button>
          </div>
          <div className={props.styles.devPopupBody}>
            <span className={props.styles.debugLine}>Stan: {state.gamepadDebug.connected ? 'Wykryty' : 'Brak kontrolera'}</span>
            <span className={props.styles.debugLine}>Index: {state.gamepadDebug.index ?? '---'}</span>
            <span className={props.styles.debugLine}>Input: {state.gamepadDebug.currentInput ?? 'Brak aktywnego wejscia'}</span>
            <span className={props.styles.debugLine}>Przyciski: {state.gamepadDebug.buttons}</span>
            <span className={props.styles.debugLine}>Osie: {state.gamepadDebug.axes}</span>
            <span className={props.styles.debugLine}>ID: {state.gamepadDebug.id || '---'}</span>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={state.isExitConfirmOpen}
        variant="danger"
        eyebrow="Alert zapisu"
        title="Masz niezapisane zmiany"
        description="Zapisz je przed wyjściem albo odrzuć i wróć do ostatniego zapisu."
        icon={<AlertTriangle size={18} />}
        focusedActionIndex={state.isDialogFocusVisible ? state.exitDialogFocusedActionIndex : null}
        isFocusVisible={state.isDialogFocusVisible}
        actions={[
          {
            label: 'Zapisz i wyjdź',
            variant: 'primary',
            fullWidth: true,
            onClick: state.handleSaveAndExit,
          },
          {
            label: 'Odrzuć zmiany',
            variant: 'danger',
            onClick: state.handleDiscardAndExit,
          },
          {
            label: 'Wróć do ustawień',
            variant: 'secondary',
            onClick: () => {
              state.setFocusedArea('tabs')
              state.handleExitDialogAction(2)
            },
          },
        ]}
      />

      <AlertDialog
        open={state.isResetConfirmOpen}
        variant="danger"
        eyebrow="Reset ustawień"
        title="Przywrócić domyślne ustawienia?"
        description="To podmieni cały aktualny szkic ustawień na wartości domyślne. Zmiana nie zapisze się sama."
        icon={<AlertTriangle size={18} />}
        focusedActionIndex={state.isDialogFocusVisible ? state.resetDialogFocusedActionIndex : null}
        isFocusVisible={state.isDialogFocusVisible}
        actions={[
          {
            label: 'Przywróć domyślne',
            variant: 'danger',
            fullWidth: true,
            onClick: state.handleConfirmResetBindings,
          },
          {
            label: 'Anuluj',
            variant: 'secondary',
            onClick: () => state.handleResetDialogAction(1),
          },
        ]}
      />
    </>
  )
}
