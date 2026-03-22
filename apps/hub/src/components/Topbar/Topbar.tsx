import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'
import styles from './Topbar.module.css'

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <span className={styles.logo}>🎉 Party</span>
      <SignedOut>
        <SignInButton>
          <button className={styles.signInButton} aria-label="Zaloguj się">
            <span className={styles.signInButtonText}>Zaloguj się</span>
            <span aria-hidden="true">👤</span>
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton aria-label="Menu użytkownika" />
      </SignedIn>
    </header>
  )
}
