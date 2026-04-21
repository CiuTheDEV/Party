import type { CharadesGameSettings } from '../state'
import styles from './SettingsPanel.module.css'

type Props = {
  settings: CharadesGameSettings
  onOpen: () => void
}

export function SettingsPanel({ settings, onOpen }: Props) {
  const gameplaySummary = `${settings.rounds} rund${settings.rounds === 1 ? 'a' : settings.rounds < 5 ? 'y' : ''} · ${settings.timerSeconds}s`
  const extrasSummary =
    settings.wordChange.enabled && settings.hints.enabled
      ? 'Zmiana hasła i podpowiedzi'
      : settings.wordChange.enabled
        ? 'Zmiana hasła'
        : settings.hints.enabled
          ? 'Podpowiedzi'
          : 'Bez dodatków'

  return (
    <div className={styles.content}>
      <button type="button" className={styles.settingsBtn} onClick={onOpen}>
        {`\u2699`} Ustawienia trybu
      </button>

      <div className={styles.settingsTiles}>
        <div className={styles.settingsTile}>
          <span className={styles.settingsTileLabel}>Tempo rozgrywki</span>
          <span className={styles.settingsTileValue}>{gameplaySummary}</span>
        </div>
        <div className={styles.settingsTile}>
          <span className={styles.settingsTileLabel}>Opcje dodatkowe</span>
          <span className={styles.settingsTileValue}>{extrasSummary}</span>
        </div>
      </div>
    </div>
  )
}
