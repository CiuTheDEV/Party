'use client'

import styles from './SettingsPanel.module.css'

type Props = {
  rounds: number
  assassinCount: number
  extraAssassinsEnabled: boolean
  onOpen: () => void
}

export function SettingsPanel({ rounds, assassinCount, extraAssassinsEnabled, onOpen }: Props) {
  return (
    <div className={styles.content}>
      <button type="button" className={styles.settingsBtn} onClick={onOpen}>
        {'\u2699'} Ustawienia trybu
      </button>

      <div className={styles.settingsTiles}>
        <div className={styles.settingsTile}>
          <span className={styles.settingsTileLabel}>Rundy</span>
          <span className={styles.settingsTileValue}>{rounds}</span>
        </div>
        <div className={styles.settingsTile}>
          <span className={styles.settingsTileLabel}>Zabójcy</span>
          <span className={styles.settingsTileValue}>
            {assassinCount}
            {extraAssassinsEnabled ? '' : ' domyślnie'}
          </span>
        </div>
      </div>
    </div>
  )
}
