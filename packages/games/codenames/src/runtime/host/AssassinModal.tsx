'use client'

import { AvatarAsset } from '@party/ui'
import styles from './AssassinModal.module.css'

type AssassinModalProps = {
  redTeam: { name: string; avatar: string }
  blueTeam: { name: string; avatar: string }
  focusedTeam: 'red' | 'blue'
  confirmActionLabel?: string | null
  isFocusVisible?: boolean
  onSelectTeam: (team: 'red' | 'blue') => void
}

export function AssassinModal({
  redTeam,
  blueTeam,
  focusedTeam,
  confirmActionLabel = null,
  isFocusVisible = false,
  onSelectTeam,
}: AssassinModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.skull} aria-hidden="true">
          <AvatarAsset avatar="skull" variant="animated" size={124} />
        </div>
        <h2 className={styles.title}>ZABÓJCA!</h2>
        <p className={styles.subtitle}>Kto natknął się na zabójcę...</p>
        <p className={styles.question}>Która drużyna przegrała rundę?</p>

        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.btnRed} ${focusedTeam === 'red' && isFocusVisible ? styles.btnFocused : ''}`}
            onClick={() => onSelectTeam('red')}
          >
            <AvatarAsset avatar={redTeam.avatar} size={52} />
            <span className={styles.btnLabel}>{redTeam.name}</span>
            {focusedTeam === 'red' && isFocusVisible && confirmActionLabel ? (
              <span className={styles.actionBadge} aria-hidden="true">
                <span className={styles.actionBadgeLabel}>{confirmActionLabel}</span>
              </span>
            ) : null}
          </button>
          <button
            className={`${styles.btn} ${styles.btnBlue} ${focusedTeam === 'blue' && isFocusVisible ? styles.btnFocused : ''}`}
            onClick={() => onSelectTeam('blue')}
          >
            <AvatarAsset avatar={blueTeam.avatar} size={52} />
            <span className={styles.btnLabel}>{blueTeam.name}</span>
            {focusedTeam === 'blue' && isFocusVisible && confirmActionLabel ? (
              <span className={styles.actionBadge} aria-hidden="true">
                <span className={styles.actionBadgeLabel}>{confirmActionLabel}</span>
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </div>
  )
}
