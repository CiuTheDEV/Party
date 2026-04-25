'use client'

import type { GameSetupSectionComponentProps } from '@party/game-sdk'
import { WordPoolManagerModal } from '@party/ui'
import { ChevronDown, LibraryBig } from 'lucide-react'
import { useMemo, useState } from 'react'
import { resolveBoardSplit } from '../category-balance'
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
      ? `Pozostało ${helpers.poolSummary.remaining}/${helpers.poolSummary.total} świeżych haseł`
      : 'Wybierz kategorie, aby zbudować pulę haseł'

  const categoryRows = useMemo(
    () =>
      helpers.categoryPoolSummaries
        .filter((summary) => summary.isSelected)
        .map((summary) => ({
          name: summary.name,
          pills: [`${summary.remaining}/${summary.total} świeżych haseł`],
          actionLabel: 'Resetuj',
          onAction: () => helpers.resetCategoryPoolHistory(summary.categoryId),
        })),
    [helpers.categoryPoolSummaries, helpers.resetCategoryPoolHistory],
  )

  const balancedCategories = helpers.categories.filter((category) => state.selectedCategories[category.id])
  const activeBalancedPair = balancedCategories.length === 2 ? balancedCategories : null
  const activeCategoryBalance =
    activeBalancedPair &&
    state.categoryBalance?.leftCategoryId === activeBalancedPair[0]?.id &&
    state.categoryBalance?.rightCategoryId === activeBalancedPair[1]?.id
      ? state.categoryBalance
      : null
  const leftSharePercent = activeCategoryBalance?.leftSharePercent ?? 50
  const boardSplit = activeBalancedPair
    ? resolveBoardSplit({
        leftCategoryId: activeBalancedPair[0].id,
        rightCategoryId: activeBalancedPair[1].id,
        leftSharePercent,
      })
    : null

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

          {activeBalancedPair && boardSplit ? (
            <div className={styles.balanceCard}>
              <div className={styles.balanceHeader}>
                <span className={styles.balanceLabel}>Balans planszy</span>
                <strong className={styles.balanceSummary}>
                  {`Plansza: ${boardSplit.leftCount} ${activeBalancedPair[0].name} / ${boardSplit.rightCount} ${activeBalancedPair[1].name}`}
                </strong>
              </div>

              <div className={styles.balanceScaleLabels}>
                <span className={styles.balanceScaleLabel}>
                  <span className={styles.balanceCategoryName}>{activeBalancedPair[0].name}</span>
                  <span className={styles.balancePercent}>{leftSharePercent}%</span>
                </span>
                <span className={styles.balanceScaleLabel}>
                  <span className={styles.balanceCategoryName}>{activeBalancedPair[1].name}</span>
                  <span className={styles.balancePercent}>{100 - leftSharePercent}%</span>
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={leftSharePercent}
                className={styles.balanceSlider}
                aria-label={`Balans kategorii: ${activeBalancedPair[0].name} i ${activeBalancedPair[1].name}`}
                onChange={(event) => {
                  const nextLeftSharePercent = Number(event.target.value)

                  updateState((current) => ({
                    ...current,
                    categoryBalance: {
                      leftCategoryId: activeBalancedPair[0].id,
                      rightCategoryId: activeBalancedPair[1].id,
                      leftSharePercent: nextLeftSharePercent,
                    },
                  }))
                }}
              />
            </div>
          ) : null}

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
          'Tutaj sprawdzisz stan aktywnej puli i ręcznie wyczyścisz historię zużytych plansz dla aktywnego wyboru kategorii.'
        }
        summaryTitle="Aktywna pula"
        summaryDescription={'Aktywna pula dla bieżącego wyboru kategorii ma teraz tyle świeżych haseł:'}
        summaryValue={poolSummaryText}
        summaryActionLabel="Resetuj aktywne"
        onSummaryAction={helpers.resetActivePoolHistory}
        rowsTitle="Kategorie"
        rowsDescription="Aktywna pula buduje plansze tylko z aktualnie zaznaczonych kategorii. Każdą kategorię możesz zresetować osobno."
        rows={categoryRows}
        theme="game"
        footer={
          helpers.poolSummary.isExhausted ? (
            <p className={styles.poolWarning}>Za mało świeżych haseł na nową planszę. Zresetuj potrzebne kategorie.</p>
          ) : null
        }
      />
    </section>
  )
}
