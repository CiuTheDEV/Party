'use client'

import { AlertDialog, WordPoolManagerModal, type WordPoolManagerRow } from '@party/ui'
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
type PoolResetTarget = { type: 'all' } | { type: 'category'; categoryName: string }

const OPEN_POOL_MANAGER_EVENT = 'charades:open-pool-manager'

export function CategoryPicker({
  categories,
  selected,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const [isPoolManagerOpen, setIsPoolManagerOpen] = useState(false)
  const [historyVersion, setHistoryVersion] = useState(0)
  const [poolResetTarget, setPoolResetTarget] = useState<PoolResetTarget | null>(null)

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

    updated[categoryId] = resolvedMode === 'both' ? ['easy', 'hard'] : [resolvedMode]

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
    setPoolResetTarget({ type: 'all' })
  }

  function handleResetCategoryPoolHistory(categoryName: string) {
    setPoolResetTarget({ type: 'category', categoryName })
  }

  function confirmPoolHistoryReset() {
    if (!poolResetTarget) {
      return
    }

    if (poolResetTarget.type === 'all') {
      resetCharadesWordHistory()
    } else {
      resetCharadesWordHistoryCategory(poolResetTarget.categoryName)
    }

    setPoolResetTarget(null)
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

  const categoryResetRows = useMemo<WordPoolManagerRow[]>(
    () =>
      categories
        .map((category) => {
          const easyStats = getWordStats(category, 'easy')
          const hardStats = getWordStats(category, 'hard')

          return {
            name: category.name,
            pills: [`Latwe ${easyStats.remaining}/${easyStats.total}`, `Trudne ${hardStats.remaining}/${hardStats.total}`],
            actionLabel: 'Resetuj',
            onAction: () => handleResetCategoryPoolHistory(category.name),
          }
        }),
    [categories, historyVersion],
  )

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

          <button
            type="button"
            className={styles.managementStrip}
            onClick={() => setIsPoolManagerOpen(true)}
          >
            Zarządzaj pulą unikalnych haseł
          </button>
        </div>
      ) : null}

      <WordPoolManagerModal
        open={isPoolManagerOpen}
        onClose={() => setIsPoolManagerOpen(false)}
        title={'Zarz\u0105dzaj pul\u0105 unikalnych hase\u0142'}
        description={
          'Tutaj sprawdzisz stan aktywnej puli i r\u0119cznie wyczy\u015bcisz histori\u0119 zu\u017cytych oraz odrzuconych hase\u0142.'
        }
        summaryTitle={'Ca\u0142a pula'}
        summaryDescription={'Aktywna pula dla bie\u017c\u0105cego wyboru kategorii ma teraz tyle \u015bwie\u017cych hase\u0142:'}
        summaryValue={`${activePoolStats.remaining}/${activePoolStats.total}`}
        summaryActionLabel="Resetuj wszystko"
        onSummaryAction={handleResetAllPoolHistory}
        rowsTitle="Kategorie"
        rowsDescription={'Reset kategorii czy\u015bci jej histori\u0119 dla wszystkich graczy w tej sesji.'}
        rows={categoryResetRows}
      />

      <AlertDialog
        open={poolResetTarget !== null}
        variant="danger"
        eyebrow="Reset puli"
        title={
          poolResetTarget?.type === 'all'
            ? 'Przywrócić całą historię puli?'
            : `Przywrócić kategorię "${poolResetTarget?.categoryName}"?`
        }
        description={
          poolResetTarget?.type === 'all'
            ? 'Wszystkie zużyte i odrzucone hasła wrócą do użycia w tej sesji.'
            : 'Zużyte i odrzucone hasła z tej kategorii wrócą do użycia dla całej sesji.'
        }
        actions={[
          {
            label: 'Anuluj',
            onClick: () => setPoolResetTarget(null),
            variant: 'secondary',
          },
          {
            label: 'Resetuj',
            onClick: confirmPoolHistoryReset,
            variant: 'danger',
            fullWidth: true,
          },
        ]}
      />
    </div>
  )
}

export function openCharadesPoolManager() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(OPEN_POOL_MANAGER_EVENT))
}
