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

  const redRevealed = roomState.cards.filter((c) => c.color === 'red' && c.revealed).length
  const blueRevealed = roomState.cards.filter((c) => c.color === 'blue' && c.revealed).length
  const redRemaining = roomState.redTotal - redRevealed
  const blueRemaining = roomState.blueTotal - blueRevealed

  const bothConnected = roomState.captainRedConnected && roomState.captainBlueConnected
  const noneConnected = !roomState.captainRedConnected && !roomState.captainBlueConnected

  const connectionLabel = bothConnected
    ? 'Obaj kapitanowie połączeni'
    : noneConnected
      ? 'Czekam na kapitanów...'
      : roomState.captainRedConnected
        ? 'Czekam na niebieskiego kapitana...'
        : 'Czekam na czerwonego kapitana...'

  if (roomState.phase === 'ended') {
    const isRedWinner = roomState.winner === 'red'
    return (
      <div className={styles.screen}>
        <div className={styles.endScreen}>
          <p className={`${styles.winnerText} ${isRedWinner ? styles.winnerRed : styles.winnerBlue}`}>
            {isRedWinner ? 'Czerwoni wygrali!' : 'Niebiescy wygrali!'}
          </p>
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

      {/* Top bar */}
      <div className={styles.topbar}>
        <div className={styles.teamLeft}>
          <div className={styles.teamDot} data-team="red" />
          <span className={styles.teamLabel} data-team="red">CZERWONI</span>
        </div>

        <div className={styles.topCenter}>
          <div className={`${styles.connectionBadge} ${bothConnected ? styles.connected : styles.disconnected}`}>
            <span className={styles.connectionDot} />
            <span className={styles.connectionLabel}>{connectionLabel}</span>
          </div>
          <div className={styles.counters}>
            <span className={styles.counter} data-team="red">{redRemaining}</span>
            <span className={styles.counterSep}>:</span>
            <span className={styles.counter} data-team="blue">{blueRemaining}</span>
          </div>
        </div>

        <div className={styles.teamRight}>
          <span className={styles.teamLabel} data-team="blue">NIEBIESCY</span>
          <div className={styles.teamDot} data-team="blue" />
        </div>
      </div>

      {/* Board */}
      <div className={styles.boardWrapper}>
        <BoardGrid cards={roomState.cards} onReveal={revealCard} />
      </div>

      {/* Bottom bar */}
      <div className={styles.bottombar}>
        <div className={styles.avatarRow}>
          {Array.from({ length: roomState.redTotal }).map((_, i) => {
            const isRevealed = i < redRevealed
            return (
              <div
                key={i}
                className={`${styles.avatar} ${isRevealed ? styles.avatarRevealed : ''}`}
                data-team="red"
              >
                <span className={styles.avatarNum}>{roomState.redTotal - i}</span>
              </div>
            )
          })}
        </div>

        <div className={styles.startingTeam}>
          {roomState.startingTeam && (
            <>
              <span className={styles.startingLabel}>Zaczynają:</span>
              <span
                className={styles.startingTeamName}
                data-team={roomState.startingTeam}
              >
                {roomState.startingTeam === 'red' ? 'CZERWONI' : 'NIEBIESCY'}
              </span>
            </>
          )}
        </div>

        <div className={styles.avatarRow}>
          {Array.from({ length: roomState.blueTotal }).map((_, i) => {
            const isRevealed = i < blueRevealed
            return (
              <div
                key={i}
                className={`${styles.avatar} ${isRevealed ? styles.avatarRevealed : ''}`}
                data-team="blue"
              >
                <span className={styles.avatarNum}>{roomState.blueTotal - i}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
