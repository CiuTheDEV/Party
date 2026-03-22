'use client'

import type { GameSettings } from '../../../hooks/charades/useGameState'
import styles from './SettingsModal.module.css'

type Props = {
  settings: GameSettings
  onChange: (s: GameSettings) => void
  onClose: () => void
}

export function SettingsModal({ settings, onChange, onClose }: Props) {
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Ustawienia trybu</h2>
          <button className={styles.close} onClick={onClose} aria-label="Zamknij">✕</button>
        </div>

        <label className={styles.field}>
          <span>Liczba rund: <strong>{settings.rounds}</strong></span>
          <input
            type="range"
            min={1}
            max={10}
            value={settings.rounds}
            onChange={(e) => onChange({ ...settings, rounds: Number(e.target.value) })}
          />
        </label>

        <label className={styles.field}>
          <span>Czas na hasło: <strong>{settings.timerSeconds}s</strong></span>
          <input
            type="range"
            min={30}
            max={120}
            step={10}
            value={settings.timerSeconds}
            onChange={(e) => onChange({ ...settings, timerSeconds: Number(e.target.value) })}
          />
        </label>
      </div>
    </div>
  )
}
