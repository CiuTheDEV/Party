'use client'

import { AutoscaledWord } from '../shared/AutoscaledWord'
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

function getRevealWordSizing(word: string) {
  const normalized = word.trim()
  const wordCount = normalized.split(/\s+/).filter(Boolean).length
  const length = normalized.length

  if (wordCount <= 1) {
    return {
      wrapMode: 'nowrap' as const,
      minFontSize: length > 14 ? 42 : 58,
      maxFontSize: length > 14 ? 120 : 164,
    }
  }

  if (wordCount === 2) {
    return {
      wrapMode: 'balance' as const,
      minFontSize: 40,
      maxFontSize: 120,
    }
  }

  return {
    wrapMode: 'balance' as const,
    minFontSize: length > 26 ? 26 : 32,
    maxFontSize: length > 26 ? 82 : 96,
  }
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
  const revealSizing = getRevealWordSizing(word)
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
          <AutoscaledWord
            text={word}
            className={styles.wordScaleRoot}
            textClassName={styles.word}
            wrapMode={revealSizing.wrapMode}
            minFontSize={revealSizing.minFontSize}
            maxFontSize={revealSizing.maxFontSize}
          />
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
