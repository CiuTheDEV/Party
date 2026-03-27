import { Settings } from 'lucide-react'
import styles from './PlayTopBar.module.css'

type PlayTopBarProps = {
  onOpenSettings: () => void
}

export function PlayTopBar({ onOpenSettings }: PlayTopBarProps) {
  return (
    <header className={styles.bar}>
      <span className={styles.gameName}>Kalambury</span>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.settingsButton}
          onClick={onOpenSettings}
          aria-label="Ustawienia"
        >
          <Settings size={18} aria-hidden="true" />
        </button>
        <button type="button" className={styles.loginButton} aria-label="Zaloguj się">
          <span className={styles.loginText}>Zaloguj się</span>
        </button>
      </div>
    </header>
  )
}
