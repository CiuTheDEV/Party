'use client'

import { AvatarAsset } from '@party/ui'
import { useRef } from 'react'
import { CodenamesCardBackMark } from '../shared/codenames-card-back'
import type { Card } from '../shared/codenames-events'
import { useRoundBoardRevealAnimation } from '../shared/useRoundBoardRevealAnimation'
import cardBackStyles from '../shared/CodenamesCardBackMark.module.css'
import styles from './CaptainGrid.module.css'

type CaptainGridProps = {
  cards: Card[]
  startingTeam?: 'red' | 'blue' | null
  isLocked?: boolean
  isConcealed?: boolean
}

export function CaptainGrid({ cards, startingTeam = null, isLocked = false, isConcealed = false }: CaptainGridProps) {
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
    <div ref={rootRef} className={`${styles.gridShell} ${isConcealed ? styles.concealed : ''}`}>
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
