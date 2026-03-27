'use client'

import { useState } from 'react'
import type { CharadesCategoryDifficulty, CharadesSelectedCategories } from '../state'
import type { CharadesWordCategory } from '../helpers'
import styles from './CategoryPicker.module.css'

type Props = {
  categories: CharadesWordCategory[]
  selected: CharadesSelectedCategories
  onChange: (selected: CharadesSelectedCategories) => void
}

export function CategoryPicker({ categories, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)

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

  return (
    <div className={styles.accordion}>
      <button className={styles.header} type="button" onClick={() => setOpen((current) => !current)}>
        <div className={styles.headerLeft}>
          <span className={styles.headerTitle}>Kategorie</span>
          <span className={styles.headerCount}>Wybrane: {Object.keys(selected).length}</span>
        </div>
        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>&#9662;</span>
      </button>

      {open ? (
        <div className={styles.grid}>
          {categories.map((category) => {
            const diffs = selected[category.id] ?? []
            const hasEasy = diffs.includes('easy')
            const hasHard = diffs.includes('hard')
            const cardClass = hasEasy && hasHard ? styles.cardMixed : hasEasy ? styles.cardEasy : hasHard ? styles.cardHard : ''

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
                    Łatwe <span className={styles.diffCount}>{category.wordsEasy.length}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.diffBtn} ${hasHard ? styles.diffHard : ''}`}
                    onClick={() => toggleDiff(category.id, 'hard')}
                  >
                    Trudne <span className={styles.diffCount}>{category.wordsHard.length}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
