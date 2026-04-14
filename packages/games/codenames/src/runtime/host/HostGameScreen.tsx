'use client'

import { useHostGame } from './useHostGame'
import { BoardGrid } from './BoardGrid'
import { AssassinModal } from './AssassinModal'
import styles from './HostGameScreen.module.css'

type HostGameScreenProps = {
  roomId: string
  wordPool: string[]
}

export function HostGameScreen({ roomId, wordPool }: HostGameScreenProps) {
  const { roomState, revealCard, setAssassinTeam, resetGame } = useHostGame({ roomId, wordPool })

  const redRemaining = roomState.redTotal - roomState.cards.filter((c) => c.color === 'red' && c.revealed).length
  const blueRemaining = roomState.blueTotal - roomState.cards.filter((c) => c.color === 'blue' && c.revealed).length

  if (roomState.phase === 'ended') {
    const winnerLabel = roomState.winner === 'red' ? 'Czerwoni wygrali!' : 'Niebiescy wygrali!'
    const winnerClass = roomState.winner === 'red' ? styles.winnerRed : styles.winnerBlue

    return (
      <div className={styles.screen}>
        <div className={styles.endScreen}>
          <p className={`${styles.winnerText} ${winnerClass}`}>{winnerLabel}</p>
          <button className={styles.resetBtn} onClick={resetGame}>
            Zagraj ponownie
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      {roomState.phase === 'assassin-reveal' && (
        <AssassinModal onSelectTeam={setAssassinTeam} />
      )}

      <div className={styles.scores}>
        <span className={styles.scoreRed}>Czerwoni: {redRemaining} pozostalo</span>
        <span className={styles.scoreBlue}>Niebiescy: {blueRemaining} pozostalo</span>
      </div>

      <div className={styles.boardWrapper}>
        <BoardGrid cards={roomState.cards} onReveal={revealCard} />
      </div>
    </div>
  )
}
