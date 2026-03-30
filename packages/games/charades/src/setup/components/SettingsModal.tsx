'use client'

import { Gamepad2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { CharadesGameSettings, CharadesWordChangeScope } from '../state'
import styles from './SettingsModal.module.css'

type Props = {
  settings: CharadesGameSettings
  onChange: (settings: CharadesGameSettings) => void
  onClose: () => void
}

const TIMER_OPTIONS = [15, 30, 45, 60, 75, 90, 120]
const ROUNDS_OPTIONS = [1, 2, 3, 4, 5, 6, 7]
const WORD_CHANGE_OPTIONS = [0, 1, 2, 3, 4, 5]

export function SettingsModal({ settings, onChange, onClose }: Props) {
  const [local, setLocal] = useState<CharadesGameSettings>(settings)
  const [activeTab, setActiveTab] = useState<'gameplay' | 'word-change'>('gameplay')
  const wordChangeDisabled = !local.wordChange.enabled
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

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Ustawienia trybu</h2>

        <div className={styles.body}>
          <nav className={styles.sidebar} aria-label="Kategorie ustawień">
            <button
              type="button"
              className={`${styles.sidebarItem} ${activeTab === 'gameplay' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('gameplay')}
            >
              <Gamepad2 size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarCopy}>
                <span className={styles.sidebarLabel}>Rozgrywka</span>
                <span className={styles.sidebarDescription}>Tempo i liczba rund</span>
              </span>
            </button>
            <button
              type="button"
              className={`${styles.sidebarItem} ${activeTab === 'word-change' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('word-change')}
            >
              <RefreshCw size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarCopy}>
                <span className={styles.sidebarLabel}>Zmiana hasła</span>
                <span className={styles.sidebarDescription}>Rerolle prezentera</span>
              </span>
            </button>
          </nav>

          <div className={styles.content}>
            {activeTab === 'gameplay' ? (
              <>
                <div className={styles.optionCard}>
                  <div className={styles.optionHeader}>
                    <div className={styles.optionIntro}>
                      <span className={styles.optionLabel}>CZAS TURY</span>
                      <p className={styles.optionDescription}>
                        Określa, ile sekund prezenter ma na pokazanie hasła w trakcie jednej tury.
                      </p>
                    </div>
                    <span className={styles.optionValue}>{local.timerSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    className={styles.slider}
                    min={15}
                    max={120}
                    step={15}
                    value={local.timerSeconds}
                    onChange={(event) => setLocal({ ...local, timerSeconds: Number(event.target.value) })}
                  />
                  <div className={styles.quickButtons}>
                    {TIMER_OPTIONS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`${styles.quickBtn} ${local.timerSeconds === value ? styles.quickBtnActive : ''}`}
                        onClick={() => setLocal({ ...local, timerSeconds: value })}
                      >
                        {value}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.optionCard}>
                  <div className={styles.optionHeader}>
                    <div className={styles.optionIntro}>
                      <span className={styles.optionLabel}>LICZBA RUND</span>
                      <p className={styles.optionDescription}>
                        Wybiera, ile pełnych rund rozegra cała grupa, zanim gra pokaże wyniki końcowe.
                      </p>
                    </div>
                    <span className={styles.optionValue}>{local.rounds}</span>
                  </div>
                  <input
                    type="range"
                    className={styles.slider}
                    min={1}
                    max={7}
                    step={1}
                    value={local.rounds}
                    onChange={(event) => setLocal({ ...local, rounds: Number(event.target.value) })}
                  />
                  <div className={styles.quickButtons}>
                    {ROUNDS_OPTIONS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`${styles.quickBtn} ${local.rounds === value ? styles.quickBtnActive : ''}`}
                        onClick={() => setLocal({ ...local, rounds: value })}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === 'word-change' ? (
              <>
                <div className={styles.optionCard}>
                  <div className={styles.optionHeader}>
                    <div className={styles.optionIntro}>
                      <span className={styles.optionLabel}>ZMIANA HASŁA</span>
                      <p className={styles.optionDescription}>
                        Pozwala prezenterowi poprosić o nowe hasło podczas odsłonięcia karty przed startem tury.
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={local.wordChange.enabled}
                        onChange={(event) => updateWordChange({ enabled: event.target.checked })}
                      />
                      <span className={styles.switchTrack}>
                        <span className={styles.switchThumb} />
                      </span>
                      <span className={styles.switchLabel}>{local.wordChange.enabled ? 'ON' : 'OFF'}</span>
                    </label>
                  </div>
                </div>

                <div className={`${styles.optionCard} ${wordChangeDisabled ? styles.optionCardDisabled : ''}`}>
                  <div className={styles.optionHeader}>
                    <div className={styles.optionIntro}>
                      <span className={styles.optionLabel}>ILOŚĆ ZMIAN NA GRACZA</span>
                      <p className={styles.optionDescription}>
                        Limit określa, ile razy pojedynczy gracz może wymienić hasło w trakcie całej gry.
                      </p>
                    </div>
                    <span className={styles.optionValue}>{local.wordChange.changesPerPlayer}</span>
                  </div>
                  <input
                    type="range"
                    className={styles.slider}
                    min={0}
                    max={5}
                    step={1}
                    disabled={wordChangeDisabled}
                    value={local.wordChange.changesPerPlayer}
                    onChange={(event) => updateWordChange({ changesPerPlayer: Number(event.target.value) })}
                  />
                  <div className={styles.quickButtons}>
                    {WORD_CHANGE_OPTIONS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={wordChangeDisabled}
                        className={`${styles.quickBtn} ${local.wordChange.changesPerPlayer === value ? styles.quickBtnActive : ''}`}
                        onClick={() => updateWordChange({ changesPerPlayer: value })}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`${styles.optionCard} ${wordChangeDisabled ? styles.optionCardDisabled : ''}`}>
                  <div className={styles.optionHeader}>
                    <div className={styles.optionIntro}>
                      <span className={styles.optionLabel}>ZAKRES ZMIANY</span>
                      <p className={styles.optionDescription}>
                        Zdecyduj, czy nowe losowanie zmienia tylko hasło, czy także kategorię, z której ono pochodzi.
                      </p>
                    </div>
                  </div>
                  <div className={styles.scopeButtons} aria-disabled={wordChangeDisabled}>
                    <button
                      type="button"
                      disabled={wordChangeDisabled}
                      className={`${styles.scopeBtn} ${local.wordChange.rerollScope === 'word-only' ? styles.scopeBtnActive : ''}`}
                      onClick={() => setRerollScope('word-only')}
                    >
                      Tylko hasło
                    </button>
                    <button
                      type="button"
                      disabled={wordChangeDisabled}
                      className={`${styles.scopeBtn} ${local.wordChange.rerollScope === 'word-and-category' ? styles.scopeBtnActive : ''}`}
                      onClick={() => setRerollScope('word-and-category')}
                    >
                      Hasło + kategoria
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Anuluj
          </button>
          <button
            type="button"
            className={styles.applyBtn}
            onClick={handleApply}
            disabled={!hasChanges}
          >
            Zastosuj
          </button>
        </div>
      </div>
    </div>
  )
}
