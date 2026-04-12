'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers'
import styles from './AuthButton.module.css'

export function AuthButton() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <button type="button" className={styles.loginButton} disabled>
        Zaloguj się
      </button>
    )
  }

  if (user) {
    return (
      <div className={styles.authGroup}>
        <Link href="/profile" className={styles.accountButton} title={user.email}>
          {user.displayName}
        </Link>
        <button
          type="button"
          className={styles.logoutButton}
          onClick={async () => {
            await logout()
            router.replace('/')
            router.refresh()
          }}
        >
          Wyloguj
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={styles.loginButton}
      onClick={() => {
        router.push('/auth')
      }}
    >
      Zaloguj się
    </button>
  )
}
