'use client'

import { QRCodeSVG } from 'qrcode.react'
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

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const captainRedUrl = `${origin}/games/codenames/captain?room=${roomId}&team=red`
  const captainBlueUrl = `${origin}/games/codenames/captain?room=${roomId}&team=blue`

  const redRemaining = roomState.redTotal - roomState.cards.filter((c) => c.color === 'red' && c.revealed).length
  const blueRemaining = roomState.blueTotal - roomState.cards.filter((c) => c.color === 'blue' && c.revealed).length

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url).catch(() => {})
  }

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

      <div className={styles.main}>
        <div className={styles.scores}>
          <span className={styles.scoreRed}>Czerwoni: {redRemaining} pozostalo</span>
          <span className={styles.scoreBlue}>Niebiescy: {blueRemaining} pozostalo</span>
        </div>

        <div className={styles.boardWrapper}>
          <BoardGrid
            cards={roomState.cards}
            onReveal={revealCard}
          />
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.captainSection}>
          <div className={styles.captainLabel}>
            <span className={`${styles.dot} ${roomState.captainRedConnected ? styles.dotConnected : ''}`} />
            Kapitan Czerwonych
          </div>
          <button className={styles.captainUrl} onClick={() => copyToClipboard(captainRedUrl)} title="Kliknij aby skopiowac">
            {captainRedUrl}
          </button>
          <div className={styles.qrWrapper}>
            <QRCodeSVG value={captainRedUrl} size={100} bgColor="transparent" fgColor="#fff" />
          </div>
        </div>

        <div className={styles.captainSection}>
          <div className={styles.captainLabel}>
            <span className={`${styles.dot} ${roomState.captainBlueConnected ? styles.dotConnected : ''}`} />
            Kapitan Niebieskich
          </div>
          <button className={styles.captainUrl} onClick={() => copyToClipboard(captainBlueUrl)} title="Kliknij aby skopiowac">
            {captainBlueUrl}
          </button>
          <div className={styles.qrWrapper}>
            <QRCodeSVG value={captainBlueUrl} size={100} bgColor="transparent" fgColor="#fff" />
          </div>
        </div>
      </div>
    </div>
  )
}
