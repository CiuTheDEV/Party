'use client'

import { useEffect } from 'react'
import type { Card } from '../shared/codenames-events'
import { BoardGrid } from './BoardGrid'
import {
  BOARD_KEY_OVERLAY_DEFAULT_VARIANT,
} from './board-key-overlay-variants'
import type { BoardKeyStats } from './board-key-stats'
import styles from './BoardKeyOverlay.module.css'

type Team = {
  name: string
  avatar: string
}

type Props = {
  mode: 'reveal' | 'review'
  cards: Card[]
  startingTeam: 'red' | 'blue' | null
  redTeam: Team
  blueTeam: Team
  stats: BoardKeyStats
  onClose?: () => void
}

export function BoardKeyOverlay({ mode, cards, startingTeam, redTeam, blueTeam, stats, onClose }: Props) {
  useEffect(() => {
    if (!onClose) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const winnerLabel = stats.winner === 'red' ? redTeam.name : stats.winner === 'blue' ? blueTeam.name : 'Brak'
  const assassinLabel =
    stats.assassinTeam === 'red'
      ? `Trafiony przez ${redTeam.name}`
      : stats.assassinTeam === 'blue'
        ? `Trafiony przez ${blueTeam.name}`
        : 'Nie trafiono'
  const startingTeamLabel =
    startingTeam === 'red' ? redTeam.name : startingTeam === 'blue' ? blueTeam.name : 'Brak'
  const eyebrowLabel = mode === 'reveal' ? 'Koniec rundy' : 'Klucz planszy'
  const titleLabel = mode === 'reveal' ? 'Pełny klucz' : 'Pełny układ'
  const assassinMeta =
    stats.assassinTeam === 'red'
      ? 'Czerwoni zakończyli rundę na zabójcy'
      : stats.assassinTeam === 'blue'
        ? 'Niebiescy zakończyli rundę na zabójcy'
        : `${stats.assassinTotal} karta zabójcy na planszy`
  const startMeta = `${stats.neutralTotal} neutralnych • ${stats.assassinTotal} zabójca`

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Klucz planszy">
      <div className={styles.shell} data-mode={mode} data-variant={BOARD_KEY_OVERLAY_DEFAULT_VARIANT}>
        <div className={styles.topbar}>
          <div className={styles.header}>
            <span className={styles.eyebrow}>{eyebrowLabel}</span>
            <h2 className={styles.title}>{titleLabel}</h2>
          </div>

          <div className={styles.topbarActions}>
            {onClose ? (
              <button type="button" className={styles.closeButton} onClick={onClose}>
                Zamknij klucz
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.content} data-mode={mode}>
          <section className={styles.boardPanel} aria-label="Pełna plansza odpowiedzi">
            <div className={styles.boardStage}>
              <div className={styles.boardWrap}>
                <BoardGrid
                  cards={cards}
                  onReveal={() => undefined}
                  isLocked
                  isConcealed={false}
                  revealAll
                  displayMode="review"
                  startingTeam={startingTeam}
                  highlightedIndex={stats.lastRevealedIndex}
                  showAssassinMarker
                  dimRevealedCards
                />
              </div>
            </div>
          </section>

          <aside className={styles.infoRail} aria-label="Statystyki rundy">
            <div className={styles.infoSegment} data-tone="red">
              <span className={styles.infoLabel}>{redTeam.name}</span>
              <strong className={styles.infoValue}>{stats.redRevealed}/{stats.redTotal}</strong>
              <span className={styles.infoMeta}>odkryte czerwone karty</span>
            </div>

            <div className={styles.infoSegment} data-tone="blue">
              <span className={styles.infoLabel}>{blueTeam.name}</span>
              <strong className={styles.infoValue}>{stats.blueRevealed}/{stats.blueTotal}</strong>
              <span className={styles.infoMeta}>odkryte niebieskie karty</span>
            </div>

            <div className={styles.infoSegment}>
              <span className={styles.infoLabel}>Wygrali</span>
              <strong className={styles.infoText}>{winnerLabel}</strong>
              <span className={styles.infoMeta}>wynik tej rundy</span>
            </div>

            <div className={styles.infoSegment}>
              <span className={styles.infoLabel}>Zabójca</span>
              <strong className={styles.infoText}>{assassinLabel}</strong>
              <span className={styles.infoMeta}>{assassinMeta}</span>
            </div>

            <div className={styles.infoSegment}>
              <span className={styles.infoLabel}>Start</span>
              <strong className={styles.infoText}>{startingTeamLabel}</strong>
              <span className={styles.infoMeta}>{startMeta}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
