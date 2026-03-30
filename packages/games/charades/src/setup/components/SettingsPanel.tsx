import type { CharadesGameSettings } from '../state'
import styles from './SettingsPanel.module.css'

type Props = {
  settings: CharadesGameSettings
  onOpen: () => void
}

export function SettingsPanel({ settings, onOpen }: Props) {
  return (
    <div className={styles.content}>
      <button type="button" className={styles.settingsBtn} onClick={onOpen}>
        {`\u2699`} Ustawienia trybu
      </button>

      <div className={styles.settingsTiles}>
        <div className={styles.settingsTile}>
          <span className={styles.settingsTileLabel}>Rundy</span>
          <span className={styles.settingsTileValue}>{settings.rounds}</span>
        </div>
        <div className={styles.settingsTile}>
          <span className={styles.settingsTileLabel}>Czas na hasło</span>
          <span className={styles.settingsTileValue}>{settings.timerSeconds}s</span>
        </div>
        <div className={styles.settingsTile}>
          <span className={styles.settingsTileLabel}>Zmiana hasła</span>
          <span className={styles.settingsTileValue}>{settings.wordChange.enabled ? 'Włączona' : 'Wyłączona'}</span>
        </div>
      </div>
    </div>
  )
}
