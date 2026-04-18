'use client'

import { AvatarAsset } from '@party/ui'
import { useRef } from 'react'
import type { Card } from '../shared/codenames-events'
import { useRoundBoardRevealAnimation } from '../shared/useRoundBoardRevealAnimation'
import styles from './CaptainGrid.module.css'

type CaptainGridProps = {
  cards: Card[]
  startingTeam?: 'red' | 'blue' | null
  isLocked?: boolean
}

export function CaptainGrid({ cards, startingTeam = null, isLocked = false }: CaptainGridProps) {
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
    <div ref={rootRef} className={styles.gridShell}>
      <div className={styles.sheen} data-round-sheen aria-hidden="true" />
      <div className={styles.grid} data-round-board>
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${styles.card} ${card.revealed ? styles.revealed : ''}`}
            data-color={card.color}
            data-round-index={index}
            data-round-card
          >
            <span className={styles.cardInner} data-round-card-inner>
              <span className={`${styles.cardFace} ${styles.cardBack}`} aria-hidden="true">
                <span className={styles.cardBackMark} />
              </span>
              <span className={`${styles.cardFace} ${styles.cardFront}`}>
                <span className={`${styles.word} ${card.revealed ? styles.strikethrough : ''}`}>{card.word}</span>
                {card.color === 'assassin' ? (
                  <span className={styles.assassinMark} aria-hidden="true">
                    <AvatarAsset avatar="skull" variant="animated" size={18} />
                  </span>
                ) : null}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
