'use client'

import { AvatarAsset } from '@party/ui'
import styles from './RoundIntroOverlay.module.css'

export const ROUND_INTRO_DURATION_MS = 2400

type RoundIntroOverlayProps = {
  roundNumber: number
  startingTeam: 'red' | 'blue'
  startingTeamLabel: string
  startingTeamAvatar: string
}

export function RoundIntroOverlay({
  roundNumber,
  startingTeam,
  startingTeamLabel,
  startingTeamAvatar,
}: RoundIntroOverlayProps) {
  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label="Start rundy">
      <div className={styles.glow} data-team={startingTeam} aria-hidden="true" />

      <section className={styles.panel}>
        <div className={styles.roundBadge}>
          <span className={styles.roundBadgeLabel}>RUNDA</span>
          <strong className={styles.roundBadgeValue}>{roundNumber}</strong>
        </div>

        <div className={styles.heroRow}>
          <div className={styles.teamOrb} data-team={startingTeam} aria-hidden="true">
            <AvatarAsset avatar={startingTeamAvatar} size={72} />
          </div>

          <div className={styles.copyBlock}>
            <span className={styles.eyebrow}>ZACZYNAJĄ</span>
            <h1 className={styles.title} data-team={startingTeam}>
              {startingTeamLabel}
            </h1>
            <p className={styles.subtitle}>Plansza odblokuje się za chwilę.</p>
          </div>
        </div>

        <div className={styles.footerPill} data-team={startingTeam}>
          start rundy
        </div>
      </section>
    </div>
  )
}
