'use client'

import { useRef } from 'react'
import type { Card } from '../shared/codenames-events'
import { useRoundBoardRevealAnimation } from '../shared/useRoundBoardRevealAnimation'
import styles from './BoardGrid.module.css'

type BoardGridProps = {
  cards: Card[]
  onReveal: (index: number) => void
  isLocked?: boolean
  startingTeam?: 'red' | 'blue' | null
}

export function BoardGrid({ cards, onReveal, isLocked = false, startingTeam = null }: BoardGridProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const boardKey = cards.map((card) => card.word).join('|')

  useRoundBoardRevealAnimation({
    scopeRef: rootRef,
    cards,
    boardKey,
    startingTeam,
    enabled: !isLocked && cards.length > 0,
  })

  return (
    <div ref={rootRef} className={styles.shell}>
      <div className={styles.sheen} data-round-sheen aria-hidden="true" />
      <div className={styles.grid} data-round-board>
        {cards.map((card, i) => (
          <button
            key={i}
            className={`${styles.card} ${card.revealed ? styles.revealed : ''}`}
            data-color={card.color}
            data-round-card
            onClick={() => !card.revealed && !isLocked && onReveal(i)}
            disabled={card.revealed || isLocked}
          >
            {card.word}
          </button>
        ))}
      </div>
    </div>
  )
}
