import { useState } from 'react'
import styles from './PlaySettingsModal.module.css'

type Props = {
  soundEnabled: boolean
  animationsEnabled: boolean
  onToggleSound: () => void
  onToggleAnimations: () => void
  onContinue: () => void
  onExitToMenu: () => void
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
  onToggleSound,
  onToggleAnimations,
  onContinue,
  onExitToMenu,
}: Props) {
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Ustawienia gry">
      <div className={styles.card}>
        {isExitConfirmOpen ? (
          <>
            <span className={styles.eyebrow}>Potwierdzenie</span>
            <h2 className={styles.title}>Na pewno wrócić do menu?</h2>
            <p className={styles.confirmCopy}>
              Bieżąca rozgrywka zostanie przerwana. Użyj tej opcji tylko wtedy, gdy naprawdę chcesz
              opuścić mecz.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setIsExitConfirmOpen(false)}
              >
                Zostań w grze
              </button>
              <button type="button" className={styles.dangerButton} onClick={onExitToMenu}>
                Tak, wróć do menu
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
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setIsExitConfirmOpen(true)}
              >
                Powrót do menu
              </button>
              <button type="button" className={styles.primaryButton} onClick={onContinue}>
                Kontynuuj
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
