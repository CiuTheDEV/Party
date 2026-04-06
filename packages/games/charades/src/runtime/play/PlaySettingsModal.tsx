import { ActionHint } from './ActionHint'
import styles from './PlaySettingsModal.module.css'

type Props = {
  soundEnabled: boolean
  animationsEnabled: boolean
  isExitConfirmOpen: boolean
  onToggleSound: () => void
  onToggleAnimations: () => void
  onOpenExitConfirm: () => void
  onCancelExitConfirm: () => void
  onContinue: () => void
  onExitToMenu: () => void
  actionHints?: {
    primary?: string | null
    secondary?: string | null
  }
}

type ToggleCardProps = {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function ToggleCard({ label, description, enabled, onToggle }: ToggleCardProps) {
  return (
    <button type="button" className={styles.toggleCard} onClick={onToggle} aria-pressed={enabled}>
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
              <button type="button" className={styles.secondaryButton} onClick={onCancelExitConfirm}>
                <span>Zostań w grze</span>
                <ActionHint label={actionHints?.secondary} muted />
              </button>
              <button type="button" className={styles.dangerButton} onClick={onExitToMenu}>
                <span>Tak, wróć do menu</span>
                <ActionHint label={actionHints?.primary} />
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
                onToggle={onToggleSound}
              />
              <ToggleCard
                label="Animacje"
                description="Wyłącza ruch i skraca przyszłe animacje w interfejsie."
                enabled={animationsEnabled}
                onToggle={onToggleAnimations}
              />
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={onOpenExitConfirm}>
                <span>Powrót do menu</span>
                <ActionHint label={actionHints?.secondary} muted />
              </button>
              <button type="button" className={styles.primaryButton} onClick={onContinue}>
                <span>Kontynuuj</span>
                <ActionHint label={actionHints?.primary} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
