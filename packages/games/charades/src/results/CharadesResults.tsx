'use client'

import type { GameResultsProps } from '@party/game-sdk'
import styles from './CharadesResults.module.css'
import { Podium } from './Podium'
import type { CharadesResultPlayer } from './types'

type Props = GameResultsProps & {
  players: CharadesResultPlayer[]
}

export function CharadesResults({ players, onPlayAgain, onBackToMenu }: Props) {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Finał gry</p>
        <h1 className={styles.title}>Wyniki kalamburów</h1>
      </div>

      <section className={styles.resultsPanel}>
        <Podium players={players} />
      </section>

      <div className={styles.actions}>
        <button type="button" className={styles.againBtn} onClick={onPlayAgain}>
          Zagraj jeszcze raz
        </button>
        <button type="button" className={styles.menuBtn} onClick={onBackToMenu}>
          Wróć do menu
        </button>
      </div>
    </main>
  )
}
