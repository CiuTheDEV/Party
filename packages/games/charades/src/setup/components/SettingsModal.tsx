'use client'

import { Gamepad2, Lightbulb, RefreshCw } from 'lucide-react'
import { useCallback, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
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

function getSliderProgress(value: number, options: number[]) {
  if (options.length <= 1) {
    return '0%'
  }

  const index = options.indexOf(value)
  const safeIndex = index >= 0 ? index : 0

  return `${(safeIndex / (options.length - 1)) * 100}%`
}

type DiscreteSliderProps = {
  options: number[]
  value: number
  onChange: (value: number) => void
  formatValue: (value: number) => string
  disabled?: boolean
}

function DiscreteSlider({ options, value, onChange, formatValue, disabled = false }: DiscreteSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const progress = getSliderProgress(value, options)

  const selectNearestOption = useCallback(
    (clientX: number) => {
      if (disabled || !trackRef.current || options.length === 0) {
        return
      }

      const rect = trackRef.current.getBoundingClientRect()
      if (rect.width <= 0) {
        return
      }

      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const rawIndex = ratio * (options.length - 1)
      const nearestIndex = Math.round(rawIndex)
      onChange(options[nearestIndex] ?? options[0])
    },
    [disabled, onChange, options],
  )

  const beginPointerDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }

      event.preventDefault()
      selectNearestOption(event.clientX)

      const handlePointerMove = (moveEvent: PointerEvent) => {
        selectNearestOption(moveEvent.clientX)
      }

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    },
    [disabled, selectNearestOption],
  )

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }

      const currentIndex = Math.max(0, options.indexOf(value))

      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault()
        onChange(options[Math.max(0, currentIndex - 1)] ?? options[0])
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault()
        onChange(options[Math.min(options.length - 1, currentIndex + 1)] ?? options[options.length - 1])
      }

      if (event.key === 'Home') {
        event.preventDefault()
        onChange(options[0] ?? value)
      }

      if (event.key === 'End') {
        event.preventDefault()
        onChange(options[options.length - 1] ?? value)
      }
    },
    [disabled, onChange, options, value],
  )

  return (
    <div className={`${styles.discreteSlider} ${disabled ? styles.discreteSliderDisabled : ''}`}>
      <div
        ref={trackRef}
        className={styles.sliderTrackWrap}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-valuemin={options[0]}
        aria-valuemax={options[options.length - 1]}
        aria-valuenow={value}
        aria-valuetext={formatValue(value)}
        onPointerDown={beginPointerDrag}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.sliderTrack}>
          <div className={styles.sliderTrackFill} style={{ width: progress }} />
          <div className={styles.sliderThumb} style={{ left: progress }} />
        </div>
      </div>
      <div className={styles.sliderScale}>
        {options.map((option, index) => {
          const position = options.length <= 1 ? '0%' : `${(index / (options.length - 1)) * 100}%`

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              className={`${styles.sliderScaleOption} ${value === option ? styles.sliderScaleOptionActive : ''}`}
              onClick={() => onChange(option)}
              style={{ ['--slider-position' as string]: position }}
              data-edge={index === 0 ? 'start' : index === options.length - 1 ? 'end' : 'middle'}
            >
              <span className={styles.sliderScaleTick} aria-hidden="true" />
              <span className={styles.sliderScaleValue}>{formatValue(option)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function SettingsModal({ settings, onChange, onClose }: Props) {
  const [local, setLocal] = useState<CharadesGameSettings>(settings)
  const [activeTab, setActiveTab] = useState<'gameplay' | 'word-change' | 'hints'>('gameplay')
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
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Ustawienia trybu</h2>

        <div className={styles.body}>
          <nav className={styles.sidebar} aria-label="Kategorie ustawień">
            <button
              type="button"
              className={`${styles.sidebarItem} ${activeTab === 'gameplay' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('gameplay')}
              aria-expanded={activeTab === 'gameplay'}
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
              aria-expanded={activeTab === 'word-change'}
            >
              <RefreshCw size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarCopy}>
                <span className={styles.sidebarLabel}>Zmiana hasła</span>
                <span className={styles.sidebarDescription}>Rerolle prezentera</span>
              </span>
            </button>
            <button
              type="button"
              className={`${styles.sidebarItem} ${activeTab === 'hints' ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab('hints')}
              aria-expanded={activeTab === 'hints'}
            >
              <Lightbulb size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarCopy}>
                <span className={styles.sidebarLabel}>Podpowiedzi</span>
                <span className={styles.sidebarDescription}>Kategoria i liczba słów</span>
              </span>
            </button>
          </nav>

          <div className={`${styles.content} ${activeTab === 'gameplay' ? '' : styles.contentCompact}`}>
            {activeTab === 'gameplay' ? (
              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionCopy}>
                    <span className={styles.sectionEyebrow}>Tryb główny</span>
                    <h3 className={styles.sectionTitle}>Tempo rozgrywki</h3>
                  </div>
                </div>

                <div className={styles.optionStack}>
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
                  <DiscreteSlider
                    options={TIMER_OPTIONS}
                    value={local.timerSeconds}
                    onChange={(value) => setLocal({ ...local, timerSeconds: value })}
                    formatValue={(value) => `${value}s`}
                  />
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
                  <DiscreteSlider
                    options={ROUNDS_OPTIONS}
                    value={local.rounds}
                    onChange={(value) => setLocal({ ...local, rounds: value })}
                    formatValue={(value) => String(value)}
                  />
                </div>
                </div>
              </section>
            ) : null}

            {activeTab === 'word-change' ? (
              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionCopy}>
                    <span className={styles.sectionEyebrow}>Opcja dodatkowa</span>
                    <h3 className={styles.sectionTitle}>Zmiana hasła</h3>
                  </div>
                </div>

                <div className={styles.optionStack}>
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
                  <DiscreteSlider
                    options={WORD_CHANGE_OPTIONS}
                    value={local.wordChange.changesPerPlayer}
                    onChange={(value) => updateWordChange({ changesPerPlayer: value })}
                    formatValue={(value) => String(value)}
                    disabled={wordChangeDisabled}
                  />
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
                </div>
              </section>
            ) : null}

            {activeTab === 'hints' ? (
              <section className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionCopy}>
                    <span className={styles.sectionEyebrow}>Opcja dodatkowa</span>
                    <h3 className={styles.sectionTitle}>Podpowiedzi</h3>
                  </div>
                </div>

                <div className={styles.optionStack}>
                <div className={styles.optionCard}>
                  <div className={styles.optionHeader}>
                    <div className={styles.optionIntro}>
                      <span className={styles.optionLabel}>PODPOWIEDZI</span>
                      <p className={styles.optionDescription}>
                        Włącza dodatkowe wskazówki, które pomagają drużynie szybciej odczytać kierunek hasła.
                      </p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={local.hints.enabled}
                        onChange={(event) => updateHints({ enabled: event.target.checked })}
                      />
                      <span className={styles.switchTrack}>
                        <span className={styles.switchThumb} />
                      </span>
                      <span className={styles.switchLabel}>{local.hints.enabled ? 'ON' : 'OFF'}</span>
                    </label>
                  </div>
                </div>

                <div className={`${styles.optionCard} ${hintsDisabled ? styles.optionCardDisabled : ''}`}>
                  <div className={styles.optionHeader}>
                    <div className={styles.optionIntro}>
                      <span className={styles.optionLabel}>KATEGORIA</span>
                      <p className={styles.optionDescription}>
                        Pokazuje, z jakiej kategorii pochodzi aktualne hasło.
                      </p>
                    </div>
                    <span className={styles.optionValue}>{local.hints.showCategory ? 'ON' : 'OFF'}</span>
                  </div>
                  <div className={styles.scopeButtons} aria-disabled={hintsDisabled}>
                    <button
                      type="button"
                      disabled={hintsDisabled}
                      className={`${styles.scopeBtn} ${local.hints.showCategory ? styles.scopeBtnActive : ''}`}
                      onClick={() => updateHints({ showCategory: true })}
                    >
                      Pokazuj
                    </button>
                    <button
                      type="button"
                      disabled={hintsDisabled}
                      className={`${styles.scopeBtn} ${!local.hints.showCategory ? styles.scopeBtnActive : ''}`}
                      onClick={() => updateHints({ showCategory: false })}
                    >
                      Ukryj
                    </button>
                  </div>
                </div>

                <div className={`${styles.optionCard} ${hintsDisabled ? styles.optionCardDisabled : ''}`}>
                  <div className={styles.optionHeader}>
                    <div className={styles.optionIntro}>
                      <span className={styles.optionLabel}>ILOŚĆ SŁÓW</span>
                      <p className={styles.optionDescription}>
                        Ujawnia, ile wyrazów składa się na prezentowane hasło.
                      </p>
                    </div>
                    <span className={styles.optionValue}>{local.hints.showWordCount ? 'ON' : 'OFF'}</span>
                  </div>
                  <div className={styles.scopeButtons} aria-disabled={hintsDisabled}>
                    <button
                      type="button"
                      disabled={hintsDisabled}
                      className={`${styles.scopeBtn} ${local.hints.showWordCount ? styles.scopeBtnActive : ''}`}
                      onClick={() => updateHints({ showWordCount: true })}
                    >
                      Pokazuj
                    </button>
                    <button
                      type="button"
                      disabled={hintsDisabled}
                      className={`${styles.scopeBtn} ${!local.hints.showWordCount ? styles.scopeBtnActive : ''}`}
                      onClick={() => updateHints({ showWordCount: false })}
                    >
                      Ukryj
                    </button>
                  </div>
                </div>
                </div>
              </section>
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
