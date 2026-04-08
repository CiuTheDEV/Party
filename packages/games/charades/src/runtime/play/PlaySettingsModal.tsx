import { ActionHint } from './ActionHint'
import styles from './PlaySettingsModal.module.css'

type SettingsFocusTarget = 'sound' | 'animations' | 'exit' | 'continue'
type SettingsExitConfirmFocusTarget = 'stay' | 'exit'

type Props = {
  soundEnabled: boolean
  animationsEnabled: boolean
  isExitConfirmOpen: boolean
  focusedTarget: SettingsFocusTarget
  exitConfirmFocusedTarget: SettingsExitConfirmFocusTarget
  isFocusVisible?: boolean
  onToggleSound: () => void
  onToggleAnimations: () => void
  onOpenExitConfirm: () => void
  onCancelExitConfirm: () => void
  onContinue: () => void
  onExitToMenu: () => void
  actionHints?: {
    confirm?: string | null
  }
}

type ToggleCardProps = {
  label: string
  description: string
  enabled: boolean
  focused?: boolean
  onToggle: () => void
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

export function PlaySettingsModal({
  soundEnabled,
  animationsEnabled,
  isExitConfirmOpen,
  focusedTarget,
  exitConfirmFocusedTarget,
  isFocusVisible = false,
  onToggleSound,
  onToggleAnimations,
  onOpenExitConfirm,
  onCancelExitConfirm,
  onContinue,
  onExitToMenu,
  actionHints,
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
                  isFocusVisible && exitConfirmFocusedTarget === 'stay'
                    ? `${styles.secondaryButton} ${styles.controlFocused}`
                    : styles.secondaryButton
                }
                onClick={onCancelExitConfirm}
              >
                <span>Zostań w grze</span>
                <ActionHint
                  label={isFocusVisible && exitConfirmFocusedTarget === 'stay' ? actionHints?.confirm : null}
                  muted
                />
              </button>
              <button
                type="button"
                className={
                  isFocusVisible && exitConfirmFocusedTarget === 'exit'
                    ? `${styles.dangerButton} ${styles.controlFocused}`
                    : styles.dangerButton
                }
                onClick={onExitToMenu}
              >
                <span>Tak, wróć do menu</span>
                <ActionHint label={isFocusVisible && exitConfirmFocusedTarget === 'exit' ? actionHints?.confirm : null} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className={styles.eyebrow}>Pauza</span>
            <h2 className={styles.title}>Ustawienia gry</h2>

            <div className={styles.toggleGrid}>
              <ToggleCard
                label="Dźwięk"
                description="Przygotowane pod efekty audio w trakcie rozgrywki."
                enabled={soundEnabled}
                focused={isFocusVisible && focusedTarget === 'sound'}
                onToggle={onToggleSound}
              />
              <ToggleCard
                label="Animacje"
                description="Wyłącza ruch i skraca przyszłe animacje w interfejsie."
                enabled={animationsEnabled}
                focused={isFocusVisible && focusedTarget === 'animations'}
                onToggle={onToggleAnimations}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={
                  isFocusVisible && focusedTarget === 'exit'
                    ? `${styles.secondaryButton} ${styles.controlFocused}`
                    : styles.secondaryButton
                }
                onClick={onOpenExitConfirm}
              >
                <span>Powrót do menu</span>
                <ActionHint label={isFocusVisible && focusedTarget === 'exit' ? actionHints?.confirm : null} muted />
              </button>
              <button
                type="button"
                className={
                  isFocusVisible && focusedTarget === 'continue'
                    ? `${styles.primaryButton} ${styles.controlFocused}`
                    : styles.primaryButton
                }
                onClick={onContinue}
              >
                <span>Kontynuuj</span>
                <ActionHint label={isFocusVisible && focusedTarget === 'continue' ? actionHints?.confirm : null} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
