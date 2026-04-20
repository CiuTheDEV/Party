'use client'

import { ControlHintBadge } from '../ControlHintBadge'
import styles from './RuntimeSettingsModal.module.css'

export type RuntimeSettingsFocusId = string

export type RuntimeSettingsToggle = {
  id: RuntimeSettingsFocusId
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

export type RuntimeSettingsActionKind = 'primary' | 'secondary' | 'danger'

export type RuntimeSettingsAction = {
  id: RuntimeSettingsFocusId
  label: string
  kind: RuntimeSettingsActionKind
  hintLabel?: string | null
  hintMuted?: boolean
  onPress: () => void
}

export type RuntimeSettingsConfirmView = {
  eyebrow: string
  title: string
  copy: string
  actions: RuntimeSettingsAction[]
  focusedActionId?: RuntimeSettingsFocusId | null
}

export type RuntimeSettingsModalProps = {
  eyebrow: string
  title: string
  copy?: string
  toggles?: RuntimeSettingsToggle[]
  actions: RuntimeSettingsAction[]
  focusedToggleId?: RuntimeSettingsFocusId | null
  focusedActionId?: RuntimeSettingsFocusId | null
  isFocusVisible?: boolean
  confirmView?: RuntimeSettingsConfirmView | null
  ariaLabel?: string
}

function ToggleCard({
  toggle,
  isFocused,
}: {
  toggle: RuntimeSettingsToggle
  isFocused: boolean
}) {
  return (
    <button
      type="button"
      className={isFocused ? `${styles.toggleCard} ${styles.controlFocused}` : styles.toggleCard}
      onClick={toggle.onToggle}
      aria-pressed={toggle.enabled}
    >
      <span className={styles.toggleCopy}>
        <span className={styles.toggleLabel}>{toggle.label}</span>
        <span className={styles.toggleDescription}>{toggle.description}</span>
      </span>
      <span className={toggle.enabled ? styles.switchOn : styles.switchOff} aria-hidden="true">
        <span className={styles.switchThumb} />
      </span>
    </button>
  )
}

function ActionButton({
  action,
  isFocused,
  isFocusVisible,
}: {
  action: RuntimeSettingsAction
  isFocused: boolean
  isFocusVisible: boolean
}) {
  const className = [
    styles.actionButton,
    action.kind === 'primary'
      ? styles.primaryButton
      : action.kind === 'danger'
        ? styles.dangerButton
        : styles.secondaryButton,
    isFocused && isFocusVisible ? styles.controlFocused : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={className} onClick={action.onPress}>
      <span>{action.label}</span>
      <ControlHintBadge
        label={action.hintLabel}
        muted={action.hintMuted}
        visible={isFocused && isFocusVisible}
      />
    </button>
  )
}

export function RuntimeSettingsModal({
  eyebrow,
  title,
  copy,
  toggles = [],
  actions,
  focusedToggleId = null,
  focusedActionId = null,
  isFocusVisible = false,
  confirmView = null,
  ariaLabel = 'Ustawienia gry',
}: RuntimeSettingsModalProps) {
  const view = confirmView ?? null
  const currentEyebrow = view ? view.eyebrow : eyebrow
  const currentTitle = view ? view.title : title
  const currentCopy = view ? view.copy : copy
  const currentActions = view ? view.actions : actions
  const currentFocusedActionId = view ? view.focusedActionId ?? null : focusedActionId

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>{currentEyebrow}</span>
        <h2 className={styles.title}>{currentTitle}</h2>

        {currentCopy ? <p className={styles.copy}>{currentCopy}</p> : null}

        {!view && toggles.length > 0 ? (
          <div className={styles.toggleGrid}>
            {toggles.map((toggle) => (
              <ToggleCard
                key={toggle.id}
                toggle={toggle}
                isFocused={isFocusVisible && focusedToggleId === toggle.id}
              />
            ))}
          </div>
        ) : null}

        <div className={styles.actions}>
          {currentActions.map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              isFocused={isFocusVisible && currentFocusedActionId === action.id}
              isFocusVisible={isFocusVisible}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
