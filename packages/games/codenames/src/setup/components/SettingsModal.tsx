'use client'

import {
  DiscreteSlider,
  GameSettingsCard,
  GameSettingsModalShell,
  GameSettingsSection,
  SwitchField,
} from '@party/ui'
import { GameSettingsTabs, type GameSettingsTabItem } from '@party/ui'
import { BarChart3, Skull } from 'lucide-react'
import { useState } from 'react'
import type { CodenamesGameSettings } from '../state'
import styles from './SettingsModal.module.css'

type SettingsTabId = 'rounds' | 'assassins'

type Props = {
  settings: CodenamesGameSettings
  onChange: (settings: CodenamesGameSettings) => void
  onClose: () => void
}

const ROUND_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const ASSASSIN_OPTIONS = [1, 2, 3, 4]
const SETTINGS_TABS: GameSettingsTabItem<SettingsTabId>[] = [
  { id: 'rounds', label: 'Rozgrywka', description: 'Tempo i liczba rund', icon: BarChart3 },
  { id: 'assassins', label: 'Zabójcy', description: 'Dodatkowe karty śmierci', icon: Skull },
]

export function SettingsModal({ settings, onChange, onClose }: Props) {
  const [localSettings, setLocalSettings] = useState<CodenamesGameSettings>(settings)
  const [activeTab, setActiveTab] = useState<SettingsTabId>('rounds')
  const extraAssassinsDisabled = !localSettings.assassins.enabled
  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)

  function handleApply() {
    onChange(localSettings)
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
      {activeTab === 'rounds' ? (
        <GameSettingsSection eyebrow="Tryb główny" title="Tempo rozgrywki" className={styles.contentSection}>
          <GameSettingsCard>
            <div className={styles.optionHeader}>
              <div className={styles.optionIntro}>
                <span className={styles.optionLabel}>LICZBA RUND</span>
                <p className={styles.optionDescription}>
                  Wybiera, ile rund rozegracie, zanim gra pokaże wynik końcowy.
                </p>
              </div>
              <span className={styles.optionValue}>{localSettings.rounds}</span>
            </div>

            <DiscreteSlider
              options={ROUND_OPTIONS}
              value={localSettings.rounds}
              onChange={(value) => setLocalSettings((current) => ({ ...current, rounds: value }))}
              formatValue={(value) => String(value)}
            />
          </GameSettingsCard>
        </GameSettingsSection>
      ) : null}

      {activeTab === 'assassins' ? (
        <GameSettingsSection eyebrow="Opcja dodatkowa" title="Zabójcy" className={styles.contentSection}>
          <GameSettingsCard>
            <div className={styles.optionHeader}>
              <div className={styles.optionIntro}>
                <span className={styles.optionLabel}>DODATKOWI ZABÓJCY</span>
                <p className={styles.optionDescription}>
                  Włącza bardziej ryzykowną planszę, zamieniając część neutralnych kart na dodatkowych zabójców.
                </p>
              </div>
              <SwitchField
                checked={localSettings.assassins.enabled}
                onChange={(enabled) =>
                  setLocalSettings((current) => ({
                    ...current,
                    assassins: {
                      ...current.assassins,
                      enabled,
                    },
                  }))
                }
                ariaLabel="Dodatkowi zabójcy"
              />
            </div>
          </GameSettingsCard>

          <GameSettingsCard
            disabled={extraAssassinsDisabled}
            className={extraAssassinsDisabled ? styles.optionCardDisabled : undefined}
          >
            <div className={styles.optionHeader}>
              <div className={styles.optionIntro}>
                <span className={styles.optionLabel}>LICZBA ZABÓJCÓW</span>
                <p className={styles.optionDescription}>
                  Ustawia łączną liczbę zabójców na planszy. Każdy dodatkowy zabójca zastępuje jedną kartę neutralną.
                </p>
              </div>
              <span className={styles.optionValue}>{localSettings.assassins.count}</span>
            </div>

            <DiscreteSlider
              options={ASSASSIN_OPTIONS}
              value={localSettings.assassins.count}
              onChange={(value) =>
                setLocalSettings((current) => ({
                  ...current,
                  assassins: {
                    ...current.assassins,
                    count: value,
                  },
                }))
              }
              formatValue={(value) => String(value)}
              disabled={extraAssassinsDisabled}
            />
          </GameSettingsCard>
        </GameSettingsSection>
      ) : null}
    </GameSettingsModalShell>
  )
}
