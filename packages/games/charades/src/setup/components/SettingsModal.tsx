'use client'

import {
  DiscreteSlider,
  GameSettingsCard,
  GameSettingsModalShell,
  GameSettingsSection,
  GameSettingsTabs,
  type GameSettingsTabItem,
  SegmentedChoice,
  SwitchField,
} from '@party/ui'
import { Gamepad2, Lightbulb, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { CharadesGameSettings, CharadesWordChangeScope } from '../state'
import styles from './SettingsModal.module.css'

type SettingsTabId = 'gameplay' | 'word-change' | 'hints'

type Props = {
  settings: CharadesGameSettings
  onChange: (settings: CharadesGameSettings) => void
  onClose: () => void
}

const TIMER_OPTIONS = [15, 30, 45, 60, 75, 90, 120]
const ROUNDS_OPTIONS = [1, 2, 3, 4, 5, 6, 7]
const WORD_CHANGE_OPTIONS = [0, 1, 2, 3, 4, 5]
const REROLL_SCOPE_OPTIONS = [
  { value: 'word-only' as const, label: 'Tylko hasło' },
  { value: 'word-and-category' as const, label: 'Hasło + kategoria' },
]
const SETTINGS_TABS: GameSettingsTabItem<SettingsTabId>[] = [
  { id: 'gameplay', label: 'Rozgrywka', description: 'Tempo i liczba rund', icon: Gamepad2 },
  { id: 'word-change', label: 'Zmiana hasła', description: 'Rerolle prezentera', icon: RefreshCw },
  { id: 'hints', label: 'Podpowiedzi', description: 'Kategoria i liczba słów', icon: Lightbulb },
]

export function SettingsModal({ settings, onChange, onClose }: Props) {
  const [local, setLocal] = useState<CharadesGameSettings>(settings)
  const [activeTab, setActiveTab] = useState<SettingsTabId>('gameplay')
  const wordChangeDisabled = !local.wordChange.enabled
  const hintsDisabled = !local.hints.enabled
  const hasChanges = JSON.stringify(local) !== JSON.stringify(settings)

  function handleApply() {
    onChange(local)
    onClose()
  }

  function updateWordChange(scope: Partial<CharadesGameSettings['wordChange']>) {
    setLocal((current) => ({
      ...current,
      wordChange: {
        ...current.wordChange,
        ...scope,
      },
    }))
  }

  function setRerollScope(rerollScope: CharadesWordChangeScope) {
    if (wordChangeDisabled) {
      return
    }

    updateWordChange({ rerollScope })
  }

  function updateHints(scope: Partial<CharadesGameSettings['hints']>) {
    setLocal((current) => ({
      ...current,
      hints: {
        ...current.hints,
        ...scope,
      },
    }))
  }

  return (
    <GameSettingsModalShell
      title="Ustawienia trybu"
      sidebar={
        <nav aria-label="Kategorie ustawień">
          <GameSettingsTabs items={SETTINGS_TABS} activeTab={activeTab} onChange={setActiveTab} />
        </nav>
      }
      contentClassName={activeTab === 'gameplay' ? undefined : styles.contentCompact}
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
      {activeTab === 'gameplay' ? (
        <GameSettingsSection eyebrow="Tryb główny" title="Tempo rozgrywki" className={styles.contentSection}>
          <div className={styles.optionStack}>
            <GameSettingsCard>
              <div className={styles.optionHeader}>
                <div className={styles.optionIntro}>
                  <span className={styles.optionLabel}>CZAS TURY</span>
                  <p className={styles.optionDescription}>
                    Określa, ile sekund prezenter ma na pokazanie hasła w trakcie jednej tury.
                  </p>
                </div>
                <span className={styles.optionValue}>{local.timerSeconds}s</span>
              </div>
              <DiscreteSlider
                options={TIMER_OPTIONS}
                value={local.timerSeconds}
                onChange={(value) => setLocal({ ...local, timerSeconds: value })}
                formatValue={(value) => `${value}s`}
              />
            </GameSettingsCard>

            <GameSettingsCard>
              <div className={styles.optionHeader}>
                <div className={styles.optionIntro}>
                  <span className={styles.optionLabel}>LICZBA RUND</span>
                  <p className={styles.optionDescription}>
                    Wybiera, ile pełnych rund rozegra cała grupa, zanim gra pokaże wyniki końcowe.
                  </p>
                </div>
                <span className={styles.optionValue}>{local.rounds}</span>
              </div>
              <DiscreteSlider
                options={ROUNDS_OPTIONS}
                value={local.rounds}
                onChange={(value) => setLocal({ ...local, rounds: value })}
                formatValue={(value) => String(value)}
              />
            </GameSettingsCard>
          </div>
        </GameSettingsSection>
      ) : null}

      {activeTab === 'word-change' ? (
        <GameSettingsSection eyebrow="Opcja dodatkowa" title="Zmiana hasła" compact className={styles.contentSection}>
          <div className={styles.optionStack}>
            <GameSettingsCard>
              <div className={styles.optionHeader}>
                <div className={styles.optionIntro}>
                  <span className={styles.optionLabel}>ZMIANA HASŁA</span>
                  <p className={styles.optionDescription}>
                    Pozwala prezenterowi poprosić o nowe hasło podczas odsłonięcia karty przed startem tury.
                  </p>
                </div>
                <SwitchField
                  checked={local.wordChange.enabled}
                  onChange={(checked) => updateWordChange({ enabled: checked })}
                  ariaLabel="Zmiana hasła"
                />
              </div>
            </GameSettingsCard>

            <GameSettingsCard
              disabled={wordChangeDisabled}
              className={wordChangeDisabled ? styles.optionCardDisabled : undefined}
            >
              <div className={styles.optionHeader}>
                <div className={styles.optionIntro}>
                  <span className={styles.optionLabel}>ILOŚĆ ZMIAN NA GRACZA</span>
                  <p className={styles.optionDescription}>
                    Limit określa, ile razy pojedynczy gracz może wymienić hasło w trakcie całej gry.
                  </p>
                </div>
                <span className={styles.optionValue}>{local.wordChange.changesPerPlayer}</span>
              </div>
              <DiscreteSlider
                options={WORD_CHANGE_OPTIONS}
                value={local.wordChange.changesPerPlayer}
                onChange={(value) => updateWordChange({ changesPerPlayer: value })}
                formatValue={(value) => String(value)}
                disabled={wordChangeDisabled}
              />
            </GameSettingsCard>

            <GameSettingsCard
              disabled={wordChangeDisabled}
              className={wordChangeDisabled ? styles.optionCardDisabled : undefined}
            >
              <div className={styles.optionHeader}>
                <div className={styles.optionIntro}>
                  <span className={styles.optionLabel}>ZAKRES ZMIANY</span>
                  <p className={styles.optionDescription}>
                    Zdecyduj, czy nowe losowanie zmienia tylko hasło, czy także kategorię, z której ono pochodzi.
                  </p>
                </div>
              </div>
              <SegmentedChoice
                options={REROLL_SCOPE_OPTIONS}
                value={local.wordChange.rerollScope}
                onChange={setRerollScope}
                disabled={wordChangeDisabled}
                ariaLabel="Zakres zmiany hasła"
              />
            </GameSettingsCard>
          </div>
        </GameSettingsSection>
      ) : null}

      {activeTab === 'hints' ? (
        <GameSettingsSection eyebrow="Opcja dodatkowa" title="Podpowiedzi" compact className={styles.contentSection}>
          <div className={styles.optionStack}>
            <GameSettingsCard>
              <div className={styles.optionHeader}>
                <div className={styles.optionIntro}>
                  <span className={styles.optionLabel}>PODPOWIEDZI</span>
                  <p className={styles.optionDescription}>
                    Włącza dodatkowe wskazówki, które pomagają drużynie szybciej odczytać kierunek hasła.
                  </p>
                </div>
                <SwitchField
                  checked={local.hints.enabled}
                  onChange={(checked) => updateHints({ enabled: checked })}
                  ariaLabel="Podpowiedzi"
                />
              </div>
            </GameSettingsCard>

            <GameSettingsCard
              disabled={hintsDisabled}
              className={hintsDisabled ? styles.optionCardDisabled : undefined}
            >
              <div className={styles.optionHeader}>
                <div className={styles.optionIntro}>
                  <span className={styles.optionLabel}>KATEGORIA</span>
                  <p className={styles.optionDescription}>Pokazuje, z jakiej kategorii pochodzi aktualne hasło.</p>
                </div>
                <SwitchField
                  checked={local.hints.showCategory}
                  disabled={hintsDisabled}
                  onChange={(checked) => updateHints({ showCategory: checked })}
                  ariaLabel="Pokazuj kategorię"
                />
              </div>
            </GameSettingsCard>

            <GameSettingsCard
              disabled={hintsDisabled}
              className={hintsDisabled ? styles.optionCardDisabled : undefined}
            >
              <div className={styles.optionHeader}>
                <div className={styles.optionIntro}>
                  <span className={styles.optionLabel}>ILOŚĆ SŁÓW</span>
                  <p className={styles.optionDescription}>Ujawnia, ile wyrazów składa się na prezentowane hasło.</p>
                </div>
                <SwitchField
                  checked={local.hints.showWordCount}
                  disabled={hintsDisabled}
                  onChange={(checked) => updateHints({ showWordCount: checked })}
                  ariaLabel="Pokazuj liczbę słów"
                />
              </div>
            </GameSettingsCard>
          </div>
        </GameSettingsSection>
      ) : null}
    </GameSettingsModalShell>
  )
}
