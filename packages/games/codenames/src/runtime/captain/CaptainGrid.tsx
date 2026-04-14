'use client'

import type { Card } from '../shared/codenames-events'
import styles from './CaptainGrid.module.css'

type CaptainGridProps = {
  cards: Card[]
}

export function CaptainGrid({ cards }: CaptainGridProps) {
  return (
    <div className={styles.grid}>
      {cards.map((card, i) => (
        <div
          key={i}
          className={`${styles.card} ${card.revealed ? styles.revealed : ''}`}
          data-color={card.color}
        >
          <span className={`${styles.word} ${card.revealed ? styles.strikethrough : ''}`}>
            {card.word}
          </span>
        </div>
      ))}
    </div>
  )
}
