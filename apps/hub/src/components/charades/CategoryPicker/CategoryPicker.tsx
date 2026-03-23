'use client'

import { useState } from 'react'
import type { WordCategory } from '@content/charades/index'
import styles from './CategoryPicker.module.css'

export type CategoryDifficulty = 'easy' | 'hard'
export type SelectedCategories = Record<string, CategoryDifficulty[]>

type Props = {
  categories: WordCategory[]
  selected: SelectedCategories
  onChange: (selected: SelectedCategories) => void
}

export function CategoryPicker({ categories, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)

  function toggleDiff(id: string, diff: CategoryDifficulty) {
    const current = selected[id] ?? []
    let next: CategoryDifficulty[]
    if (current.includes(diff)) {
      next = current.filter((d) => d !== diff)
    } else {
      next = [...current, diff]
    }
    if (next.length === 0) {
      const updated = { ...selected }
      delete updated[id]
      onChange(updated)
    } else {
      onChange({ ...selected, [id]: next })
    }
  }

  function selectAll() {
    onChange(Object.fromEntries(categories.map((c) => [c.id, ['easy'] as CategoryDifficulty[]])))
  }

  function selectRandom() {
    const shuffled = [...categories].sort(() => Math.random() - 0.5)
    onChange(Object.fromEntries(shuffled.slice(0, 3).map((c) => [c.id, ['easy'] as CategoryDifficulty[]])))
  }

  function clearAll() {
    onChange({})
  }

  const selectedCount = Object.keys(selected).length

  return (
    <div className={styles.accordion}>
      <button className={styles.header} type="button" onClick={() => setOpen((v) => !v)}>
        <div className={styles.headerLeft}>
          <span className={styles.headerTitle}>Kategorie</span>
          <span className={styles.headerCount}>Wybrane: {selectedCount}</span>
        </div>
        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>▾</span>
      </button>

      {open && (
        <>
          <div className={styles.grid}>
            {categories.map((cat) => {
              const diffs = selected[cat.id] ?? []
              const hasEasy = diffs.includes('easy')
              const hasHard = diffs.includes('hard')
              const cardMod = hasEasy && hasHard ? styles.cardMixed : hasEasy ? styles.cardEasy : hasHard ? styles.cardHard : ''
              return (
                <div key={cat.id} className={styles.cardWrapper}>
                  <div className={`${styles.card} ${cardMod}`}>
                    <span className={styles.name}>{cat.name}</span>
                  </div>
                  <div className={styles.diffRow}>
                    <button
                      type="button"
                      className={`${styles.diffBtn} ${hasEasy ? styles.diffEasy : ''}`}
                      onClick={() => toggleDiff(cat.id, 'easy')}
                    >
                      Łatwe <span className={styles.diffCount}>{cat.wordsEasy.length}</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.diffBtn} ${hasHard ? styles.diffHard : ''}`}
                      onClick={() => toggleDiff(cat.id, 'hard')}
                    >
                      Trudne <span className={styles.diffCount}>{cat.wordsHard.length}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.actionBtn} onClick={selectAll}>Wszystkie</button>
            <button type="button" className={styles.actionBtn} onClick={selectRandom}>Losowo</button>
            <button type="button" className={styles.actionBtn} onClick={clearAll}>Wyczyść</button>
          </div>
        </>
      )}
    </div>
  )
}
