'use client'

import styles from './PresenterPhaseReveal.module.css'

type PresenterPhaseRevealProps = {
  word: string
  category: string
  difficulty: 'easy' | 'hard' | ''
  revealRemaining: number
  revealDuration: number
}

export function PresenterPhaseReveal({
  word,
  category,
  difficulty,
  revealDuration: _revealDuration,
  revealRemaining: _revealRemaining,
}: PresenterPhaseRevealProps) {
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

      <button className={styles.revealMetaCard} type="button" aria-disabled="true">
        <span className={styles.changeButtonLabel}>Zmień hasło</span>
      </button>
    </div>
  )
}
