'use client'

import styles from './HostSettingsModal.module.css'

type SettingsFocusTarget = 'sound' | 'animations' | 'exit' | 'continue'
type SettingsExitConfirmFocusTarget = 'stay' | 'exit'

type ToggleCardProps = {
  label: string
  description: string
  enabled: boolean
  focused?: boolean
  onToggle: () => void
}

type Props = {
  canStartGame?: boolean
  soundEnabled: boolean
  animationsEnabled: boolean
  isExitConfirmOpen: boolean
  focusedTarget: SettingsFocusTarget
  exitConfirmFocusedTarget: SettingsExitConfirmFocusTarget
  onStartGame?: () => void
  onToggleSound: () => void
  onToggleAnimations: () => void
  onOpenExitConfirm: () => void
  onCancelExitConfirm: () => void
  onContinue: () => void
  onExitToMenu: () => void
}

function ToggleCard({ label, description, enabled, focused = false, onToggle }: ToggleCardProps) {
  return (
    <button
      type="button"
      className={focused ? `${styles.toggleCard} ${styles.controlFocused}` : styles.toggleCard}
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
                  exitConfirmFocusedTarget === 'stay'
                    ? `${styles.secondaryButton} ${styles.controlFocused}`
                    : styles.secondaryButton
                }
                onClick={onCancelExitConfirm}
              >
                Zostań w grze
              </button>
              <button
                type="button"
                className={
                  exitConfirmFocusedTarget === 'exit'
                    ? `${styles.dangerButton} ${styles.controlFocused}`
                    : styles.dangerButton
                }
                onClick={onExitToMenu}
              >
                Tak, wróć do menu
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
                onToggle={onToggleSound}
              />
              <ToggleCard
                label="Animacje"
                description="Wyłącza ruch i skraca przyszłe animacje w interfejsie."
                enabled={animationsEnabled}
                focused={focusedTarget === 'animations'}
                onToggle={onToggleAnimations}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={focusedTarget === 'exit' ? `${styles.secondaryButton} ${styles.controlFocused}` : styles.secondaryButton}
                onClick={onOpenExitConfirm}
              >
                Powrót do menu
              </button>
              {canStartGame ? (
                <button
                  type="button"
                  className={focusedTarget === 'continue' ? `${styles.primaryButton} ${styles.controlFocused}` : styles.primaryButton}
                  onClick={onStartGame}
                >
                  Rozpocznij grę
                </button>
              ) : (
                <button
                  type="button"
                  className={focusedTarget === 'continue' ? `${styles.primaryButton} ${styles.controlFocused}` : styles.primaryButton}
                  onClick={onContinue}
                >
                  Kontynuuj
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
