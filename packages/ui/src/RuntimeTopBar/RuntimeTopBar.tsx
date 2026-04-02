import { Settings } from 'lucide-react'
import styles from './RuntimeTopBar.module.css'

type RuntimeTopBarProps = {
  gameName: string
  onOpenSettings?: () => void
  authLabel?: string
}

export function RuntimeTopBar({
  gameName,
  onOpenSettings,
  authLabel = 'Zaloguj się',
}: RuntimeTopBarProps) {
  return (
    <header className={styles.bar}>
      <span className={styles.gameName}>{gameName}</span>
      <div className={styles.actions}>
        {onOpenSettings ? (
          <button
            type="button"
            className={styles.settingsButton}
            onClick={onOpenSettings}
            aria-label="Ustawienia"
          >
            <Settings size={18} aria-hidden="true" />
          </button>
        ) : null}
        <button type="button" className={styles.loginButton} aria-label={authLabel}>
          <span className={styles.loginText}>{authLabel}</span>
        </button>
      </div>
    </header>
  )
}
