'use client'

import { ChevronDown, LibraryBig } from 'lucide-react'
import { useState } from 'react'
import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CodenamesSetupHelpers } from '../helpers'
import type { CodenamesSetupState } from '../state'
import styles from './CategoriesSection.module.css'

export function CategoriesSection({
  state,
  updateState,
  helpers,
}: GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>) {
  const [open, setOpen] = useState(false)

  const selectedLabels = helpers.categories
    .filter((category) => state.selectedCategories[category.id])
    .map((category) => category.name)

  const summaryText = selectedLabels.length > 0 ? `Wybrane: ${selectedLabels.join(', ')}` : 'Wybrane: brak'

  function toggle(id: string) {
    updateState((current) => {
      const next = { ...current.selectedCategories }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = true
      }
      return { ...current, selectedCategories: next }
    })
  }

  return (
    <section className={styles.section}>
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
          <div className={styles.categoryList}>
            {helpers.categories.map((category) => {
              const isSelected = Boolean(state.selectedCategories[category.id])
              return (
                <button
                  key={category.id}
                  type="button"
                  className={isSelected ? `${styles.categoryCard} ${styles.categoryCardActive}` : styles.categoryCard}
                  onClick={() => toggle(category.id)}
                >
                  <div className={styles.categoryMeta}>
                    <span className={styles.categoryName}>{category.name}</span>
                    <span className={styles.categoryDescription}>{category.description}</span>
                    <span className={styles.categoryCount}>{category.words.length} haseł</span>
                  </div>
                  <span className={styles.categoryCheck} aria-hidden="true">
                    {isSelected ? '\u2713' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}
