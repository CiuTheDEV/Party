'use client'

import { Check, CheckCheck, ChevronDown, Dices, Eraser, LibraryBig } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  getRemainingUniqueWordCount,
  getTotalUniqueWordCount,
} from '../../runtime/hooks/word-history-helpers'
import { buildCategoryPromptPool, buildPromptPool } from '../../runtime/hooks/word-pool-helpers'
import {
  readCharadesWordHistory,
  resetCharadesWordHistory,
  resetCharadesWordHistoryCategory,
} from '../../runtime/shared/charades-storage'
import type { CharadesWordCategory } from '../helpers'
import type { CharadesCategoryDifficulty, CharadesSelectedCategories } from '../state'
import styles from './CategoryPicker.module.css'

type Props = {
  categories: CharadesWordCategory[]
  selected: CharadesSelectedCategories
  onChange: (selected: CharadesSelectedCategories) => void
}

type PoolStats = {
  remaining: number
  total: number
}

type DifficultyMode = 'easy' | 'hard' | 'both' | null

const OPEN_POOL_MANAGER_EVENT = 'charades:open-pool-manager'

export function CategoryPicker({ categories, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [isPoolManagerOpen, setIsPoolManagerOpen] = useState(false)
  const [historyVersion, setHistoryVersion] = useState(0)

  const usedPromptKeys = useMemo(
    () => new Set(readCharadesWordHistory()?.usedPrompts ?? []),
    [historyVersion],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    function handleOpenPoolManager() {
      setOpen(true)
      setIsPoolManagerOpen(true)
      setHistoryVersion((current) => current + 1)
    }

    window.addEventListener(OPEN_POOL_MANAGER_EVENT, handleOpenPoolManager)
    return () => window.removeEventListener(OPEN_POOL_MANAGER_EVENT, handleOpenPoolManager)
  }, [])

  function refreshHistory() {
    setHistoryVersion((current) => current + 1)
  }

  function getModeForCategory(categoryId: string): DifficultyMode {
    const current = selected[categoryId] ?? []

    if (current.includes('easy') && current.includes('hard')) {
      return 'both'
    }

    if (current.includes('easy')) {
      return 'easy'
    }

    if (current.includes('hard')) {
      return 'hard'
    }

    return null
  }

  function setCategoryMode(categoryId: string, nextMode: DifficultyMode) {
    const currentMode = getModeForCategory(categoryId)
    const resolvedMode = currentMode === nextMode ? null : nextMode
    const updated = { ...selected }

    if (!resolvedMode) {
      delete updated[categoryId]
      onChange(updated)
      return
    }

    updated[categoryId] =
      resolvedMode === 'both'
        ? ['easy', 'hard']
        : [resolvedMode]

    onChange(updated)
  }

  function selectAll() {
    onChange(
      Object.fromEntries(
        categories.map((category) => [category.id, ['easy', 'hard'] satisfies CharadesCategoryDifficulty[]]),
      ),
    )
  }

  function clearAll() {
    onChange({})
  }

  function selectRandom() {
    if (categories.length === 0) {
      onChange({})
      return
    }

    const shuffled = [...categories].sort(() => Math.random() - 0.5)
    const count = Math.max(1, Math.min(categories.length, 4))
    const picked = shuffled.slice(0, count)

    onChange(
      Object.fromEntries(
        picked.map((category) => {
          const variants: CharadesCategoryDifficulty[][] = [['easy'], ['hard'], ['easy', 'hard']]
          const randomVariant = variants[Math.floor(Math.random() * variants.length)]
          return [category.id, randomVariant]
        }),
      ),
    )
  }

  function handleResetAllPoolHistory() {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Resetować całą historię puli? Wszystkie zużyte i odrzucone hasła wrócą do użycia.')
    ) {
      return
    }

    resetCharadesWordHistory()
    refreshHistory()
  }

  function handleResetCategoryPoolHistory(categoryName: string) {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Resetować historię kategorii "${categoryName}" dla całej sesji?`)
    ) {
      return
    }

    resetCharadesWordHistoryCategory(categoryName)
    refreshHistory()
  }

  function getWordStats(category: CharadesWordCategory, difficulty: CharadesCategoryDifficulty): PoolStats {
    const prompts = buildCategoryPromptPool(category, [difficulty])

    return {
      remaining: getRemainingUniqueWordCount(prompts, usedPromptKeys),
      total: getTotalUniqueWordCount(prompts),
    }
  }

  const selectedLabels = categories
    .filter((category) => (selected[category.id] ?? []).length > 0)
    .map((category) => category.name)

  const summaryText = selectedLabels.length > 0 ? `Wybrane: ${selectedLabels.join(', ')}` : 'Wybrane: brak'

  const activePoolStats = useMemo(() => {
    const prompts = buildPromptPool(categories, selected)

    return {
      remaining: getRemainingUniqueWordCount(prompts, usedPromptKeys),
      total: getTotalUniqueWordCount(prompts),
    }
  }, [categories, selected, usedPromptKeys])

  return (
    <div className={`${styles.accordion} ${open ? styles.accordionOpen : ''}`}>
      <button className={styles.header} type="button" onClick={() => setOpen((current) => !current)}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>
            <LibraryBig size={18} />
          </span>
          <span className={styles.headerTitle}>Kategorie</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerSummary}>{summaryText}</span>
          <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>
            <ChevronDown size={18} />
          </span>
        </div>
      </button>

      {open ? (
        <div className={styles.content}>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconActionButton}
              aria-label="Wybierz wszystkie kategorie"
              onClick={selectAll}
            >
              <CheckCheck size={16} />
            </button>
            <button
              type="button"
              className={styles.iconActionButton}
              aria-label="Wybierz losowe kategorie"
              onClick={selectRandom}
            >
              <Dices size={16} />
            </button>
            <button
              type="button"
              className={styles.iconActionButton}
              aria-label="Wyczyść wybór kategorii"
              onClick={clearAll}
            >
              <Eraser size={16} />
            </button>
          </div>

          <div className={styles.grid}>
            {categories.map((category) => {
              const mode = getModeForCategory(category.id)
              const cardClass =
                mode === 'both'
                  ? styles.cardMixed
                  : mode === 'easy'
                    ? styles.cardEasy
                    : mode === 'hard'
                      ? styles.cardHard
                      : ''

              return (
                <div
                  key={category.id}
                  className={`${styles.card} ${cardClass} ${mode ? styles.cardSelected : styles.cardUnselected}`}
                  role={mode ? 'button' : undefined}
                  tabIndex={mode ? 0 : undefined}
                  onClick={() => {
                    if (mode) {
                      setCategoryMode(category.id, null)
                    }
                  }}
                  onKeyDown={(event) => {
                    if (!mode) {
                      return
                    }

                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setCategoryMode(category.id, null)
                    }
                  }}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.name}>{category.name}</span>
                    {mode ? (
                      <span className={styles.selectedBadge}>
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className={styles.unselectedBadge} />
                    )}
                  </div>

                  <div className={styles.segmentedControl}>
                    <button
                      type="button"
                      className={`${styles.segmentButton} ${mode === 'easy' ? styles.segmentActive : ''}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        setCategoryMode(category.id, 'easy')
                      }}
                    >
                      Łatwe
                    </button>
                    <button
                      type="button"
                      className={`${styles.segmentButton} ${mode === 'hard' ? styles.segmentActive : ''}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        setCategoryMode(category.id, 'hard')
                      }}
                    >
                      Trudne
                    </button>
                    <button
                      type="button"
                      className={`${styles.segmentButton} ${mode === 'both' ? styles.segmentActive : ''}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        setCategoryMode(category.id, 'both')
                      }}
                    >
                      Oba
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <button type="button" className={styles.managementStrip} onClick={() => setIsPoolManagerOpen(true)}>
            Zarządzaj pulą unikalnych haseł
          </button>
        </div>
      ) : null}

      {isPoolManagerOpen ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setIsPoolManagerOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="charades-pool-manager-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeading}>
                <h3 id="charades-pool-manager-title" className={styles.modalTitle}>
                  Zarządzaj pulą unikalnych haseł
                </h3>
                <p className={styles.modalDescription}>
                  Tutaj sprawdzisz stan aktywnej puli i ręcznie wyczyścisz historię zużytych oraz odrzuconych haseł.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                aria-label="Zamknij zarządzanie pulą"
                onClick={() => setIsPoolManagerOpen(false)}
              >
                Zamknij
              </button>
            </div>

            <section className={styles.modalSection}>
              <div className={styles.modalSectionCopy}>
                <h4 className={styles.modalSectionTitle}>Cała pula</h4>
                <p className={styles.modalSectionDescription}>
                  Aktywna pula dla bieżącego wyboru kategorii ma teraz tyle świeżych haseł:
                </p>
                <div className={styles.poolSummaryValue}>{`${activePoolStats.remaining}/${activePoolStats.total}`}</div>
              </div>
              <button type="button" className={styles.resetAllButton} onClick={handleResetAllPoolHistory}>
                Resetuj wszystko
              </button>
            </section>

            <section className={styles.modalSectionColumn}>
              <div className={styles.modalSectionCopy}>
                <h4 className={styles.modalSectionTitle}>Kategorie</h4>
                <p className={styles.modalSectionDescription}>
                  Reset kategorii czyści jej historię dla wszystkich graczy w tej sesji.
                </p>
              </div>

              <div className={styles.categoryResetList}>
                {categories.map((category) => {
                  const easyStats = getWordStats(category, 'easy')
                  const hardStats = getWordStats(category, 'hard')

                  return (
                    <div key={category.id} className={styles.categoryResetRow}>
                      <div className={styles.categoryResetMeta}>
                        <span className={styles.categoryResetName}>{category.name}</span>
                        <div className={styles.categoryStatsRow}>
                          <span className={styles.categoryStatPill}>{`Łatwe ${easyStats.remaining}/${easyStats.total}`}</span>
                          <span className={styles.categoryStatPill}>{`Trudne ${hardStats.remaining}/${hardStats.total}`}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.categoryResetButton}
                        onClick={() => handleResetCategoryPoolHistory(category.name)}
                      >
                        Resetuj
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function openCharadesPoolManager() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(OPEN_POOL_MANAGER_EVENT))
}
