'use client'

import type { Card } from '../shared/codenames-events'
import styles from './BoardGrid.module.css'

type BoardGridProps = {
  cards: Card[]
  onReveal: (index: number) => void
}

export function BoardGrid({ cards, onReveal }: BoardGridProps) {
  return (
    <div className={styles.grid}>
      {cards.map((card, i) => (
        <button
          key={i}
          className={`${styles.card} ${card.revealed ? styles.revealed : ''}`}
          data-color={card.color}
          onClick={() => !card.revealed && onReveal(i)}
          disabled={card.revealed}
        >
          {card.word}
        </button>
      ))}
    </div>
  )
}
