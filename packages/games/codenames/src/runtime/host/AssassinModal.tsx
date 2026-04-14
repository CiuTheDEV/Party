'use client'

import styles from './AssassinModal.module.css'

type AssassinModalProps = {
  onSelectTeam: (team: 'red' | 'blue') => void
}

export function AssassinModal({ onSelectTeam }: AssassinModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Trafiono zabojce!</h2>
        <p className={styles.subtitle}>Ktora druzyna trafila zabojce?</p>
        <div className={styles.buttons}>
          <button className={`${styles.btn} ${styles.btnRed}`} onClick={() => onSelectTeam('red')}>
            Czerwoni
          </button>
          <button className={`${styles.btn} ${styles.btnBlue}`} onClick={() => onSelectTeam('blue')}>
            Niebiescy
          </button>
        </div>
      </div>
    </div>
  )
}
