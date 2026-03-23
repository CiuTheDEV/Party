import Link from 'next/link'
import styles from './Topbar.module.css'

type TopbarProps = {
  gameName?: string
}

export function Topbar({ gameName }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoMark} aria-hidden="true">🎮</span>
        <span className={styles.logoText}>
          <span className={styles.logoLabel}>PROJECT PARTY</span>
          {gameName && <span className={styles.logoGame}>{gameName}</span>}
        </span>
      </Link>
      <button className={styles.authBtn} aria-label="Zaloguj się">
        <span className={styles.authIcon} aria-hidden="true">👤</span>
        <span className={styles.authBtnText}>Zaloguj się</span>
      </button>
    </header>
  )
}
