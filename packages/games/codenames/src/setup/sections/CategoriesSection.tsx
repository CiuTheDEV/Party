'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import type { CodenamesSetupHelpers } from '../helpers'
import type { CodenamesSetupState } from '../state'
import styles from './CategoriesSection.module.css'

export function CategoriesSection({ state, updateState, helpers }: GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>) {
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
      <h3 className={styles.sectionTitle}>Kategorie</h3>
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
              <span className={styles.categoryName}>{category.name}</span>
              <span className={styles.categoryCount}>{category.words.length} haseł</span>
              <span className={styles.categoryCheck} aria-hidden="true">
                {isSelected ? '\u2713' : ''}
              </span>
            </button>
          )
        })}
      </div>
      {Object.keys(state.selectedCategories).length === 0 ? (
        <p className={styles.hint}>Wybierz przynajmniej jedną kategorię.</p>
      ) : null}
    </section>
  )
}
