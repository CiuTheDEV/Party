'use client'

import { AvatarAsset } from '@party/ui'
import { useRef } from 'react'
import type { Card } from '../shared/codenames-events'
import { useRoundBoardRevealAnimation } from '../shared/useRoundBoardRevealAnimation'
import styles from './BoardGrid.module.css'

type BoardGridProps = {
  cards: Card[]
  onReveal: (index: number) => void
  isLocked?: boolean
  isConcealed?: boolean
  revealAll?: boolean
  displayMode?: 'default' | 'review'
  startingTeam?: 'red' | 'blue' | null
  selectedIndex?: number | null
  selectedActionLabel?: string | null
  isFocusVisible?: boolean
  highlightedIndex?: number | null
  showAssassinMarker?: boolean
  dimRevealedCards?: boolean
}

export function BoardGrid({
  cards,
  onReveal,
  isLocked = false,
  isConcealed = false,
  revealAll = false,
  displayMode = 'default',
  startingTeam = null,
  selectedIndex = null,
  selectedActionLabel = null,
  isFocusVisible = false,
  highlightedIndex = null,
  showAssassinMarker = false,
  dimRevealedCards = false,
}: BoardGridProps) {
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
    <div
      ref={rootRef}
      className={`${styles.shell} ${isConcealed ? styles.concealed : ''}`}
      data-display-mode={displayMode}
    >
      <div className={styles.sheen} data-round-sheen aria-hidden="true" />
      <div className={styles.grid} data-round-board>
        {cards.map((card, i) => (
          <button
            key={i}
            className={`${styles.card} ${card.revealed ? styles.revealed : ''}`}
            data-color={card.color}
            data-selected={selectedIndex === i ? 'true' : 'false'}
            data-focused={selectedIndex === i && isFocusVisible ? 'true' : 'false'}
            data-dim-revealed={dimRevealedCards ? 'true' : 'false'}
            data-highlighted={highlightedIndex === i ? 'true' : 'false'}
            data-face-visible={card.revealed || revealAll ? 'true' : 'false'}
            data-round-index={i}
            data-round-card
            aria-current={selectedIndex === i ? 'true' : undefined}
            onClick={() => !card.revealed && !revealAll && !isLocked && !isConcealed && onReveal(i)}
            disabled={card.revealed || revealAll || isLocked || isConcealed}
          >
            <span className={styles.cardInner} data-round-card-inner>
              <span className={`${styles.cardFace} ${styles.cardBack}`} aria-hidden="true" />
              <span className={`${styles.cardFace} ${styles.cardFront}`}>
                <span className={styles.cardWord}>{card.word}</span>
                {showAssassinMarker && card.color === 'assassin' ? (
                  <span className={styles.assassinMark} aria-hidden="true">
                    <AvatarAsset avatar="skull" variant="animated" size={18} />
                  </span>
                ) : null}
                {!card.revealed && !revealAll && selectedActionLabel ? (
                  <span className={styles.cardActionBadge} aria-hidden="true">
                    <span className={styles.cardActionBadgeLabel}>{selectedActionLabel}</span>
                  </span>
                ) : null}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
