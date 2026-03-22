'use client'

import type { WordCategory } from '@content/charades/index'
import styles from './CategoryPicker.module.css'

type Props = {
  categories: WordCategory[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function CategoryPicker({ categories, selected, onChange }: Props) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    )
  }

  return (
    <div className={styles.grid}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`${styles.card} ${selected.includes(cat.id) ? styles.selected : ''}`}
          onClick={() => toggle(cat.id)}
        >
          <span className={styles.name}>{cat.name}</span>
          <span className={styles.count}>{cat.words.length} słów</span>
        </button>
      ))}
    </div>
  )
}
