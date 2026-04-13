'use client'

import styles from './SettingsPanel.module.css'

type Props = {
  rounds: number
  selectedCategoriesCount: number
  totalCategories: number
  selectedCategoryNames: string[]
  onOpen: () => void
}

export function SettingsPanel({
  rounds,
  selectedCategoriesCount,
  totalCategories,
  selectedCategoryNames,
  onOpen,
}: Props) {
  const categorySummary = `${selectedCategoriesCount}/${totalCategories}`
  const categoryPreview = selectedCategoryNames.length > 0 ? selectedCategoryNames.join(', ') : 'Brak wybranych kategorii'

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
          <span className={styles.settingsTileLabel}>Kategorie</span>
          <span className={styles.settingsTileValue}>{categorySummary}</span>
          <span className={styles.settingsTileHint}>{categoryPreview}</span>
        </div>
      </div>
    </div>
  )
}
