import Link from 'next/link'
import styles from './Topbar.module.css'

type TopbarProps = {
  gameName?: string
}

export function Topbar({ gameName }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>Project Party</Link>
        {gameName && (
          <>
            <span className={styles.separator}>/</span>
            <span className={styles.gameName}>{gameName}</span>
          </>
        )}
      </div>
      <button className={styles.authBtn} aria-label="Zaloguj się">
        <span className={styles.authBtnText}>Zaloguj się</span>
        <span aria-hidden="true">👤</span>
      </button>
    </header>
  )
}
