'use client'

import styles from './HostSettingsModal.module.css'

type SettingsFocusTarget = 'sound' | 'animations' | 'exit' | 'continue'
type SettingsExitConfirmFocusTarget = 'stay' | 'exit'

type ToggleCardProps = {
  label: string
  description: string
  enabled: boolean
  focused?: boolean
  isFocusVisible?: boolean
  onToggle: () => void
}

type Props = {
  canStartGame?: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  isExitConfirmOpen: boolean
  focusedTarget: SettingsFocusTarget
  exitConfirmFocusedTarget: SettingsExitConfirmFocusTarget
  confirmActionLabel?: string | null
  isFocusVisible?: boolean
  onStartGame?: () => void
  onToggleSound: () => void
  onToggleAnimations: () => void
  onOpenExitConfirm: () => void
  onCancelExitConfirm: () => void
  onContinue: () => void
  onExitToMenu: () => void
}

function ToggleCard({ label, description, enabled, focused = false, isFocusVisible = true, onToggle }: ToggleCardProps) {
  return (
    <button
      type="button"
      className={focused && isFocusVisible ? `${styles.toggleCard} ${styles.controlFocused}` : styles.toggleCard}
      onClick={onToggle}
      aria-pressed={enabled}
    >
      <span className={styles.toggleCopy}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDescription}>{description}</span>
      </span>
      <span className={enabled ? styles.switchOn : styles.switchOff} aria-hidden="true">
        <span className={styles.switchThumb} />
      </span>
    </button>
  )
}

export function HostSettingsModal({
  canStartGame = false,
  soundEnabled,
  animationsEnabled,
  isExitConfirmOpen,
  focusedTarget,
  exitConfirmFocusedTarget,
  confirmActionLabel = null,
  isFocusVisible = true,
  onStartGame,
  onToggleSound,
  onToggleAnimations,
  onOpenExitConfirm,
  onCancelExitConfirm,
  onContinue,
  onExitToMenu,
}: Props) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Ustawienia gry">
      <div className={styles.card}>
        {isExitConfirmOpen ? (
          <>
            <span className={styles.eyebrow}>Potwierdzenie</span>
            <h2 className={styles.title}>Na pewno wrócić do menu?</h2>
            <p className={styles.confirmCopy}>
              Bieżąca rozgrywka zostanie przerwana. Użyj tej opcji tylko wtedy, gdy naprawdę chcesz opuścić mecz.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={
                  exitConfirmFocusedTarget === 'exit' && isFocusVisible
                    ? `${styles.dangerButton} ${styles.controlFocused}`
                    : styles.dangerButton
                }
                onClick={onExitToMenu}
              >
                Tak, wróć do menu
              </button>
              <button
                type="button"
                className={
                  exitConfirmFocusedTarget === 'stay' && isFocusVisible
                    ? `${styles.secondaryButton} ${styles.controlFocused}`
                    : styles.secondaryButton
                }
                onClick={onCancelExitConfirm}
              >
                Zostań w grze
              </button>
            </div>
          </>
        ) : (
          <>
            <span className={styles.eyebrow}>{canStartGame ? 'Start gry' : 'Pauza'}</span>
            <h2 className={styles.title}>{canStartGame ? 'Kapitanowie gotowi do startu' : 'Ustawienia gry'}</h2>

            <div className={styles.toggleGrid}>
              <ToggleCard
                label="Dźwięk"
                description="Przygotowane pod efekty audio w trakcie rozgrywki."
                enabled={soundEnabled}
                focused={focusedTarget === 'sound'}
                isFocusVisible={isFocusVisible}
                onToggle={onToggleSound}
              />
              <ToggleCard
                label="Animacje"
                description="Wyłącza ruch i skraca przyszłe animacje w interfejsie."
                enabled={animationsEnabled}
                focused={focusedTarget === 'animations'}
                isFocusVisible={isFocusVisible}
                onToggle={onToggleAnimations}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={
                  focusedTarget === 'exit' && isFocusVisible
                    ? `${styles.secondaryButton} ${styles.controlFocused}`
                    : styles.secondaryButton
                }
                onClick={onOpenExitConfirm}
              >
                Powrót do menu
                {confirmActionLabel ? <span className={styles.actionHint}>{confirmActionLabel}</span> : null}
              </button>
              {canStartGame ? (
                <button
                  type="button"
                  className={
                    focusedTarget === 'continue' && isFocusVisible
                      ? `${styles.primaryButton} ${styles.controlFocused}`
                      : styles.primaryButton
                  }
                  onClick={onStartGame}
                >
                  Rozpocznij grę
                  {confirmActionLabel ? <span className={styles.actionHint}>{confirmActionLabel}</span> : null}
                </button>
              ) : (
                <button
                  type="button"
                  className={
                    focusedTarget === 'continue' && isFocusVisible
                      ? `${styles.primaryButton} ${styles.controlFocused}`
                      : styles.primaryButton
                  }
                  onClick={onContinue}
                >
                  Kontynuuj
                  {confirmActionLabel ? <span className={styles.actionHint}>{confirmActionLabel}</span> : null}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
