'use client'

import Link from 'next/link'
import type { GameConfig } from '@party/game-sdk'
import styles from './GameCard.module.css'

type GameCardProps = {
  game: GameConfig
  onPremiumClick?: () => void
}

export function GameCard({ game, onPremiumClick }: GameCardProps) {
  const gradient = game.gradient ?? `linear-gradient(135deg, ${game.color}88, ${game.color})`

  if (game.isPremium) {
    return (
      <button className={styles.card} onClick={onPremiumClick} aria-label={`${game.name} — Premium`}>
        <div className={styles.hero} style={{ background: gradient, opacity: 0.4 }}>
          <span className={styles.heroIcon}>🔒</span>
        </div>
        <div className={styles.body}>
          <div className={styles.name}>{game.name}</div>
          <div className={styles.description}>{game.description}</div>
          <div className={styles.meta}>
            <span className={styles.players}>{game.minPlayers}–{game.maxPlayers} graczy</span>
            <span className={styles.premiumBadge}>Premium</span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <Link href={game.href} className={styles.card}>
      <div className={styles.hero} style={{ background: gradient }}>
        <span className={styles.heroIcon}>{game.icon}</span>
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{game.name}</div>
        <div className={styles.description}>{game.description}</div>
        <div className={styles.meta}>
          <span className={styles.players}>{game.minPlayers}–{game.maxPlayers} graczy</span>
          <span className={styles.playBtn}>Zagraj →</span>
        </div>
      </div>
    </Link>
  )
}
