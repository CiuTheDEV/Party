'use client'

import styles from './PresenterPhaseReveal.module.css'

type PresenterPhaseRevealProps = {
  word: string
  category: string
  difficulty: 'easy' | 'hard' | ''
  canChangeWord: boolean
  remainingWordChanges: number
  onChangeWord: () => boolean
  revealRemaining: number
  revealDuration: number
}

export function PresenterPhaseReveal({
  word,
  category,
  difficulty,
  canChangeWord,
  remainingWordChanges,
  onChangeWord,
  revealDuration: _revealDuration,
  revealRemaining: _revealRemaining,
}: PresenterPhaseRevealProps) {
  const isGloballyDisabled = !canChangeWord
  const isExhausted = canChangeWord && remainingWordChanges <= 0
  const isDisabled = !canChangeWord || remainingWordChanges <= 0
  const buttonLabel = isGloballyDisabled
    ? 'Zmień hasło'
    : isExhausted
      ? 'Brak dostępnych zmian'
      : `Zmień hasło (${remainingWordChanges})`

  return (
    <div className={styles.revealLayout}>
      <section className={styles.wordHeroCard}>
        <div className={styles.wordHeroTop}>
          <div className={styles.metaBlock}>
            <p className={styles.wordHeroLabel}>Karta hasła</p>
          </div>
          <div className={styles.badgeRow}>
            <span className={styles.categoryPill}>{category}</span>
            {difficulty ? (
              <span className={styles.difficultyPill} data-difficulty={difficulty}>
                {difficulty === 'easy' ? 'Łatwe' : 'Trudne'}
              </span>
            ) : null}
          </div>
        </div>
        <div className={styles.wordHero}>
          <div className={styles.word}>{word}</div>
        </div>
      </section>

      <button
        className={`${styles.revealMetaCard} ${isDisabled ? styles.revealMetaCardDisabled : ''}`}
        type="button"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        onClick={onChangeWord}
      >
        <span className={styles.changeButtonLabel}>{buttonLabel}</span>
      </button>
    </div>
  )
}
