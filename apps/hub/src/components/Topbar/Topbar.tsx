import styles from './Topbar.module.css'

// TODO: restore Clerk components (SignInButton, UserButton) in Phase 5
export function Topbar() {
  return (
    <header className={styles.topbar}>
      <span className={styles.logo}>🎉 Party</span>
      <button className={styles.signInButton} aria-label="Zaloguj się">
        <span className={styles.signInButtonText}>Zaloguj się</span>
        <span aria-hidden="true">👤</span>
      </button>
    </header>
  )
}
