'use client'

import { AlertDialog } from '@party/ui'
import { Check, CheckCheck, ChevronDown, Dices, Eraser, LibraryBig, LockKeyhole } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
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
  hasCategoryAccess: (categoryId: string) => boolean
  redeemActivationCode: (code: string) => Promise<void>
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
  hasCategoryAccess,
  redeemActivationCode,
}: Props) {
  const [open, setOpen] = useState(false)
  const [isPoolManagerOpen, setIsPoolManagerOpen] = useState(false)
  const [historyVersion, setHistoryVersion] = useState(0)
  const [poolResetTarget, setPoolResetTarget] = useState<PoolResetTarget | null>(null)
  const [lockedCategory, setLockedCategory] = useState<CharadesWordCategory | null>(null)
  const [activationCode, setActivationCode] = useState('')
  const [activationError, setActivationError] = useState<string | null>(null)
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)

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
    const availableCategories = categories.filter((category) => hasCategoryAccess(category.id))

    onChange(
      Object.fromEntries(
        availableCategories.map((category) => [category.id, ['easy', 'hard'] satisfies CharadesCategoryDifficulty[]]),
      ),
    )
  }

  function clearAll() {
    onChange({})
  }

  function selectRandom() {
    const availableCategories = categories.filter((category) => hasCategoryAccess(category.id))

    if (availableCategories.length === 0) {
      onChange({})
      return
    }

    const shuffled = [...availableCategories].sort(() => Math.random() - 0.5)
    const count = Math.max(1, Math.min(availableCategories.length, 4))
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

  function openActivationDialog(category: CharadesWordCategory) {
    setLockedCategory(category)
    setActivationCode('')
    setActivationError(null)
    setActivationSuccess(null)
  }

  async function handleActivationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!lockedCategory) {
      return
    }

    setActivationError(null)
    setActivationSuccess(null)
    setIsRedeeming(true)

    try {
      await redeemActivationCode(activationCode)
      setActivationSuccess('Kod zaakceptowany. Kategoria została odblokowana.')
      setActivationCode('')
      setTimeout(() => {
        setLockedCategory(null)
      }, 350)
    } catch (error) {
      setActivationError(error instanceof Error ? error.message : 'Nie udało się aktywować kodu.')
    } finally {
      setIsRedeeming(false)
    }
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
    .filter((category) => hasCategoryAccess(category.id) && (selected[category.id] ?? []).length > 0)
    .map((category) => category.name)

  const summaryText = selectedLabels.length > 0 ? `Wybrane: ${selectedLabels.join(', ')}` : 'Wybrane: brak'

  const activePoolStats = useMemo(() => {
    const prompts = buildPromptPool(categories.filter((category) => hasCategoryAccess(category.id)), selected)

    return {
      remaining: getRemainingUniqueWordCount(prompts, usedPromptKeys),
      total: getTotalUniqueWordCount(prompts),
    }
  }, [categories, hasCategoryAccess, selected, usedPromptKeys])

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
              const isLocked = !hasCategoryAccess(category.id)
              const mode = getModeForCategory(category.id)
              const cardClass =
                isLocked
                  ? styles.cardLocked
                  : mode === 'both'
                  ? styles.cardMixed
                  : mode === 'easy'
                    ? styles.cardEasy
                    : mode === 'hard'
                      ? styles.cardHard
                      : ''

              return (
                <div
                  key={category.id}
                  className={`${styles.card} ${cardClass} ${isLocked ? styles.cardLocked : mode ? styles.cardSelected : styles.cardUnselected}`}
                  aria-disabled={isLocked}
                  role={!isLocked && mode ? 'button' : undefined}
                  tabIndex={!isLocked && mode ? 0 : undefined}
                  onClick={() => {
                    if (!isLocked && mode) {
                      setCategoryMode(category.id, null)
                    }
                  }}
                  onKeyDown={(event) => {
                    if (isLocked || !mode) {
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
                    {isLocked ? (
                      <button
                        type="button"
                        className={styles.lockBadgeButton}
                        aria-label={`Otwórz kod aktywacyjny dla kategorii ${category.name}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          openActivationDialog(category)
                        }}
                      >
                        <span className={styles.lockBadge}>
                          <LockKeyhole size={14} />
                        </span>
                      </button>
                    ) : mode ? (
                      <span className={styles.selectedBadge}>
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className={styles.unselectedBadge} />
                    )}
                  </div>

                  {isLocked ? (
                    <span className={styles.lockedTag}>Zablokowana</span>
                  ) : (
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
                  )}
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
                {categories.filter((category) => hasCategoryAccess(category.id)).map((category) => {
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

      {lockedCategory ? (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setLockedCategory(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="charades-activation-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeading}>
                <h3 id="charades-activation-dialog-title" className={styles.modalTitle}>
                  {lockedCategory.name}
                </h3>
                <p className={styles.modalDescription}>
                  Ta kategoria jest zablokowana. Wpisz kod aktywacyjny, aby ją odblokować.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                aria-label="Zamknij okno aktywacji"
                onClick={() => setLockedCategory(null)}
              >
                Zamknij
              </button>
            </div>

            <form className={styles.unlockForm} onSubmit={handleActivationSubmit}>
              <label className={styles.unlockField}>
                <span className={styles.unlockLabel}>Kod aktywacyjny</span>
                <input
                  className={styles.unlockInput}
                  value={activationCode}
                  onChange={(event) => setActivationCode(event.target.value)}
                  autoComplete="off"
                  placeholder="KALAMBURY-START"
                  required
                />
              </label>

              <p className={styles.unlockNote}>
                Po odblokowaniu kategoria zniknie z listy zamkniętych i stanie się dostępna od razu.
              </p>

              {activationError ? <p className={styles.unlockError}>{activationError}</p> : null}
              {activationSuccess ? <p className={styles.unlockSuccess}>{activationSuccess}</p> : null}

              <div className={styles.unlockActions}>
                <button
                  type="button"
                  className={styles.unlockSecondaryButton}
                  onClick={() => setLockedCategory(null)}
                >
                  Anuluj
                </button>
                <button type="submit" className={styles.unlockPrimaryButton} disabled={isRedeeming}>
                  {isRedeeming ? 'Aktywuję...' : 'Odblokuj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
