'use client'

import { useCaptainGame } from './useCaptainGame'
import { CaptainGrid } from './CaptainGrid'
import styles from './CaptainScreen.module.css'

type CaptainScreenProps = {
  roomId: string
  team: 'red' | 'blue'
}

export function CaptainScreen({ roomId, team }: CaptainScreenProps) {
  const { roomState } = useCaptainGame({ roomId, team })

  const teamLabel = team === 'red' ? 'Czerwoni' : 'Niebiescy'
  const teamClass = team === 'red' ? styles.teamRed : styles.teamBlue

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={`${styles.teamName} ${teamClass}`}>{teamLabel}</h1>
        <p className={styles.role}>Klucz kapitana</p>
      </div>

      {roomState.cards.length === 0 ? (
        <div className={styles.waiting}>Czekam na start gry...</div>
      ) : (
        <CaptainGrid cards={roomState.cards} />
      )}
    </div>
  )
}
