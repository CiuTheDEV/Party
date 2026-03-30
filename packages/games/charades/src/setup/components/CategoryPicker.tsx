'use client'

import { ChevronDown, LibraryBig } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getRemainingPromptCount } from '../../runtime/hooks/word-history-helpers'
import { buildCategoryPromptPool } from '../../runtime/hooks/word-pool-helpers'
import { readCharadesWordHistory } from '../../runtime/shared/charades-storage'
import type { CharadesWordCategory } from '../helpers'
import type { CharadesCategoryDifficulty, CharadesSelectedCategories } from '../state'
import styles from './CategoryPicker.module.css'

type Props = {
  categories: CharadesWordCategory[]
  selected: CharadesSelectedCategories
  onChange: (selected: CharadesSelectedCategories) => void
}

export function CategoryPicker({ categories, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const usedPromptKeys = useMemo(() => new Set(readCharadesWordHistory()?.usedPrompts ?? []), [open])

  function toggleDiff(id: string, diff: CharadesCategoryDifficulty) {
    const current = selected[id] ?? []
    const next = current.includes(diff) ? current.filter((value) => value !== diff) : [...current, diff]

    if (next.length === 0) {
      const updated = { ...selected }
      delete updated[id]
      onChange(updated)
      return
    }

    onChange({ ...selected, [id]: next })
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

  function getWordStats(category: CharadesWordCategory, difficulty: CharadesCategoryDifficulty) {
    const prompts = buildCategoryPromptPool(category, [difficulty])

    return {
      remaining: getRemainingPromptCount(prompts, usedPromptKeys),
      total: prompts.length,
    }
  }

  const selectedLabels = categories
    .filter((category) => (selected[category.id] ?? []).length > 0)
    .map((category) => category.name)

  const summaryText = selectedLabels.length > 0 ? `Wybrane: ${selectedLabels.join(', ')}` : 'Wybrane: brak'

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
          <div className={styles.grid}>
            {categories.map((category) => {
              const diffs = selected[category.id] ?? []
              const hasEasy = diffs.includes('easy')
              const hasHard = diffs.includes('hard')
              const cardClass = hasEasy && hasHard ? styles.cardMixed : hasEasy ? styles.cardEasy : hasHard ? styles.cardHard : ''
              const easyStats = getWordStats(category, 'easy')
              const hardStats = getWordStats(category, 'hard')

              return (
                <div key={category.id} className={styles.cardWrapper}>
                  <div className={`${styles.card} ${cardClass}`}>
                    <span className={styles.name}>{category.name}</span>
                  </div>
                  <div className={styles.diffRow}>
                    <button
                      type="button"
                      className={`${styles.diffBtn} ${hasEasy ? styles.diffEasy : ''}`}
                      onClick={() => toggleDiff(category.id, 'easy')}
                    >
                      Łatwe <span className={styles.diffCount}>{`${easyStats.remaining}/${easyStats.total}`}</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.diffBtn} ${hasHard ? styles.diffHard : ''}`}
                      onClick={() => toggleDiff(category.id, 'hard')}
                    >
                      Trudne <span className={styles.diffCount}>{`${hardStats.remaining}/${hardStats.total}`}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.actionButton} onClick={selectAll}>
              Wszystkie
            </button>
            <button type="button" className={styles.actionButton} onClick={selectRandom}>
              Losowo
            </button>
            <button type="button" className={styles.actionButton} onClick={clearAll}>
              Wyczyść
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
