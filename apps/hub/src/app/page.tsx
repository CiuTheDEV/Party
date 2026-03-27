'use client'

import { useState } from 'react'
import { Topbar, GameCard } from '@party/ui'
import { PremiumModal } from '@/components/PremiumModal/PremiumModal'
import { games } from '@/data/games'
import styles from './page.module.css'

export default function HomePage() {
  const [showPremium, setShowPremium] = useState(false)

  return (
    <>
      <Topbar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Wybierz gr&#281;</h1>
        <div className={styles.grid}>
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPremiumClick={() => setShowPremium(true)}
            />
          ))}
        </div>
      </main>
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </>
  )
}
