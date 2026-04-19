'use client'

import { useRef } from 'react'
import { CodenamesCardBackMark } from '../shared/codenames-card-back'
import type { Card } from '../shared/codenames-events'
import { useRoundBoardRevealAnimation } from '../shared/useRoundBoardRevealAnimation'
import cardBackStyles from '../shared/CodenamesCardBackMark.module.css'
import styles from './BoardGrid.module.css'

type BoardGridProps = {
  cards: Card[]
  onReveal: (index: number) => void
  isLocked?: boolean
  isConcealed?: boolean
  startingTeam?: 'red' | 'blue' | null
}

export function BoardGrid({ cards, onReveal, isLocked = false, isConcealed = false, startingTeam = null }: BoardGridProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const boardKey = cards.map((card) => card.word).join('|')

  useRoundBoardRevealAnimation({
    scopeRef: rootRef,
    cards,
    boardKey,
    startingTeam,
    enabled: !isLocked && !isConcealed && cards.length > 0,
  })

  return (
    <div ref={rootRef} className={`${styles.shell} ${isConcealed ? styles.concealed : ''}`}>
      <div className={styles.sheen} data-round-sheen aria-hidden="true" />
      <div className={styles.grid} data-round-board>
        {cards.map((card, i) => (
          <button
            key={i}
            className={`${styles.card} ${card.revealed ? styles.revealed : ''}`}
            data-color={card.color}
            data-round-index={i}
            data-round-card
            onClick={() => !card.revealed && !isLocked && !isConcealed && onReveal(i)}
            disabled={card.revealed || isLocked || isConcealed}
          >
            <span className={styles.cardInner} data-round-card-inner>
              <span className={`${styles.cardFace} ${styles.cardBack}`} aria-hidden="true">
                <CodenamesCardBackMark
                  rootClassName={cardBackStyles.root}
                  compactClassName={cardBackStyles.compact}
                  surfaceClassName={cardBackStyles.surface}
                  gridClassName={cardBackStyles.grid}
                  topMetaClassName={cardBackStyles.topMeta}
                  bottomMetaClassName={cardBackStyles.bottomMeta}
                  centerClassName={cardBackStyles.center}
                  badgeClassName={cardBackStyles.badge}
                  emojiClassName={cardBackStyles.emoji}
                  labelClassName={cardBackStyles.label}
                  density="compact"
                />
              </span>
              <span className={`${styles.cardFace} ${styles.cardFront}`}>
                <span className={styles.cardWord}>{card.word}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
