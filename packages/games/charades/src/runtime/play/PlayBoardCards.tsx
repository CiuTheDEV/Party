import { AvatarAsset } from '@party/ui'
import styles from './PlayBoard.module.css'
import type { PlayerSummary } from './playboard-types'

export function SettledCard({
  player,
  index,
  isActive,
}: {
  player: PlayerSummary | undefined
  index: number
  isActive: boolean
}) {
  return (
    <div className={isActive ? styles.orderCardSettledActive : styles.orderCardSettled}>
      <div className={styles.orderCardInner}>
        <div className={styles.orderCardBack}>
          <CardBack branded />
        </div>
        <div className={styles.orderCardFront}>
          <span className={styles.orderIndex}>{index + 1}</span>
          <AvatarAsset avatar={player?.avatar} className={styles.orderAvatar} />
          <span className={styles.namePill} data-gender={player?.gender ?? 'none'}>
            {player?.name ?? 'Brak gracza'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function CardBack({ branded = false }: { branded?: boolean }) {
  return (
    <div className={styles.cardBackFace}>
      <span className={styles.cardBackCorner}>{branded ? 'K' : ''}</span>
      <div className={styles.cardBackCenter}>
        {branded ? <span className={styles.cardBackLabel}>Kalambury</span> : null}
      </div>
      <span className={styles.cardBackCorner}>{branded ? 'K' : ''}</span>
    </div>
  )
}

export function PresenterCard({
  presenter,
  subtitle,
  compact = false,
  featured = false,
}: {
  presenter: PlayerSummary | undefined
  subtitle: string
  compact?: boolean
  featured?: boolean
}) {
  return (
    <div
      className={
        compact ? styles.presenterCardCompact : featured ? styles.presenterCardFeatured : styles.presenterCard
      }
    >
      <span className={featured ? styles.presenterBadgeFeatured : styles.presenterSubtitle}>{subtitle}</span>
      <AvatarAsset
        avatar={presenter?.avatar}
        variant={featured ? 'animated' : 'static'}
        className={featured ? styles.presenterAvatarFeatured : styles.presenterAvatar}
      />
      <div className={styles.presenterMeta}>
        <span
          className={featured ? styles.presenterNamePill : styles.presenterName}
          data-gender={presenter?.gender ?? 'none'}
        >
          {presenter?.name ?? 'Brak gracza'}
        </span>
      </div>
    </div>
  )
}
