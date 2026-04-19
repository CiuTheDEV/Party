'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import { WordPoolManagerModal } from '@party/ui'
import { ChevronDown, LibraryBig } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { CodenamesSetupHelpers } from '../helpers'
import type { CodenamesSetupState } from '../state'
import styles from './CategoriesSection.module.css'

export function CategoriesSection({
  state,
  updateState,
  helpers,
}: GameSetupSectionComponentProps<CodenamesSetupState, CodenamesSetupHelpers>) {
  const [open, setOpen] = useState(false)
  const [isPoolManagerOpen, setIsPoolManagerOpen] = useState(false)

  const selectedLabels = helpers.categories
    .filter((category) => state.selectedCategories[category.id])
    .map((category) => category.name)

  const summaryText = selectedLabels.length > 0 ? `Wybrane: ${selectedLabels.join(', ')}` : 'Wybrane: brak'
  const poolSummaryText =
    helpers.poolSummary.total > 0
      ? `Pozostalo ${helpers.poolSummary.remaining}/${helpers.poolSummary.total} swiezych hasel`
      : 'Wybierz kategorie, aby zbudowac pule hasel'

  const categoryRows = useMemo(
    () =>
      helpers.categoryPoolSummaries
        .filter((summary) => summary.isSelected)
        .map((summary) => ({
          name: summary.name,
          pills: [`${summary.remaining}/${summary.total} swiezych hasel`],
          actionLabel: 'Resetuj',
          onAction: () => helpers.resetCategoryPoolHistory(summary.categoryId),
        })),
    [helpers.categoryPoolSummaries, helpers.resetCategoryPoolHistory],
  )

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

          <button type="button" className={styles.managementStrip} onClick={() => setIsPoolManagerOpen(true)}>
            {'Zarz\u0105dzaj pul\u0105 unikalnych hase\u0142'}
          </button>
        </div>
      ) : null}

      <WordPoolManagerModal
        open={isPoolManagerOpen}
        onClose={() => setIsPoolManagerOpen(false)}
        title={'Zarz\u0105dzaj pul\u0105 unikalnych hase\u0142'}
        description={
          'Tutaj sprawdzisz stan aktywnej puli i recznie wyczyscisz historie zuzytych plansz dla aktywnego wyboru kategorii.'
        }
        summaryTitle="Aktywna pula"
        summaryDescription={'Aktywna pula dla biezacego wyboru kategorii ma teraz tyle swiezych hasel:'}
        summaryValue={poolSummaryText}
        summaryActionLabel="Resetuj aktywne"
        onSummaryAction={helpers.resetActivePoolHistory}
        rowsTitle="Kategorie"
        rowsDescription="Aktywna pula buduje plansze tylko z aktualnie zaznaczonych kategorii. Kazda kategorie mozesz zresetowac osobno."
        rows={categoryRows}
        theme="game"
        footer={
          helpers.poolSummary.isExhausted ? (
            <p className={styles.poolWarning}>Za malo swiezych hasel na nowa plansze. Zresetuj potrzebne kategorie.</p>
          ) : null
        }
      />
    </section>
  )
}
