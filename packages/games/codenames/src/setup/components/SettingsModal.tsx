'use client'

import { DiscreteSlider, GameSettingsCard, GameSettingsModalShell, GameSettingsSection } from '@party/ui'
import { GameSettingsTabs, type GameSettingsTabItem } from '@party/ui'
import { BarChart3 } from 'lucide-react'
import { useState } from 'react'
import styles from './SettingsModal.module.css'

type SettingsTabId = 'rounds'

type Props = {
  rounds: number
  onChange: (rounds: number) => void
  onClose: () => void
}

const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const SETTINGS_TABS: GameSettingsTabItem<SettingsTabId>[] = [
  { id: 'rounds', label: 'Rozgrywka', description: 'Tempo i liczba rund', icon: BarChart3 },
]

export function SettingsModal({ rounds, onChange, onClose }: Props) {
  const [localRounds, setLocalRounds] = useState(rounds)
  const [activeTab, setActiveTab] = useState<SettingsTabId>('rounds')
  const hasChanges = localRounds !== rounds

  function handleApply() {
    onChange(localRounds)
    onClose()
  }

  return (
    <GameSettingsModalShell
      title="Ustawienia trybu"
      sidebar={
        <div className={styles.sidebarContent}>
          <nav aria-label="Zakładki ustawień" className={styles.sidebarTabs}>
            <GameSettingsTabs items={SETTINGS_TABS} activeTab={activeTab} onChange={setActiveTab} />
          </nav>
        </div>
      }
      contentClassName={styles.contentCompact}
      footer={
        <>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Anuluj
          </button>
          <button type="button" className={styles.applyBtn} onClick={handleApply} disabled={!hasChanges}>
            Zastosuj
          </button>
        </>
      }
      >
      <GameSettingsSection eyebrow="Tryb główny" title="Tempo rozgrywki" className={styles.contentSection}>
        <GameSettingsCard>
          <div className={styles.optionHeader}>
            <div className={styles.optionIntro}>
              <span className={styles.optionLabel}>LICZBA RUND</span>
              <p className={styles.optionDescription}>
                Wybiera, ile rund rozegracie, zanim gra pokaże wynik końcowy.
              </p>
            </div>
            <span className={styles.optionValue}>{localRounds}</span>
          </div>

          <DiscreteSlider
            options={ROUND_OPTIONS}
            value={localRounds}
            onChange={(value) => setLocalRounds(value)}
            formatValue={(value) => String(value)}
          />
        </GameSettingsCard>
      </GameSettingsSection>
    </GameSettingsModalShell>
  )
}
