'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Podium } from '../../../../components/charades/Podium/Podium'
import type { Player } from '../../../../hooks/charades/useGameState'
import styles from './page.module.css'

export default function CharadesResultsPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    const raw = sessionStorage.getItem('charades:results')
    if (!raw) { router.replace('/games/charades'); return }
    setPlayers(JSON.parse(raw))
  }, [router])

  function handlePlayAgain() {
    sessionStorage.removeItem('charades:results')
    // config pozostaje — /play ją odczyta i wysłe GAME_RESET
    router.push('/games/charades/play')
  }

  function handleBackToMenu() {
    sessionStorage.removeItem('charades:config')
    sessionStorage.removeItem('charades:results')
    router.push('/games/charades')
  }

  if (players.length === 0) return null

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Wyniki</h1>
      <Podium players={players} />
      <div className={styles.actions}>
        <button className={styles.againBtn} onClick={handlePlayAgain}>
          Zagraj jeszcze raz
        </button>
        <button className={styles.menuBtn} onClick={handleBackToMenu}>
          Wróć do menu
        </button>
      </div>
    </main>
  )
}
