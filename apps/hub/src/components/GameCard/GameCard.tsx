'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Game } from '@/data/games'
import { PremiumModal } from '@/components/PremiumModal/PremiumModal'
import styles from './GameCard.module.css'

type GameCardProps = {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const [showModal, setShowModal] = useState(false)

  if (game.isPremium) {
    return (
      <>
        <button
          className={styles.card}
          style={{ '--card-glow-color': game.color + '4d' } as React.CSSProperties}
          onClick={() => setShowModal(true)}
          aria-label={`${game.name} — treść premium`}
        >
          <div className={styles.icon} aria-hidden="true">{game.icon}</div>
          <div className={styles.name}>{game.name}</div>
          <div className={styles.description}>{game.description}</div>
          <div className={styles.badges}>
            <span className={styles.badge}>{game.minPlayers}–{game.maxPlayers} graczy</span>
            <span className={`${styles.badge} ${styles.premiumBadge}`}>Premium</span>
          </div>
          <div className={styles.premiumOverlay} aria-hidden="true">🔒</div>
        </button>
        {showModal && <PremiumModal onClose={() => setShowModal(false)} />}
      </>
    )
  }

  return (
    <Link
      href={game.href}
      className={styles.card}
      style={{ '--card-glow-color': game.color + '4d' } as React.CSSProperties}
    >
      <div className={styles.icon} aria-hidden="true">{game.icon}</div>
      <div className={styles.name}>{game.name}</div>
      <div className={styles.description}>{game.description}</div>
      <div className={styles.badges}>
        <span className={styles.badge}>{game.minPlayers}–{game.maxPlayers} graczy</span>
      </div>
    </Link>
  )
}
